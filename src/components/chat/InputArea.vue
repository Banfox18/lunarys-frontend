<!-- src/components/chat/InputArea.vue -->
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

interface Props {
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  send: [content: string]
}>()

const chatStore = useChatStore()
const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

const isEmpty = computed(() => !inputText.value.trim())
const isStreaming = computed(() => chatStore.isLoading)

const handleSend = () => {
  if (isEmpty.value || props.disabled) return

  const content = inputText.value.trim()
  inputText.value = ''
  emit('send', content)

  // 重置textarea高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

const handleStop = () => {
  chatStore.stopStreaming()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

const handleInput = () => {
  adjustTextareaHeight()
}
</script>

<template>
  <div class="input-area">
    <div class="input-container">
      <!-- 文本输入区域 -->
      <textarea
        ref="textareaRef"
        v-model="inputText"
        :disabled="disabled || isStreaming"
        placeholder="输入消息... (Enter发送，Shift+Enter换行)"
        class="message-input"
        @keydown="handleKeyDown"
        @input="handleInput"
        rows="1"
      ></textarea>

      <!-- 发送/停止按钮 -->
      <el-button
        v-if="!isStreaming"
        type="primary"
        :disabled="isEmpty || disabled"
        class="send-button"
        @click="handleSend"
      >
        <el-icon><Promotion /></el-icon>
      </el-button>

      <el-button
        v-else
        type="warning"
        class="stop-button"
        @click="handleStop"
      >
        <el-icon><VideoPause /></el-icon>
      </el-button>
    </div>

    <!-- 底部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="text" size="small" class="tool-button">
          <el-icon><Paperclip /></el-icon>
        </el-button>
        <el-button type="text" size="small" class="tool-button">
          <el-icon><Picture /></el-icon>
        </el-button>
      </div>

      <div class="toolbar-right">
        <div v-if="isStreaming" class="streaming-indicator">
          <div class="pulse-dot"></div>
          <span>AI正在输入...</span>
        </div>
        <el-button type="text" size="small" class="tool-button">
          <el-icon><MagicStick /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  background: var(--surface-dark);
  border: 1px solid var(--border-dark);
  border-radius: 12px;
  padding: 12px;
  transition: all var(--transition-normal) ease;
}

.input-area:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--text-muted);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  flex: 0 0 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--primary-color);
  border: none;
  transition: all var(--transition-normal) ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:not(:disabled):hover {
  background: var(--primary-light);
  transform: scale(1.05);
}

.send-button:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
  transform: none;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-dark);
}

.tool-button {
  color: var(--text-secondary);
  transition: all var(--transition-fast) ease;
}

.tool-button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

/* 添加流式指示器样式 */
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color);
  font-size: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.stop-button {
  flex: 0 0 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--warning-color);
  border: none;
  transition: all var(--transition-normal) ease;
}

.stop-button:hover {
  background: #dc2626;
  transform: scale(1.05);
}
</style>
