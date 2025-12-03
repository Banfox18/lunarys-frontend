<!-- src/components/settings/SettingsPanel.vue -->
<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useChatStore } from '@/stores/chat'
import type { AIModel, BackgroundType, ChatBackground } from '@/types/chat'
import { Check, Close, UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile} from 'element-plus'
import { ElLoading, ElMessage } from 'element-plus'

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const chatStore = useChatStore()

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

// 计算属性绑定到store
const model = computed({
  get: () => settingsStore.model,
  set: (value) => settingsStore.setModel(value),
})

const temperature = computed({
  get: () => settingsStore.temperature,
  set: (value) => settingsStore.setTemperature(value),
})

const enableStreaming = computed({
  get: () => settingsStore.enableStreaming,
  set: (value) => {
    settingsStore.enableStreaming = value
  },
})

const apiKey = computed({
  get: () => settingsStore.apiKey,
  set: (value) => settingsStore.setApiKey(value),
})

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

        // 判断图片来源 - 在这里判断
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

      // 判断图片来源 - 在这里判断
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
// 保存设置
const saveSettings = async () => {
  try {
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

    settingsStore.saveSettings()
    ElMessage.success('背景设置已保存')
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
// 图片压缩函数
const compressImage = (
  file: File,
  maxWidth = 2560,
  maxHeight = 1440,
  quality = 0.85,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算缩放比例
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'))
          return
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为WebP格式（如果支持）
        const mimeType = 'image/webp'
        const dataUrl = canvas.toDataURL(mimeType, quality)

        // 转换回File对象
        const byteString = atob(dataUrl.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }

        const blob = new Blob([ab], { type: mimeType })
        const compressedFile = new File([blob], file.name, {
          type: mimeType,
          lastModified: Date.now(),
        })

        resolve(compressedFile)
      }

      img.onerror = reject
    }

    reader.onerror = reject
  })
}

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取图片格式
const getImageFormat = (mimeType: string): string => {
  const format = mimeType.split('/')[1]
  return format ? format.toUpperCase() : '未知'
}

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

// Blob转Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 组件卸载时清理
onUnmounted(() => {
  if (localImagePreview.value && localImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localImagePreview.value)
  }
})
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
      <!-- 模型选择 -->
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

      <!-- 流式传输设置 -->
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

      <!-- API设置 -->
      <div class="settings-section">
        <h3 class="section-title">API设置</h3>
        <div class="section-content">
          <div class="form-item">
            <label class="form-label">DeepSeek API Key</label>
            <el-input
              v-model="apiKey"
              type="password"
              placeholder="输入您的DeepSeek API Key"
              show-password
            />
            <div class="form-hint">您的API Key仅存储在本地浏览器中，不会发送到任何其他服务器。</div>
          </div>
        </div>
      </div>

      <!-- 聊天背景设置 -->
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
            <el-color-picker v-model="background.color" :predefine="predefinedColors" show-alpha />
          </div>

          <!-- 渐变背景设置 -->
          <div v-if="background.type === 'gradient'" class="form-item">
            <label class="form-label">渐变颜色</label>
            <div class="gradient-colors">
              <div class="gradient-color-item">
                <label class="color-label">起始颜色</label>
                <el-color-picker
                  v-model="background.gradientColors[0]"
                  :predefine="predefinedColors"
                  show-alpha
                />
              </div>
              <div class="gradient-color-item">
                <label class="color-label">结束颜色</label>
                <el-color-picker
                  v-model="background.gradientColors[1]"
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
              <div class="form-item" style="margin-top: 16px;">
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
    </div>

    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">恢复默认</el-button>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  background: var(--surface-dark);
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  margin: 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-dark);
}

.settings-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.settings-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-content {
  background: var(--surface-darker);
  border-radius: 8px;
  padding: 16px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

/* 背景类型选项 */
.background-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.background-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--surface-dark);
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.background-option:hover {
  background: var(--surface-dark-hover);
  transform: translateY(-2px);
}

.background-option.selected {
  border-color: var(--primary-color);
  background: var(--surface-dark-hover);
}

.bg-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.bg-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 渐变颜色设置 */
.gradient-colors {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.gradient-color-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 图片预设 */
.image-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.image-preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.image-preset:hover {
  transform: translateY(-2px);
}

.image-preset.selected {
  border-color: var(--primary-color);
}

.preset-image {
  width: 100%;
  height: 60px;
  object-fit: cover;
}

.preset-name {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 4px;
  text-align: center;
  background: var(--surface-dark);
  width: 100%;
}

/* 透明度控制 */
.opacity-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.opacity-value {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 40px;
  text-align: center;
}

/* 应用范围选项 */
.apply-options {
  margin-top: 8px;
}

/* 预览区域 */
.background-preview {
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-dark);
  overflow: hidden;
  position: relative;
}

.preview-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

/* 设置页脚 */
.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-dark);
}

/* 滚动条样式 */
.settings-content::-webkit-scrollbar {
  width: 6px;
}

.settings-content::-webkit-scrollbar-track {
  background: var(--surface-dark);
  border-radius: 3px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: var(--border-dark);
  border-radius: 3px;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
/* 图片来源选项 */
.image-source-options {
  margin-bottom: 16px;
}

/* 本地图片上传区域 */
.local-image-upload {
  margin-top: 12px;
}

.upload-demo {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--surface-dark);
  border: 2px dashed var(--border-dark);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.el-upload-dragger:hover {
  border-color: var(--primary-color);
  background: var(--surface-dark-hover);
}

.el-icon--upload {
  font-size: 48px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.el-upload__text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.el-upload__text em {
  color: var(--primary-color);
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 8px;
}

/* 本地图片预览 */
.local-image-preview {
  margin-top: 20px;
  border: 1px solid var(--border-dark);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-dark);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-darker);
  border-bottom: 1px solid var(--border-dark);
}

.preview-header span {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.preview-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary);
}

.clear-btn {
  color: var(--error-color);
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  display: block;
}

.preview-info {
  padding: 12px 16px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  background: var(--surface-darker);
  border-top: 1px solid var(--border-dark);
}
</style>
