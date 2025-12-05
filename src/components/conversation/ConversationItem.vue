<!-- src/components/conversation/ConversationItem.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

// 添加状态和事件处理
const isConfirmingDelete = ref(false)

const handleDelete = () => {
  isConfirmingDelete.value = true
}

const confirmDelete = () => {
  emit('delete', props.conversation.id)
  isConfirmingDelete.value = false
}

const cancelDelete = () => {
  isConfirmingDelete.value = false
}

// 修改handleClick，在确认状态下阻止切换会话
const handleClick = () => {
  if (isConfirmingDelete.value) return
  emit('click', props.conversation.id)
}

const deleteConfirmRef = ref<HTMLElement | null>(null)
// 点击外部取消删除的函数
const handleClickOutside = (event: MouseEvent) => {
  if (!isConfirmingDelete.value) return

  // 检查点击是否在确认删除界面内部
  if (deleteConfirmRef.value && !deleteConfirmRef.value.contains(event.target as Node)) {
    // 点击了外部，取消删除
    cancelDelete()
  }
}
// 添加全局点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    class="conversation-item"
    :class="{
      active: isActive,
      'is-confirming': isConfirmingDelete,
    }"
    @click="handleClick"
  >
    <!-- 原内容（始终显示，确认删除时虚化） -->
    <div class="item-content" :class="{ blurred: isConfirmingDelete }">
      <div class="title">{{ conversation.title }}</div>
      <div class="preview">{{ conversation.preview }}</div>
    </div>

    <!-- 确认删除界面（显示在虚化内容上方） -->
    <transition name="fade">
      <div v-if="isConfirmingDelete" ref="deleteConfirmRef" class="delete-confirm-overlay">
        <div class="delete-confirm">
          <div class="confirm-text">确认删除？</div>
          <div class="confirm-actions">
            <el-button size="small" type="danger" @click.stop="confirmDelete">删除</el-button>
            <el-button size="small" @click.stop="cancelDelete">取消</el-button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 删除按钮（只在正常状态显示） -->
    <div v-if="!isConfirmingDelete" class="actions">
      <el-button type="text" size="small" @click.stop="handleDelete" class="delete-btn">
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
/* 确认删除界面样式 */
.delete-confirm {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 100%;
}
.delete-confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 1;
}

.confirm-text {
  font-size: 12px;
  color: var(--error-color);
  margin-bottom: 8px;
  font-weight: 500;
  line-height: 17px;
  text-align: center;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}
.item-content,
.delete-confirm {
  min-height: 36px; /* 设置相同的最小内容高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item-content {
  flex: 1;
  min-width: 0; /* 允许内容收缩 */
  transition:
    filter var(--transition-slow) ease,
    opacity var(--transition-slow) ease;
}
.item-content.blurred {
  filter: blur(2px);
  opacity: 0.6;
}

.conversation-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  background: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid transparent;
  min-height: 60px;
  position: relative;
}

.conversation-item.is-confirming {
  cursor: default;
}

.conversation-item:hover {
  background: rgba(15, 23, 42, 0.3);
  border-color: rgba(76, 83, 103, 0.3);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.conversation-item.active {
  background: rgba(37, 99, 235, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-white);
  border-color: rgba(37, 99, 235, 0.5);
}

.conversation-item .title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-primary);
  line-height: 1.3;
}

.conversation-item .preview {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 4.2em;
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-slow) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
