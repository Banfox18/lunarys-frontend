<!-- src/components/chat/MessageList.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types/chat'
import { useSettingsStore } from '@/stores/settings'
import MessageBubble from './MessageBubble.vue'
import TypingIndicator from './TypingIndicator.vue'

interface Props {
  messages: Message[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: [message: Message]
}>()

const handleRetry = (message: Message) => {
  emit('retry', message)
}

const settingsStore = useSettingsStore()

// 获取头像配置 - 使用 computed 确保响应式
const userAvatar = computed(() => settingsStore.getUserAvatar())
const aiAvatar = computed(() => settingsStore.getAiAvatar())
// 直接访问 settings ref 中的 avatars，确保响应式更新
const userAvatarBg = computed(() => settingsStore.settings.avatars?.userAvatarBg)
const aiAvatarBg = computed(() => settingsStore.settings.avatars?.aiAvatarBg)
</script>

<template>
  <div class="message-list">
    <!-- 欢迎消息 -->
    <div v-if="messages.length === 0" class="welcome-message">
      <div class="welcome-icon">🌟</div>
      <h2 class="welcome-title">欢迎回到 Lunarys ！</h2>
      <p class="welcome-subtitle">如果你需要任何帮助，请随时告诉我~</p>
      <div class="welcome-examples">
        <div class="example-item">
          <span class="example-icon">💡</span>
          <span>帮我写一段代码</span>
        </div>
        <div class="example-item">
          <span class="example-icon">📚</span>
          <span>解释这个概念</span>
        </div>
        <div class="example-item">
          <span class="example-icon">✍️</span>
          <span>帮我写一篇文章</span>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <TransitionGroup name="message" tag="div" class="messages">
      <MessageBubble
        v-for="message in messages"
        :key="message.id || message.createdAt"
        :message="message"
        :is-streaming="isLoading && message.role === 'assistant' && message.content === ''"
        :user-avatar="userAvatar"
        :ai-avatar="aiAvatar"
        :user-avatar-bg="userAvatarBg"
        :ai-avatar-bg="aiAvatarBg"
        @retry="handleRetry"
      />
    </TransitionGroup>

    <!-- 打字指示器 -->
    <TypingIndicator v-if="isLoading" />
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  border: 1px solid transparent;
  background-clip: padding-box;
  transition: background 0.3s ease;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
  background-clip: padding-box;
}

.welcome-message {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  animation: welcomeFadeIn 0.6s ease-out;
}

@keyframes welcomeFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  font-size: 56px;
  margin-bottom: 20px;
  display: inline-block;
  animation: iconFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(5deg);
  }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  margin-bottom: 40px;
  opacity: 0.7;
  color: var(--text-secondary);
}

.welcome-examples {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 0 auto;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.example-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.example-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-3px) translateX(4px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.example-item:hover::before {
  left: 100%;
}

.example-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.example-item:hover .example-icon {
  transform: scale(1.2) rotate(5deg);
}

.messages {
  display: flex;
  flex-direction: column;
}

/* 消息动画 - 更流畅的效果 */
.message-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}

.message-move {
  transition: transform 0.3s ease;
}
</style>
