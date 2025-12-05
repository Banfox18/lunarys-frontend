<!-- src/components/settings/BackgroundSettings.vue -->
<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useChatStore } from '@/stores/chat'
import type { BackgroundType, ChatBackground } from '@/types/chat'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { ElLoading, ElMessage } from 'element-plus'
import { compressImage, formatFileSize, getImageFormat, blobToBase64 } from './utils/imageUtils'

const settingsStore = useSettingsStore()
const chatStore = useChatStore()

// 背景类型选项
const backgroundTypes = [
  { value: 'none' as BackgroundType, label: '无背景', icon: '🚫' },
  { value: 'solid' as BackgroundType, label: '纯色', icon: '🎨' },
  { value: 'gradient' as BackgroundType, label: '渐变', icon: '🌈' },
  { value: 'image' as BackgroundType, label: '图片', icon: '🖼️' },
]

// 预定义颜色
const predefinedColors = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#f5576c',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#38f9d7',
  '#fa709a',
  '#fee140',
  '#667eea80',
  '#764ba280',
]

// 图片预设
const imagePresets = [
  {
    name: '星空',
    url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop',
  },
  {
    name: '山脉',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  },
  {
    name: '海洋',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w-400&h=300&fit=crop',
  },
  {
    name: '森林',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  },
  {
    name: '抽象',
    url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=300&fit=crop',
  },
  {
    name: '极光',
    url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop',
  },
]

// 当前会话信息
const currentConversationId = computed(() => chatStore.currentConversation?.id)
const currentConversationTitle = computed(
  () => chatStore.currentConversation?.title || '未命名会话',
)

// 背景设置
const background = ref<ChatBackground>({
  type: 'none',
  color: '#667eea',
  gradientColors: ['#667eea', '#764ba2'],
  gradientDirection: 'to right',
  imageUrl: '',
  imageOpacity: 0.8,
})

// 应用范围
const applyScope = ref<'current' | 'all'>('current')

// 图片来源选项
const imageSource = ref<'url' | 'local'>('url')

// 本地图片相关
const localImagePreview = ref<string>('')
const localImageFile = ref<File | null>(null)

// 初始化背景设置
const initializeBackground = () => {
  try {
    const currentId = currentConversationId.value
    if (currentId && currentId !== -1) {
      const convBg = settingsStore.getConversationBackground(currentId)
      if (convBg && convBg.type) {
        background.value = {
          type: convBg.type || 'none',
          color: convBg.color || '#667eea',
          gradientColors: convBg.gradientColors || ['#667eea', '#764ba2'],
          gradientDirection: convBg.gradientDirection || 'to right',
          imageUrl: convBg.imageUrl || '',
          imageOpacity: convBg.imageOpacity || 0.8,
        }

        // 判断图片来源
        if (convBg.imageUrl && convBg.imageUrl.startsWith('data:image')) {
          imageSource.value = 'local'
          localImagePreview.value = convBg.imageUrl
        } else {
          imageSource.value = 'url'
        }

        applyScope.value = 'current'
        return
      }
    }

    // 使用全局背景
    const globalBg = settingsStore.chatBackground
    if (globalBg && globalBg.type) {
      background.value = {
        type: globalBg.type || 'none',
        color: globalBg.color || '#667eea',
        gradientColors: globalBg.gradientColors || ['#667eea', '#764ba2'],
        gradientDirection: globalBg.gradientDirection || 'to right',
        imageUrl: globalBg.imageUrl || '',
        imageOpacity: globalBg.imageOpacity || 0.8,
      }

      // 判断图片来源
      if (globalBg.imageUrl && globalBg.imageUrl.startsWith('data:image')) {
        imageSource.value = 'local'
        localImagePreview.value = globalBg.imageUrl
      } else {
        imageSource.value = 'url'
      }

      applyScope.value = 'all'
      return
    }

    // 如果没有找到任何背景设置，使用默认值
    background.value = {
      type: 'none',
      color: '#667eea',
      gradientColors: ['#667eea', '#764ba2'],
      gradientDirection: 'to right',
      imageUrl: '',
      imageOpacity: 0.8,
    }
    imageSource.value = 'url'
    applyScope.value = 'current'
  } catch (error) {
    console.error('初始化背景设置失败:', error)
    // 使用默认值
    background.value = {
      type: 'none',
      color: '#667eea',
      gradientColors: ['#667eea', '#764ba2'],
      gradientDirection: 'to right',
      imageUrl: '',
      imageOpacity: 0.8,
    }
    imageSource.value = 'url'
    applyScope.value = 'current'
  }
}

// 监听当前会话变化
watch(
  currentConversationId,
  () => {
    nextTick(() => {
      initializeBackground()
    })
  },
  { immediate: true },
)

// 预览样式
const previewStyle = computed(() => {
  const bg = background.value

  switch (bg.type) {
    case 'solid':
      return { background: bg.color || '#667eea' }
    case 'gradient':
      return {
        background: `linear-gradient(${bg.gradientDirection || 'to right'},
                   ${bg.gradientColors?.[0] || '#667eea'},
                   ${bg.gradientColors?.[1] || '#764ba2'})`,
      }
    case 'image':
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: bg.imageOpacity || 0.8,
      }
    default:
      return { background: 'var(--surface-dark)' }
  }
})

// 上传前检查
const beforeImageUpload = (file: File) => {
  const maxSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxSize) {
    ElMessage.warning('图片大小超过20MB限制，请选择较小的图片')
    return false
  }
  return true
}

// 处理图片上传
const handleImageUpload = async (file: UploadFile) => {
  if (!file.raw) return

  try {
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '正在优化图片...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    // 压缩图片
    const compressedFile = await compressImage(file.raw)

    localImageFile.value = compressedFile

    // 创建Blob URL预览
    const blobUrl = URL.createObjectURL(compressedFile)
    localImagePreview.value = blobUrl

    // 将Blob URL保存到background中
    background.value.imageUrl = blobUrl

    loading.close()
    ElMessage.success('图片优化完成，已准备好应用')
  } catch (error) {
    console.error('图片处理失败:', error)
    ElMessage.error('图片处理失败，请重试')
  }
}

// 清除本地图片
const clearLocalImage = () => {
  if (localImagePreview.value && localImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localImagePreview.value)
  }
  localImagePreview.value = ''
  localImageFile.value = null
  background.value.imageUrl = ''
}

// 保存背景设置（供父组件调用）
const saveBackground = async () => {
  // 如果是本地图片模式
  if (imageSource.value === 'local' && localImageFile.value) {
    // 将Blob转换为Base64存储
    background.value.imageUrl = await blobToBase64(localImageFile.value)

    // 清理Blob URL
    if (localImagePreview.value && localImagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(localImagePreview.value)
    }
  }

  if (applyScope.value === 'current' && currentConversationId.value) {
    settingsStore.setConversationBackground(currentConversationId.value, { ...background.value })
  } else {
    settingsStore.setChatBackground({ ...background.value })
  }
}

// 重置背景设置（供父组件调用）
const resetBackground = () => {
  background.value = {
    type: 'none',
    color: '#667eea',
    gradientColors: ['#667eea', '#764ba2'],
    gradientDirection: 'to right',
    imageUrl: '',
    imageOpacity: 0.8,
  }
  imageSource.value = 'url'
  localImagePreview.value = ''
  localImageFile.value = null
  applyScope.value = 'current'
}

// 组件卸载时清理
onUnmounted(() => {
  if (localImagePreview.value && localImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localImagePreview.value)
  }
})

// 暴露方法供父组件调用
defineExpose({
  saveBackground,
  resetBackground,
})
</script>

<template>
  <div class="settings-section">
    <h3 class="section-title">聊天背景</h3>
    <div class="section-content">
      <!-- 背景类型选择 -->
      <div class="form-item">
        <label class="form-label">背景类型</label>
        <div class="background-options">
          <div
            v-for="bgType in backgroundTypes"
            :key="bgType.value"
            class="background-option"
            :class="{ selected: background.type === bgType.value }"
            @click="background.type = bgType.value"
          >
            <div class="bg-icon">{{ bgType.icon }}</div>
            <div class="bg-label">{{ bgType.label }}</div>
          </div>
        </div>
      </div>

      <!-- 纯色背景选择器 -->
      <div v-if="background.type === 'solid'" class="form-item">
        <label class="form-label">选择颜色</label>
        <div class="color-picker-wrapper">
          <el-color-picker v-model="background.color" :predefine="predefinedColors" show-alpha />
          <div class="color-preview" :style="{ background: background.color }"></div>
        </div>
      </div>

      <!-- 渐变背景设置 -->
      <div v-if="background.type === 'gradient'" class="form-item">
        <label class="form-label">渐变颜色</label>
        <div class="gradient-colors">
          <div class="gradient-color-item">
            <label class="color-label">起始颜色</label>
            <el-color-picker
              v-model="background.gradientColors![0]"
              :predefine="predefinedColors"
              show-alpha
            />
          </div>
          <div class="gradient-color-item">
            <label class="color-label">结束颜色</label>
            <el-color-picker
              v-model="background.gradientColors![1]"
              :predefine="predefinedColors"
              show-alpha
            />
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">渐变方向</label>
          <el-select v-model="background.gradientDirection" placeholder="选择渐变方向">
            <el-option label="从左到右" value="to right" />
            <el-option label="从右到左" value="to left" />
            <el-option label="从上到下" value="to bottom" />
            <el-option label="从下到上" value="to top" />
            <el-option label="对角线（左上到右下）" value="to bottom right" />
            <el-option label="对角线（右上到左下）" value="to bottom left" />
          </el-select>
        </div>
      </div>

      <!-- 图片来源选择 -->
      <div v-if="background.type === 'image'" class="form-item">
        <label class="form-label">图片来源</label>
        <div class="image-source-options">
          <el-radio-group v-model="imageSource">
            <el-radio label="url">网络URL</el-radio>
            <el-radio label="local">本地图片</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 网络图片背景设置 -->
      <div v-if="background.type === 'image' && imageSource === 'url'" class="form-item">
        <label class="form-label">图片URL</label>
        <el-input v-model="background.imageUrl" placeholder="输入图片URL或选择预设" clearable />
        <div class="form-hint">支持网络图片URL，或使用下方预设图片</div>

        <div class="image-presets">
          <div
            v-for="preset in imagePresets"
            :key="preset.url"
            class="image-preset"
            :class="{ selected: background.imageUrl === preset.url }"
            @click="background.imageUrl = preset.url"
          >
            <img :src="preset.url" :alt="preset.name" class="preset-image" />
            <div class="preset-name">{{ preset.name }}</div>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">透明度</label>
          <div class="opacity-control">
            <el-slider
              v-model="background.imageOpacity"
              :min="0.1"
              :max="1"
              :step="0.1"
              show-stops
            />
            <span class="opacity-value">{{ (background.imageOpacity || 0.8).toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <!-- 本地图片上传 -->
      <div v-if="background.type === 'image' && imageSource === 'local'" class="form-item">
        <label class="form-label">上传本地图片</label>
        <div class="local-image-upload">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageUpload"
            accept="image/*"
            :before-upload="beforeImageUpload"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽图片到此处或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                支持 JPG、PNG、GIF 格式，最大20MB，建议尺寸大于 800x600
              </div>
            </template>
          </el-upload>

          <!-- 图片预览 -->
          <div v-if="localImagePreview" class="local-image-preview">
            <div class="preview-header">
              <span>预览</span>
              <div class="preview-stats">
                <span class="file-size" v-if="localImageFile">
                  {{ formatFileSize(localImageFile.size) }}
                </span>
                <el-button type="text" size="small" @click="clearLocalImage" class="clear-btn">
                  清除
                </el-button>
              </div>
            </div>
            <img :src="localImagePreview" alt="本地图片预览" class="preview-image" />
            <div class="preview-info">
              <div v-if="localImageFile">
                格式: {{ getImageFormat(localImageFile.type) }} • 大小:
                {{ formatFileSize(localImageFile.size) }}
              </div>
              <div v-else>图片已加载，点击保存即可应用</div>
            </div>
          </div>

          <!-- 透明度控制 -->
          <div class="form-item" style="margin-top: 16px">
            <label class="form-label">透明度</label>
            <div class="opacity-control">
              <el-slider
                v-model="background.imageOpacity"
                :min="0.1"
                :max="1"
                :step="0.1"
                show-stops
              />
              <span class="opacity-value">{{ (background.imageOpacity || 0.8).toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 应用到当前会话或所有会话 -->
      <div class="form-item">
        <label class="form-label">应用范围</label>
        <div class="apply-options">
          <el-radio-group v-model="applyScope">
            <el-radio label="current">仅当前会话</el-radio>
            <el-radio label="all">所有会话</el-radio>
          </el-radio-group>
        </div>
        <div class="form-hint" v-if="applyScope === 'current' && currentConversationId">
          将应用到会话：{{ currentConversationTitle }}
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="form-item">
        <label class="form-label">预览</label>
        <div class="background-preview" :style="previewStyle">
          <div class="preview-text">聊天背景预览</div>
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

.background-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.background-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.background-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.background-option:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.background-option:hover::before {
  transform: scaleX(1);
}

.background-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
}

.background-option.selected::before {
  transform: scaleX(1);
}

.bg-icon {
  font-size: 28px;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.bg-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.gradient-colors {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.gradient-color-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.gradient-color-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.color-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.image-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.image-preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
}

.image-preset::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  padding: 2px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preset:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.image-preset.selected {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.image-preset.selected::after {
  opacity: 1;
}

.preset-image {
  width: 100%;
  height: 70px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preset:hover .preset-image {
  transform: scale(1.1);
}

.preset-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-primary);
  padding: 8px 4px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  width: 100%;
  letter-spacing: -0.2px;
}

.opacity-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.opacity-control :deep(.el-slider) {
  flex: 1;
}

.opacity-control :deep(.el-slider__runway) {
  background: rgba(255, 255, 255, 0.1);
  height: 6px;
}

.opacity-control :deep(.el-slider__bar) {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  height: 6px;
}

.opacity-control :deep(.el-slider__button) {
  width: 18px;
  height: 18px;
  border: 3px solid var(--primary-color);
  background: var(--surface-dark);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

.opacity-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 45px;
  text-align: center;
  padding: 6px 10px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.apply-options {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.apply-options :deep(.el-radio-group) {
  display: flex;
  gap: 24px;
}

.apply-options :deep(.el-radio) {
  margin-right: 0;
}

.apply-options :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.background-preview {
  height: 120px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.background-preview:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    inset 0 2px 12px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2);
}

.preview-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: -0.2px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-picker-wrapper :deep(.el-color-picker) {
  height: 40px;
}

.color-picker-wrapper :deep(.el-color-picker__trigger) {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-picker-wrapper :deep(.el-color-picker__trigger:hover) {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: scale(1.05);
}

.color-preview {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.color-preview:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gradient-color-item :deep(.el-color-picker) {
  height: 40px;
}

.gradient-color-item :deep(.el-color-picker__trigger) {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.gradient-color-item :deep(.el-color-picker__trigger:hover) {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: scale(1.05);
}

.image-source-options {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.image-source-options :deep(.el-radio-group) {
  display: flex;
  gap: 24px;
}

.image-source-options :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.local-image-upload {
  margin-top: 16px;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-demo :deep(.el-upload-dragger::before) {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.upload-demo :deep(.el-upload-dragger:hover::before) {
  opacity: 1;
}

.el-icon--upload {
  font-size: 52px;
  color: var(--primary-color);
  margin-bottom: 16px;
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.3));
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.upload-demo :deep(.el-upload-dragger:hover .el-icon--upload) {
  transform: scale(1.1) rotate(5deg);
}

.el-upload__text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  letter-spacing: -0.2px;
}

.el-upload__text em {
  color: var(--primary-color);
  font-style: normal;
  font-weight: 600;
}

.el-upload__tip {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 12px;
  opacity: 0.8;
  position: relative;
  z-index: 1;
}

.local-image-preview {
  margin-top: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.local-image-preview:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.preview-header span {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.preview-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-size {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.clear-btn {
  color: var(--error-color);
  font-weight: 500;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  transform: scale(1.05);
  text-decoration: underline;
}

.preview-image {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
  background: rgba(0, 0, 0, 0.2);
}

.preview-info {
  padding: 14px 18px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  letter-spacing: -0.1px;
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

.form-item :deep(.el-select) {
  width: 100%;
}

.form-item :deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.form-item :deep(.el-select:hover .el-input__wrapper) {
  border-color: rgba(255, 255, 255, 0.15);
}
</style>
