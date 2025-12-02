// src/stores/settings.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings, AIModel } from '@/types/chat'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    theme: 'dark',
    model: 'deepseek-chat',
    temperature: 0.8,
    enableStreaming: true,  // 新增：流式传输开关
    apiKey: ''
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

    // 操作方法
    toggleStreaming,
    setTheme,
    setModel,
    setTemperature,
    setApiKey,
    saveSettings
  }
})
