/**
 * 响应式工具函数
 * 用于检测设备类型和屏幕尺寸
 */

/**
 * 检测是否为移动设备
 */
export const isMobile = () => {
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 检测是否为平板设备
 */
export const isTablet = () => {
  return /iPad|Android/i.test(navigator.userAgent) && 
    !/Mobile/i.test(navigator.userAgent)
}

/**
 * 检测是否为桌面设备
 */
export const isDesktop = () => {
  return !isMobile() && !isTablet()
}

/**
 * 获取当前屏幕宽度
 */
export const getScreenWidth = () => {
  return window.innerWidth || document.documentElement.clientWidth
}

/**
 * 获取当前屏幕高度
 */
export const getScreenHeight = () => {
  return window.innerHeight || document.documentElement.clientHeight
}

/**
 * 检测是否为横屏
 */
export const isLandscape = () => {
  return window.innerWidth > window.innerHeight
}

/**
 * 检测是否为竖屏
 */
export const isPortrait = () => {
  return window.innerHeight > window.innerWidth
}

/**
 * 响应式断点
 */
export const breakpoints = {
  xs: 480,   // 小屏手机
  sm: 768,   // 大屏手机/小平板
  md: 1024,  // 平板
  lg: 1440,  // 桌面
  xl: 1920   // 大屏桌面
}

/**
 * 检测当前屏幕尺寸范围
 */
export const getScreenSize = () => {
  const width = getScreenWidth()
  
  if (width < breakpoints.xs) {
    return 'xs'
  } else if (width < breakpoints.sm) {
    return 'sm'
  } else if (width < breakpoints.md) {
    return 'md'
  } else if (width < breakpoints.lg) {
    return 'lg'
  } else {
    return 'xl'
  }
}

/**
 * 监听窗口大小变化
 */
export const onResize = (callback) => {
  let resizeTimer = null
  
  const handleResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    
    resizeTimer = setTimeout(() => {
      callback({
        width: getScreenWidth(),
        height: getScreenHeight(),
        size: getScreenSize(),
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop(),
        isLandscape: isLandscape(),
        isPortrait: isPortrait()
      })
    }, 150) // 防抖 150ms
  }
  
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('orientationchange', handleResize, { passive: true })
  
  // 立即执行一次
  handleResize()
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
  }
}

/**
 * Vue Composable: 响应式屏幕信息
 */
export const useResponsive = () => {
  const { ref, onMounted, onUnmounted } = require('vue')
  
  const screenInfo = ref({
    width: getScreenWidth(),
    height: getScreenHeight(),
    size: getScreenSize(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isLandscape: isLandscape(),
    isPortrait: isPortrait()
  })
  
  let cleanup = null
  
  onMounted(() => {
    cleanup = onResize((info) => {
      screenInfo.value = info
    })
  })
  
  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })
  
  return screenInfo
}

/**
 * 检测浏览器类型
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent
  
  return {
    isIE: /MSIE|Trident/.test(ua),
    isEdge: /Edge/.test(ua),
    isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
    isFirefox: /Firefox/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isOpera: /Opera|OPR/.test(ua),
    isMobile: isMobile(),
    userAgent: ua
  }
}

/**
 * 检测是否支持某些特性
 */
export const featureDetection = {
  // 检测是否支持 CSS Grid
  supportsGrid: () => {
    return CSS.supports('display', 'grid')
  },
  
  // 检测是否支持 Flexbox
  supportsFlexbox: () => {
    return CSS.supports('display', 'flex')
  },
  
  // 检测是否支持 CSS Variables
  supportsCSSVariables: () => {
    return CSS.supports('color', 'var(--test)')
  },
  
  // 检测是否支持 Intersection Observer
  supportsIntersectionObserver: () => {
    return 'IntersectionObserver' in window
  },
  
  // 检测是否支持 WebP
  supportsWebP: () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  },
  
  // 检测是否支持触摸
  supportsTouch: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
}

export default {
  isMobile,
  isTablet,
  isDesktop,
  getScreenWidth,
  getScreenHeight,
  isLandscape,
  isPortrait,
  breakpoints,
  getScreenSize,
  onResize,
  useResponsive,
  getBrowserInfo,
  featureDetection
}
















