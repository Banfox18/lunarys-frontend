<!-- src/components/settings/SettingsPanel.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import ModelSettings from './ModelSettings.vue'
import StreamingSettings from './StreamingSettings.vue'
import ApiSettings from './ApiSettings.vue'
import BackgroundSettings from './BackgroundSettings.vue'
import AvatarSettings from './AvatarSettings.vue'
import AvatarCropperDialog from './AvatarCropperDialog.vue'

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()

// 子组件引用
const backgroundSettingsRef = ref<InstanceType<typeof BackgroundSettings> | null>(null)
const avatarSettingsRef = ref<InstanceType<typeof AvatarSettings> | null>(null)

// 头像裁剪对话框状态
const showCropper = ref(false)
const cropperImageUrl = ref('')
const cropperType = ref<'user' | 'ai'>('user')

// 打开裁剪对话框
const handleOpenCropper = (data: { imageUrl: string; type: 'user' | 'ai' }) => {
  cropperImageUrl.value = data.imageUrl
  cropperType.value = data.type
  showCropper.value = true
}

// 处理裁剪完成
const handleCropComplete = (dataUrl: string) => {
  // 清理裁剪时使用的blob URL
  if (cropperImageUrl.value && cropperImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageUrl.value)
  }

  // 调用子组件的方法处理裁剪结果
  if (avatarSettingsRef.value) {
    avatarSettingsRef.value.handleCropComplete(dataUrl, cropperType.value)
  }

  showCropper.value = false
  cropperImageUrl.value = ''
}

// 取消裁剪
const handleCropCancel = () => {
  // 清理裁剪时使用的blob URL
  if (cropperImageUrl.value && cropperImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageUrl.value)
  }
  cropperImageUrl.value = ''
  showCropper.value = false
}

// 保存设置
const saveSettings = async () => {
  try {
    // 保存背景设置
    if (backgroundSettingsRef.value) {
      await backgroundSettingsRef.value.saveBackground()
    }

    // 保存头像设置
    if (avatarSettingsRef.value) {
      avatarSettingsRef.value.saveAvatars()
    }

    settingsStore.saveSettings()
    ElMessage.success('设置已保存')
    emit('close')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 恢复默认设置
const resetSettings = () => {
  settingsStore.setModel('deepseek-chat')
  settingsStore.setTemperature(0.8)
  settingsStore.enableStreaming = true
  settingsStore.setApiKey('')

  // 重置背景设置
  if (backgroundSettingsRef.value) {
    backgroundSettingsRef.value.resetBackground()
  }

  // 重置头像设置
  if (avatarSettingsRef.value) {
    avatarSettingsRef.value.resetAvatars()
  }
}
</script>

<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2 class="settings-title">设置</h2>
      <el-button
        type="text"
        @click="$emit('close')"
        class="close-btn"
        style="border: none; outline: none"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <div class="settings-content">
      <!-- 模型设置 -->
      <ModelSettings />

      <!-- 流式传输设置 -->
      <StreamingSettings />

      <!-- API设置 -->
      <ApiSettings />

      <!-- 聊天背景设置 -->
      <BackgroundSettings ref="backgroundSettingsRef" />

      <!-- 头像设置 -->
      <AvatarSettings ref="avatarSettingsRef" @open-cropper="handleOpenCropper" />
    </div>

    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">恢复默认</el-button>
    </div>
  </div>

  <!-- 头像裁剪对话框 - 使用 Teleport 传送到 body，成为独立窗口 -->
  <Teleport to="body">
    <AvatarCropperDialog
      v-model="showCropper"
      :image-url="cropperImageUrl"
      @crop="handleCropComplete"
      @cancel="handleCropCancel"
    />
  </Teleport>
</template>

<style scoped>
.settings-panel {
  background: linear-gradient(135deg, var(--surface-dark) 0%, var(--surface-darker) 100%);
  border-radius: 16px;
  padding: 28px;
  max-width: 560px;
  margin: 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.settings-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  border-radius: 2px;
}

.settings-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  color: var(--text-secondary);
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--surface-dark-hover);
  transform: rotate(90deg);
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  margin-right: -12px;
}

/* 滚动条样式 */
.settings-content::-webkit-scrollbar {
  width: 8px;
}

.settings-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: background 0.3s ease;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
  background-clip: padding-box;
}

/* 设置页脚 */
.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.settings-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  border-radius: 2px;
}

.settings-footer :deep(.el-button) {
  padding: 10px 24px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  letter-spacing: -0.2px;
}

.settings-footer :deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.settings-footer :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.settings-footer :deep(.el-button:not(.el-button--primary)) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.settings-footer :deep(.el-button:not(.el-button--primary):hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}
</style>
