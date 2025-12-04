<!-- src/components/chat/InputArea.vue -->
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSettingsStore } from '@/stores/settings'
import { Promotion, VideoPause, Paperclip, Picture, MagicStick } from '@element-plus/icons-vue'

interface Props {
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  send: [content: string]
}>()

const chatStore = useChatStore()
const settingsStore = useSettingsStore()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

// 计算属性
const isEmpty = computed(() => !inputText.value.trim())
const isStreaming = computed(() => chatStore.isLoading)
const enableStreaming = computed(() => settingsStore.enableStreaming)

// 发送消息
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

// 停止流式传输
const handleStop = () => {
  chatStore.stopStreaming()
}

// 切换流式传输
const toggleStreaming = () => {
  settingsStore.toggleStreaming()
  settingsStore.saveSettings()
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

// 调整textarea高度
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
    <!-- 模式指示器 -->
    <div class="mode-indicator">
      <div
        class="mode-toggle"
        @click="toggleStreaming"
        :title="enableStreaming ? '点击切换为完整模式' : '点击切换为流式模式'"
      >
        <div class="mode-dot" :class="{ streaming: enableStreaming }"></div>
        <span class="mode-text">
          {{ enableStreaming ? '流式模式' : '完整模式' }}
        </span>
        <span class="mode-hint">
          {{ enableStreaming ? '实时响应' : '完整响应' }}
        </span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <!-- 文本输入框 -->
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

      <el-button v-else type="warning" class="stop-button" @click="handleStop">
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
        <!-- 流式传输指示器 -->
        <div v-if="isStreaming && enableStreaming" class="streaming-indicator">
          <div class="pulse-dot"></div>
          <span>AI正在输入...</span>
        </div>

        <!-- 完整模式指示器 -->
        <div v-if="isStreaming && !enableStreaming" class="complete-indicator">
          <div class="loading-dot"></div>
          <span>正在生成完整响应...</span>
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
  background: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(76, 83, 103, 0.3);
  border-radius: 12px;
  padding: 12px;
  transition: all var(--transition-normal) ease;

  /* 多层阴影效果 */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.input-area:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* 模式指示器 */
.mode-indicator {
  margin-bottom: 8px;
}

.mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 16px;
  background: var(--surface-dark-hover);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.mode-toggle:hover {
  background: var(--surface-dark-active);
}

.mode-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  transition: all 0.2s ease;
}

.mode-dot.streaming {
  background: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.mode-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.mode-hint {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* 输入容器 */
.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-input::-webkit-scrollbar {
  width: 9px;
}

.message-input::-webkit-scrollbar-track {
  background: var(--surface-dark-hover);
  border-radius: 5px;
}

.message-input::-webkit-scrollbar-thumb {
  background: var(--border-dark);
  border-radius: 5px;
}

.message-input::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
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
  color: var(--text-tertiary);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮样式 */
.send-button,
.stop-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  padding: 0;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-button {
  padding: 4px;
  color: var(--text-secondary);
}

.tool-button:hover {
  color: var(--text-primary);
  background: var(--surface-dark-hover);
}

/* 指示器样式 */
.streaming-indicator,
.complete-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--surface-dark-hover);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: pulse 1.5s infinite;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--warning-color);
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
