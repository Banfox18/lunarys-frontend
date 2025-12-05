<!-- src/components/settings/StreamingSettings.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const enableStreaming = computed({
  get: () => settingsStore.enableStreaming,
  set: (value) => {
    settingsStore.enableStreaming = value
  },
})
</script>

<template>
  <div class="settings-section">
    <h3 class="section-title">响应设置</h3>
    <div class="section-content">
      <div class="form-item">
        <div class="toggle-item">
          <div class="toggle-info">
            <div class="toggle-label">启用流式传输</div>
            <div class="toggle-description">实时显示AI的思考过程，提供更好的交互体验</div>
          </div>
          <el-switch v-model="enableStreaming" />
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

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.toggle-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.toggle-info {
  flex: 1;
  margin-right: 16px;
}

.toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

.toggle-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  opacity: 0.8;
}

.toggle-item :deep(.el-switch) {
  --el-switch-on-color: var(--primary-color);
}

.toggle-item :deep(.el-switch__core) {
  width: 48px;
  height: 24px;
}
</style>

