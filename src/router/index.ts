// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 由于是单页面，只有一个路由
const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
