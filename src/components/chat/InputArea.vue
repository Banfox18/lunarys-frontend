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
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.15),
    0 1px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.input-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.input-area:focus-within {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow:
    0 6px 32px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.input-area:focus-within::before {
  opacity: 1;
}

/* 模式指示器 */
.mode-indicator {
  margin-bottom: 10px;
}

.mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mode-toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mode-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mode-toggle:hover::before {
  opacity: 1;
}

.mode-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.mode-dot.streaming {
  background: rgba(59, 130, 246, 0.9);
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.15),
    0 0 12px rgba(59, 130, 246, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 3px rgba(59, 130, 246, 0.15),
      0 0 12px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow:
      0 0 0 4px rgba(59, 130, 246, 0.2),
      0 0 16px rgba(59, 130, 246, 0.4);
  }
}

.mode-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
  letter-spacing: -0.2px;
}

.mode-hint {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.7;
  position: relative;
  z-index: 1;
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
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.message-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.message-input:focus {
  color: var(--text-primary);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮样式 */
.send-button,
.stop-button {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.send-button {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(124, 58, 237, 0.2));
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: rgba(147, 197, 253, 0.9);
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(124, 58, 237, 0.3));
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.send-button:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.stop-button {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2));
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: rgba(251, 191, 36, 0.9);
}

.stop-button:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3));
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}

.stop-button:active {
  transform: translateY(0) scale(1);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-button {
  padding: 6px 8px;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.tool-button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.tool-button:active {
  transform: translateY(0);
}

/* 指示器样式 */
.streaming-indicator,
.complete-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.streaming-indicator:hover,
.complete-indicator:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
  animation: pulseDot 1.5s infinite;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.loading-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.9);
  animation: spinDot 1s linear infinite;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

@keyframes pulseDot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.85);
  }
}

@keyframes spinDot {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.9);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
