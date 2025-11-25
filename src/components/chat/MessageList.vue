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
        :role="message.role"
        :content="message.content"
        :animate="true"
      />
    </TransitionGroup>

    <!-- 打字指示器 -->
    <TypingIndicator v-if="isLoading" />
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* 欢迎消息样式 */
.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.8;
}

.welcome-examples {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface-dark);
  border: 1px solid var(--border-dark);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  font-size: 14px;
}

.example-item:hover {
  background: var(--surface-dark-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.example-icon {
  font-size: 16px;
}

/* 消息过渡动画 */
.message-move,
.message-enter-active,
.message-leave-active {
  transition: all 0.5s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.message-leave-active {
  position: absolute;
}
</style>
