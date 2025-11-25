// src/types/chat.ts - 更新类型定义
export interface Message {
  id?: number
  conversationId: number
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export interface Conversation {
  id: number
  title: string
  model: string
  createdAt: string
  updatedAt: string
  preview: string
}

export interface ChatRequest {
  conversationId?: number
  model: string
  messages: Array<{
    role: string
    content: string
  }>
}

// 移除旧的ChatResponse，因为现在是流式响应
// export interface ChatResponse {
//   conversationId: number
//   answer: string
// }

// 模型类型
export type AIModel = 'deepseek-chat' | 'deepseek-reasoner'

// 设置类型
export interface AppSettings {
  theme: 'dark' | 'light'
  model: AIModel
  apiKey?: string
  temperature: number
}
