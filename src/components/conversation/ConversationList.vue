<!-- src/components/conversation/ConversationList.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { ElMessage, ElMessageBox } from 'element-plus'
import ConversationItem from './ConversationItem.vue'

interface Props {
  collapsed?: boolean
}

defineProps<Props>()

const chatStore = useChatStore()

// 确保每个conversation都有preview
const conversationsWithPreview = computed(() => {
  return chatStore.conversations.map((conv) => ({
    ...conv,
    preview: conv.preview || '暂无消息',
  }))
})

const handleConversationClick = async (conversationId: number) => {
  await chatStore.switchConversation(conversationId)
}

const handleConversationDelete = async (conversationId: number) => {
  try {
    // 确认删除对话框
    await ElMessageBox.confirm(
      '确定要删除这个会话吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 执行删除
    await chatStore.deleteConversation(conversationId)

    ElMessage.success('会话删除成功')
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除，不做任何操作
      console.log('用户取消删除')
    } else {
      console.error('删除会话失败:', error)
      ElMessage.error('删除会话失败，请重试')
    }
  }
}
</script>

<template>
  <div class="conversation-list">
    <div v-if="!collapsed" class="list-header">
      <span class="section-title">对话历史</span>
    </div>

    <div class="conversations">
      <ConversationItem
        v-for="conversation in conversationsWithPreview"
        :key="conversation.id"
        :conversation="conversation"
        :is-active="chatStore.currentConversation?.id === conversation.id"
        @click="handleConversationClick"
        @delete="handleConversationDelete"
      />
    </div>

    <div v-if="chatStore.conversations.length === 0 && !collapsed" class="empty-state">
      <div class="empty-icon">💬</div>
      <p class="empty-text">暂无对话记录</p>
      <p class="empty-subtext">开始一个新的对话吧</p>
    </div>
  </div>
</template>

<style scoped>
.conversation-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 16px 16px 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.conversations {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-subtext {
  font-size: 12px;
  opacity: 0.7;
}
</style>
