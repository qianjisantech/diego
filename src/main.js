// MUST BE FIRST - Polyfill for @stomp/stompjs
import './polyfill'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import App from './App.vue'
import router from './router'
import permission from './directives/permission'
import { initApp } from './utils/initApp'


// 初始化应用并启动
;(async () => {
  // 初始化 IndexedDB 并迁移数据
  await initApp()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(TDesign)

  // 注册全局权限指令
  app.directive('permission', permission)

  

  

  // 根据路由自动切换 dense-mode（仅在工作台/管理类页面启用紧凑模式）
  const densePrefixes = ['/workspace', '/rbac', '/admin']
  const updateDenseMode = (to) => {
    try {
      const path = to?.path || (router.currentRoute && router.currentRoute.value && router.currentRoute.value.path) || ''
      const enable = densePrefixes.some(prefix => path.startsWith(prefix))
      if (enable) document.body.classList.add('dense-mode')
      else document.body.classList.remove('dense-mode')
    } catch (e) {
      // ignore
    }
  }
  router.afterEach((to) => {
    updateDenseMode(to)
  })
  // 初始化时根据当前路由设置一次
  updateDenseMode(router.currentRoute && router.currentRoute.value ? router.currentRoute.value : {})

  app.mount('#app')
  
  // 应用初始化完成后隐藏加载动画
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay')
    if (loadingOverlay) {
      loadingOverlay.classList.add('fade-out')
      // 动画完成后移除元素
      setTimeout(() => {
        loadingOverlay.remove()
      }, 500)
    }
  }, 100)
})()
