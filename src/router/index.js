import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { useUserStore } from '@/store/user'
import Layout from '@/layout/index.vue'

/**
 * 静态路由
 * 不需要权限验证的路由
 */
export const staticRoutes = [
  {
    path: '/',
    name: 'Product',
    component: () => import('@/views/product/index.vue'),
    meta: { title: '产品介绍', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  }
]

/**
 * 静态子路由
 * 这些路由是写死的，不会被动态路由覆盖
 */
const staticChildRoutes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: true,
      icon: 'dashboard'
    }
  },
  {
    path: '/logs',
    name: 'LogManagement',
    component: () => import('../views/logs/LogManagement.vue'),
    meta: {
      title: '记录管理',
      requiresAuth: true,
      icon: 'view-module'
    }
  },
  {
    path: '/space/projects',
    name: 'SpaceProjects',
    component: () => import('@/views/space/ProjectManagement.vue'),
    meta: {
      title: '项目管理',
      requiresAuth: true,
      icon: 'app'
    }
  },
  {
    path: '/space/settings',
    name: 'SpaceSettings',
    component: () => import('@/views/space/SpaceSettings.vue'),
    meta: {
      title: '成员管理',
      requiresAuth: true,
      icon: 'usergroup'
    }
  }
]

/**
 * 基础路由
 * 包含布局的路由，会在其中动态添加子路由
 */
export const layoutRoute = {
  path: '/workspace',
  name: 'Layout',  // ⚠️ 必须设置 name，否则 addRoute 无法找到父路由
  component: Layout,
  redirect: '/home',
  meta: { requiresAuth: true },
  children: [...staticChildRoutes]
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...staticRoutes,
    // 添加布局路由（包含首页静态路由）
    layoutRoute
    // ⚠️ 404 通配符路由移到动态路由加载后添加，否则会在动态路由加载前就匹配到 404
  ]
})

/**
 * 动态添加路由
 * @param {Array} routes - 动态路由数组
 */
export function addDynamicRoutes(routes) {
  console.log('[addDynamicRoutes] 开始添加动态路由，数量:', routes.length)

  // 将动态路由逐个添加到 layoutRoute（name 为 'Layout'） 下
  routes.forEach((route, index) => {
    console.log(`[addDynamicRoutes] 添加路由 ${index}:`, route.path, '(name:', route.name, ')')
    router.addRoute('Layout', route)  // ⚠️ 使用 Layout 的 name，而不是 path
  })

  // 更新 layoutRoute 的 children 引用（用于其他地方读取完整路由列表）
  layoutRoute.children = [...staticChildRoutes, ...routes]

  console.log('[addDynamicRoutes] 动态路由添加完成')
  console.log('[addDynamicRoutes] 当前所有路由:')
  router.getRoutes().forEach(r => {
    console.log('  -', r.path, '(name:', r.name, ', parent:', r.parent?.name || '无', ')')
  })

  // 🔧 特别检查 /space/settings 路由是否存在
  const spaceSettingsRoute = router.getRoutes().find(r => r.path === '/space/settings')
  if (spaceSettingsRoute) {
    console.log('✅ [addDynamicRoutes] /space/settings 路由已注册:', spaceSettingsRoute)
  } else {
    console.error('❌ [addDynamicRoutes] /space/settings 路由未找到！')
  }
}

/**
 * 重置路由
 * 移除所有动态添加的路由
 */
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: [...staticRoutes]
  })
  router.matcher = newRouter.matcher
}

// 白名单：不需要登录就能访问的路由
const whiteList = ['/', '/login', '/404']

/**
 * 全局前置守卫
 * 处理登录验证、动态路由加载和权限检查
 */
router.beforeEach(async (to, from, next) => {
  const token = Cookies.get('dcp_token')
  const userStore = useUserStore()

  if (to.path === '/') {
    if (token) {
      next('/home')
    } else {
      next('/login')
    }
    return
  }

  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - Diego` : 'Diego'

  if (token) {
    // 已登录
    if (to.path === '/login') {
      // 如果已登录，访问登录页则跳转到首页
      next({ path: '/home' })
      return
    }

    // 检查是否已加载动态路由
    if (!userStore.routesLoaded) {
      try {
        // 获取用户信息和菜单
        await userStore.fetchUserInfo()

        // 获取动态路由
        const dynamicRoutes = userStore.routes

        // 添加动态路由
        addDynamicRoutes(dynamicRoutes)

        // 标记路由已加载
        userStore.setRoutesLoaded(true)

        // 重新导航到目标路由
        // 使用 replace 避免留下历史记录
        next({ ...to, replace: true })
        return
      } catch (error) {
        console.error('获取用户信息失败:', error)

        // 清除 token
        userStore.logout()
        Cookies.remove('dcp_token')

        // 跳转到登录页
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 路由已加载，进行权限检查
    if (to.meta.permission) {
      // 如果权限数据还未加载完成，等待加载完成后再进行权限检查
      if (!userStore.permissionsLoaded && !userStore.permissionsLoading) {
        // 异步加载权限数据
        try {
          await userStore.getPermissions()
          // 权限加载完成后，重新执行路由守卫
          next({ ...to, replace: true })
          return
        } catch (error) {
          // 权限加载失败，暂时放行（避免白屏）
          console.warn('权限数据加载失败，暂时放行:', to.path)
          next()
          return
        }
      }

      // 如果权限正在加载中，等待一小段时间
      if (userStore.permissionsLoading) {
        // 使用轮询等待权限加载完成
        const checkInterval = setInterval(() => {
          if (userStore.permissionsLoaded || !userStore.permissionsLoading) {
            clearInterval(checkInterval)
            next({ ...to, replace: true })
          }
        }, 100)

        // 最多等待3秒，超时后放行
        setTimeout(() => {
          if (!userStore.permissionsLoaded) {
            clearInterval(checkInterval)
            console.warn('权限数据加载超时，暂时放行:', to.path)
            next()
          }
        }, 3000)
        return
      }

      const userPermissions = userStore.menuPermissions || []
      const requiredPermission = to.meta.permission

      // admin用户或拥有通配符权限，直接放行
      if (userPermissions.includes('*:*:*')) {
        next()
        return
      }

      // 检查是否拥有所需权限
      const hasPermission = userPermissions.some(permission => {
        // 精确匹配
        if (permission === requiredPermission) {
          return true
        }
        // 通配符匹配
        if (permission.endsWith('*')) {
          const prefix = permission.slice(0, -1)
          return requiredPermission.startsWith(prefix)
        }
        return false
      })

      if (!hasPermission) {
        // 没有权限，显示提示并阻止跳转
        console.warn(`无权限访问：${to.path}，需要权限：${requiredPermission}，当前拥有权限：`, userPermissions)

        // 如果是从其他页面跳转过来，返回上一页
        if (from.path !== '/' && from.path !== '/login') {
          next(false)
        } else {
          // 如果是直接访问，跳转到首页
          next('/home')
        }
        return
      }
    }

    // 已登录且路由已加载，直接放行
    next()
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接放行
      next()
    } else {
      // 不在白名单中，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
})

/**
 * 全局后置守卫
 */
router.afterEach(() => {
  // 可以在这里处理一些全局的后置逻辑
  // 例如：关闭 loading、记录访问日志等
})

export default router
