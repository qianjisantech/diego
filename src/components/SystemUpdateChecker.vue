<template>
  <div class="system-update-checker">
    <!-- 右下角更新通知弹窗 -->
    <transition name="slide-fade">
      <div v-if="showNotification" class="update-notification">
        <div class="notification-header">
          <div class="notification-title">
            <t-icon name="info-circle-filled" size="20px"/>
            <span>系统更新提醒</span>
          </div>
          <t-icon name="close" size="16px" class="close-btn" @click="closeNotification"/>
        </div>

        <div class="notification-body">
          <div class="version-info">
            <div class="version-item">
              <span class="label">当前版本：</span>
              <span class="value current">v{{ updateInfo.current_version }}</span>
            </div>
            <div class="version-arrow">→</div>
            <div class="version-item">
              <span class="label">最新版本：</span>
              <span class="value latest">v{{ updateInfo.latest_version }}</span>
            </div>
          </div>

          <div class="announcement-info" v-if="updateInfo.announcement_title">
            <div class="announcement-title-text">{{ updateInfo.announcement_title }}</div>
            <div class="announcement-content-preview" v-if="updateInfo.announcement_content">
              {{ truncateContent(updateInfo.announcement_content) }}
            </div>
          </div>
        </div>

        <div class="notification-footer">
          <t-button size="small" @click="viewDetails">查看详情</t-button>
          <t-button size="small" theme="primary" @click="refreshNow">立即刷新</t-button>
        </div>
      </div>
    </transition>

    <!-- 功能更新提示对话框 -->
    <t-dialog
        v-model:visible="updateDialogVisible"
        header="功能更新通知"
        width="600px"
        :confirm-btn="{ content: '刷新页面', loading: updating }"
        :cancel-btn="{ content: '稍后查看' }"
        @confirm="handleUpdate"
        @cancel="handleLater"
    >
      <div class="update-content">
        <div class="announcement-title">
          <t-icon name="info-circle" size="20px" style="color: #0052d9; margin-right: 8px;"/>
          {{ updateInfo.announcement_title }}
        </div>
        <div class="announcement-content" v-html="updateInfo.announcement_content"></div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import {MessagePlugin, NotifyPlugin} from 'tdesign-vue-next'
import Cookies from 'js-cookie'
import WebSocketClient from '@/utils/websocket'
import request from '@/utils/request'

// WebSocket 连接状态
const connected = ref(false)

// 更新信息（使用下划线命名，与后端保持一致）
const updateInfo = ref({
  has_update: false,
  current_version: '',
  latest_version: '',
  message: '',
  download_url: '',
  announcement_id: null,
  announcement_title: '',
  announcement_content: ''
})

// 更新对话框可见性
const updateDialogVisible = ref(false)

// 右下角通知可见性
const showNotification = ref(false)

// 更新中状态
const updating = ref(false)

// 定时器
let checkTimer = null

// 已显示过的公告ID集合（避免重复显示）
const shownAnnouncementIds = new Set()

// 临时禁用 WebSocket，防止连接失败
const systemWebSocketDisabled = true

const resolveWsHttpBase = () => {
  if (import.meta.env.VITE_WS_URL) {
    try {
      return new URL(import.meta.env.VITE_WS_URL, window.location.origin).origin
    } catch (error) {
      console.warn('[系统更新检查] 解析 VITE_WS_URL 失败，使用默认地址', error)
    }
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL.startsWith('http')
        ? new URL(import.meta.env.VITE_API_BASE_URL)
        : new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin)
      return apiUrl.origin
    } catch (error) {
      console.warn('[系统更新检查] 解析 VITE_API_BASE_URL 失败，使用当前站点', error)
    }
  }

  return window.location.origin
}

// WebSocket 连接
const connectWebSocket = () => {
  const wsBase = resolveWsHttpBase().replace(/\/$/, '')
  const wsUrl = `${wsBase}/ws`

  // 从 Cookie 获取 token
  const token = Cookies.get('dcp_token')

  if (!token) {
    console.warn('[系统更新检查] 未找到 token，无法建立 WebSocket 连接')
    return
  }

  WebSocketClient.connect(
      wsUrl,
      // 连接成功回调
      () => {
        connected.value = true
        console.log('[系统更新检查] WebSocket 连接成功')

        // 订阅用户特定的更新队列（点对点消息）
        WebSocketClient.subscribe('/user/queue/system/update', handleUpdateMessage)

        // 立即发送一次检查请求
        sendCheckRequest()

        // 启动定时器，每10秒发送一次检查请求
        startCheckTimer()
      },
      // 连接错误回调
      (error) => {
        connected.value = false
        console.warn('[系统更新检查] WebSocket 连接失败（静默处理，不影响使用）', error)
        // 不显示错误提示，避免影响用户体验
        // MessagePlugin.error('系统更新检查服务连接失败')
      },
      // 传递 token
      token
  )
}

// 发送更新检查请求
const sendCheckRequest = () => {
  if (WebSocketClient.isConnected()) {
    WebSocketClient.send('/app/system/check-update', {})
    console.log('[系统更新检查] 发送检查请求')
  }
}

// 启动定时器
const startCheckTimer = () => {
  // 清除已存在的定时器
  if (checkTimer) {
    clearInterval(checkTimer)
  }

  // 每10秒发送一次检查请求
  checkTimer = setInterval(() => {
    sendCheckRequest()
  }, 10000)

  console.log('[系统更新检查] 定时器已启动，每10秒检查一次')
}

// 停止定时器
const stopCheckTimer = () => {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
    console.log('[系统更新检查] 定时器已停止')
  }
}

// 处理更新消息
const handleUpdateMessage = (data) => {
  console.log('[系统更新检查] 收到更新信息', data)

  // WebSocket 返回的是下划线命名，需要使用下划线读取
  const hasUpdate = data.has_update
  const announcementId = data.announcement_id

  console.log('[系统更新检查] hasUpdate 值:', hasUpdate, '类型:', typeof hasUpdate)
  console.log('[系统更新检查] announcementId:', announcementId)
  console.log('[系统更新检查] 已显示的公告ID集合:', Array.from(shownAnnouncementIds))

  updateInfo.value = data

  // 当 has_update 为 false 时，表示用户还未更新，需要显示通知
  // 当 has_update 为 true 时，表示用户已更新，不需要显示通知
  if (hasUpdate) {
    console.log('[系统更新检查] 不满足显示条件:', {
      hasUpdate: hasUpdate,
      announcementId: announcementId,
      alreadyShown: shownAnnouncementIds.has(announcementId)
    })

  } else {
    console.log('[系统更新检查] 准备显示更新通知...')
    showUpdateNotification(data)
    // 标记该公告已显示
    shownAnnouncementIds.add(announcementId)
  }
}

// 显示右下角更新通知
const showUpdateNotification = (data) => {
  console.log('[系统更新检查] showUpdateNotification 被调用，data:', data)
  showNotification.value = true
  console.log('[系统更新检查] 已显示右下角自定义通知')
}

// 关闭通知
const closeNotification = () => {
  showNotification.value = false
  console.log('[系统更新检查] 用户关闭通知')
}

// 查看详情
const viewDetails = () => {
  showNotification.value = false
  updateDialogVisible.value = true
  console.log('[系统更新检查] 用户查看详情')
}

// 立即刷新
const refreshNow = async () => {
  showNotification.value = false
  await handleUpdateDirectly()
}

// 截取内容（最多显示100字符）
const truncateContent = (content) => {
  if (!content) return ''
  // 移除HTML标签和换行符
  const text = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

// 处理直接刷新（从通知栏点击）
const handleUpdateDirectly = async () => {
  if (!updateInfo.value.announcement_id) {
    MessagePlugin.warning('公告信息无效')
    return
  }

  try {
    // 调用后端API标记公告为已读
    const response = await request.post(`/announcement/mark-read/${updateInfo.value.announcement_id}`)

    if (response.success) {
      await MessagePlugin.success('正在刷新页面...')

      // 延迟500毫秒后刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } else {
      await MessagePlugin.error(response.message || '标记已读失败')
    }
  } catch (error) {
    console.error('[系统更新检查] 标记已读失败', error)
    await MessagePlugin.error('操作失败，请稍后重试')
  }
}

// 处理立即更新（从对话框点击刷新页面）
const handleUpdate = async () => {
  if (!updateInfo.value.announcement_id) {
    await MessagePlugin.warning('公告信息无效')
    updateDialogVisible.value = false
    return
  }

  try {
    updating.value = true

    // 调用后端API标记公告为已读
    const response = await request.post(`/announcement/mark-read/${updateInfo.value.announcement_id}`)

    if (response.code === 200) {
      MessagePlugin.success('正在刷新页面...')
      updateDialogVisible.value = false

      // 延迟1秒后刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      await MessagePlugin.error(response.message || '标记已读失败')
      updating.value = false
    }
  } catch (error) {
    console.error('[系统更新检查] 标记已读失败', error)
    await MessagePlugin.error('操作失败，请稍后重试')
    updating.value = false
  }
}

// 处理稍后提醒
const handleLater = () => {
  updateDialogVisible.value = false
}

// 组件挂载
onMounted(() => {
  if (!systemWebSocketDisabled) {
    connectWebSocket()
  }
})

// 组件卸载
onUnmounted(() => {
  stopCheckTimer()
  if (!systemWebSocketDisabled) {
    WebSocketClient.disconnect()
  }
})
</script>

<style scoped lang="scss">
.system-update-checker {
  // 保持组件本身不可见，但子元素可见
  position: relative;
}

// 右下角通知弹窗
.update-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 380px;
  background: var(--tencent-blue-gradient);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 82, 217, 0.25);
  color: white;
  z-index: 9999;
  overflow: hidden;

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);

    .notification-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 600;

      :deep(.t-icon) {
        color: #ffffff;
      }
    }

    .close-btn {
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }

      :deep(.t-icon) {
        color: #ffffff;
      }
    }
  }

  .notification-body {
    padding: 20px;

    .version-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;

      .version-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 12px;
          opacity: 0.8;
        }

        .value {
          font-size: 16px;
          font-weight: 600;

          &.current {
            color: rgba(255, 255, 255, 0.9);
          }

          &.latest {
            color: #fff;
          }
        }
      }

      .version-arrow {
        font-size: 20px;
        opacity: 0.6;
      }
    }

    .announcement-info {
      .announcement-title-text {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .announcement-content-preview {
        font-size: 13px;
        opacity: 0.85;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .notification-footer {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.1);

    :deep(.t-button) {
      flex: 1;

      &.t-button--variant-outline {
        border-color: rgba(255, 255, 255, 0.4);
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.6);
        }
      }

      &.t-button--theme-primary {
        background: white;
        color: #0052d9;
        border: none;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}

// 动画效果
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

.update-content {
  padding: 20px 0;

  .announcement-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e7e7e7;
  }

  .announcement-content {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.8;
    color: #646a73;
    max-height: 400px;
    overflow-y: auto;

    :deep(p) {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 20px;
      margin-bottom: 12px;
    }

    :deep(li) {
      margin-bottom: 8px;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 16px;
      margin-bottom: 8px;
      font-weight: 600;
      color: #1f2329;
    }

    :deep(code) {
      padding: 2px 6px;
      background-color: #e6e6e6;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
    }

    :deep(pre) {
      padding: 12px;
      background-color: #e6e6e6;
      border-radius: 4px;
      overflow-x: auto;
      margin-bottom: 12px;

      code {
        padding: 0;
        background-color: transparent;
      }
    }
  }
}
</style>
