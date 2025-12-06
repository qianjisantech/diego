<template>
  <div class="layout-container">
    <!-- 顶部Header区域 -->
    <Header />

    <!-- 权限加载中 -->
    <div v-if="!userStore.permissionsLoaded" class="permission-loading">
      <t-loading size="large" text="加载中..." />
    </div>

    <!-- 下方内容区域 -->
    <div v-else class="layout-body">
      <Sidebar @secondary-change="handleSecondaryChange" />
      <div class="layout-main" :style="{ marginLeft: sidebarWidth }">
        <div class="layout-content">
          <router-view :key="route.fullPath" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const route = useRoute()

// 二级菜单展开状态
const hasSecondary = ref(false)

// 处理二级菜单状态变化
const handleSecondaryChange = (isShow) => {
  console.log('[Layout] 二级菜单状态变化:', isShow)
  hasSecondary.value = isShow
  console.log('[Layout] hasSecondary 更新为:', hasSecondary.value)
  console.log('[Layout] sidebarWidth 将变为:', isShow ? '280px' : '80px')
}

// 根据二级菜单状态动态计算内容区域的左边距
const sidebarWidth = computed(() => {
  // 如果是发布日志，二级菜单宽度为 300px
  // 如果是工作台（我的事项），二级菜单宽度为 320px
  // 否则为 280px
  let secondaryWidth = '280px'
  if (route.path.startsWith('/changelog')) {
    secondaryWidth = '300px'
  } else if (route.path.startsWith('/workspace')) {
    secondaryWidth = '320px'
  }
  const width = hasSecondary.value ? secondaryWidth : '80px'
  const viewportWidth = window.innerWidth

  console.log('======================== Layout 计算信息 ========================')
  console.log('📏 [Layout] sidebarWidth computed:', width, '(hasSecondary:', hasSecondary.value, ')')
  console.log('📏 [Layout] 视口宽度:', viewportWidth, 'px')
  console.log('📏 [Layout] 媒体查询状态 (<=768px):', viewportWidth <= 768 ? '✅ 已触发' : '❌ 未触发')

  // 在 nextTick 中检查实际应用的样式
  nextTick(() => {
    console.log('--------------------------- DOM 检查开始 ---------------------------')

    // 检查所有关键容器
    const containers = {
      layoutContainer: document.querySelector('.layout-container'),
      headerContainer: document.querySelector('.header-container'),
      layoutBody: document.querySelector('.layout-body'),
      sidebarContainer: document.querySelector('.sidebar-container'),
      layoutMain: document.querySelector('.layout-main')
    }

    Object.entries(containers).forEach(([name, element]) => {
      if (element) {
        const styles = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        console.log(`✅ ${name}:`, {
          存在: true,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          zIndex: styles.zIndex,
          位置: `left:${rect.left}px, top:${rect.top}px`,
          尺寸: `${rect.width}x${rect.height}px`,
          marginLeft: styles.marginLeft || 'none'
        })
      } else {
        console.error(`❌ ${name}: 不存在！`)
      }
    })

    console.log('--------------------------- DOM 检查结束 ---------------------------')
    console.log('================================================================')
  })

  return width
})

// 监听权限加载状态
watch(() => userStore.permissionsLoaded, (newVal, oldVal) => {
  console.log('🔔🔔🔔 [Layout] permissionsLoaded 状态变化:', {
    从: oldVal,
    到: newVal,
    当前路由: route.path
  })

  if (newVal === false && oldVal === true) {
    console.error('⚠️⚠️⚠️ [Layout] 警告：权限状态从 true 变为 false！这可能导致 Sidebar 消失！')
  }
})

// 组件挂载时获取用户权限
onMounted(async () => {
  const viewportWidth = window.innerWidth
  console.log('==================== Layout 组件挂载 ====================')
  console.log('📱 [Layout] 视口宽度:', viewportWidth, 'px')

  if (viewportWidth <= 768) {
    console.warn('⚠️⚠️⚠️ [Layout] 警告：当前视口宽度 <=768px，Sidebar 将被隐藏！')
    console.warn('⚠️⚠️⚠️ [Layout] 原因：响应式 CSS 设置了 transform: translateX(-100%)')
    console.warn('⚠️⚠️⚠️ [Layout] 解决方案：')
    console.warn('  1. 将浏览器窗口宽度调整到 > 768px')
    console.warn('  2. 或者实现移动端菜单按钮来控制显示')
  } else {
    console.log('✅ [Layout] 视口宽度正常，Sidebar 应该可见')
  }

  try {
    await userStore.getPermissions()
    console.log('✅ [Layout] 用户权限加载成功')
    console.log('✅ [Layout] permissionsLoaded:', userStore.permissionsLoaded)
  } catch (error) {
    console.error('❌ [Layout] 获取用户权限失败:', error)
  }

  console.log('========================================================')
})
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg-secondary);
  position: relative;

  // 权限加载中
  .permission-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 64px; // 为顶部Header预留组织
    min-height: calc(100vh - 64px);
  }

  // 下方内容区域（Sidebar + Main）
  .layout-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 64px; // 为顶部Header预留组织
  }

  .layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0; // 防止flex子项溢出
    position: relative; // 建立层叠上下文
    z-index: 10; // 与 Sidebar 在同一层级
    transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1); // 腾讯云风格的平滑过渡

    .layout-content {
      flex: 1;
      padding: 0;
      overflow-y: auto;
      background: var(--color-bg-secondary);
      height: 100%;

      // 苹果风格滚动条
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: rgba(0, 0, 0, 0.15);
        }
      }

      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
    }
  }
}

// ========== 响应式适配 ==========

// 平板屏幕 (768px - 1024px)
@media (max-width: 1024px) {
  .layout-container {
    .layout-body {
      margin-top: 64px;
    }
  }
}

// 手机屏幕 (768px 以下)
@media (max-width: 768px) {
  .layout-container {
    .layout-body {
      margin-top: 56px; // Header在移动端高度为56px
    }

    .layout-main {
      // 移动端不需要左边距，Sidebar为浮动层
      margin-left: 0 !important;

      .layout-content {
        padding: 0;
      }
    }
  }
}

// 小屏手机 (480px 以下)
@media (max-width: 480px) {
  .layout-container {
    .layout-main {
      .layout-content {
        padding: 0;
      }
    }
  }
}
</style>
