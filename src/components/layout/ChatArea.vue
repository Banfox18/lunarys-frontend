<!-- src/components/layout/ChatArea.vue -->
<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSettingsStore } from '@/stores/settings'
import MessageList from '@/components/chat/MessageList.vue'
import InputArea from '@/components/chat/InputArea.vue'

const chatStore = useChatStore()
const settingsStore = useSettingsStore()

const messagesEndRef = ref<HTMLElement>()

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// 监听消息变化，自动滚动
watch(() => chatStore.messages.length, scrollToBottom, { immediate: true })

const handleSendMessage = async (content: string) => {
  await chatStore.sendMessage(content)
}

//获取当前聊天背景样式
const chatBackgroundStyle = computed(() => {
  const currentConversationId = chatStore.currentConversation?.id
  const background = currentConversationId
    ? settingsStore.getCurrentBackground(currentConversationId)
    : settingsStore.chatBackground

  if (!background || background.type === 'none') {
    return {}
  }

  switch (background.type) {
    case 'solid':
      return {
        background: background.color || 'var(--bg-dark)',
      }
    case 'gradient':
      return {
        background: `linear-gradient(${background.gradientDirection || 'to right'},
                   ${background.gradientColors?.[0] || '#667eea'},
                   ${background.gradientColors?.[1] || '#764ba2'})`,
      }
    case 'image':
      return {
        backgroundImage: `url(${background.imageUrl})`,
        opacity: background.imageOpacity || 0.8  // 只影响背景层
      }
    default:
      return {}
  }
})
</script>

<template>
  <div class="chat-area">
    <!-- 背景层 -->
    <div class="chat-background" :style="chatBackgroundStyle"></div>

    <!-- 内容层 -->
    <div class="chat-content">
      <!-- 消息列表区域 -->
      <div class="messages-container" :style="messagesContainerStyle">
        <MessageList :messages="chatStore.messages" :is-loading="chatStore.isLoading" />
        <div ref="messagesEndRef" />
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <InputArea :disabled="chatStore.isLoading" @send="handleSendMessage" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.chat-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.chat-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 为图片背景添加遮罩效果 */
.chat-area:has(.chat-background[style*="background-image"]) .messages-container {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  margin: 8px;
}

.input-container {
  padding: 20px;
  border-top: 1px solid var(--border-dark);
  background: var(--surface-dark);
}

/* 为图片背景下的输入区域添加遮罩 */
.chat-area:has(.chat-background[style*="background-image"]) .input-container {
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

