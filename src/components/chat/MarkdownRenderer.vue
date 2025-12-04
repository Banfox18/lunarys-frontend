<!-- src/components/chat/MarkdownRenderer.vue -->
<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import mk from '@iktakahiro/markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true, // 允许 HTML 标签
  linkify: true, // 自动链接检测
  typographer: true, // 排版优化
  breaks: true, // 将换行符转换为 <br>

  // 代码高亮函数
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {
        // 如果高亮失败，返回原始代码
      }
    }

    // 如果没有指定语言或语言不支持，使用默认高亮
    return hljs.highlightAuto(str).value
  },
})

// 添加 KaTeX 插件 - 解决数学公式问题
md.use(mk, {
  throwOnError: false, // 不抛出错误
  errorColor: '#cc0000', // 错误颜色
  delimiters: [
    { left: '$$', right: '$$', display: true }, // 块级公式
    { left: '$', right: '$', display: false }, // 行内公式
    { left: '\\(', right: '\\)', display: false }, // 行内公式 (LaTeX 风格)
    { left: '\\[', right: '\\]', display: true }, // 块级公式 (LaTeX 风格)
  ],
})

// 计算属性：渲染后的内容
const renderedContent = computed(() => {
  if (!props.content) return ''

  try {
    // 渲染为 HTML
    const html = md.render(props.content)

    return html
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return `<div class="error">渲染错误: ${error.message}</div>`
  }
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
}

/* MathJax 数学公式样式 - 改为 KaTeX 样式 */
.markdown-content :deep(.katex) {
  font-size: 1.1em;
}

.markdown-content :deep(.katex-display) {
  margin: 16px 0;
  padding: 12px;
  background: var(--surface-dark);
  border-radius: 8px;
  text-align: center;
  overflow-x: auto;
  border: 1px solid var(--border-dark);
}

/* 行内数学公式样式 */
.markdown-content :deep(.katex-inline) {
  background: var(--surface-dark);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid var(--border-dark);
}

/* 代码高亮样式 */
.markdown-content :deep(.hljs) {
  background: transparent;
  padding: 0;
}

.markdown-content :deep(pre code.hljs) {
  display: block;
  overflow-x: auto;
  padding: 1em;
}

/* 以下保持原有的样式不变 */
.markdown-content :deep(p) {
  margin: 8px 0;
}

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

/* 代码样式 */
.markdown-content :deep(code) {
  background: var(--surface-dark);
  color: var(--text-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.9em;
  border: 1px solid var(--border-dark);
}

.markdown-content :deep(pre) {
  background: var(--surface-dark);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid var(--border-dark);
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
  background: var(--surface-dark);
  border-radius: 0 8px 8px 0;
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
  background: var(--surface-dark-hover);
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
</style>
