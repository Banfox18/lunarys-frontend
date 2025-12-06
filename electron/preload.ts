import { contextBridge, ipcRenderer } from 'electron'

/**
 * 安全地暴露 Node.js API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 示例：可以添加一些 Electron API 的封装
  platform: process.platform,
  
  // 如果需要与主进程通信，可以添加 IPC 方法
  // 例如：
  // sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  // onMessage: (callback: (message: string) => void) => {
  //   ipcRenderer.on('message', (_, message) => callback(message))
  // },
})

// 类型声明（会在 electron.d.ts 中定义）
declare global {
  interface Window {
    electronAPI: {
      platform: string
    }
  }
}
