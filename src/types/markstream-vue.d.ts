// Worker 类型声明
declare module 'markstream-vue/workers/katexRenderer.worker?worker' {
  const Worker: new () => Worker
  export default Worker
}

declare module 'markstream-vue/workers/mermaidParser.worker?worker' {
  const Worker: new () => Worker
  export default Worker
}
