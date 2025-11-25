<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import AppLayout from '@/components/layout/AppLayout.vue'

const chatStore = useChatStore()

onMounted(async () => {
  // 应用启动时加载会话列表
  await chatStore.loadConversations()
})
</script>

<template>
  <div id="app">
    <AppLayout />
  </div>
</template>

<style>
#app {
  height: 100vh;
  background: var(--bg-dark);
  color: var(--text-primary);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}
</style>
