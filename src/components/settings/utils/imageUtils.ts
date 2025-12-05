// 图片压缩函数
export const compressImage = (
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
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取图片格式
export const getImageFormat = (mimeType: string): string => {
  const format = mimeType.split('/')[1]
  return format ? format.toUpperCase() : '未知'
}

// Blob转Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 判断是否为图片URL
export const isImageUrl = (avatar: string | undefined): boolean => {
  if (!avatar) return false
  return (
    avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image')
  )
}

