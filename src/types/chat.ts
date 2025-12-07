// src/types/chat.ts - 更新类型定义
export interface Message {
  id?: number
  conversationId?: number
  role: 'user' | 'assistant' | 'reasoning'
  content: string
  createdAt?: string
  metadata?: {
    isThinking?: boolean
    reasoningContent?: string
    finalAnswer?: string
  }
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
  message?: string // 当前消息内容（可选，用于向后兼容）
  messages: Array<{
    role: string
    content: string
  }>
}

// 模型类型
export type AIModel = 'deepseek-chat' | 'deepseek-reasoner'

// 背景类型
export type BackgroundType = 'solid' | 'gradient' | 'image' | 'none'

export interface ChatBackground {
  type: BackgroundType
  // 纯色背景
  color?: string
  // 渐变背景
  gradientColors?: string[]
  gradientDirection?: string
  // 图片背景
  imageUrl?: string
  imageOpacity?: number
  // 会话特定背景
  conversationId?: number
}

// 头像配置类型
export interface AvatarConfig {
  userAvatar?: string // 用户头像，支持URL或emoji，为空则不显示
  aiAvatar?: string // AI头像，支持URL或emoji，为空则不显示
  userAvatarBg?: string // 用户头像背景色，支持透明（transparent）
  aiAvatarBg?: string // AI头像背景色，支持透明（transparent）
}

// 设置类型
export interface AppSettings {
  theme: 'dark' | 'light'
  model: AIModel
  apiKey?: string
  temperature: number
  enableStreaming?: boolean
  // 新增：聊天背景设置
  chatBackground?: ChatBackground
  conversationBackgrounds?: Record<number, ChatBackground> // 会话特定背景
  // 新增：头像配置
  avatars?: AvatarConfig
}
