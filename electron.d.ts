/**
 * Electron API 类型定义
 * 用于在渲染进程中使用 Electron API
 */

export interface ElectronAPI {
  platform: string
  // 可以在这里添加更多 API 方法
  // 例如：
  // sendMessage: (message: string) => Promise<void>
  // onMessage: (callback: (message: string) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

