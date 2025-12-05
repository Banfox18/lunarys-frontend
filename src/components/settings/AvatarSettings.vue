<!-- src/components/settings/AvatarSettings.vue -->
<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { UploadFile } from 'element-plus'
import { ElLoading, ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { isImageUrl } from './utils/imageUtils'

const settingsStore = useSettingsStore()

// 头像设置
const avatarConfig = ref({
  userAvatar: settingsStore.getUserAvatar() || '👤',
  aiAvatar: settingsStore.getAiAvatar() || '🤖',
  userAvatarBg: settingsStore.settings.avatars?.userAvatarBg || 'transparent',
  aiAvatarBg: settingsStore.settings.avatars?.aiAvatarBg || 'transparent',
})

// 头像来源选项
const userAvatarSource = ref<'emoji' | 'url' | 'local'>('emoji')
const aiAvatarSource = ref<'emoji' | 'url' | 'local'>('emoji')

// 本地头像相关
const userAvatarFile = ref<File | null>(null)
const userAvatarPreview = ref<string>('')
const aiAvatarFile = ref<File | null>(null)
const aiAvatarPreview = ref<string>('')

// 裁剪对话框相关 - 通过事件通知父组件
const emit = defineEmits<{
  openCropper: [data: { imageUrl: string; type: 'user' | 'ai' }]
}>()

// 预定义背景色
const predefinedBgColors = [
  { label: '透明', value: 'transparent' },
  { label: '蓝色', value: '#3b82f6' },
  { label: '紫色', value: '#8b5cf6' },
  { label: '绿色', value: '#10b981' },
  { label: '红色', value: '#ef4444' },
  { label: '黄色', value: '#f59e0b' },
  { label: '粉色', value: '#ec4899' },
  { label: '青色', value: '#06b6d4' },
]

// 上传前检查
const beforeImageUpload = (file: File) => {
  const maxSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxSize) {
    ElMessage.warning('图片大小超过20MB限制，请选择较小的图片')
    return false
  }
  return true
}

// 初始化头像来源
const initAvatarSource = () => {
  const userAvatar = avatarConfig.value.userAvatar
  const aiAvatar = avatarConfig.value.aiAvatar

  if (userAvatar && isImageUrl(userAvatar)) {
    if (userAvatar.startsWith('data:image')) {
      userAvatarSource.value = 'local'
      userAvatarPreview.value = userAvatar
    } else {
      userAvatarSource.value = 'url'
    }
  } else {
    userAvatarSource.value = 'emoji'
  }

  if (aiAvatar && isImageUrl(aiAvatar)) {
    if (aiAvatar.startsWith('data:image')) {
      aiAvatarSource.value = 'local'
      aiAvatarPreview.value = aiAvatar
    } else {
      aiAvatarSource.value = 'url'
    }
  } else {
    aiAvatarSource.value = 'emoji'
  }
}

// 处理头像上传
const handleAvatarUpload = async (file: UploadFile, type: 'user' | 'ai') => {
  if (!file.raw) return

  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在加载图片...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    // 创建预览URL
    const blobUrl = URL.createObjectURL(file.raw)

    if (type === 'user') {
      userAvatarFile.value = file.raw
      userAvatarPreview.value = blobUrl
    } else {
      aiAvatarFile.value = file.raw
      aiAvatarPreview.value = blobUrl
    }

    loading.close()
    // 通过事件通知父组件打开裁剪对话框
    emit('openCropper', { imageUrl: blobUrl, type })
  } catch (error) {
    console.error('图片加载失败:', error)
    ElMessage.error('图片加载失败，请重试')
  }
}

// 为URL图片打开裁剪器
const openCropperForUrl = async (type: 'user' | 'ai') => {
  const url = type === 'user' ? avatarConfig.value.userAvatar : avatarConfig.value.aiAvatar
  if (!url || !isImageUrl(url)) return

  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在加载图片...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    // 如果是网络图片，需要先转换为blob或data URL
    // 使用fetch获取图片并转换为blob
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    loading.close()
    // 通过事件通知父组件打开裁剪对话框
    emit('openCropper', { imageUrl: blobUrl, type })
  } catch (error) {
    console.error('图片加载失败:', error)
    ElMessage.error('图片加载失败，请检查URL是否可访问')
  }
}

// 处理裁剪完成（由父组件调用）
const handleCropComplete = (dataUrl: string, type: 'user' | 'ai') => {
  if (type === 'user') {
    avatarConfig.value.userAvatar = dataUrl
    // 如果是从URL裁剪的，切换到local模式
    if (userAvatarSource.value === 'url') {
      userAvatarSource.value = 'local'
    }
    // 清理预览URL
    if (userAvatarPreview.value && userAvatarPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(userAvatarPreview.value)
    }
    userAvatarPreview.value = dataUrl
  } else {
    avatarConfig.value.aiAvatar = dataUrl
    // 如果是从URL裁剪的，切换到local模式
    if (aiAvatarSource.value === 'url') {
      aiAvatarSource.value = 'local'
    }
    // 清理预览URL
    if (aiAvatarPreview.value && aiAvatarPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(aiAvatarPreview.value)
    }
    aiAvatarPreview.value = dataUrl
  }
}

// 清除本地头像
const clearLocalAvatar = (type: 'user' | 'ai') => {
  if (type === 'user') {
    if (userAvatarPreview.value && userAvatarPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(userAvatarPreview.value)
    }
    userAvatarPreview.value = ''
    userAvatarFile.value = null
    avatarConfig.value.userAvatar = '👤'
    userAvatarSource.value = 'emoji'
  } else {
    if (aiAvatarPreview.value && aiAvatarPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(aiAvatarPreview.value)
    }
    aiAvatarPreview.value = ''
    aiAvatarFile.value = null
    avatarConfig.value.aiAvatar = '🤖'
    aiAvatarSource.value = 'emoji'
  }
}

// 保存头像设置（供父组件调用）
const saveAvatars = () => {
  settingsStore.setAvatars({
    userAvatar: avatarConfig.value.userAvatar || undefined,
    aiAvatar: avatarConfig.value.aiAvatar || undefined,
    userAvatarBg: avatarConfig.value.userAvatarBg || undefined,
    aiAvatarBg: avatarConfig.value.aiAvatarBg || undefined,
  })
}

// 重置头像设置（供父组件调用）
const resetAvatars = () => {
  avatarConfig.value = {
    userAvatar: '👤',
    aiAvatar: '🤖',
    userAvatarBg: 'transparent',
    aiAvatarBg: 'transparent',
  }
  userAvatarSource.value = 'emoji'
  aiAvatarSource.value = 'emoji'
  clearLocalAvatar('user')
  clearLocalAvatar('ai')
}

// 组件卸载时清理
onUnmounted(() => {
  if (userAvatarPreview.value && userAvatarPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(userAvatarPreview.value)
  }
  if (aiAvatarPreview.value && aiAvatarPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(aiAvatarPreview.value)
  }
})

// 初始化
initAvatarSource()

// 暴露方法供父组件调用
defineExpose({
  saveAvatars,
  resetAvatars,
  handleCropComplete,
})
</script>

<template>
  <div class="settings-section">
    <h3 class="section-title">头像设置</h3>
    <div class="section-content">
      <!-- 用户头像设置 -->
      <div class="form-item">
        <label class="form-label">用户头像</label>
        <div class="avatar-setting">
          <!-- 头像来源选择 -->
          <div class="avatar-source-selector">
            <el-radio-group v-model="userAvatarSource" size="small">
              <el-radio label="emoji">Emoji</el-radio>
              <el-radio label="url">URL</el-radio>
              <el-radio label="local">本地上传</el-radio>
            </el-radio-group>
          </div>

          <!-- Emoji输入 -->
          <div v-if="userAvatarSource === 'emoji'" class="avatar-input-wrapper">
            <el-input
              v-model="avatarConfig.userAvatar"
              placeholder="输入emoji表情，留空则不显示头像"
              clearable
            />
          </div>

          <!-- URL输入 -->
          <div v-if="userAvatarSource === 'url'" class="avatar-input-wrapper">
            <el-input
              v-model="avatarConfig.userAvatar"
              placeholder="输入图片URL，留空则不显示头像"
              clearable
            />
            <el-button
              v-if="avatarConfig.userAvatar && isImageUrl(avatarConfig.userAvatar)"
              type="primary"
              @click="openCropperForUrl('user')"
              class="crop-btn"
            >
              裁剪
            </el-button>
          </div>

          <!-- 本地上传 -->
          <div v-if="userAvatarSource === 'local'" class="avatar-upload-wrapper">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file: UploadFile) => handleAvatarUpload(file, 'user')"
              accept="image/*"
              :before-upload="beforeImageUpload"
            >
              <el-button type="primary" :icon="UploadFilled">选择图片</el-button>
            </el-upload>
            <el-button
              v-if="userAvatarPreview"
              type="text"
              @click="clearLocalAvatar('user')"
              class="clear-avatar-btn"
            >
              清除
            </el-button>
          </div>

          <!-- 背景色选择 -->
          <div class="avatar-bg-selector">
            <label class="bg-label">背景色：</label>
            <div class="bg-color-options">
              <div
                v-for="color in predefinedBgColors"
                :key="color.value"
                class="bg-color-option"
                :class="{ selected: avatarConfig.userAvatarBg === color.value }"
                :style="{
                  backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                  backgroundImage:
                    color.value === 'transparent'
                      ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 10px 10px'
                      : 'none',
                }"
                @click="avatarConfig.userAvatarBg = color.value"
                :title="color.label"
              >
                <span v-if="color.value === 'transparent'" class="transparent-icon">∅</span>
              </div>
            </div>
            <el-color-picker
              v-model="avatarConfig.userAvatarBg"
              :predefine="['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b']"
              show-alpha
              class="bg-color-picker"
            />
          </div>

          <!-- 头像预览 -->
          <div v-if="avatarConfig.userAvatar" class="avatar-preview">
            <div class="avatar-preview-label">预览：</div>
            <div class="avatar-preview-item">
              <div
                class="avatar user-avatar"
                :style="{
                  backgroundColor:
                    avatarConfig.userAvatarBg === 'transparent'
                      ? 'transparent'
                      : avatarConfig.userAvatarBg,
                  backgroundImage:
                    avatarConfig.userAvatarBg === 'transparent'
                      ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
                      : 'none',
                }"
              >
                <img
                  v-if="isImageUrl(avatarConfig.userAvatar)"
                  :src="avatarConfig.userAvatar"
                  alt="用户头像预览"
                  class="avatar-image"
                />
                <span v-else>{{ avatarConfig.userAvatar }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI头像设置 -->
      <div class="form-item">
        <label class="form-label">AI头像</label>
        <div class="avatar-setting">
          <!-- 头像来源选择 -->
          <div class="avatar-source-selector">
            <el-radio-group v-model="aiAvatarSource" size="small">
              <el-radio label="emoji">Emoji</el-radio>
              <el-radio label="url">URL</el-radio>
              <el-radio label="local">本地上传</el-radio>
            </el-radio-group>
          </div>

          <!-- Emoji输入 -->
          <div v-if="aiAvatarSource === 'emoji'" class="avatar-input-wrapper">
            <el-input
              v-model="avatarConfig.aiAvatar"
              placeholder="输入emoji表情，留空则不显示头像"
              clearable
            />
          </div>

          <!-- URL输入 -->
          <div v-if="aiAvatarSource === 'url'" class="avatar-input-wrapper">
            <el-input
              v-model="avatarConfig.aiAvatar"
              placeholder="输入图片URL，留空则不显示头像"
              clearable
            />
            <el-button
              v-if="avatarConfig.aiAvatar && isImageUrl(avatarConfig.aiAvatar)"
              type="primary"
              @click="openCropperForUrl('ai')"
              class="crop-btn"
            >
              裁剪
            </el-button>
          </div>

          <!-- 本地上传 -->
          <div v-if="aiAvatarSource === 'local'" class="avatar-upload-wrapper">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file: UploadFile) => handleAvatarUpload(file, 'ai')"
              accept="image/*"
              :before-upload="beforeImageUpload"
            >
              <el-button type="primary" :icon="UploadFilled">选择图片</el-button>
            </el-upload>
            <el-button
              v-if="aiAvatarPreview"
              type="text"
              @click="clearLocalAvatar('ai')"
              class="clear-avatar-btn"
            >
              清除
            </el-button>
          </div>

          <!-- 背景色选择 -->
          <div class="avatar-bg-selector">
            <label class="bg-label">背景色：</label>
            <div class="bg-color-options">
              <div
                v-for="color in predefinedBgColors"
                :key="color.value"
                class="bg-color-option"
                :class="{ selected: avatarConfig.aiAvatarBg === color.value }"
                :style="{
                  backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                  backgroundImage:
                    color.value === 'transparent'
                      ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 10px 10px'
                      : 'none',
                }"
                @click="avatarConfig.aiAvatarBg = color.value"
                :title="color.label"
              >
                <span v-if="color.value === 'transparent'" class="transparent-icon">∅</span>
              </div>
            </div>
            <el-color-picker
              v-model="avatarConfig.aiAvatarBg"
              :predefine="['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b']"
              show-alpha
              class="bg-color-picker"
            />
          </div>

          <!-- 头像预览 -->
          <div v-if="avatarConfig.aiAvatar" class="avatar-preview">
            <div class="avatar-preview-label">预览：</div>
            <div class="avatar-preview-item">
              <div
                class="avatar ai-avatar"
                :style="{
                  backgroundColor:
                    avatarConfig.aiAvatarBg === 'transparent'
                      ? 'transparent'
                      : avatarConfig.aiAvatarBg,
                  backgroundImage:
                    avatarConfig.aiAvatarBg === 'transparent'
                      ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'
                      : 'none',
                }"
              >
                <img
                  v-if="isImageUrl(avatarConfig.aiAvatar)"
                  :src="avatarConfig.aiAvatar"
                  alt="AI头像预览"
                  class="avatar-image"
                />
                <span v-else>{{ avatarConfig.aiAvatar }}</span>
              </div>
            </div>
          </div>
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

.avatar-setting {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-input-wrapper :deep(.el-input) {
  flex: 1;
}

.clear-avatar-btn {
  color: var(--text-secondary);
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.clear-avatar-btn:hover {
  color: var(--error-color);
  transform: scale(1.05);
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 8px;
}

.avatar-preview-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: -0.1px;
}

.avatar-preview-item {
  display: flex;
  align-items: center;
}

.avatar-preview-item .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  overflow: hidden;
}

.avatar-preview-item .avatar.user-avatar {
  background: var(--primary-color);
  color: var(--text-white);
}

.avatar-preview-item .avatar.ai-avatar {
  background: var(--secondary-color);
  color: var(--text-white);
}

.avatar-preview-item .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-source-selector {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.avatar-source-selector :deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

.avatar-source-selector :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.avatar-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-uploader {
  display: inline-block;
}

.avatar-bg-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.bg-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.bg-color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bg-color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bg-color-option:hover {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.bg-color-option.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.transparent-icon {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: bold;
}

.bg-color-picker {
  margin-left: auto;
}

.crop-btn {
  margin-left: 8px;
}

.form-item :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.form-item :deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
}

.form-item :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-item :deep(.el-input__inner) {
  color: var(--text-primary);
}

.form-item :deep(.el-input__inner::placeholder) {
  color: var(--text-secondary);
  opacity: 0.6;
}
</style>
