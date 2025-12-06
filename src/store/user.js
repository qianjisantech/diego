import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { login as loginApi, getPermissions as getPermissionsApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import { generateRoutes, menusToSidebar, getDefaultHomePage } from '@/utils/routerHelper'
import { useWorkspaceStore } from './workspace'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(Cookies.get('dcp_token') || '')
  const menuPermissions = ref([])
  const dataPermissions = ref(null)
  const userSpaces = ref([])
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

  const getPermissions = async () => {
    // 如果权限已经加载或正在加载中，直接返回
    if (permissionsLoaded.value || permissionsLoading.value) {
      return
    }

    permissionsLoading.value = true

    try {
      const res = await getPermissionsApi()
      if (res.success) {
        // 更新用户基本信息（非常重要！兼容驼峰和下划线命名）
        if (res.data.userInfo || res.data.user_info) {
          userInfo.value = res.data.userInfo || res.data.user_info
        }
        // 更新权限信息（兼容驼峰和下划线命名）
        menuPermissions.value = res.data.menuPermissions || res.data.menu_permissions || []
        dataPermissions.value = res.data.dataPermissions || res.data.data_permissions || null
        userSpaces.value = res.data.spaces || []
        permissionsLoaded.value = true // 标记权限已加载
        return res
      } else {
        throw new Error(res.message || '获取权限失败')
      }
    } catch (error) {
      // 即使加载失败，也标记为已完成，避免一直卡在加载状态
      permissionsLoaded.value = true
      throw error
    } finally {
      permissionsLoading.value = false
    }
  }

  // 获取用户信息和菜单（用于动态路由）
  const fetchUserInfo = async () => {
    try {
      // 使用现有的 getPermissionsApi，它调用 /auth/profile 接口
      const res = await getPermissionsApi()
      if (res.success || res.code === 200) {
        const data = res.data

        // 保存用户信息（保留所有字段，包括 user_code）
        userInfo.value = data.userInfo || data.user_info || {
          id: data.user_info?.id,
          username: data.user_info?.username,
          name: data.user_info?.name,
          nickname: data.user_info?.nickname,
          email: data.user_info?.email,
          avatar: data.user_info?.avatar,
          phone: data.user_info?.phone,
          user_code: data.user_info?.user_code,
          userCode: data.user_info?.user_code
        }

        // 保存菜单
        menus.value = data.menus || []

        // 保存权限
        menuPermissions.value = data.menuPermissions || data.menu_permissions || []

        // 保存角色
        roles.value = data.roles || []

        // 保存组织
        userSpaces.value = data.spaces || []

        // 生成路由配置
        routes.value = generateRoutes(menus.value)

        // 生成侧边栏菜单
        sidebarMenus.value = menusToSidebar(menus.value)

        // 标记权限已加载
        permissionsLoaded.value = true

        console.log('[fetchUserInfo] 菜单数据:', menus.value)
        console.log('[fetchUserInfo] 生成的路由:', routes.value)

        return data
      } else {
        throw new Error(res.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 设置路由加载状态
  const setRoutesLoaded = (loaded) => {
    routesLoaded.value = loaded
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
      userSpaces.value = []
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
  const hasSpacePermission = (spaceId, permission) => {
    const space = userSpaces.value.find(s => s.id === spaceId)
    return space ? space.permissions.includes(permission) : false
  }

  // 默认首页路径（固定为首页）
  const defaultHomePage = computed(() => {
    return '/home'
  })

  return {
    // 状态
    userInfo,
    token,
    menuPermissions,
    dataPermissions,
    userSpaces,
    roles,
    permissionsLoaded,
    permissionsLoading,

    // 动态路由相关状态
    menus,
    routes,
    sidebarMenus,
    routesLoaded,

    // 计算属性
    defaultHomePage,

    // 方法
    login,
    getPermissions,
    fetchUserInfo,
    setRoutesLoaded,
    logout,
    hasMenuPermission,
    hasSpacePermission
  }
})
