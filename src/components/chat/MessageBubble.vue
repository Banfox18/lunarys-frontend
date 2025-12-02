<!-- src/components/chat/MessageBubble.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'


interface Props {
  message: Message
  isStreaming?: boolean
}

const props = defineProps<Props>()

const isUser = computed(() => props.message.role === 'user')
const showCopyButton = ref(false)
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

// 复制原始文本到剪贴板
const copyToClipboard = async () => {
  try {
    // 直接复制原始内容，不做任何转换
    await navigator.clipboard.writeText(props.message.content)
    copyStatus.value = 'success'

    // 2秒后重置状态
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    copyStatus.value = 'error'

    // 2秒后重置状态
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  }
}

// 获取复制按钮文本
const copyButtonText = computed(() => {
  switch (copyStatus.value) {
    case 'success':
      return '✅ 已复制'
    case 'error':
      return '❌ 复制失败'
    default:
      return '📋 复制'
  }
})
</script>

<template>
  <div
    :class="['message-bubble', { 'user-message': isUser, 'ai-message': !isUser }]"
    @mouseenter="showCopyButton = true"
    @mouseleave="showCopyButton = false"
  >
    <div class="message-avatar">
      <div v-if="isUser" class="avatar user-avatar">👤</div>
      <div v-else class="avatar ai-avatar">🤖</div>
    </div>

    <div class="message-content">
      <div class="message-header">
        <div class="message-role">
          {{ isUser ? 'Administrator' : 'Lunarys' }}
        </div>
        <button
          v-if="showCopyButton && !isStreaming"
          class="copy-button"
          @click="copyToClipboard"
          :title="copyButtonText"
          :disabled="copyStatus !== 'idle'"
        >
          {{ copyButtonText }}
        </button>
      </div>

      <div class="message-text">
        <!-- 用户消息直接显示文本 -->
        <template v-if="isUser">
          <div class="plain-text">{{ message.content }}</div>
        </template>

        <!-- AI消息使用Markdown渲染器 -->
        <template v-else>
          <MarkdownRenderer :content="message.content" />
        </template>

        <!-- 流式加载指示器 -->
        <div v-if="isStreaming && !isUser" class="streaming-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="message-time">
        {{ new Date(message.createdAt).toLocaleTimeString() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  display: flex;
  margin-bottom: 24px;
  gap: 12px;
  position: relative;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-avatar {
  background: var(--primary-color);
  color: var(--text-white);
}

.ai-avatar {
  background: var(--secondary-color);
  color: var(--text-white);
}

.message-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-message .message-content {
  align-items: flex-end;
}

.ai-message .message-content {
  align-items: flex-start;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4px;
}

.message-role {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  opacity: 0.8;
}

.copy-button {
  background: var(--surface-dark);
  border: 1px solid var(--border-dark);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  opacity: 0.8;
}

.copy-button:hover {
  background: var(--surface-dark-hover);
  border-color: var(--primary-color);
  opacity: 1;
}

.copy-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  position: relative;
}

.user-message .message-text {
  background: var(--primary-color);
  color: var(--text-white);
  border-bottom-right-radius: 4px;
}

.ai-message .message-text {
  background: var(--surface-dark);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--border-dark);
}

.plain-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.7;
}

.streaming-indicator {
  display: inline-block;
  margin-left: 8px;
  vertical-align: middle;
}

.typing-dots {
  display: inline-flex;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}
</style>
