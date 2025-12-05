<!-- src/components/settings/ModelSettings.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { AIModel } from '@/types/chat'
import { Check } from '@element-plus/icons-vue'

const settingsStore = useSettingsStore()

// 模型选项
const modelOptions = [
  {
    value: 'deepseek-chat' as AIModel,
    label: 'DeepSeek Chat',
    icon: '💬',
    description: '通用对话模型，适合日常聊天和问答',
  },
  {
    value: 'deepseek-reasoner' as AIModel,
    label: 'DeepSeek Reasoner',
    icon: '💭',
    description: '推理模型，显示思考过程，适合复杂问题分析',
  },
]

const model = computed({
  get: () => settingsStore.model,
  set: (value) => settingsStore.setModel(value),
})

const temperature = computed({
  get: () => settingsStore.temperature,
  set: (value) => settingsStore.setTemperature(value),
})
</script>

<template>
  <div class="settings-section">
    <h3 class="section-title">模型设置</h3>
    <div class="section-content">
      <div class="form-item">
        <label class="form-label">选择模型</label>
        <div class="model-options">
          <div
            v-for="modelOption in modelOptions"
            :key="modelOption.value"
            class="model-option"
            :class="{ selected: model === modelOption.value }"
            @click="model = modelOption.value"
          >
            <div class="model-icon">{{ modelOption.icon }}</div>
            <div class="model-info">
              <div class="model-name">{{ modelOption.label }}</div>
              <div class="model-description">{{ modelOption.description }}</div>
            </div>
            <div class="model-check" v-if="model === modelOption.value">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">温度 (Temperature)</label>
        <div class="temperature-control">
          <el-slider v-model="temperature" :min="0" :max="1" :step="0.1" show-stops />
          <span class="temperature-value">{{ temperature.toFixed(1) }}</span>
        </div>
        <div class="form-hint">
          控制输出的随机性。较低的值使输出更确定，较高的值使输出更随机。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-section {
  margin-bottom: 28px;
  animation: fadeInUp 0.4s ease-out;
  animation-fill-mode: both;
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

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.3px;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 18px;
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.section-content {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.section-content:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.form-item {
  margin-bottom: 24px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.2px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  line-height: 1.5;
  opacity: 0.8;
}

.model-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-option {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.model-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-color);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.model-option:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.model-option:hover::before {
  transform: scaleY(1);
}

.model-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
  box-shadow:
    0 4px 16px rgba(37, 99, 235, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.model-option.selected::before {
  transform: scaleY(1);
}

.model-icon {
  font-size: 32px;
  margin-right: 16px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  flex-shrink: 0;
}

.model-info {
  flex: 1;
  min-width: 0;
}

.model-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

.model-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  opacity: 0.8;
}

.model-check {
  color: var(--primary-color);
  font-size: 20px;
  margin-left: 12px;
  flex-shrink: 0;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.temperature-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.temperature-control :deep(.el-slider) {
  flex: 1;
}

.temperature-control :deep(.el-slider__runway) {
  background: rgba(255, 255, 255, 0.1);
  height: 6px;
}

.temperature-control :deep(.el-slider__bar) {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  height: 6px;
}

.temperature-control :deep(.el-slider__button) {
  width: 18px;
  height: 18px;
  border: 3px solid var(--primary-color);
  background: var(--surface-dark);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

.temperature-control :deep(.el-slider__button:hover) {
  transform: scale(1.2);
}

.temperature-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 50px;
  text-align: center;
  padding: 6px 12px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(37, 99, 235, 0.2);
}
</style>

