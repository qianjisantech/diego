<template>
  <router-view />
  <GlobalLoading />
  <SystemUpdateChecker />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import GlobalLoading from '@/components/GlobalLoading.vue'
import SystemUpdateChecker from '@/components/SystemUpdateChecker.vue'
import { getBrowserInfo, featureDetection } from '@/utils/responsive'

const userStore = useUserStore()

// 应用启动时，如果已登录则加载权限数据
onMounted(async () => {
  // 浏览器兼容性检测
  const browserInfo = getBrowserInfo()
  const features = {
    grid: featureDetection.supportsGrid(),
    flexbox: featureDetection.supportsFlexbox(),
    cssVariables: featureDetection.supportsCSSVariables(),
    intersectionObserver: featureDetection.supportsIntersectionObserver(),
    webp: featureDetection.supportsWebP(),
    touch: featureDetection.supportsTouch()
  }
  // 添加浏览器类名到 body，方便 CSS 针对性处理
  if (browserInfo.isIE) {
    document.body.classList.add('browser-ie')
  }
  if (browserInfo.isMobile) {
    document.body.classList.add('device-mobile')
  }
  if (browserInfo.isTablet) {
    document.body.classList.add('device-tablet')
  }
  if (browserInfo.isDesktop) {
    document.body.classList.add('device-desktop')
  }
  
  // 添加屏幕尺寸类名
  const updateScreenClass = () => {
    const width = window.innerWidth
    document.body.classList.remove('screen-xs', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl')
    
    if (width < 480) {
      document.body.classList.add('screen-xs')
    } else if (width < 768) {
      document.body.classList.add('screen-sm')
    } else if (width < 1024) {
      document.body.classList.add('screen-md')
    } else if (width < 1440) {
      document.body.classList.add('screen-lg')
    } else {
      document.body.classList.add('screen-xl')
    }
  }
  
  updateScreenClass()
  window.addEventListener('resize', updateScreenClass, { passive: true })
  
  if (userStore.token) {
    try {
      await userStore.getPermissions()
    } catch (error) {
      console.error('加载权限失败:', error)
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 浏览器兼容性 */
  -webkit-tap-highlight-color: transparent;
}

*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
  /* 浏览器兼容性 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 移动端优化 */
  -webkit-overflow-scrolling: touch;
  /* 防止页面缩放（可选） */
  touch-action: manipulation;
}

#app {
  width: 100%;
  min-height: 100vh;
  /* iOS Safari 兼容性 */
  min-height: -webkit-fill-available;
  /* 防止内容溢出 */
  overflow-x: hidden;
  /* 硬件加速 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: scroll-position;
}

/* 弹窗蒙层 - 最浅遮罩 */
.t-drawer__mask,
.t-dialog__mask,
.t-popup__mask,
.t-modal__mask {
  background-color: rgba(0, 0, 0, 0.05) !important;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 苹果风格弹窗内容 */
.t-dialog,
.t-drawer,
.t-popup {
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--color-shadow-xl) !important;
  border: 1px solid var(--color-border) !important;
}

/* 弹窗左中间定位 */
.t-dialog {
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
}

/* 苹果风格卡片组件 */
.t-card {
  border-radius: var(--radius-md) !important;
  box-shadow: var(--color-shadow-sm) !important;
  border: 1px solid var(--color-border) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.t-card:hover {
  box-shadow: var(--color-shadow-md) !important;
}

/* 苹果风格按钮组件 */
.t-button {
  border-radius: var(--radius-md) !important;
  font-weight: 500 !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.t-button--variant-outline {
  border-color: var(--color-border) !important;
}

.t-button--variant-outline:hover {
  border-color: var(--color-border-hover) !important;
  background: var(--color-bg-secondary) !important;
}

/* 苹果风格输入框组件 */
.t-input {
  border-radius: var(--radius-md) !important;
  border-color: var(--color-border) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.t-input:hover {
  border-color: var(--color-border-hover) !important;
}

.t-input--focused {
  border-color: var(--color-text-secondary) !important;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05) !important;
}

/* Compact / unified form control styles (dense mode) */
body.dense-mode {
.t-input__inner,
.t-select .t-input__inner,
.t-input-number .t-input__inner,
.t-select__wrap,
.t-input__wrap,
.t-picker__input {
  height: 36px !important;
  min-height: 36px !important;
  padding: 6px 10px !important;
  border-radius: var(--radius-md) !important;
  font-size: 13px !important;
  display: flex;
  align-items: center;
}

/* Textarea smaller default */
.t-textarea__inner,
.w-e-text-container,
.w-e-scroll {
  min-height: 72px !important; /* approx 2 lines */
  max-height: 160px !important;
}

/* Ensure select placeholder vertically centered */
.t-select .t-input__placeholder,
.t-select .t-input__inner {
  display: flex !important;
  align-items: center !important;
}

/* Compact number input */
.t-input-number .t-input__inner {
  padding-left: 8px !important;
  padding-right: 8px !important;
}

/* Slightly subtler focus ring for dense mode */
.t-input--focused, .t-select--focused {
  box-shadow: 0 0 0 3px rgba(0,0,0,0.04) !important;
}
}

/* 苹果风格表格 */
.t-table {
  border-radius: var(--radius-md) !important;
}

.t-table__header {
  background: var(--color-bg-tertiary) !important;
}

.t-table__row:hover {
  background: var(--color-bg-secondary) !important;
}

/* 苹果风格标签 */
.t-tag {
  border-radius: var(--radius-sm) !important;
  font-weight: 500 !important;
  border: none !important;
}

/* 响应式工具类 */
.container-responsive {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

@media (max-width: 1024px) {
  .container-responsive {
    padding: 0 calc(var(--spacing-md) * 0.75);
  }
}

@media (max-width: 768px) {
  .container-responsive {
    padding: 0 calc(var(--spacing-sm) * 2);
  }
}

@media (max-width: 480px) {
  .container-responsive {
    padding: 0 var(--spacing-xs);
  }
}

/* 文本溢出处理 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-ellipsis-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 移动端触摸优化 */
@media (max-width: 768px) {
  /* 增大触摸目标 */
  button, a, .t-button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 优化输入框 */
  input, textarea, select {
    font-size: 16px; /* 防止 iOS 自动缩放 */
  }
}

/* 打印样式 */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  
  a, a:visited {
    text-decoration: underline;
  }
  
  pre, blockquote {
    border: 1px solid #999;
    page-break-inside: avoid;
  }
  
  thead {
    display: table-header-group;
  }
  
  tr, img {
    page-break-inside: avoid;
  }
  
  img {
    max-width: 100% !important;
  }
  
  p, h2, h3 {
    orphans: 3;
    widows: 3;
  }
  
  h2, h3 {
    page-break-after: avoid;
  }
}
</style>
