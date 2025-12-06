"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 示例：可以添加一些 Electron API 的封装
  platform: process.platform
  // 如果需要与主进程通信，可以添加 IPC 方法
  // 例如：
  // sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  // onMessage: (callback: (message: string) => void) => {
  //   ipcRenderer.on('message', (_, message) => callback(message))
  // },
});
