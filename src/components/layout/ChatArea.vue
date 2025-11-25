<!-- src/components/layout/ChatArea.vue -->
<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageList from '@/components/chat/MessageList.vue'
import InputArea from '@/components/chat/InputArea.vue'

const chatStore = useChatStore()

const messagesEndRef = ref<HTMLElement>()

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// 监听消息变化，自动滚动
watch(() => chatStore.messages.length, scrollToBottom, { immediate: true })

const handleSendMessage = async (content: string) => {
  await chatStore.sendMessage(content)
}
</script>

<template>
  <div class="chat-area">
    <!-- 消息列表区域 -->
    <div class="messages-container">
      <MessageList :messages="chatStore.messages" :is-loading="chatStore.isLoading" />
      <div ref="messagesEndRef" />
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <InputArea :disabled="chatStore.isLoading" @send="handleSendMessage" />
    </div>
  </div>
</template>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-dark);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.input-container {
  padding: 20px;
  border-top: 1px solid var(--border-dark);
  background: var(--surface-dark);
}
</style>
