// src/stores/settings.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings, AIModel } from '@/types/chat'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({
    theme: 'dark',
    model: 'deepseek-chat',
    temperature: 0.8,
  })

  const setTheme = (theme: 'dark' | 'light') => {
    settings.value.theme = theme
    // 这里可以添加主题切换逻辑
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

  return {
    settings,
    setTheme,
    setModel,
    setTemperature,
    setApiKey,
  }
})
