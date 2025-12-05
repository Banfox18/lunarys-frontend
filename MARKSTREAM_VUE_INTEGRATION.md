# markstream-vue 集成说明

## 已完成的工作

### 1. 安装依赖
项目已经安装了以下依赖：
- `markstream-vue`: ^0.0.2-beta.8
- `stream-markdown`: ^0.0.10
- `stream-monaco`: ^0.0.7
- `mermaid`: ^11.12.2
- `katex`: ^0.16.25
- `shiki`: ^3.19.0
- `monaco-editor`: ^0.55.1

### 2. 创建的新文件

#### `src/components/chat/MarkdownRenderer.vue`
- 使用 `markstream-vue` 替换了原有的 `markdown-it` 实现
- 支持流式渲染，适合 AI 对话场景
- 配置了代码块流式更新、批量渲染、视口优先级等性能优化选项
- 保留了原有的样式设计

#### `src/types/markstream-vue.d.ts`
- Worker 类型声明文件，支持 Vite 的 `?worker` 导入语法

### 3. 修改的文件

#### `src/main.ts`
- 全局配置了 KaTeX 和 Mermaid 的 Web Workers
- 导入了必要的样式文件（markstream-vue 和 katex）

## 主要特性

### 流式渲染
- **自动支持流式更新**：当 `content` prop 更新时，组件会自动增量渲染新内容
- **代码块流式更新**：大代码块支持平滑的增量更新，不会重新渲染整个代码块
- **渐进式 Mermaid**：Mermaid 图表在语法可用时立即渲染，后续更新会完善图表

### 性能优化
- **批量渲染**：使用 `requestIdleCallback` 和 `requestAnimationFrame` 分批渲染节点
- **视口优先级**：使用 Intersection Observer 延迟渲染不可见内容
- **Web Workers**：KaTeX 和 Mermaid 在 Worker 中处理，不阻塞主线程

### 功能支持
- ✅ 完整的 Markdown 语法支持
- ✅ 代码高亮（Monaco Editor）
- ✅ 数学公式（KaTeX）
- ✅ Mermaid 图表
- ✅ 表格、列表、引用等
- ✅ Emoji、复选框等扩展语法

## 使用方式

组件使用方式保持不变：

```vue
<MarkdownRenderer :content="message.content" />
```

当 `content` 更新时（例如流式接收 AI 回复），组件会自动增量渲染新内容。

## 配置选项

如果需要调整渲染行为，可以修改 `MarkdownRenderer.vue` 中的 props：

```vue
<MarkdownRender
  :content="content"
  :code-block-stream="true"      // 代码块流式更新
  :typewriter="false"            // 禁用打字机效果
  :batch-rendering="true"        // 启用批量渲染
  :viewport-priority="true"      // 启用视口优先级
  :is-dark="isDark"              // 主题模式
  :themes="themes"               // 代码高亮主题
/>
```

## 注意事项

1. **Workers 初始化**：Workers 在 `main.ts` 中全局初始化，如果初始化失败会回退到主线程渲染（性能会降低但功能正常）

2. **样式覆盖**：组件中包含了样式覆盖，以匹配项目的现有设计。如果需要调整样式，修改 `MarkdownRenderer.vue` 中的 `<style>` 部分

3. **流式更新**：组件会自动处理流式更新，无需额外配置。当 `content` prop 变化时，组件会智能地只渲染新增部分

4. **性能**：对于大文档，组件会自动启用虚拟滚动和批量渲染，确保流畅的用户体验

## 测试建议

1. 测试流式渲染：发送一条长消息，观察渲染是否流畅
2. 测试代码块：发送包含代码的消息，检查高亮和流式更新
3. 测试数学公式：发送包含 LaTeX 公式的消息
4. 测试 Mermaid 图表：发送包含 Mermaid 代码块的消息
5. 测试性能：发送超长消息，检查是否有卡顿

## 故障排查

如果遇到问题：

1. **Workers 未初始化**：检查浏览器控制台是否有 Worker 初始化错误
2. **样式不匹配**：检查 `MarkdownRenderer.vue` 中的样式覆盖是否正确
3. **类型错误**：确保 `src/types/markstream-vue.d.ts` 文件存在
4. **流式更新不工作**：确保 `content` prop 是响应式的，并且会触发更新

## 下一步

- [ ] 测试流式渲染功能
- [ ] 根据实际使用情况调整性能参数
- [ ] 根据需要自定义代码块主题
- [ ] 考虑添加更多自定义节点组件

