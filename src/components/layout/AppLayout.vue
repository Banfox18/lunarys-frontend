<!-- src/components/layout/AppLayout.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import ChatArea from './ChatArea.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="app-layout">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" class="sidebar" />
    <ChatArea class="chat-area" />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: transparent;
}

.sidebar {
  flex: 0 0 280px;
  border-right: 1px solid var(--border-dark);
  transition: flex-basis var(--transition-normal) ease;
}

.sidebar.collapsed {
  flex-basis: 60px;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
