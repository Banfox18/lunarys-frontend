// src/services/api.ts
import type { ChatRequest, Conversation, Message } from '@/types/chat'

const API_BASE_URL = 'http://localhost:8080/api'

export interface StreamResponse {
  type: 'reasoning' | 'content' | 'error' | 'complete'
  data: string
}

export interface ChatResponse {
  content: string
  conversationId: number
}

export const chatService = {
  /**
   * 流式聊天
   */
  async sendMessageStream(
    request: ChatRequest,
    onContent: (content: string) => void,
    onError: (error: string) => void,
    onComplete: (conversationId: number) => void,
    onReasoning?: (reasoning: string) => void  // 新增：思考过程回调
  ): Promise<() => void> {
    let abortController: AbortController | null = null

    try {
      abortController = new AbortController()
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortController.signal
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        onError(error.message)
        return
      }

      if (!response.body) {
        const error = new Error('Empty response body')
        onError(error.message)
        return
      }

      // 修改processSSEStream调用，传入onReasoning回调
      this.processSSEStream(response.body, onContent, onError, onComplete, onReasoning)

    } catch (error) {
      if (error.name === 'AbortError') {
        onError('Request cancelled')
      } else {
        onError(error.message)
      }
    }

    return () => abortController?.abort()
  },

  /**
   * 非流式聊天
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  },

  /**
   * 处理SSE流数据 - 核心解析逻辑
   */
  async processSSEStream(
    readableStream: ReadableStream<Uint8Array>,
    onContent: (content: string) => void,
    onError: (error: string) => void,
    onComplete: (conversationId: number) => void
  ): Promise<void> {
    const reader = readableStream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 处理缓冲区剩余数据
          if (buffer.trim()) {
            this.processSSEBuffer(buffer, onContent, onError, onComplete)
          }

          break
        }

        // 解码数据并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 按SSE事件分割（标准SSE以\n\n分隔）
        const events = buffer.split('\n\n')

        // 保留最后一个不完整的事件
        buffer = events.pop() || ''

        // 处理每个完整的事件
        for (const event of events) {
          if (event.trim()) {
            this.processSSEEvent(event.trim(), onContent, onError, onComplete)
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
          console.log('[SSE] 流被用户中止')

      } else {
        console.error('[SSE] 流处理错误:', error)
        onError(`流式传输错误: ${error.message}`)
      }
    }
  },

  /**
   * 处理单个SSE事件
   */
  processSSEEvent(
    event: string,
    onContent: (content: string) => void,
    onError: (error: string) => void,
    onComplete: (conversationId: number) => void,
    onReasoning?: (reasoning: string) => void
  ): void {
    const lines = event.split('\n')

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const jsonStr = line.substring(5).trim()
        if (!jsonStr) continue

        try {
          const data: StreamResponse = JSON.parse(jsonStr)

          console.log('[SSE] ', '[', data.type, '] -', data.data.substring(0, 50), '-')

          switch (data.type) {
            case 'reasoning':  // 统一使用reasoning
              if (onReasoning) {
                onReasoning(data.data)
              }
              break
            case 'content':
              onContent(data.data)
              break
            case 'error':
              onError(data.data)
              break
            case 'complete':
              const conversationId = parseInt(data.data)
              if (!isNaN(conversationId)) {
                onComplete(conversationId)
              } else {
                console.error('[SSE] 无效的会话ID:', data.data)
                onError('收到无效的会话ID')
              }
              break
            default:
              console.warn('[SSE] 未知的事件类型:', data.type)
          }
        } catch (parseError) {
          console.error('[SSE] 解析JSON失败:', parseError, '原始数据:', jsonStr)
        }
      }
    }
  },

  /**
   * 处理缓冲区剩余数据
   */
  processSSEBuffer(
    buffer: string,
    onContent: (content: string) => void,
    onError: (error: string) => void,
    onComplete: (conversationId: number) => void
  ): void {
    // 尝试按行处理缓冲区剩余数据
    const lines = buffer.split('\n')

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const jsonStr = line.substring(5).trim()
        if (!jsonStr) continue

        try {
          const data: StreamResponse = JSON.parse(jsonStr)
          // 创建一个模拟的SSE事件进行处理
          const mockEvent = `data:${JSON.stringify(data)}`
          this.processSSEEvent(mockEvent, onContent, onError, onComplete)
        } catch (e) {
          console.error('[SSE] 处理缓冲区数据失败:', e)
        }
      }
    }
  },

  /**
   * 获取会话列表
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`)
      if (!response.ok) {
        console.error(`获取会话列表失败: HTTP ${response.status}`)
        return []
      }
      return await response.json()
    } catch (error) {
      console.error('获取会话列表失败:', error)
      return []
    }
  },

  /**
   * 获取会话消息历史
   */
  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`)
      if (!response.ok) {
        console.error(`获取消息历史失败: HTTP ${response.status}`)
        return []
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
        console.error(`删除会话失败: HTTP ${response.status}`)
        // 继续执行，因为已经在catch块中
      }
    } catch (error) {
      console.error('删除会话失败:', error)
      // 如果后端没有实现删除接口，我们仍然在前端删除
      console.warn('后端删除接口可能未实现，仅在前端删除')
    }
  }
}
