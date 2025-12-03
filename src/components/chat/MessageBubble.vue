<!-- 修改MessageBubble.vue -->
<template>
  <div :class="['message-bubble', { 'user-message': isUser, 'ai-message': !isUser }]">
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
        <!-- 思考过程 -->
        <ReasoningProcess
          v-if="showReasoning && reasoningContent"
          :content="reasoningContent"
          :is-streaming="isStreaming"
          :default-collapsed="true"
        />

        <!-- 最终答案 -->
        <MarkdownRenderer v-if="!isUser" :content="finalAnswer" />

        <!-- 用户消息 -->
        <div v-if="isUser" class="plain-text">{{ message.content }}</div>

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
        {{ formatMessageTime(message.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ReasoningProcess from './ReasoningProcess.vue'

interface Props {
  message: Message
  isStreaming?: boolean
  reasoningContent?: string  // 思考过程内容
}

const props = defineProps<Props>()

const isUser = computed(() => props.message.role === 'user')
const showCopyButton = ref(false)
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

// 是否显示思考过程
const showReasoning = computed(() =>
  !isUser.value && props.reasoningContent && props.reasoningContent.trim().length > 0
)

// 最终答案（从消息内容中提取或使用单独字段）
const finalAnswer = computed(() => {
  // 如果消息包含思考过程，可能需要提取最终答案部分
  // 这里简单返回整个内容，实际实现可能需要解析
  return props.message.content
})

// 复制功能保持不变
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copyStatus.value = 'success'
    setTimeout(() => { copyStatus.value = 'idle' }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    copyStatus.value = 'error'
    setTimeout(() => { copyStatus.value = 'idle' }, 2000)
  }
}

const copyButtonText = computed(() => {
  switch (copyStatus.value) {
    case 'success': return '✅ 已复制'
    case 'error': return '❌ 复制失败'
    default: return '📋 复制'
  }
})
// 时间格式化函数
const formatMessageTime = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp)
  const now = new Date()

  // 判断是否是今天
  const isToday = date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  // 判断是否是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  // 格式化时间
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  if (isToday) {
    return timeStr
  } else if (isYesterday) {
    return `昨天 ${timeStr}`
  } else {
    // 显示日期和时间
    const dateStr = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    return `${dateStr} ${timeStr}`
  }
}

</script>

<style scoped>
.message-bubble {
  display: flex;
  margin-bottom: 24px;
  gap: 12px;
  position: relative;
}

.message-bubble.user-message {
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

.message-bubble.user-message .message-content {
  align-items: flex-end;
}

.message-bubble.ai-message .message-content {
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

.message-bubble.user-message .message-text {
  background: var(--primary-color);
  color: var(--text-white);
  border-bottom-right-radius: 4px;
}

.message-bubble.ai-message .message-text {
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
