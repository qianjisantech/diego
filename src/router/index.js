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
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },

  {
    path: '/enterprise/my-list',
    name: 'EnterprisesMyList',
    component: () => import('@/views/enterprise/MyEnterprises.vue'),
    meta: { title: '我的企业', requiresAuth: true }
  },
  {
    path: '/enterprise/create',
    name: 'EnterpriseCreate',
    component: () => import('@/views/enterprise/EnterpriseCreate.vue'),
    meta: { title: '新建企业', requiresAuth: true }
  },
  {
    path: '/enterprise-admin/:id',
    name: 'EnterpriseAdmin',
    component: () => import('@/views/enterprise-admin/EnterpriseAdmin.vue'),
    meta: { title: '企业管理后台', requiresAuth: true },
    redirect: (to) => {
      return `/enterprise-admin/${to.params.id}/info`
    },
    children: [
      {
        path: 'info',
        name: 'EnterpriseInfo',
        component: () => import('@/views/enterprise-admin/EnterpriseInfo.vue'),
        meta: { title: '企业信息', requiresAuth: true }
      },
      {
        path: 'members',
        name: 'EnterpriseMembers',
        component: () => import('@/views/enterprise-admin/Members.vue'),
        meta: { title: '成员', requiresAuth: true }
      },
      {
        path: 'organization',
        name: 'EnterpriseOrganization',
        component: () => import('@/views/enterprise-admin/Organization.vue'),
        meta: { title: '组织架构', requiresAuth: true }
      },
      {
        path: 'custom-templates',
        name: 'EnterpriseCustomTemplates',
        component: () => import('@/views/enterprise-admin/CustomTemplates.vue'),
        meta: { title: '自定义模板', requiresAuth: true }
      },
      {
        path: 'item-type-management',
        name: 'EnterpriseItemTypeManagement',
        component: () => import('@/views/enterprise-admin/ItemTypeManagement.vue'),
        meta: { title: '事项类型管理', requiresAuth: true }
      },
      {
        path: 'template-design',
        name: 'EnterpriseTemplateDesign',
        component: () => import('@/views/enterprise-admin/TemplateDesign.vue'),
        meta: { title: '模板设计', requiresAuth: true }
      },
      {
        path: 'enterprise-permissions',
        name: 'EnterprisePermissions',
        component: () => import('@/views/enterprise-admin/EnterpriseInfo.vue'), // 临时使用同一个组件
        meta: { title: '企业权限', requiresAuth: true }
      },
      {
        path: 'project-permissions',
        name: 'ProjectPermissions',
        component: () => import('@/views/enterprise-admin/EnterpriseInfo.vue'), // 临时使用同一个组件
        meta: { title: '项目权限', requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Admin.vue'),
    meta: { title: '管理员后台', requiresAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '仪表盘', requiresAuth: true }
      },
      {
        path: 'enterprises',
        name: 'AdminEnterprises',
        component: () => import('@/views/admin/Enterprises.vue'),
        meta: { title: '企业', requiresAuth: true }
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('@/views/admin/Projects.vue'),
        meta: { title: '项目管理', requiresAuth: true }
      },
      {
        path: 'members',
        name: 'AdminMembers',
        component: () => import('@/views/admin/Members.vue'),
        meta: { title: '成员管理', requiresAuth: true }
      },
      {
        path: 'rbac/user',
        name: 'AdminRbacUser',
        component: () => import('@/views/rbac/user/index.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
      {
        path: 'rbac/role',
        name: 'AdminRbacRole',
        component: () => import('@/views/rbac/role/index.vue'),
        meta: { title: '角色管理', requiresAuth: true }
      },
      {
        path: 'rbac/menu',
        name: 'AdminRbacMenu',
        component: () => import('@/views/rbac/menu/index.vue'),
        meta: { title: '菜单管理', requiresAuth: true }
      },
      {
        path: 'rbac/dict',
        name: 'AdminRbacDict',
        component: () => import('@/views/rbac/dict/index.vue'),
        meta: { title: '字典管理', requiresAuth: true }
      },
      {
        path: 'rbac/config',
        name: 'AdminRbacConfig',
        component: () => import('@/views/rbac/config/index.vue'),
        meta: { title: '配置管理', requiresAuth: true }
      },
      // {
      //   path: 'announcement',
      //   name: 'AdminAnnouncement',
      //   component: () => import('@/views/announcement/Announcement.vue'),
      //   meta: { title: '公告', requiresAuth: true }
      // },
      // {
      //   path: 'changelog',
      //   name: 'AdminChangelog',
      //   component: () => import('@/views/changelog/Changelog.vue'),
      //   meta: { title: '发布日志', requiresAuth: true }
      // },
      // {
      //   path: 'changelog/detail',
      //   name: 'AdminChangelogDetail',
      //   component: () => import('@/views/changelog/components/ChangelogDetail.vue'),
      //   meta: { title: '发布日志详情', requiresAuth: true, hidden: true }
      // },
      // {
      //   path: 'records',
      //   name: 'AdminRecords',
      //   component: () => import('@/views/records/RecordsManagement.vue'),
      //   meta: { title: '记录管理', requiresAuth: true, icon: 'chart-line' }
      // }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: { title: '个人设置', requiresAuth: true },
    redirect: '/profile/account',
    children: [
      {
        path: 'account',
        name: 'ProfileAccount',
        component: () => import('@/views/profile/Account.vue'),
        meta: { title: '账号设置', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/views/profile/Settings.vue'),
        meta: { title: '偏好设置', requiresAuth: true }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  }
  ,
  // Invite page - public
  {
    path: '/enterprise/invite/:id',
    name: 'Invite',
    component: () => import('@/views/invite/Invite.vue'),
    meta: { title: '邀请加入', requiresAuth: false }
  }
]

/**
 * 静态子路由
 * 这些路由是写死的，不会被动态路由覆盖
 */
const staticChildRoutes = [


  {
    path: '/workspace/filter',
    name: 'WorkspaceFilter',
    component: () => import('@/views/workspace/Filter.vue'),
    meta: {
      title: '筛选器',
      requiresAuth: false,
      icon: 'filter',
      hidden: false
    }
  },
  {
    path: '/workspace/issue',
    name: 'MyIssue',
    component: () => import('@/views/workspace/Issue.vue'),
    meta: {
      title: '我的事项',
      requiresAuth: false,
      icon: 'task',
      hidden: false
    }
  },
  {
    path: '/workspace/my-created',
    name: 'MyCreated',
    component: () => import('@/views/workspace/MyCreated.vue'),
    meta: {
      title: '我的创建',
      requiresAuth: true,
      icon: 'add-circle',
      hidden: false
    }
  },
  {
    path: '/workspace/my-watched',
    name: 'MyWatched',
    component: () => import('@/views/workspace/MyWatched.vue'),
    meta: {
      title: '我的关注',
      requiresAuth: false,
      icon: 'star',
      hidden: false
    }
  },
  {
    path: '/workspace/my-completed',
    name: 'MyCompleted',
    component: () => import('@/views/workspace/MyCompleted.vue'),
    meta: {
      title: '我的完成',
      requiresAuth: false,
      icon: 'check-circle',
      hidden: false
    }
  },
  {
    path: '/workspace/view/my',
    name: 'MyView',
    component: () => import('@/views/workspace/MyView.vue'),
    meta: {
      title: '我的视图',
      requiresAuth: true,
      icon: 'view-list',
      hidden: false
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
  // redirect should point to a concrete child path to avoid redirect loops
  redirect: '/workspace/filter',
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

  // 将动态路由逐个添加到 layoutRoute（name 为 'Layout'） 下
  routes.forEach((route, index) => {

    router.addRoute('Layout', route)  // ⚠️ 使用 Layout 的 name，而不是 path
  })

  // 更新 layoutRoute 的 children 引用（用于其他地方读取完整路由列表）
  layoutRoute.children = [...staticChildRoutes, ...routes]

  router.getRoutes().forEach(r => {
    console.log('  -', r.path, '(name:', r.name, ', parent:', r.parent?.name || '无', ')')
  })

  // 组织相关路由检查已移除
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
const whiteList = ['/', '/login', '/register', '/404']

/**
 * 全局前置守卫
 * 处理登录验证、动态路由加载和权限检查
 */
router.beforeEach(async (to, from, next) => {
  const token = Cookies.get('dcp_token')
  const userStore = useUserStore()

  if (to.path === '/') {
    if (token) {
      next('/workspace')
    } else {
      next('/login')
    }
    return
  }

  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - Cooperise` : 'Cooperise'

  if (token) {
    // 已登录
    if (to.path === '/login') {
      // 如果已登录，访问登录页则跳转到工作区
      next({ path: '/workspace' })
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
          // 如果是直接访问，跳转到工作区
          next('/workspace')
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
 * 注意：页面访问埋点已在 setupTrackingRouter 中处理
 */
router.afterEach(() => {
  // 可以在这里处理一些全局的后置逻辑
  // 例如：关闭 loading、记录访问日志等
  // 页面访问埋点已在 tracking.js 的 setupTrackingRouter 中自动处理
})

export default router
