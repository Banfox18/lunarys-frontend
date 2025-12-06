import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    electron({
      main: {
        // 主进程入口文件
        entry: 'electron/main.ts',
      },
      preload: {
        // 预加载脚本
        input: 'electron/preload.ts',
      },
      // 开发模式下，Vite 会启动 Electron
      // 生产模式下，需要先构建再打包
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
