<template>
  <div class="header-container">
    <div class="header-left">
      <AppLogo :clickable="true" />
      <div class="search-wrapper" :class="{ 'search-focused': searchFocused }">
        <t-input
            v-model="searchIssueNumber"
            placeholder="搜索事项单号或者概要"
            clearable
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @input="handleSearchInput"
            @keyup.enter="handleDirectSearch"
            class="search-input"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>


      </div>
    </div>
    <div class="header-right">
      <t-button theme="primary" size="medium" @click="handleCreateIssue" class="create-issue-btn">
        <template #icon>
          <t-icon name="add" />
        </template>
        新建
      </t-button>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useWorkspaceStore } from '@/store/workspace'
import { MessagePlugin } from 'tdesign-vue-next'
import { searchIssues } from '@/api/workspace'

import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()

const searchIssueNumber = ref('')
const searchFocused = ref(false)
const showSearchResults = ref(false)
const searchResults = ref([])
let searchTimeout = null


// 通知数据
const notices = ref([])

// 从环境变量读取通知配置
const loadNoticeFromEnv = () => {
  const title = import.meta.env.VITE_TOP_NOTIFICATION_TITLE
  const type = import.meta.env.VITE_TOP_NOTIFICATION_TYPE
  const link = import.meta.env.VITE_TOP_NOTIFICATION_LINK
  const showUnderline = import.meta.env.VITE_TOP_NOTIFICATION_UNDERLINE

  // 如果配置了通知内容，使用环境变量的值
  if (title) {
    const noticeConfig = {
      id: 'env-notice',
      title: title,
      type: type ? Number(type) : 1, // 默认为信息类型
      link: link && link.trim() ? link.trim() : undefined, // 跳转链接
      showUnderline: showUnderline === 'true' || showUnderline === '1' // 是否显示下划线
    }
    console.log('[Header] 从环境变量加载通知:', noticeConfig)
    notices.value = [noticeConfig]
    return true // 表示已从环境变量加载
  }
  console.log('[Header] 未配置环境变量通知')
  return false // 表示未配置环境变量
}

// WebSocket 连接
let websocket = null
let reconnectTimeout = null
let heartbeatInterval = null

// 组织相关已移除

// 页面标题映射
const pageTitleMap = {
  // 工作台
  '/workspace/issue': '我的事项',
  '/workspace/myview': '我的视图',
  '/workspace/view/my': '我的视图',
  // 权限管理
  '/rbac/user': '用户管理',
  '/rbac/role': '角色管理',
  '/rbac/menu': '菜单管理',
  '/rbac/dict': '字典管理',
  '/rbac/config': '配置管理',
  // 其他一级菜单
  '/announcement': '公告',
  '/feedback': '问题反馈',
  '/changelog': '发布日志',
  '/changelog/detail': '日志详情',
  '/operation-log': '操作日志'
}

// 设置页面标题特殊处理
const getSettingsTitle = (path) => {
  const settingsTitles = {
    '/settings/account': '账号设置',
    '/settings/notification': '通知设置',
    '/settings/privacy': '隐私设置',
    '/settings/system-basic': '基础设置',
    '/settings/system-advanced': '高级设置',
    '/settings/security-password': '密码管理',
    '/settings/security-auth': '双重认证',
    '/settings/security-log': '登录日志'
  }
  return settingsTitles[path] || '设置'
}

const pageTitle = computed(() => {
  // 如果是设置页面，使用特殊处理
  if (route.path.startsWith('/settings')) {
    return getSettingsTitle(route.path)
  }

  // 如果路径在映射表中，直接返回
  if (pageTitleMap[route.path]) {
    return pageTitleMap[route.path]
  }

  // 处理动态路由（如视图详情页）
  if (route.path.startsWith('/workspace')) {
    return '工作台'
  }
  if (route.path.startsWith('/rbac')) {
    return '权限管理'
  }
  if (route.path.startsWith('/changelog')) {
    return '发布日志'
  }

  return '工作台'
})

// 组织相关已移除


// 顶部通知配置：通过环境变量控制
// 方式1：静态配置（推荐）- 在 .env 或 .env.production 中配置：
//   VITE_TOP_NOTIFICATION_TITLE=通知内容文本
//   VITE_TOP_NOTIFICATION_TYPE=1  (1=信息/蓝色, 2=警告/橙色, 3=错误/红色, 4=成功/绿色)
//   VITE_TOP_NOTIFICATION_LINK=https://example.com  (可选，点击通知跳转的链接)
//
// 方式2：动态 WebSocket（如果未配置静态通知）- 在 .env 中配置：
//   VITE_ENABLE_TOP_NOTIFICATION=true
const webSocketTemporarilyDisabled = import.meta.env.VITE_ENABLE_TOP_NOTIFICATION !== 'true'

// 初始化WebSocket连接
const initWebSocket = () => {
  // 获取WebSocket协议（根据当前页面协议）
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  // 解析 API 基础地址，优先使用环境变量，否则使用当前站点
  let host = window.location.host
  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http')) {
    try {
      const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL)
      host = apiUrl.host
    } catch (error) {
      console.warn('[WebSocket] 解析 API 基础地址失败，使用当前站点 host', error)
    }
  }

  const wsUrl = `${protocol}//${host}/ws/top-notification`

  console.log('[WebSocket] 尝试连接:', wsUrl)

  try {
    websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log('[WebSocket] 连接成功')
      // 启动心跳
      startHeartbeat()
    }

    websocket.onmessage = (event) => {
      console.log('[WebSocket] 收到消息:', event.data)
      try {
        const notification = JSON.parse(event.data)
        if (notification && notification.id) {
          // 更新通知数组
          notices.value = [notification]
        } else {
          // 没有已发布的通知
          notices.value = []
        }
      } catch (error) {
        console.error('[WebSocket] 解析消息失败:', error)
      }
    }

    websocket.onerror = (error) => {
      console.error('[WebSocket] 连接错误:', error)
    }

    websocket.onclose = () => {
      console.log('[WebSocket] 连接关闭')
      stopHeartbeat()
      // 5秒后尝试重连
      reconnectTimeout = setTimeout(() => {
        console.log('[WebSocket] 尝试重连...')
        initWebSocket()
      }, 5000)
    }
  } catch (error) {
    console.error('[WebSocket] 创建连接失败:', error)
  }
}

// 启动心跳
const startHeartbeat = () => {
  heartbeatInterval = setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send('ping')
    }
  }, 30000) // 每30秒发送一次心跳
}

// 停止心跳
const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

// 关闭WebSocket连接
const closeWebSocket = () => {
  stopHeartbeat()
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (websocket) {
    websocket.close()
    websocket = null
  }
}



// 组件挂载时初始化通知和组织列表
onMounted(() => {
  // 优先从环境变量加载通知
  const loadedFromEnv = loadNoticeFromEnv()
  
  // 如果环境变量没有配置通知，且 WebSocket 功能未禁用，则尝试 WebSocket
  if (!loadedFromEnv && !webSocketTemporarilyDisabled) {
    initWebSocket()
  }

})

// 组件卸载时关闭WebSocket
onBeforeUnmount(() => {
  if (!webSocketTemporarilyDisabled) {
    closeWebSocket()
  }
})


// 处理新建事项
const handleCreateIssue = async () => {
  console.log('[Header.vue] handleCreateIssue called')
  // 先跳转到我的事项页面
  await router.push('/workspace/issue')
  console.log('[Header.vue] route navigation completed')
  // 等待路由导航完成后，延迟触发对话框
  setTimeout(() => {
    console.log('[Header.vue] triggering create issue dialog')
    workspaceStore.triggerCreateIssue()
    console.log('[Header.vue] showCreateIssueDialog:', workspaceStore.showCreateIssueDialog)
  }, 100)
}

// 搜索框获取焦点
const handleSearchFocus = () => {
  searchFocused.value = true
  if (searchIssueNumber.value.trim()) {
    showSearchResults.value = true
  }
}

// 搜索框失去焦点
const handleSearchBlur = () => {
  searchFocused.value = false
  // 延迟隐藏，让点击事件能够触发
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

// 输入内容变化时自动搜索
const handleSearchInput = () => {
  // 清除之前的定时器
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  const keyword = searchIssueNumber.value.trim()

  if (!keyword) {
    showSearchResults.value = false
    searchResults.value = []
    return
  }

  // 防抖：输入停止300ms后才开始搜索
  searchTimeout = setTimeout(async () => {
    try {
      const res = await searchIssues(keyword)
      if (res.success || res.code === 200) {
        searchResults.value = res.data || []
        showSearchResults.value = true
      }
    } catch (error) {
      console.error('搜索事项失败:', error)
    }
  }, 300)
}

// 选择搜索结果
const handleSelectIssue = (issue) => {
  // 跳转到事项详情页
  router.push(`/workspace/issue/${issue.id}`)
  // 清空搜索框和结果
  searchIssueNumber.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

// 直接搜索（回车键）
const handleDirectSearch = async () => {
  if (!searchIssueNumber.value.trim()) {
    await MessagePlugin.warning('请输入搜索内容')
    return
  }

  // 如果有搜索结果，跳转到第一个
  if (searchResults.value.length > 0) {
    handleSelectIssue(searchResults.value[0])
    return
  }

  // 否则跳转到工作台并搜索
  workspaceStore.setSearchIssueNumber(searchIssueNumber.value)
  if (route.path !== '/workspace/issue') {
    router.push('/workspace/issue')
  }
  showSearchResults.value = false
}

// 获取优先级主题色
const getPriorityTheme = (priority) => {
  const themeMap = {
    '高': 'danger',
    'high': 'danger',
    '中': 'warning',
    'medium': 'warning',
    '低': 'success',
    'low': 'success'
  }
  return themeMap[priority] || 'default'
}

// 处理通知点击
const handleNoticeClick = (notice) => {
  if (notice.link) {
    // 如果有链接，判断是内部路由还是外部链接
    if (notice.link.startsWith('http://') || notice.link.startsWith('https://')) {
      // 外部链接，新窗口打开
      window.open(notice.link, '_blank')
    } else {
      // 内部路由
      router.push(notice.link)
    }
  }
}

// 获取通知类型对应的CSS类名
const getNoticeTypeClass = (type) => {
  const typeClassMap = {
    1: 'notice-type-info',     // 信息 - 蓝色
    2: 'notice-type-warning',  // 警告 - 橙色
    3: 'notice-type-error',    // 错误 - 红色
    4: 'notice-type-success'   // 成功 - 绿色
  }
  return typeClassMap[type] || 'notice-type-info'
}
</script>

<style scoped lang="scss">
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height:55px;
  min-height: 55px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .header-left {
    display: flex;
    align-items: center;

    :deep(.app-logo) {
      padding-right: 24px;
      border-right: 1px solid rgba(0, 0, 0, 0.06);
      .space-switch-select {
        min-width: 160px;
      }
    }
    
    .left-create-btn {
      margin-left: 12px;
    }


  }


  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .create-issue-btn {
      margin-right: 100px;
    }

    .search-wrapper {
      width: 200px;
      transition: all 0.3s ease;
      position: relative;

      &.search-focused {
        width: 300px;

      }

      .search-input {
        transition: all 0.3s ease;
      }

    }
  }
}



</style>

