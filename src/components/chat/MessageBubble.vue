<!-- 修改MessageBubble.vue -->
<template>
  <div
    :class="['message-bubble', { 'user-message': isUser, 'ai-message': !isUser }]"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div v-if="displayAvatar" class="message-avatar">
      <div
        v-if="isUser"
        class="avatar user-avatar"
        :style="{
          backgroundColor:
            userAvatarBg && userAvatarBg !== 'transparent' ? userAvatarBg : 'var(--primary-color)',
          backgroundImage:
            userAvatarBg === 'transparent'
              ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
              : userAvatarBg && userAvatarBg !== 'transparent'
                ? 'none'
                : undefined,
        }"
      >
        <img v-if="isImageUrl(userAvatar)" :src="userAvatar" alt="用户头像" class="avatar-image" />
        <span v-else-if="userAvatar">{{ userAvatar }}</span>
      </div>
      <div
        v-else
        class="avatar ai-avatar"
        :style="{
          backgroundColor:
            aiAvatarBg && aiAvatarBg !== 'transparent' ? aiAvatarBg : 'var(--secondary-color)',
          backgroundImage:
            aiAvatarBg === 'transparent'
              ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
              : aiAvatarBg && aiAvatarBg !== 'transparent'
                ? 'none'
                : undefined,
        }"
      >
        <img v-if="isImageUrl(aiAvatar)" :src="aiAvatar" alt="AI头像" class="avatar-image" />
        <span v-else-if="aiAvatar">{{ aiAvatar }}</span>
      </div>
    </div>

    <div class="message-content">
      <div class="message-header">
        <div class="message-role">
          {{ isUser ? 'Administrator' : 'Lunarys' }}
        </div>
      </div>

      <div class="message-text">
        <!-- 使用transition包裹 -->
        <transition name="action-bar">
          <div v-if="isHovering && !isStreaming" class="hover-action-bar">
            <button
              class="action-button copy-button"
              @click="copyToClipboard"
              :title="copyButtonText"
              :disabled="copyStatus !== 'idle'"
            >
              {{ copyIcon }}
            </button>
            <!-- 未来可以在这里添加其他按钮 -->
          </div>
        </transition>
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
        {{ message.createdAt ? formatMessageTime(message.createdAt) : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue'
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ReasoningProcess from './ReasoningProcess.vue'

interface Props {
  message: Message
  isStreaming?: boolean
  reasoningContent?: string // 思考过程内容
  userAvatar?: string // 用户头像，支持URL或emoji，为空则不显示
  aiAvatar?: string // AI头像，支持URL或emoji，为空则不显示
  userAvatarBg?: string // 用户头像背景色
  aiAvatarBg?: string // AI头像背景色
}

const props = withDefaults(defineProps<Props>(), {
  userAvatar: undefined,
  aiAvatar: undefined,
  userAvatarBg: undefined,
  aiAvatarBg: undefined,
})

const isUser = computed(() => props.message.role === 'user')
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

// 判断是否为图片URL
const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return (
    avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image')
  )
}

// 计算是否显示头像
const displayAvatar = computed(() => {
  if (isUser.value) {
    return props.userAvatar !== undefined && props.userAvatar !== ''
  } else {
    return props.aiAvatar !== undefined && props.aiAvatar !== ''
  }
})

const isHovering = ref(false)
// 复制按钮图标
const copyIcon = computed(() => {
  switch (copyStatus.value) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    default:
      return '📋'
  }
})

// 是否显示思考过程
const showReasoning = computed(
  () => !isUser.value && props.reasoningContent && props.reasoningContent.trim().length > 0,
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
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    copyStatus.value = 'error'
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  }
}

const copyButtonText = computed(() => {
  switch (copyStatus.value) {
    case 'success':
      return '已复制到剪贴板'
    case 'error':
      return '复制失败'
    default:
      return '复制文本'
  }
})
// 时间格式化函数
const formatMessageTime = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp)
  const now = new Date()

  // 判断是否是今天
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  // 判断是否是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  // 格式化时间
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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
      day: '2-digit',
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
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  /* 默认背景色，如果设置了自定义背景色则会被内联样式覆盖 */
  background-color: var(--primary-color);
  color: var(--text-white);
}

.ai-avatar {
  /* 默认背景色，如果设置了自定义背景色则会被内联样式覆盖 */
  background-color: var(--secondary-color);
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

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  position: relative;
}

.message-bubble.user-message .message-text {
  background: rgba(37, 99, 235, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-white);
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.message-bubble.ai-message .message-text {
  background: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(76, 83, 103, 0.3);
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
/* 悬停操作栏样式 */
.hover-action-bar {
  position: absolute;
  top: -44px;
  right: 0;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.message-bubble.user-message .hover-action-bar {
  right: 0;
  left: auto;
}

.message-bubble.ai-message .hover-action-bar {
  right: 0;
  left: auto;
}

/* Vue Transition 动画 */
.action-bar-enter-active,
.action-bar-leave-active {
  transition:
    opacity var(--transition-normal) ease,
    transform var(--transition-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
}
.action-bar-enter-from,
.action-bar-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.action-bar-enter-to,
.action-bar-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
/* 操作按钮样式 - 增强渐变版 */
.action-button {
  width: 36px;
  height: 32px;
  border-radius: 0;
  background:
    /* 中间实色层 */
    linear-gradient(
      to top,
      rgba(37, 99, 235, 0) 0%,
      rgba(37, 99, 235, 0.3) 50%,
      rgba(37, 99, 235, 0) 100%
    ),
    /* 四周透明渐变层 */
      radial-gradient(
        circle at center,
        rgba(37, 99, 235, 0.3) 0%,
        rgba(37, 99, 235, 0) 50%,
        transparent 100%
      );
  border: none;
  border-left: 2px solid rgba(37, 99, 235, 0.2);
  border-right: 2px solid rgba(37, 99, 235, 0.2);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) ease;
  position: relative;
  overflow: hidden;
}

.action-button:hover {
  background:
    linear-gradient(
      to top,
      rgba(59, 130, 246, 0) 0%,
      rgba(59, 130, 246, 0.3) 50%,
      rgba(59, 130, 246, 0) 100%
    ),
    radial-gradient(
      circle at center,
      rgba(59, 130, 246, 0.4) 0%,
      rgba(59, 130, 246, 0.04) 50%,
      transparent 100%
    );
  border: none;
  border-left: 2px solid rgba(59, 130, 246, 0.2);
  border-right: 2px solid rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

/* 流光动画效果 */
.action-button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: translateX(-100%) rotate(45deg);
  transition: transform 0.8s ease;
}

.action-button:hover::after {
  transform: translateX(100%) rotate(45deg);
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}
</style>
