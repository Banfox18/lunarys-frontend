<!-- src/components/conversation/ConversationItem.vue -->
<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'

interface Conversation {
  id: number
  title: string
  preview: string
  updatedAt: string
}

interface Props {
  conversation: Conversation
  isActive?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [id: number]
  delete: [id: number]
}>()

const handleClick = () => {
  emit('click', props.conversation.id)
}

const handleDelete = () => {
  emit('delete', props.conversation.id)
}
</script>

<template>
  <div class="conversation-item" :class="{ active: isActive }" @click="handleClick">
    <div class="item-content">
      <div class="title">{{ conversation.title }}</div>
      <div class="preview">{{ conversation.preview }}</div>
    </div>
    <div class="actions">
      <el-button type="text" size="small" @click.stop="handleDelete" class="delete-btn">
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.conversation-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  background: var(--surface-dark);
  border: 1px solid transparent;
}

.conversation-item:hover {
  background: var(--surface-dark-hover);
  border-color: var(--border-dark);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.conversation-item.active {
  background: var(--primary-color);
  color: var(--text-white);
  border-color: var(--primary-light);
}

.conversation-item .title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.conversation-item .preview {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.conversation-item.active .title,
.conversation-item.active .preview {
  color: var(--text-white);
}

.delete-btn {
  opacity: 0;
  transition: opacity var(--transition-fast) ease;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}
</style>
