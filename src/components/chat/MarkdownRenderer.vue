<!-- src/components/chat/MarkdownRenderer.vue - 使用 markstream-vue -->
<template>
  <div class="markdown-content">
    <MarkdownRender
      :content="content"
      :code-block-stream="true"
      :typewriter="false"
      :batch-rendering="false"
      :viewport-priority="false"
      :defer-nodes-until-visible="false"
      :max-live-nodes="0"
      :is-dark="isDark"
      :themes="themes"
      :code-block-dark-theme="codeBlockDarkTheme"
      :code-block-light-theme="codeBlockLightTheme"
      :code-block-monaco-options="monacoOptions"
      :code-block-props="codeBlockProps"
      @copy="handleCopy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownRender from 'markstream-vue'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  content: string
}

defineProps<Props>()
const emit = defineEmits<{
  copy: [text: string]
}>()

const settingsStore = useSettingsStore()

// 主题配置
const isDark = computed(() => settingsStore.theme === 'dark')
const themes = computed(() => ['github-dark', 'github-light'])

// CodeBlockNode 配置
const codeBlockDarkTheme = computed(() => 'github-dark')
const codeBlockLightTheme = computed(() => 'github-light')

// Monaco 编辑器选项
const monacoOptions = computed(() => ({
  fontSize: 14,
  lineHeight: 20,
  wordWrap: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  readOnly: true,
  automaticLayout: true,
  // 最大高度（像素），超过此高度会显示滚动条
  MAX_HEIGHT: 600,
}))

// 传递给 CodeBlockNode 的额外属性
const codeBlockProps = computed(() => ({
  showHeader: true, // 显示代码块头部（语言标签、操作按钮）
  showCopyButton: true, // 显示复制按钮
  showExpandButton: false, // 显示展开/折叠按钮
  showPreviewButton: false, // 显示预览按钮（HTML/SVG）
  showFontSizeButtons: false, // 显示字体大小调整按钮
  enableFontSizeControl: false, // 启用字体大小控制
  stream: true, // 启用流式更新（重要：让代码块支持增量更新）
  loading: false, // 代码块是否处于加载状态
  maxWidth: '100%',
}))

// 处理复制事件
const handleCopy = (event: { text?: string }) => {
  if (event?.text) {
    emit('copy', event.text)
  }
}
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
  width: fit-content;
  min-width: 0;
}

/* 覆盖 markstream-vue 的默认样式以匹配现有设计 */
.markdown-content :deep(.markdown-renderer) {
  color: var(--text-primary);
}

/* 标题样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary);
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
}
.markdown-content :deep(h2) {
  font-size: 1.3em;
}
.markdown-content :deep(h3) {
  font-size: 1.2em;
}
.markdown-content :deep(h4) {
  font-size: 1.1em;
}
.markdown-content :deep(h5) {
  font-size: 1em;
}
.markdown-content :deep(h6) {
  font-size: 0.9em;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin: 8px 0;
}

/* 代码块样式 */
.markdown-content :deep(code) {
  color: var(--text-primary);
  padding: 2px 6px;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.9em;
  border: 1px solid rgba(76, 83, 103, 0.3);
}

.markdown-content :deep(pre) {
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid rgba(76, 83, 103, 0.3);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  border: none;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin: 4px 0;
  color: var(--text-primary);
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 16px 0;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 0 12px 12px 0;
  border-right: 1px solid rgba(76, 83, 103, 0.3);
  border-top: 1px solid rgba(76, 83, 103, 0.3);
  border-bottom: 1px solid rgba(76, 83, 103, 0.3);
  font-style: italic;
  color: var(--text-secondary);
}

/* 表格样式 */
.markdown-content :deep(table) {
  border-collapse: collapse;
  margin: 16px 0;
  width: auto;
  max-width: 100%;
  overflow-x: auto;
  display: block;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-dark);
  padding: 8px 12px;
  text-align: left;
  color: var(--text-primary);
  white-space: nowrap;
}

.markdown-content :deep(th) {
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-weight: 600;
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: var(--primary-light);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
  color: var(--primary-color);
}

/* 水平线 */
.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-dark);
  margin: 24px 0;
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

/* KaTeX 数学公式样式 */
.markdown-content :deep(.katex) {
  font-size: 1.1em;
}

.markdown-content :deep(.katex-display) {
  margin: 16px 0;
  padding: 12px;
  background: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  text-align: center;
  overflow-x: auto;
  border: 1px solid rgba(76, 83, 103, 0.3);
}

.markdown-content :deep(.katex-inline) {
  background: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid rgba(76, 83, 103, 0.3);
}

/* Mermaid 图表样式 */
.markdown-content :deep(.mermaid-container) {
  margin: 16px 0;
  border-radius: 12px;
  overflow: auto;
  border: 1px solid rgba(76, 83, 103, 0.3);
  background: rgba(15, 23, 42, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
