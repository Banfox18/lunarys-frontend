// src/services/api.ts - 修复SSE解析版本
import type { ChatRequest, Conversation, Message } from '@/types/chat'

const API_BASE_URL = 'http://localhost:8080/api'

// 流式响应数据类型
export interface StreamResponse {
  type: 'content' | 'error' | 'complete'
  data: string
}

// 流式聊天服务
export const chatService = {
  /**
   * 发送流式聊天消息
   */
  async sendMessageStream(
    request: ChatRequest,
    onContent: (content: string) => void,
    onError: (error: string) => void,
    onComplete: (conversationId: number) => void
  ): Promise<() => void> {
    let abortController: AbortController | null = null

    console.log('🔍 [DEBUG] 开始发送流式请求:', request)

    try {
      abortController = new AbortController()

      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortController.signal
      })

      console.log('🔍 [DEBUG] 收到响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [DEBUG] HTTP错误:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      if (!response.body) {
        console.error('❌ [DEBUG] 响应体为空')
        throw new Error('Response body is null')
      }

      console.log('🔍 [DEBUG] 开始读取流数据...')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 处理流式数据 - 修复SSE格式解析
      const processStream = async () => {
        try {
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log('🔍 [DEBUG] 流读取完成')
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk

            console.log('🔍 [DEBUG] 收到原始数据块:', chunk)
            console.log('🔍 [DEBUG] 当前缓冲区:', buffer)

            // 按行分割并处理SSE格式
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留未完成的行

            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine) continue

              console.log('🔍 [DEBUG] 处理行:', trimmedLine)

              // 解析SSE格式: data:{"type":"content","data":"您好"}
              if (trimmedLine.startsWith('data:')) {
                const jsonStr = trimmedLine.substring(5).trim() // 去掉 "data:"

                try {
                  const data: StreamResponse = JSON.parse(jsonStr)
                  console.log('✅ [DEBUG] 解析成功:', data)

                  switch (data.type) {
                    case 'content':
                      console.log('✅ [DEBUG] 收到内容:', data.data)
                      onContent(data.data)
                      break
                    case 'error':
                      console.error('❌ [DEBUG] 收到错误:', data.data)
                      onError(data.data)
                      break
                    case 'complete':
                      console.log('✅ [DEBUG] 收到完成信号:', data.data)
                      onComplete(parseInt(data.data))
                      return // 完成时退出
                    default:
                      console.warn('⚠️ [DEBUG] 未知的数据类型:', data.type)
                  }
                } catch (parseError) {
                  console.error('❌ [DEBUG] 解析JSON失败:', parseError, '原始数据:', jsonStr)
                }
              } else if (trimmedLine.startsWith('id:')) {
                // 忽略SSE的id字段
                console.log('🔍 [DEBUG] 忽略SSE id:', trimmedLine)
              } else if (trimmedLine.startsWith('event:')) {
                // 忽略SSE的event字段
                console.log('🔍 [DEBUG] 忽略SSE event:', trimmedLine)
              } else {
                console.warn('⚠️ [DEBUG] 未知的SSE字段:', trimmedLine)
              }
            }
          }
        } catch (streamError) {
          if (streamError.name === 'AbortError') {
            console.log('🔍 [DEBUG] 流被用户中止')
          } else {
            console.error('❌ [DEBUG] 流处理错误:', streamError)
            onError('流式传输处理失败: ' + streamError.message)
          }
        }
      }

      processStream()

    } catch (error) {
      console.error('❌ [DEBUG] 请求失败:', error)
      if (error.name === 'AbortError') {
        onError('请求被用户取消')
      } else {
        onError('网络请求失败: ' + error.message)
      }
    }

    // 返回中止函数
    return () => {
      console.log('🔍 [DEBUG] 执行中止函数')
      if (abortController) {
        abortController.abort()
      }
    }
  },

  /**
   * 获取会话列表
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      // 需要后端提供这个接口
      const response = await fetch(`${API_BASE_URL}/conversations`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('获取会话列表失败:', error)
      // 返回空数组而不是抛出错误
      return []
    }
  },

  /**
   * 获取会话消息历史
   */
  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      // 需要后端提供这个接口
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('获取消息历史失败:', error)
      return []
    }
  },

  /**
   * 删除会话
   */
  async deleteConversation(conversationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // 如果后端返回404，说明会话不存在，我们仍然认为删除成功
        if (response.status === 404) {
          console.log('会话不存在，视为删除成功')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('删除会话失败:', error)
      // 如果后端没有实现删除接口，我们仍然在前端删除
      console.warn('后端删除接口可能未实现，仅在前端删除')
      // 不抛出错误，让前端状态更新继续执行
    }
  }

}
