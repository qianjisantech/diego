import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventBus } from '@/utils/eventBus.js'
import Cookies from 'js-cookie'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api/auth'
import { generateRoutes, menusToSidebar, getDefaultHomePage } from '@/utils/routerHelper'
import { useWorkspaceStore } from './workspace'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(Cookies.get('dcp_token') || '')
  const menuPermissions = ref([])
  const dataPermissions = ref(null)
  const userCompanies = ref([])
  const selectedCompanyId = ref('')
  const roles = ref([]) // 用户角色
  const permissionsLoaded = ref(false) // 权限是否已加载
  const permissionsLoading = ref(false) // 权限是否正在加载中

  // 动态路由相关状态
  const menus = ref([])
  const routes = ref([])
  const sidebarMenus = ref([])
  const routesLoaded = ref(false) // 路由是否已加载

  const login = async (credentials) => {
    try {
      const res = await loginApi(credentials)
      if (res.success) {
        token.value = res.data.token
        userInfo.value = res.data.user_info

        // 保存 cookie
        const expires = credentials.remember ? 7 : 1
        Cookies.set('dcp_token', res.data.token, { expires })

        return res
      } else {
        throw new Error(res.message || '登录失败')
      }
    } catch (error) {
      throw error
    }
  }


  // 获取用户信息和菜单（用于动态路由）
  // promise to dedupe concurrent fetchUserInfo calls
  let fetchUserInfoPromise = null

  const fetchUserInfo = async () => {
    // if a fetch is already in-flight, return the same promise
    if (fetchUserInfoPromise) {
      return fetchUserInfoPromise
    }
    fetchUserInfoPromise = (async () => {
    try {
      // use getUserInfo to fetch profile and related permission/menu data
      const res = await getUserInfoApi()
      if (res && (res.success )) {
        const data = res.data || res

        // 保存用户信息（保留所有字段，包括 user_code）
        userInfo.value = data.userInfo || data.user_info || {
          id: data.user_info?.id,
          username: data.user_info?.username,
          name: data.user_info?.name,
          nickname: data.user_info?.nickname,
          email: data.user_info?.email,
          avatar: data.user_info?.avatar,
          phone: data.user_info?.phone,
          userCode: data.user_info?.user_code
        }

        // 保存菜单
        menus.value = data.menus || []

        // 保存权限
        menuPermissions.value = data.menuPermissions || data.menu_permissions || []

        // 保存角色
        roles.value = data.roles || []

        // 保存组织（兼容 profile 返回的 companies 字段）
        userCompanies.value = data.companies  || []
        // 如果后端返回组织列表并且未设置 selectedCompanyId，直接从 companies 字段中查找默认企业
        if ((!selectedCompanyId.value || selectedCompanyId.value === '') && Array.isArray(userCompanies.value) && userCompanies.value.length > 0) {
          const defaultCompany = userCompanies.value.find(c => c.is_default || c.isDefault) || userCompanies.value[0]
          if (defaultCompany?.id) {
              selectedCompanyId.value = String(defaultCompany.id)
              try { eventBus.emit('company:changed', selectedCompanyId.value) } catch (e) {}
          }
        }

        // 生成路由配置
        routes.value = generateRoutes(menus.value)

        // 生成侧边栏菜单
        sidebarMenus.value = menusToSidebar(menus.value)

        // 标记权限已加载
        permissionsLoaded.value = true

        return data
      } else {
        throw new Error(res.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    } finally {
      // clear in-flight promise so subsequent calls will refetch if needed
      fetchUserInfoPromise = null
    }
    })()
    return fetchUserInfoPromise
  }

  // 兼容老代码：提供 getPermissions 方法（用于路由守卫中调用）
  const getPermissions = async () => {
    if (permissionsLoaded.value) {
      return {
        menus: menus.value,
        menuPermissions: menuPermissions.value,
        routes: routes.value
      }
    }
    if (permissionsLoading.value) {
      // 如果正在加载，等待短暂轮询直到加载完成或超时
      return new Promise((resolve, reject) => {
        const start = Date.now()
        const interval = setInterval(() => {
          if (permissionsLoaded.value) {
            clearInterval(interval)
            resolve({
              menus: menus.value,
              menuPermissions: menuPermissions.value,
              routes: routes.value
            })
          } else if (Date.now() - start > 5000) {
            clearInterval(interval)
            reject(new Error('获取权限超时'))
          }
        }, 100)
      })
    }

    try {
      permissionsLoading.value = true
      const data = await fetchUserInfo()
      permissionsLoading.value = false
      permissionsLoaded.value = true
      return {
        menus: menus.value,
        menuPermissions: menuPermissions.value,
        routes: routes.value,
        raw: data
      }
    } catch (error) {
      permissionsLoading.value = false
      throw error
    }
  }

  // 设置路由加载状态
  const setRoutesLoaded = (loaded) => {
    routesLoaded.value = loaded
  }

  const setSelectedCompany = (id) => {
    if (!id) return
    selectedCompanyId.value = String(id)
    try {
      eventBus.emit('company:changed', selectedCompanyId.value)
    } catch (e) {}
    try { localStorage.setItem('activeCompanyId', String(selectedCompanyId.value)) } catch (e) {}
    // log whenever selected company changes
    // eslint-disable-next-line no-console
    console.log('selectedCompanyId.value:', selectedCompanyId.value)
    console.log('userStore.selectedCompanyId:', userStore.selectedCompanyId)
    // expose to global for debug/externals
    try { window.__selectedCompanyId = selectedCompanyId.value } catch (e) {}
  }

  const logout = async () => {
    try {
      // 调用后端退出接口
      await logoutApi()
    } catch (error) {
      console.error('调用退出接口失败:', error)
      // 即使后端接口调用失败，也要清除前端的信息
    } finally {
      // 清除前端存储的所有用户信息
      token.value = ''
      userInfo.value = null
      menuPermissions.value = []
      dataPermissions.value = null
      userCompanies.value = []
      roles.value = []
      permissionsLoaded.value = false // 重置权限加载状态
      permissionsLoading.value = false // 重置权限加载中状态

      // 清除动态路由相关状态
      menus.value = []
      routes.value = []
      sidebarMenus.value = []
      routesLoaded.value = false

      Cookies.remove('dcp_token')

      // 清除其他 store 的数据
      const workspaceStore = useWorkspaceStore()
      workspaceStore.setIssueCount(0)
      workspaceStore.setSearchIssueNumber('')
    }
  }

  // 检查是否有某个菜单权限
  const hasMenuPermission = (permission) => {
    return menuPermissions.value.includes(permission)
  }

  // 检查是否有某个组织的权限
  const hasCompanyPermission = (companyId, permission) => {
    const company = userCompanies.value.find(s => s.id === spaceId)
    return company ? company.permissions.includes(permission) : false
  }

  // 默认首页路径（固定为首页）
  const defaultHomePage = computed(() => {
    return '/workspace'
  })

  return {
    // 状态
    userInfo,
    token,
    menuPermissions,
    dataPermissions,
    userCompanies,
    roles,
    permissionsLoaded,
    permissionsLoading,

    // 动态路由相关状态
    menus,
    routes,
    sidebarMenus,
    routesLoaded,
    selectedCompanyId,
    setSelectedCompany,

    // 计算属性
    defaultHomePage,

    // 方法
    login,
    fetchUserInfo,
    getPermissions,
    setRoutesLoaded,
    logout,
    hasMenuPermission,
    hasCompanyPermission
  }
})
