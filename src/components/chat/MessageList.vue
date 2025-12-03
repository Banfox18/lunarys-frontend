<!-- src/components/chat/MessageList.vue -->
<script setup lang="ts">
import type { Message } from '@/types/chat'
import MessageBubble from './MessageBubble.vue'
import TypingIndicator from './TypingIndicator.vue'

interface Props {
  messages: Message[]
  isLoading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="message-list">
    <!-- 欢迎消息 -->
    <div v-if="messages.length === 0" class="welcome-message">
      <div class="welcome-icon">🌟</div>
      <h2 class="welcome-title">欢迎使用 Lunarys</h2>
      <p class="welcome-subtitle">我是您的AI助手，随时为您提供帮助</p>
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
  padding: 20px;
}

.message-list::-webkit-scrollbar {
  width: 9px;
}

.message-list::-webkit-scrollbar-track {
  background: var(--surface-dark-hover);
  border-radius: 5px;
}

.message-list::-webkit-scrollbar-thumb {
  background: var(--border-dark);
  border-radius: 5px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.welcome-subtitle {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.8;
}

.welcome-examples {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface-dark);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  border: 1px solid var(--border-dark);
  color: var(--text-primary);
}

.example-item:hover {
  background: var(--surface-dark-hover);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.example-icon {
  font-size: 18px;
}

.messages {
  display: flex;
  flex-direction: column;
}

/* 消息动画 */
.message-enter-active,
.message-leave-active {
  transition: all var(--transition-normal) ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
