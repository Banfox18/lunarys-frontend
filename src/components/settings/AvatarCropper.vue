<!-- src/components/settings/AvatarCropper.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  imageUrl: string
  aspectRatio?: number // 宽高比，默认1（圆形）
}

interface Emits {
  (e: 'crop', dataUrl: string): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 1,
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLDivElement>()
const imageRef = ref<HTMLImageElement>()
const cropBoxRef = ref<HTMLDivElement>()

const imageLoaded = ref(false)
const imageScale = ref(1)
const imageOffset = ref({ x: 0, y: 0 })
const cropBox = ref({ x: 50, y: 50, width: 200, height: 200 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const isResizing = ref(false)
const resizeHandle = ref<string>('')
const originalImageSize = ref({ width: 0, height: 0 })
const minScale = ref(0.5) // 最小缩放比例
const maxScale = ref(3) // 最大缩放比例

const cropSize = computed(() => Math.min(200, (containerRef.value?.clientWidth || 300) * 0.6))

// 更新图片位置
const updateImagePosition = (scale: number) => {
  if (!containerRef.value || !originalImageSize.value.width) return

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight

  imageOffset.value = {
    x: (containerWidth - originalImageSize.value.width * scale) / 2,
    y: (containerHeight - originalImageSize.value.height * scale) / 2,
  }
}

// 初始化裁剪框
const initCropBox = () => {
  if (!containerRef.value) return
  const size = cropSize.value
  cropBox.value = {
    x: (containerRef.value.clientWidth - size) / 2,
    y: (containerRef.value.clientHeight - size) / 2,
    width: size,
    height: size,
  }
}

// 处理鼠标滚轮缩放
const handleWheel = (e: WheelEvent) => {
  if (!containerRef.value || !imageLoaded.value) return

  e.preventDefault()

  // 获取鼠标在容器中的位置
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // 计算缩放中心点相对于图片的位置
  const imgX = (mouseX - imageOffset.value.x) / imageScale.value
  const imgY = (mouseY - imageOffset.value.y) / imageScale.value

  // 计算新的缩放比例
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  let newScale = imageScale.value + delta

  // 限制缩放范围
  newScale = Math.max(minScale.value, Math.min(maxScale.value, newScale))

  // 如果缩放比例没有变化，直接返回
  if (newScale === imageScale.value) return

  // 计算缩放后图片的新位置，保持鼠标指向的图片位置不变
  const newOffsetX = mouseX - imgX * newScale
  const newOffsetY = mouseY - imgY * newScale

  // 更新缩放和位置
  imageScale.value = newScale
  imageOffset.value = {
    x: newOffsetX,
    y: newOffsetY,
  }

  // 确保图片不会移出容器太远
  constrainImagePosition()
}

// 限制图片位置，确保图片始终覆盖容器
const constrainImagePosition = () => {
  if (!containerRef.value || !originalImageSize.value.width) return

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight
  const imgWidth = originalImageSize.value.width * imageScale.value
  const imgHeight = originalImageSize.value.height * imageScale.value

  // 如果图片小于容器，居中显示
  if (imgWidth <= containerWidth) {
    imageOffset.value.x = (containerWidth - imgWidth) / 2
  } else {
    // 如果图片大于容器，限制移动范围
    imageOffset.value.x = Math.max(containerWidth - imgWidth, Math.min(0, imageOffset.value.x))
  }

  if (imgHeight <= containerHeight) {
    imageOffset.value.y = (containerHeight - imgHeight) / 2
  } else {
    imageOffset.value.y = Math.max(containerHeight - imgHeight, Math.min(0, imageOffset.value.y))
  }
}

// 加载图片
const loadImage = () => {
  if (!containerRef.value) {
    // 容器还没渲染，等待一下
    setTimeout(loadImage, 50)
    return
  }

  // 等待容器尺寸可用
  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight

  if (containerWidth === 0 || containerHeight === 0) {
    // 容器尺寸为0，等待一下再试
    setTimeout(loadImage, 50)
    return
  }

  const img = new Image()

  // 如果是blob URL或data URL，不需要设置crossOrigin
  if (props.imageUrl.startsWith('http://') || props.imageUrl.startsWith('https://')) {
    img.crossOrigin = 'anonymous'
  }

  img.onload = () => {
    if (!containerRef.value) return

    const containerWidth = containerRef.value.clientWidth
    const containerHeight = containerRef.value.clientHeight

    if (containerWidth === 0 || containerHeight === 0) {
      // 容器尺寸为0，重试
      setTimeout(loadImage, 100)
      return
    }

    // 保存原始图片尺寸
    originalImageSize.value = { width: img.width, height: img.height }

    const imgAspectRatio = img.width / img.height
    const containerAspectRatio = containerWidth / containerHeight

    // 计算初始缩放，确保图片完整显示在容器内（fit模式）
    let scale = 1
    if (imgAspectRatio > containerAspectRatio) {
      // 图片更宽，以宽度为准
      scale = containerWidth / img.width
    } else {
      // 图片更高，以高度为准
      scale = containerHeight / img.height
    }

    // 稍微缩小一点，留出边距
    scale = scale * 0.95

    // 确保缩放比例在合理范围内
    scale = Math.max(minScale.value, Math.min(maxScale.value, scale))

    imageScale.value = scale
    updateImagePosition(scale)

    imageLoaded.value = true

    // 等待nextTick确保imageRef已经渲染
    setTimeout(() => {
      if (imageRef.value) {
        imageRef.value.src = props.imageUrl
      }
      initCropBox()
    }, 0)
  }

  img.onerror = () => {
    console.error('图片加载失败:', props.imageUrl)
    imageLoaded.value = false
  }

  img.src = props.imageUrl
}

// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  if (!cropBoxRef.value) return

  const rect = cropBoxRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // 检查是否在调整大小的手柄上
  const handleSize = 10
  const isNearRight = Math.abs(x - rect.width) < handleSize
  const isNearBottom = Math.abs(y - rect.height) < handleSize
  const isNearLeft = x < handleSize
  const isNearTop = y < handleSize

  if (isNearRight && isNearBottom) {
    isResizing.value = true
    resizeHandle.value = 'se'
  } else if (isNearLeft && isNearTop) {
    isResizing.value = true
    resizeHandle.value = 'nw'
  } else if (isNearRight && isNearTop) {
    isResizing.value = true
    resizeHandle.value = 'ne'
  } else if (isNearLeft && isNearBottom) {
    isResizing.value = true
    resizeHandle.value = 'sw'
  } else if (isNearRight) {
    isResizing.value = true
    resizeHandle.value = 'e'
  } else if (isNearBottom) {
    isResizing.value = true
    resizeHandle.value = 's'
  } else if (isNearLeft) {
    isResizing.value = true
    resizeHandle.value = 'w'
  } else if (isNearTop) {
    isResizing.value = true
    resizeHandle.value = 'n'
  } else {
    isDragging.value = true
  }

  dragStart.value = { x: e.clientX, y: e.clientY }
  e.preventDefault()
}

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return

  if (isDragging.value) {
    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y

    cropBox.value.x = Math.max(
      0,
      Math.min(containerRef.value.clientWidth - cropBox.value.width, cropBox.value.x + deltaX),
    )
    cropBox.value.y = Math.max(
      0,
      Math.min(containerRef.value.clientHeight - cropBox.value.height, cropBox.value.y + deltaY),
    )

    dragStart.value = { x: e.clientX, y: e.clientY }
  } else if (isResizing.value) {
    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y

    if (resizeHandle.value.includes('e')) {
      cropBox.value.width = Math.max(
        50,
        Math.min(containerRef.value.clientWidth - cropBox.value.x, cropBox.value.width + deltaX),
      )
    }
    if (resizeHandle.value.includes('w')) {
      const newWidth = Math.max(50, cropBox.value.width - deltaX)
      const newX = cropBox.value.x + (cropBox.value.width - newWidth)
      if (newX >= 0) {
        cropBox.value.x = newX
        cropBox.value.width = newWidth
      }
    }
    if (resizeHandle.value.includes('s')) {
      cropBox.value.height = Math.max(
        50,
        Math.min(containerRef.value.clientHeight - cropBox.value.y, cropBox.value.height + deltaY),
      )
    }
    if (resizeHandle.value.includes('n')) {
      const newHeight = Math.max(50, cropBox.value.height - deltaY)
      const newY = cropBox.value.y + (cropBox.value.height - newHeight)
      if (newY >= 0) {
        cropBox.value.y = newY
        cropBox.value.height = newHeight
      }
    }

    // 保持宽高比
    if (props.aspectRatio) {
      if (resizeHandle.value.includes('e') || resizeHandle.value.includes('w')) {
        cropBox.value.height = cropBox.value.width / props.aspectRatio
      } else {
        cropBox.value.width = cropBox.value.height * props.aspectRatio
      }
    }

    dragStart.value = { x: e.clientX, y: e.clientY }
  }
}

// 鼠标释放
const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeHandle.value = ''
}

// 裁剪图片
const cropImage = () => {
  if (!imageRef.value || !containerRef.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = Math.min(cropBox.value.width, cropBox.value.height)
  canvas.width = size
  canvas.height = size

  // 计算源图片中的裁剪区域
  const scale = imageScale.value
  const offsetX = imageOffset.value.x
  const offsetY = imageOffset.value.y

  const sourceX = (cropBox.value.x - offsetX) / scale
  const sourceY = (cropBox.value.y - offsetY) / scale
  const sourceWidth = cropBox.value.width / scale
  const sourceHeight = cropBox.value.height / scale

  // 绘制裁剪后的图片
  ctx.drawImage(imageRef.value, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size)

  const dataUrl = canvas.toDataURL('image/png')
  emit('crop', dataUrl)
}

// 取消
const cancel = () => {
  emit('cancel')
}

onMounted(() => {
  // 等待DOM渲染完成后再加载图片
  setTimeout(() => {
    loadImage()
  }, 0)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="avatar-cropper">
    <div class="cropper-header">
      <h3>选择头像区域</h3>
      <p class="cropper-hint">拖动裁剪框选择头像区域，可拖动边缘调整大小，使用鼠标滚轮缩放图片</p>
    </div>

    <div ref="containerRef" class="cropper-container" @wheel="handleWheel">
      <div v-if="!imageLoaded" class="cropper-loading">加载中...</div>
      <template v-else>
        <img
          ref="imageRef"
          class="cropper-image"
          :style="{
            transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`,
            transformOrigin: 'top left',
          }"
        />

        <div
          ref="cropBoxRef"
          class="crop-box"
          :style="{
            left: cropBox.x + 'px',
            top: cropBox.y + 'px',
            width: cropBox.width + 'px',
            height: cropBox.height + 'px',
          }"
          @mousedown="handleMouseDown"
        >
          <div class="crop-box-overlay"></div>
          <div class="crop-box-border"></div>
          <!-- 调整大小的手柄 -->
          <div class="resize-handle resize-handle-nw"></div>
          <div class="resize-handle resize-handle-ne"></div>
          <div class="resize-handle resize-handle-sw"></div>
          <div class="resize-handle resize-handle-se"></div>
          <div class="resize-handle resize-handle-n"></div>
          <div class="resize-handle resize-handle-s"></div>
          <div class="resize-handle resize-handle-w"></div>
          <div class="resize-handle resize-handle-e"></div>
        </div>
      </template>
    </div>

    <div class="cropper-actions">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="cropImage">确认</el-button>
    </div>
  </div>
</template>

<style scoped>
.avatar-cropper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 600px;
  height: 100%;
  max-height: 600px;
}

.cropper-header {
  text-align: center;
}

.cropper-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.cropper-hint {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.cropper-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 20px 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: move;
}

.cropper-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  user-select: none;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 2px solid var(--primary-color);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  cursor: move;
  z-index: 10;
}

.crop-box-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
}

.crop-box-border {
  position: absolute;
  inset: -2px;
  border: 2px dashed rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--primary-color);
  border: 2px solid white;
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 11;
}

.resize-handle-nw {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
}

.resize-handle-ne {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}

.resize-handle-sw {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}

.resize-handle-se {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}

.resize-handle-n {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resize-handle-s {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resize-handle-w {
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.resize-handle-e {
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.cropper-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.cropper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
</style>
