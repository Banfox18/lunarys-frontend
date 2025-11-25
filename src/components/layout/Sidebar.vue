<!-- src/components/layout/Sidebar.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import ConversationList from '@/components/conversation/ConversationList.vue'

interface Props {
  collapsed?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()

const chatStore = useChatStore()

const handleNewConversation = async () => {
  await chatStore.createNewConversation()
}

const handleToggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="sidebar" :class="{ collapsed }">
    <!-- 顶部Logo区域 -->
    <div class="sidebar-header">
      <div class="logo" v-if="!collapsed">
        <div class="logo-icon">🤖</div>
        <span class="logo-text">Lunarys</span>
      </div>
      <div class="logo-collapsed" v-else>
        <div class="logo-icon">🤖</div>
      </div>
      <el-button type="text" class="toggle-btn" @click="handleToggle">
        <el-icon v-if="!collapsed"><ArrowLeft /></el-icon>
        <el-icon v-else><ArrowRight /></el-icon>
      </el-button>
    </div>

    <!-- 新建会话按钮 -->
    <div class="new-conversation-section" v-if="!collapsed">
      <el-button type="primary" class="new-conversation-btn" @click="handleNewConversation">
        <el-icon><Plus /></el-icon>
        <span>新建对话</span>
      </el-button>
    </div>

    <!-- 会话列表 -->
    <div class="conversation-list-section">
      <ConversationList :collapsed="collapsed" />
    </div>

    <!-- 底部设置区域 -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="settings">
        <el-button type="text" class="settings-btn">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--surface-dark);
  border-right: 1px solid var(--border-dark);
  transition: all var(--transition-normal) ease;
  min-width: 280px;
}

.sidebar.collapsed {
  min-width: 60px;
}

/* 顶部Logo区域 */
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-dark);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-collapsed {
  display: flex;
  justify-content: center;
}

.toggle-btn {
  color: var(--text-secondary);
  transition: color var(--transition-fast) ease;
}

.toggle-btn:hover {
  color: var(--text-primary);
}

/* 新建会话区域 */
.new-conversation-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-dark);
}

.new-conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 500;
  transition: all var(--transition-normal) ease;
}

.new-conversation-btn:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 会话列表区域 */
.conversation-list-section {
  flex: 1;
  overflow-y: auto;
}

/* 底部设置区域 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-dark);
}

.settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  color: var(--text-secondary);
  transition: color var(--transition-fast) ease;
}

.settings-btn:hover {
  color: var(--text-primary);
}
</style>
