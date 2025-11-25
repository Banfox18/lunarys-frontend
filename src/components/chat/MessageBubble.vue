<!-- src/components/chat/MessageBubble.vue - 只修改script部分 -->
<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

interface Props {
  role: 'user' | 'assistant'
  content: string
  animate?: boolean
}

const props = defineProps<Props>()

// 配置marked选项
marked.setOptions({
  breaks: true,        // 将\n转换为<br>
  gfm: true,           // 启用GitHub风格的Markdown
  sanitize: false,     // 不清理HTML（允许样式）
  smartypants: true,   // 智能标点符号
})

const formattedContent = computed(() => {
  // 简单的Markdown解析
  return marked.parse(props.content)
})
</script>

<template>
  <div class="message-bubble" :class="[role, { animate__animated: animate }]">
    <div class="avatar">
      <div v-if="role === 'user'" class="user-avatar">👤</div>
      <div v-else class="assistant-avatar">🤖</div>
    </div>

    <div class="bubble-content">
      <div class="content" v-html="formattedContent"></div>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  animation-duration: 0.5s;
}

.message-bubble.user {
  flex-direction: row-reverse;
}

.message-bubble.assistant {
  flex-direction: row;
}

/* 头像样式 */
.avatar {
  flex: 0 0 32px;
}

.user-avatar,
.assistant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: transform var(--transition-normal) ease;
}

.user-avatar {
  background: var(--primary-color);
}

.assistant-avatar {
  background: var(--secondary-color);
}

.message-bubble:hover .user-avatar,
.message-bubble:hover .assistant-avatar {
  transform: scale(1.1);
}

/* 消息气泡样式 */
.bubble-content {
  max-width: 70%;
}

.message-bubble.user .bubble-content {
  display: flex;
  justify-content: flex-end;
}

.content {
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  transition: all var(--transition-normal) ease;
}

.message-bubble.user .content {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.assistant .content {
  background: var(--surface-dark);
  color: var(--text-primary);
  border: 1px solid var(--border-dark);
  border-bottom-left-radius: 4px;
}

.message-bubble:hover .content {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Markdown内容样式 */
.content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.message-bubble.assistant .content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
}

.content :deep(pre) {
  background: rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-bubble.assistant .content :deep(pre) {
  background: rgba(255, 255, 255, 0.05);
}

/* 增强Markdown内容样式 */
.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4),
.content :deep(h5),
.content :deep(h6) {
  margin: 1em 0 0.5em 0;
  font-weight: 600;
  line-height: 1.25;
}

.content :deep(h1) { font-size: 1.5em; }
.content :deep(h2) { font-size: 1.3em; }
.content :deep(h3) { font-size: 1.2em; }

.content :deep(p) {
  margin: 0.5em 0;
}

.content :deep(ul),
.content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.content :deep(li) {
  margin: 0.25em 0;
}

.content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 1em 0;
  padding: 0.5em 1em;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
}

.content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.message-bubble.assistant .content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
}

.content :deep(pre) {
  background: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.message-bubble.assistant .content :deep(pre) {
  background: rgba(255, 255, 255, 0.05);
}

.content :deep(pre code) {
  background: none;
  padding: 0;
}

.content :deep(table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

.content :deep(th),
.content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5em;
  text-align: left;
}

.content :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

.content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.content :deep(a:hover) {
  text-decoration: underline;
}

.content :deep(strong) {
  font-weight: 600;
}

.content :deep(em) {
  font-style: italic;
}

/* 流式动画 */
.message-bubble.animate__animated .content {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
