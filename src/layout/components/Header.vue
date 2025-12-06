<template>
  <div class="header-container">
    <div class="header-left">
      <AppLogo :clickable="true" />
      <template v-if="isSpaceSettings">
        <t-select
          v-model="currentSpaceId"
          :options="spaceOptions"
          size="medium"
          placeholder="选择组织"
          class="space-switch-select"
        />
      </template>
      <h2 v-else class="page-title">{{ pageTitle }}</h2>
    </div>

    <!-- 滚动通知 -->
    <div v-if="notices.length > 0" class="notice-wrapper" :class="getNoticeTypeClass(notices[0].type)">
      <t-icon name="notification" size="18px" class="notice-icon" />
      <div class="notice-scroll">
        <div class="notice-content">
          <span
            v-for="(notice, index) in notices"
            :key="index"
            class="notice-item"
            :class="{ 'notice-clickable': notice.showUnderline || notice.link }"
            @click="notice.link ? handleNoticeClick(notice) : null"
          >
            {{ notice.title }}
          </span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <t-button theme="primary" size="medium" @click="handleCreateIssue" class="create-issue-btn">
        <template #icon>
          <t-icon name="add" />
        </template>
        新建
      </t-button>

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

        <!-- 搜索结果下拉框 -->
        <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="search-result-item"
            @mousedown="handleSelectIssue(item)"
          >
            <div class="issue-info">
              <span class="issue-no">{{ item.issueNo }}</span>
              <span class="issue-summary">{{ item.summary }}</span>
            </div>
            <t-tag v-if="item.priority" size="small" :theme="getPriorityTheme(item.priority)">
              {{ item.priority }}
            </t-tag>
          </div>
        </div>

        <!-- 无结果提示 -->
        <div v-if="showSearchResults && searchResults.length === 0 && searchIssueNumber" class="search-no-result">
          <t-icon name="search" size="20px" />
          <span>未找到相关事项</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useWorkspaceStore } from '@/store/workspace'
import { MessagePlugin } from 'tdesign-vue-next'
import { getBannerNotifications } from '@/api/notification'
import { searchIssues } from '@/api/workspace'
import tracking from '@/utils/tracking'
import AppLogo from '@/components/AppLogo.vue'
import { getSpaceList } from '@/api/space'

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

// 当前是否为组织设置页面
const isSpaceSettings = computed(() => route.path === '/space/settings')

// 组织列表（来自 /space/list 接口）
const spaces = ref([])

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
  '/space': '组织',
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
  // 组织设置页面不显示固定标题，改为组织下拉框
  if (isSpaceSettings.value) {
    return ''
  }
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

// 组织下拉：组织列表（来自接口数据）
const spaceOptions = computed(() => {
  const list = spaces.value || []
  return list.map(space => ({
    label: space.name,
    value: String(space.id)
  }))
})

// 当前选择的组织 ID（字符串形式，方便和下拉绑定）
const currentSpaceId = computed({
  get() {
    const idFromQuery = route.query.spaceId || route.query.id
    const idFromParam = route.params.spaceId || route.params.id
    const id = idFromQuery || idFromParam
    if (id) return String(id)

    // 如果路由上没有组织ID，fallback 到第一个组织
    const list = spaces.value || []
    return list.length > 0 ? String(list[0].id) : ''
  },
  set(val) {
    if (!val) return
    router.push({
      path: '/space/settings',
      query: {
        spaceId: val
      }
    })
  }
})


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

// 加载组织列表
const loadSpaces = async () => {
  try {
    const res = await getSpaceList()
    if (res.success || res.code === 200) {
      spaces.value = res.data || []

      // 如果当前在组织设置页且路由上没有 spaceId，则默认跳到第一个组织
      if (isSpaceSettings.value && !route.query.spaceId && spaces.value.length > 0) {
        router.replace({
          path: '/space/settings',
          query: { spaceId: spaces.value[0].id }
        })
      }
    }
  } catch (error) {
    console.error('[Header] 加载组织列表失败:', error)
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
  
  loadSpaces()
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
  height: 64px;
  min-height: 64px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;

    :deep(.app-logo) {
      padding-right: 24px;
      border-right: 1px solid rgba(0, 0, 0, 0.06);
      .space-switch-select {
        min-width: 200px;
      }
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      letter-spacing: -0.01em;
    }
  }

  .notice-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 4px;
    padding: 6px 12px;
    width: 507px;
    overflow: hidden;
    margin-left: auto;
    margin-right: auto;

    .notice-icon {
      flex-shrink: 0;
    }

    .notice-scroll {
      flex: 1;
      overflow: hidden;
      position: relative;
      height: 20px;

      .notice-content {
        display: flex;
        white-space: nowrap;
        animation: scrollNotice 30s linear infinite;

        .notice-item {
          font-size: 13px;
          margin-right: 80px;
          display: inline-block;

          &.notice-clickable {
            cursor: pointer;
            text-decoration: underline;
            text-decoration-style: dotted;
          }
        }
      }

      &:hover .notice-content {
        animation-play-state: paused;
      }
    }

    // 信息类型 - 蓝色
    &.notice-type-info {
      background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
      border: 1px solid #c5d8ff;

      .notice-icon {
        color: #0052d9;
      }

      .notice-item {
        color: #0052d9;

        &.notice-clickable:hover {
          color: #003ba8;
        }
      }
    }

    // 警告类型 - 橙色
    &.notice-type-warning {
      background: linear-gradient(135deg, #fff7e6 0%, #fff1d9 100%);
      border: 1px solid #ffd591;

      .notice-icon {
        color: #fa8c16;
      }

      .notice-item {
        color: #d46b08;

        &.notice-clickable:hover {
          color: #ad4e00;
        }
      }
    }

    // 错误类型 - 红色
    &.notice-type-error {
      background: linear-gradient(135deg, #fff1f0 0%, #ffe7e6 100%);
      border: 1px solid #ffccc7;

      .notice-icon {
        color: #f5222d;
      }

      .notice-item {
        color: #cf1322;

        &.notice-clickable:hover {
          color: #a8071a;
        }
      }
    }

    // 成功类型 - 绿色
    &.notice-type-success {
      background: linear-gradient(135deg, #f6ffed 0%, #e7f7e0 100%);
      border: 1px solid #b7eb8f;

      .notice-icon {
        color: #52c41a;
      }

      .notice-item {
        color: #389e0d;

        &.notice-clickable:hover {
          color: #237804;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .create-issue-btn {
      flex-shrink: 0;
    }

    .search-wrapper {
      width: 200px;
      transition: all 0.3s ease;
      position: relative;

      &.search-focused {
        width: 300px;

        .search-input {
          border-color: #0052d9;
        }
      }

      .search-input {
        transition: all 0.3s ease;
      }

      .search-results {
        position: absolute;
        top: 44px;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;

        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: var(--color-bg-secondary);
          }

          .issue-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 0;

            .issue-no {
              font-size: 13px;
              font-weight: 500;
              color: #0052d9;
            }

            .issue-summary {
              font-size: 12px;
              color: #646a73;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .search-no-result {
        position: absolute;
        top: 44px;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #909399;
        z-index: 1000;

        .t-icon {
          color: #c0c4cc;
        }

        span {
          font-size: 13px;
        }
      }
    }
  }
}

:deep(.t-dropdown__menu) {
  padding: 4px 0;

  .t-dropdown__item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    font-size: 14px;
    color: var(--color-text-primary);
    text-align: center;
    border-radius: 8px;
    margin: 2px 4px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }
  }
}

// 通知滚动动画
@keyframes scrollNotice {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

// ========== 响应式适配 ==========

// 大屏幕 (1440px 以上) - 默认样式

// 中等屏幕 (1024px - 1440px)
@media (max-width: 1440px) {
  .header-container {
    .notice-wrapper {
      width: 400px;
      margin-right: auto;
    }

    .header-left {
      gap: 16px;

      :deep(.app-logo) {
        padding-right: 16px;

        .logo-text {
          font-size: 16px;
        }
      }

      .page-title {
        font-size: 16px;
      }
    }
  }
}

// 平板屏幕 (768px - 1024px)
@media (max-width: 1024px) {
  .header-container {
    padding: 0 16px;

    .notice-wrapper {
      display: none; // 隐藏通知栏
    }

    .header-left {
      gap: 12px;

      :deep(.app-logo) {
        .logo-text {
          display: none; // 隐藏Logo文字，只保留图标
        }
      }
    }

    .header-right {
      gap: 8px;

      .search-wrapper {
        width: 160px;

        &.search-focused {
          width: 220px;
        }
      }

    }
  }
}

// 手机屏幕 (480px - 768px)
@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;
    height: 56px;
    min-height: 56px;

    .header-left {
      gap: 8px;

      :deep(.app-logo) {
        padding-right: 12px;
        border-right: none;

        svg {
          width: 24px;
          height: 24px;
        }
      }

      .page-title {
        font-size: 14px;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .header-right {
      gap: 6px;

      .create-issue-btn {
        :deep(.t-button__text) {
          display: none; // 只显示图标
        }
      }

      .search-wrapper {
        width: 120px;

        &.search-focused {
          width: 180px;
        }

        .search-results,
        .search-no-result {
          right: -60px;
          left: auto;
          min-width: 280px;
        }
      }
    }
  }
}

// 小屏手机 (480px 以下)
@media (max-width: 480px) {
  .header-container {
    padding: 0 8px;

    .header-left {
      min-width: 0;
      flex-shrink: 1;

      .page-title {
        font-size: 13px;
        max-width: 80px;
      }
    }

    .header-right {
      .search-wrapper {
        width: 100px;

        &.search-focused {
          position: fixed;
          left: 0;
          right: 0;
          top: 56px;
          width: 100%;
          padding: 12px;
          background: #fff;
          z-index: 1001;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .search-results,
        .search-no-result {
          top: 56px;
          right: 0;
          left: 0;
          max-width: 100%;
        }
      }

    }
  }
}
</style>
