<!-- 修改MessageBubble.vue -->
<template>
  <div :class="['message-bubble', { 'user-message': isUser, 'ai-message': !isUser }]">
    <div v-if="displayAvatar" class="message-avatar">
      <div
        v-if="isUser"
        class="avatar user-avatar"
        :style="{
          backgroundColor:
            userAvatarBg === 'transparent' ? 'transparent' : userAvatarBg || 'var(--primary-color)',
          backgroundImage:
            userAvatarBg === 'transparent'
              ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
              : 'none',
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
            aiAvatarBg === 'transparent' ? 'transparent' : aiAvatarBg || 'var(--secondary-color)',
          backgroundImage:
            aiAvatarBg === 'transparent'
              ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
              : 'none',
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

      <!-- 消息 Footer 小组件栏 -->
      <div class="message-footer">
        <!-- 用户消息的 Footer：时间在左，操作按钮在右 -->
        <template v-if="isUser">
          <div class="footer-time">
            {{ message.createdAt ? formatMessageTime(message.createdAt) : '' }}
          </div>
          <div class="footer-actions">
            <button
              :class="['footer-button', 'copy-button', `copy-status-${copyStatus}`]"
              @click="copyToClipboard"
              :title="copyButtonText"
              :disabled="copyStatus !== 'idle' || isStreaming"
            >
              <el-icon>
                <component :is="copyIconComponent" />
              </el-icon>
            </button>
            <button
              class="footer-button retry-button"
              @click="handleRetry"
              :title="'重新编辑输出'"
              :disabled="isStreaming"
            >
              <el-icon>
                <EditPen />
              </el-icon>
            </button>
          </div>
        </template>
        <!-- AI 消息的 Footer：操作按钮在左，时间在右 -->
        <template v-else>
          <div class="footer-actions">
            <button
              :class="['footer-button', 'copy-button', `copy-status-${copyStatus}`]"
              @click="copyToClipboard"
              :title="copyButtonText"
              :disabled="copyStatus !== 'idle' || isStreaming"
            >
              <el-icon>
                <component :is="copyIconComponent" />
              </el-icon>
            </button>
            <button
              class="footer-button retry-button"
              @click="handleRetry"
              :title="'重新生成回复'"
              :disabled="isStreaming"
            >
              <el-icon>
                <RefreshLeft />
              </el-icon>
            </button>
          </div>
          <div class="footer-time">
            {{ message.createdAt ? formatMessageTime(message.createdAt) : '' }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue'
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ReasoningProcess from './ReasoningProcess.vue'
import {
  DocumentCopy,
  Check,
  CircleCloseFilled,
  RefreshLeft,
  EditPen,
} from '@element-plus/icons-vue'

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

const emit = defineEmits<{
  retry: [message: Message]
}>()

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

// 复制按钮图标组件
const copyIconComponent = computed(() => {
  switch (copyStatus.value) {
    case 'success':
      return Check
    case 'error':
      return CircleCloseFilled
    default:
      return DocumentCopy
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

// 处理撤回/重新生成/重新编辑
const handleRetry = () => {
  if (props.isStreaming) return
  emit('retry', props.message)
}
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
  width: fit-content;
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

/* 消息 Footer 小组件栏 */
.message-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 4px 0;
  min-height: 24px;
}

/* 用户消息 Footer：时间在左，操作按钮在右 */
.message-bubble.user-message .message-footer {
  justify-content: flex-end;
  flex-direction: row;
}

.message-bubble.user-message .footer-time {
  order: 1;
}

.message-bubble.user-message .footer-actions {
  order: 2;
}

/* AI 消息 Footer：操作按钮在左，时间在右 */
.message-bubble.ai-message .message-footer {
  justify-content: flex-start;
  flex-direction: row;
}

.footer-time {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.6;
  white-space: nowrap;
  user-select: none;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Footer 按钮样式 */
.footer-button {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  opacity: 0.7;
  padding: 0;
}

.footer-button .el-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
  transform: translateY(-1px);
}

.footer-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* 用户消息的按钮样式 */
.message-bubble.user-message .footer-button {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.message-bubble.user-message .footer-button:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.25);
  border-color: rgba(37, 99, 235, 0.35);
  color: rgba(255, 255, 255, 1);
}

.message-bubble.user-message .footer-button .el-icon {
  color: inherit;
}

/* AI 消息的按钮样式 */
.message-bubble.ai-message .footer-button {
  background: rgba(76, 83, 103, 0.1);
  border-color: rgba(76, 83, 103, 0.15);
  color: var(--text-secondary);
}

.message-bubble.ai-message .footer-button:hover:not(:disabled) {
  background: rgba(76, 83, 103, 0.2);
  border-color: rgba(76, 83, 103, 0.25);
  color: var(--text-primary);
}

.message-bubble.ai-message .footer-button .el-icon {
  color: inherit;
}

/* 成功状态图标颜色 */
.footer-button.copy-button.copy-status-success {
  color: #67c23a;
}

.footer-button.copy-button.copy-status-success .el-icon {
  color: #67c23a;
}

/* 错误状态图标颜色 */
.footer-button.copy-button.copy-status-error {
  color: #f56c6c;
}

.footer-button.copy-button.copy-status-error .el-icon {
  color: #f56c6c;
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
