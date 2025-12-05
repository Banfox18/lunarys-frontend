<!-- src/components/settings/AvatarCropperDialog.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import AvatarCropper from './AvatarCropper.vue'

interface Props {
  modelValue: boolean
  imageUrl: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'crop', dataUrl: string): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showDialog = ref(props.modelValue)

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    showDialog.value = newVal
  },
)

// 监听内部 showDialog 变化，同步到外部
watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

// 处理裁剪完成
const handleCrop = (dataUrl: string) => {
  emit('crop', dataUrl)
  showDialog.value = false
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  showDialog.value = false
}
</script>

<template>
  <el-dialog
    v-model="showDialog"
    width="460px"
    :max-width="900"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    top="15vh"
    class="avatar-cropper-dialog"
    :show-close="false"
    destroy-on-close
  >
    <div class="cropper-container">
      <AvatarCropper
        v-if="showDialog && imageUrl"
        :image-url="imageUrl"
        :aspect-ratio="1"
        @crop="handleCrop"
        @cancel="handleCancel"
      />
    </div>
  </el-dialog>
</template>

<style scoped>
.cropper-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>

<style>
/* 全局样式，用于覆盖 Element Plus 对话框样式 */
.avatar-cropper-dialog {
  z-index: 3000;
  background: transparent;
}

.avatar-cropper-dialog .el-dialog {
  background: linear-gradient(135deg, var(--surface-dark) 0%, var(--surface-darker) 100%);
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.avatar-cropper-dialog .el-dialog__title {
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

.avatar-cropper-dialog .el-dialog__headerbtn {
  top: 20px;
  right: 28px;
  width: auto;
  height: auto;
  border-radius: 8px;
  transition: all 0.2s ease;
  padding: 8px;
}

.avatar-cropper-dialog .el-dialog__headerbtn:hover {
  background: var(--surface-dark-hover);
  transform: rotate(90deg);
}

.avatar-cropper-dialog .el-dialog__close {
  color: var(--text-secondary);
  font-size: 18px;
  transition: color 0.2s ease;
}

.avatar-cropper-dialog .el-dialog__close:hover {
  color: var(--text-primary);
}

.avatar-cropper-dialog .el-dialog__body {
  padding: 20px 28px;
  margin: 0;
}

.avatar-cropper-dialog .el-dialog__footer {
  display: none;
}

/* 遮罩层样式 */
.avatar-cropper-dialog.is-align-center .el-overlay {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-cropper-dialog .el-dialog {
    width: 95% !important;
    max-width: 95% !important;
    margin: 2vh auto !important;
  }

  .avatar-cropper-dialog .el-dialog__header {
    padding: 16px 20px;
    padding-bottom: 16px;
  }

  .avatar-cropper-dialog .el-dialog__body {
    padding: 16px 20px;
  }
}
</style>
