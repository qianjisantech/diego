<template>
  <transition name="slide-fade">
    <div v-if="visible" class="update-notification">
      <div class="notification-header">
        <div class="header-left">
          <t-icon name="notification-filled" size="24px" class="notification-icon" />
          <span class="notification-title">系统更新提醒</span>
        </div>
        <t-icon
          name="close"
          size="20px"
          class="close-icon"
          @click="handleClose"
        />
      </div>

      <div class="notification-content">
        <h4>{{ updateInfo.title }}</h4>
        <p class="version">版本: {{ updateInfo.version }}</p>
        <div class="update-desc">
          <p>{{ updateInfo.description }}</p>
          <ul v-if="updateInfo.features && updateInfo.features.length > 0">
            <li v-for="(feature, index) in updateInfo.features" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>

      <div class="notification-footer">
        <t-button
          theme="default"
          variant="outline"
          size="small"
          @click="handleLater"
        >
          稍后提醒
        </t-button>
        <t-button
          theme="primary"
          size="small"
          @click="handleUpdate"
        >
          立即更新
        </t-button>
      </div>

      <!-- 进度条 -->
      <div v-if="showProgress" class="update-progress">
        <div class="progress-info">
          <span>正在更新...</span>
          <span>{{ progress }}%</span>
        </div>
        <t-progress
          :percentage="progress"
          :theme="progress === 100 ? 'success' : 'primary'"
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { checkSystemUpdate } from '@/api/notification'

const visible = ref(false)
const showProgress = ref(false)
const progress = ref(0)

// 更新信息
const updateInfo = ref({
  title: '',
  version: '',
  description: '',
  features: [],
  hasUpdate: false,
  forceUpdate: false
})

// 检查是否需要显示更新提示
const checkUpdate = async () => {
  try {
    const res = await checkSystemUpdate()
    if (res.success && res.data.hasUpdate) {
      // 更新信息赋值
      updateInfo.value = {
        title: res.data.title,
        version: res.data.version,
        description: res.data.description,
        features: res.data.features || [],
        hasUpdate: res.data.hasUpdate,
        forceUpdate: res.data.forceUpdate || false
      }

      // 检查本地存储，判断是否已经提示过这个版本
      const dismissedVersion = localStorage.getItem('dismissedUpdateVersion')
      const currentVersion = updateInfo.value.version

      // 如果是强制更新，或者用户还没有忽略这个版本，则显示提示
      if (updateInfo.value.forceUpdate || dismissedVersion !== currentVersion) {
        // 延迟3秒显示，让用户先看到主界面
        setTimeout(() => {
          visible.value = true
        }, 3000)
      }
    }
  } catch (error) {
    console.error('检查更新失败:', error)
  }
}

// 立即更新
const handleUpdate = () => {
  showProgress.value = true

  // 模拟更新进度
  const interval = setInterval(() => {
    progress.value += 10

    if (progress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        MessagePlugin.success('更新完成！页面即将刷新...')
        setTimeout(() => {
          // 刷新页面
          window.location.reload()
        }, 1500)
      }, 500)
    }
  }, 300)
}

// 稍后提醒
const handleLater = () => {
  visible.value = false
  MessagePlugin.info('将在下次启动时提醒您')
}

// 关闭弹窗
const handleClose = () => {
  // 记录用户已忽略此版本
  localStorage.setItem('dismissedUpdateVersion', updateInfo.value.version)
  visible.value = false
  MessagePlugin.info('已忽略此次更新提醒')
}

// 手动触发显示（用于测试）
const show = (info) => {
  if (info) {
    updateInfo.value = { ...updateInfo.value, ...info }
  }
  visible.value = true
}

// 手动触发隐藏
const hide = () => {
  visible.value = false
}

// 监听全局事件
const handleGlobalEvent = (event) => {
  if (event.detail) {
    show(event.detail)
  }
}

// 组件挂载时检查更新并添加事件监听
onMounted(() => {
  checkUpdate()

  // 监听全局更新通知事件
  window.addEventListener('show-update-notification', handleGlobalEvent)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('show-update-notification', handleGlobalEvent)
})

// 暴露方法供外部调用
defineExpose({
  show,
  hide
})
</script>

<style scoped lang="scss">
.update-notification {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 380px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;

  .notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--tencent-blue-gradient);
    color: #fff;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .notification-icon {
        animation: ring 2s ease-in-out infinite;
      }

      .notification-title {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .close-icon {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.2);
      }
    }
  }

  .notification-content {
    padding: 20px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      margin: 0 0 8px 0;
    }

    .version {
      font-size: 13px;
      color: #0052d9;
      margin: 0 0 12px 0;
      font-weight: 500;
    }

    .update-desc {
      font-size: 14px;
      color: #646a73;
      line-height: 1.6;

      p {
        margin: 0 0 12px 0;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 8px;
          position: relative;

          &::marker {
            color: #0052d9;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .notification-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 0 20px 20px 20px;
  }

  .update-progress {
    padding: 0 20px 20px 20px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: #646a73;
    }
  }
}

// 动画
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// 铃铛摇晃动画
@keyframes ring {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-10deg);
  }
  20%, 40% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(0deg);
  }
}
</style>
