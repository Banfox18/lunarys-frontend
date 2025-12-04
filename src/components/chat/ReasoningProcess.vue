<!-- src/components/chat/ReasoningProcess.vue -->
<template>
  <div class="reasoning-process">
    <div class="reasoning-header" @click="toggleCollapse">
      <div class="reasoning-icon">💭</div>
      <span class="reasoning-title">思考过程</span>
      <div class="collapse-icon">
        {{ isCollapsed ? '▶' : '▼' }}
      </div>
    </div>

    <div v-if="!isCollapsed" class="reasoning-content">
      <div class="reasoning-text">{{ content }}</div>
      <div v-if="isStreaming" class="reasoning-typing">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content: string
  isStreaming?: boolean
  defaultCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultCollapsed: true
})

const isCollapsed = ref(props.defaultCollapsed)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.reasoning-process {
  background: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(76, 83, 103, 0.3);
  border-radius: 12px;
  padding: 12px;
  margin: 8px 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.reasoning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-dark);
  cursor: pointer;
  user-select: none;
}

.reasoning-header:hover {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  margin: -4px -8px;
}

.reasoning-icon {
  font-size: 16px;
}

.reasoning-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.collapse-icon {
  font-size: 10px;
  color: var(--text-tertiary);
}

.reasoning-content {
  color: var(--text-primary);
}

.reasoning-text {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.reasoning-typing {
  margin-top: 8px;
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
