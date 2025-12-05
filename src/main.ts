// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './assets/theme.css'
// 导入 markstream-vue 样式
import 'markstream-vue/index.css'
import 'katex/dist/katex.min.css'
import App from './App.vue'
import router from './router'
import { setKaTeXWorker, setMermaidWorker } from 'markstream-vue'

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 配置 markstream-vue 的 Web Workers（仅在浏览器环境中）
if (typeof window !== 'undefined') {
  // 动态导入 Workers 以避免 SSR 问题
  Promise.all([
    import('markstream-vue/workers/katexRenderer.worker?worker'),
    import('markstream-vue/workers/mermaidParser.worker?worker'),
  ])
    .then(([KaTeXWorkerModule, MermaidWorkerModule]) => {
      const KaTeXWorker = KaTeXWorkerModule.default
      const MermaidWorker = MermaidWorkerModule.default
      
      if (KaTeXWorker && typeof KaTeXWorker === 'function') {
        setKaTeXWorker(new KaTeXWorker())
      }
      if (MermaidWorker && typeof MermaidWorker === 'function') {
        setMermaidWorker(new MermaidWorker())
      }
    })
    .catch((error) => {
      console.warn('Failed to initialize markstream-vue workers (optional):', error)
    })
}

app.mount('#app')
