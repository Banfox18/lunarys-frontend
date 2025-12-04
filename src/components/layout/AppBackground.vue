<!-- src/components/layout/AppBackground.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSettingsStore } from '@/stores/settings'

const chatStore = useChatStore()
const settingsStore = useSettingsStore()

// 获取当前聊天背景样式
const backgroundStyle = computed(() => {
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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        opacity: background.imageOpacity || 0.8,
      }
    default:
      return {}
  }
})

// 暴露背景类型，供其他组件使用
defineExpose({
  backgroundStyle,
})
</script>

<template>
  <div class="app-background" :style="backgroundStyle"></div>
</template>

<style scoped>
.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
</style>
