// src/stores/settings.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings, AIModel, ChatBackground } from '@/types/chat'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    theme: 'dark',
    model: 'deepseek-chat',
    temperature: 0.8,
    enableStreaming: true,  // 新增：流式传输开关
    apiKey: '',
    // 新增：默认聊天背景
    chatBackground: {
      type: 'none',
      color: 'var(--surface-dark)'
    },
    conversationBackgrounds: {}
  })

  // 计算属性
  const enableStreaming = computed({
    get: () => settings.value.enableStreaming ?? true,
    set: (value) => { settings.value.enableStreaming = value }
  })

  const theme = computed({
    get: () => settings.value.theme,
    set: (value) => { settings.value.theme = value }
  })

  const model = computed({
    get: () => settings.value.model,
    set: (value) => { settings.value.model = value }
  })

  const temperature = computed({
    get: () => settings.value.temperature,
    set: (value) => { settings.value.temperature = Math.max(0, Math.min(1, value)) }
  })

  const apiKey = computed({
    get: () => settings.value.apiKey ?? '',
    set: (value) => { settings.value.apiKey = value }
  })

  // 新增：聊天背景计算属性
  const chatBackground = computed({
    get: () => settings.value.chatBackground || { type: 'none', color: 'var(--surface-dark)' },
    set: (value) => { settings.value.chatBackground = value }
  })

  const conversationBackgrounds = computed({
    get: () => settings.value.conversationBackgrounds || {},
    set: (value) => { settings.value.conversationBackgrounds = value }
  })

  // 操作方法
  const toggleStreaming = () => {
    settings.value.enableStreaming = !settings.value.enableStreaming
  }

  const setTheme = (theme: 'dark' | 'light') => {
    settings.value.theme = theme
  }

  const setModel = (model: AIModel) => {
    settings.value.model = model
  }

  const setTemperature = (temperature: number) => {
    settings.value.temperature = Math.max(0, Math.min(1, temperature))
  }

  const setApiKey = (apiKey: string) => {
    settings.value.apiKey = apiKey
  }

  // 新增：背景设置方法
  const setChatBackground = (background: ChatBackground) => {
    settings.value.chatBackground = background
  }

  const setConversationBackground = (conversationId: number, background: ChatBackground) => {
    if (!settings.value.conversationBackgrounds) {
      settings.value.conversationBackgrounds = {}
    }
    settings.value.conversationBackgrounds[conversationId] = background
  }

  const getConversationBackground = (conversationId: number): ChatBackground | undefined => {
    return settings.value.conversationBackgrounds?.[conversationId]
  }

  const removeConversationBackground = (conversationId: number) => {
    if (settings.value.conversationBackgrounds) {
      delete settings.value.conversationBackgrounds[conversationId]
    }
  }

  // 获取当前会话的背景（优先使用会话特定背景，否则使用全局背景）
  const getCurrentBackground = (conversationId?: number): ChatBackground => {
    if (conversationId) {
      const convBg = getConversationBackground(conversationId)
      if (convBg) return convBg
    }
    return chatBackground.value
  }

  // 持久化（可选）
  const loadSettings = () => {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        settings.value = { ...settings.value, ...parsed }
      } catch {
        // 忽略解析错误
      }
    }
  }

  const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
  }

  // 初始化时加载设置
  loadSettings()

  return {
    // 计算属性
    settings,
    enableStreaming,
    theme,
    model,
    temperature,
    apiKey,
    chatBackground,
    conversationBackgrounds,

    // 操作方法
    toggleStreaming,
    setTheme,
    setModel,
    setTemperature,
    setApiKey,
    setChatBackground,
    setConversationBackground,
    getConversationBackground,
    removeConversationBackground,
    getCurrentBackground,
    saveSettings
  }
})
