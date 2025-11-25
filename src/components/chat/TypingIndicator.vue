<!-- src/components/chat/TypingIndicator.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const dots = ref('')

onMounted(() => {
  const interval = setInterval(() => {
    dots.value = dots.value.length >= 3 ? '' : dots.value + '.'
  }, 500)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<template>
  <div class="typing-indicator">
    <div class="typing-avatar">
      <div class="assistant-avatar">🤖</div>
    </div>

    <div class="typing-content">
      <div class="typing-bubble">
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <span class="typing-text">AI正在思考{{ dots }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;
}

.typing-avatar {
  flex: 0 0 32px;
}

.assistant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--secondary-color);
}

.typing-content {
  max-width: 70%;
}

.typing-bubble {
  padding: 12px 16px;
  background: var(--surface-dark);
  border: 1px solid var(--border-dark);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse 2s infinite;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-text {
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes fadeIn {
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
