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
    <!-- <div class="typing-avatar">
      <div class="assistant-avatar">🤖</div>
    </div> -->

    <!-- <div class="typing-content">
      <div class="typing-bubble">
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <span class="typing-text">AI正在思考{{ dots }}</span>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.typing-indicator {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.typing-avatar {
  flex: 0 0 36px;
}

.assistant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.2);
  color: rgba(196, 181, 253, 0.9);
  animation: avatarPulse 2s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0);
  }
}

.typing-content {
  max-width: 70%;
}

.typing-bubble {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.typing-dots {
  display: flex;
  gap: 5px;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: bounce 1.4s infinite ease-in-out both;
  opacity: 0.6;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}
.dot:nth-child(2) {
  animation-delay: -0.16s;
}
.dot:nth-child(3) {
  animation-delay: 0s;
}

.typing-text {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  opacity: 0.8;
  letter-spacing: 0.2px;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.85);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
