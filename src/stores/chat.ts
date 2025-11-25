// src/stores/chat.ts - 完全重写为流式版本
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Conversation, Message, ChatRequest } from '@/types/chat'
import { chatService } from '@/services/api'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const currentModel = ref('deepseek-chat')
  const abortController = ref<(() => void) | null>(null)

  // 动作
  const loadConversations = async () => {
    try {
      conversations.value = await chatService.getConversations()
    } catch (error) {
      console.error('加载会话列表失败:', error)
      // 保持模拟数据作为fallback
      conversations.value = [
        {
          id: 1,
          title: '欢迎对话',
          model: 'deepseek-chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preview: '欢迎使用Lunarys!'
        }
      ]
    }
  }

  const createNewConversation = async (): Promise<Conversation> => {
    // 创建临时会话对象（不设置ID，让后端生成）
    const tempConversation: Conversation = {
      id: -1, // 临时ID，后端会生成正式ID
      title: '新对话',
      model: currentModel.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preview: '开始新的对话'
    }

    conversations.value.unshift(tempConversation)
    currentConversation.value = tempConversation
    messages.value = []

    return tempConversation
  }

// src/stores/chat.ts - 修改switchConversation
  const switchConversation = async (conversationId: number) => {
    // 只切换正式会话，不切换临时会话
    if (conversationId <= 0) {
      console.warn('尝试切换到临时会话，忽略')
      return
    }

    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      currentConversation.value = conversation
      // 加载该会话的消息历史
      try {
        messages.value = await chatService.getMessages(conversationId)
      } catch (error) {
        console.error('加载消息历史失败:', error)
        messages.value = []
      }
    }
  }


  // 停止当前流式响应
  const stopStreaming = () => {
    if (abortController.value) {
      abortController.value()
      abortController.value = null
      isLoading.value = false
    }
  }

  // 流式发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // 停止之前的流式响应
    stopStreaming()

    // 如果没有当前会话，创建新会话
    if (!currentConversation.value) {
      await createNewConversation()
    }

    // 添加用户消息
    const userMessage: Message = {
      conversationId: currentConversation.value!.id,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString()
    }
    messages.value.push(userMessage)

    // 添加空的AI消息用于流式更新
    const aiMessage: Message = {
      conversationId: currentConversation.value!.id,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    }
    messages.value.push(aiMessage)

    isLoading.value = true

    // 准备请求数据 - 发送完整的对话历史
    const request: ChatRequest = {
      // 如果是临时会话，不发送conversationId，让后端创建新会话
      conversationId: currentConversation.value!.id > 0 ? currentConversation.value!.id : undefined,
      model: currentModel.value,
      messages: messages.value.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    }

    try {
      // 开始流式传输
      abortController.value = await chatService.sendMessageStream(
        request,
        // 内容回调 - 实时更新消息内容
        (contentChunk) => {
          const lastIndex = messages.value.length - 1
          messages.value[lastIndex].content += contentChunk
        },
        // 错误回调
        (errorMessage) => {
          const lastIndex = messages.value.length - 1
          messages.value[lastIndex].content = `错误: ${errorMessage}`
          isLoading.value = false
          abortController.value = null
        },
        // 完成回调 - 更新会话ID
        (conversationId) => {
          console.log('✅ 收到后端生成的会话ID:', conversationId)

          // 更新当前会话的ID
          if (currentConversation.value) {
            currentConversation.value.id = conversationId
            currentConversation.value.updatedAt = new Date().toISOString()
          }

          // 更新会话列表中的ID
          const conversationInList = conversations.value.find(c => c.id === -1)
          if (conversationInList) {
            conversationInList.id = conversationId
          }

          // 更新会话标题（如果是第一条消息）
          if (messages.value.length === 2) {
            updateConversationTitle(content)
          }

          isLoading.value = false
          abortController.value = null
        }
      )

    } catch (error) {
      console.error('发送消息失败:', error)
      const lastIndex = messages.value.length - 1
      messages.value[lastIndex].content = '抱歉，发送消息时出现错误，请稍后重试。'
      isLoading.value = false
    }
  }

  const updateConversationTitle = (firstMessage: string) => {
    if (currentConversation.value && currentConversation.value.title === '新对话') {
      const title = firstMessage.length > 20
        ? firstMessage.substring(0, 20) + '...'
        : firstMessage
      currentConversation.value.title = title
      currentConversation.value.updatedAt = new Date().toISOString()
    }
  }

  // 在stores/chat.ts中添加删除方法
  const deleteConversation = async (conversationId: number) => {
    try {
      // 调用后端API删除会话
      await chatService.deleteConversation(conversationId)

      // 从前端状态中移除会话
      const index = conversations.value.findIndex(c => c.id === conversationId)
      if (index !== -1) {
        conversations.value.splice(index, 1)
      }

      // 如果删除的是当前会话，切换到其他会话或清空
      if (currentConversation.value?.id === conversationId) {
        currentConversation.value = null
        messages.value = []
      }

      console.log('✅ 会话删除成功:', conversationId)
    } catch (error) {
      console.error('删除会话失败:', error)
      throw error // 重新抛出错误，让UI层处理
    }
  }


  return {
    // 状态
    conversations,
    currentConversation,
    messages,
    isLoading,
    currentModel,

    // 动作
    loadConversations,
    createNewConversation,
    switchConversation,
    sendMessage,
    stopStreaming,
    deleteConversation
  }
})
