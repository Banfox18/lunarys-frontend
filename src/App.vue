<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppBackground from '@/components/layout/AppBackground.vue'  // 新增

const chatStore = useChatStore()

onMounted(async () => {
  // 应用启动时加载会话列表
  await chatStore.loadConversations()
})
</script>

<template>
  <div id="app">
    <!-- 全屏背景层 -->
    <AppBackground />

    <!-- 应用内容 -->
    <div class="app-content">
      <AppLayout />
    </div>
  </div>
</template>

<style>
#app {
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--bg-dark);  /* 默认背景（当 AppBackground 没有背景时显示） */
  color: var(--text-primary);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.app-content {
  position: relative;
  z-index: 1;
  height: 100%;
  background: transparent;
}
</style>
