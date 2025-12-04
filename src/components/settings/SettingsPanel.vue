<!-- src/components/settings/SettingsPanel.vue -->
<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useChatStore } from '@/stores/chat'
import type { AIModel, BackgroundType, ChatBackground } from '@/types/chat'
import { Check, Close, UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { ElLoading, ElMessage, ElDialog } from 'element-plus'
import AvatarCropper from './AvatarCropper.vue'

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

// 裁剪对话框
const showCropper = ref(false)
const cropperImageUrl = ref('')
const cropperType = ref<'user' | 'ai'>('user')

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

    // 保存头像设置
    settingsStore.setAvatars({
      userAvatar: avatarConfig.value.userAvatar || undefined,
      aiAvatar: avatarConfig.value.aiAvatar || undefined,
      userAvatarBg: avatarConfig.value.userAvatarBg || undefined,
      aiAvatarBg: avatarConfig.value.aiAvatarBg || undefined,
    })

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

  // 重置头像设置
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
        const dataUrlParts = dataUrl.split(',')
        if (!dataUrlParts[1]) {
          reject(new Error('无法解析图片数据'))
          return
        }
        const byteString = atob(dataUrlParts[1])
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

// 判断是否为图片URL
const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return (
    avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image')
  )
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
      cropperImageUrl.value = blobUrl
      cropperType.value = 'user'
    } else {
      aiAvatarFile.value = file.raw
      aiAvatarPreview.value = blobUrl
      cropperImageUrl.value = blobUrl
      cropperType.value = 'ai'
    }

    loading.close()
    showCropper.value = true
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

    cropperImageUrl.value = blobUrl
    cropperType.value = type

    loading.close()
    showCropper.value = true
  } catch (error) {
    console.error('图片加载失败:', error)
    ElMessage.error('图片加载失败，请检查URL是否可访问')
  }
}

// 处理裁剪完成
const handleCropComplete = (dataUrl: string) => {
  // 清理裁剪时使用的blob URL
  if (cropperImageUrl.value && cropperImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageUrl.value)
  }

  if (cropperType.value === 'user') {
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
            <div class="form-hint">*您的API Key仅存储在本地，不会发送到任何其他服务器。</div>
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
            <div class="color-picker-wrapper">
              <el-color-picker
                v-model="background.color"
                :predefine="predefinedColors"
                show-alpha
              />
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
                  <span class="opacity-value">{{
                    (background.imageOpacity || 0.8).toFixed(1)
                  }}</span>
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

      <!-- 头像设置 -->
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
    </div>

    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">恢复默认</el-button>
    </div>

    <!-- 头像裁剪对话框 -->
    <el-dialog
      v-model="showCropper"
      title="选择头像区域"
      width="90%"
      :max-width="640"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="5vh"
      :style="{ '--el-dialog-content-max-height': 'calc(80vh - 140px)' }"
    >
      <AvatarCropper
        v-if="showCropper"
        :image-url="cropperImageUrl"
        :aspect-ratio="1"
        @crop="handleCropComplete"
        @cancel="handleCropCancel"
      />
    </el-dialog>
  </div>
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

.settings-section {
  margin-bottom: 28px;
  animation: fadeInUp 0.4s ease-out;
  animation-fill-mode: both;
}

.settings-section:nth-child(1) {
  animation-delay: 0.05s;
}

.settings-section:nth-child(2) {
  animation-delay: 0.1s;
}

.settings-section:nth-child(3) {
  animation-delay: 0.15s;
}

.settings-section:nth-child(4) {
  animation-delay: 0.2s;
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

/* 模型选项样式 */
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

/* 温度控制 */
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

/* 切换项样式 */
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

/* 渐变颜色设置 */
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

/* 图片预设 */
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

/* 透明度控制 */
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

/* 应用范围选项 */
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

/* 预览区域 */
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

/* 输入框样式优化 */
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

/* 选择器样式优化 */
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

/* 图片来源选项 */
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

/* 本地图片上传区域 */
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

/* 本地图片预览 */
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

/* 颜色选择器样式 */
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

/* 渐变颜色选择器优化 */
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

/* 头像设置样式 */
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

/* 头像来源选择器 */
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

/* 头像上传区域 */
.avatar-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-uploader {
  display: inline-block;
}

/* 背景色选择器 */
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

/* 裁剪按钮样式 */
.crop-btn {
  margin-left: 8px;
}
</style>
