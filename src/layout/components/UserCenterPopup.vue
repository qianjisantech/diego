<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="popup-overlay" @click="handleClickOverlay">
        <div class="user-center-popup-wrapper" @click.stop>
          <div class="user-center-popup">
            <!-- 左侧主菜单 -->
            <div class="popup-main">
              <!-- 企业部分 -->
              <div class="enterprise-section">
                <div class="section-title">企业</div>
                <div
                  v-for="space in spaceList"
                  :key="space.id"
                  class="enterprise-item"
                  :class="{ 'is-active': activeSpaceId === String(space.id) }"
                  @click="handleEnterpriseClick(space)"
                >
                  <div class="enterprise-icon">
                    <t-icon v-if="space.icon" :name="space.icon" size="20px" />
                    <div v-else class="default-icon">{{ space.name?.charAt(0) || '企' }}</div>
                  </div>
                  <span class="enterprise-name">{{ space.name }}</span>
                  <t-icon v-if="activeSpaceId === String(space.id)" name="check" size="16px" class="check-icon" />
                </div>
                <div class="enterprise-item add-enterprise" @click="handleAddEnterprise">
                  <t-icon name="add" size="20px" />
                  <span>新建企业</span>
                </div>
              </div>

              <!-- 底部操作 -->
              <div class="popup-footer">
                <div class="footer-item" @click="handleAccountSettings">
                  <t-icon name="user-setting" size="16px" />
                  <span>账号设置</span>
                </div>
                <div class="footer-item" @click="handlePreferenceSettings">
                  <t-icon name="setting" size="16px" />
                  <span>偏好设置</span>
                </div>
                <div v-if="isAdmin" class="footer-item admin-backend-item" @click="handleAdminBackendFromFooter">
                  <t-icon name="control-platform" size="16px" />
                  <span>管理员后台</span>
                </div>
                <div class="footer-item" @click="handleLogout">
                  <t-icon name="logout" size="16px" />
                  <span>退出登录</span>
                </div>
              </div>
            </div>

            <!-- 右侧二级菜单 -->
            <transition name="slide-right">
              <div v-if="showSecondaryMenu" class="popup-secondary">
                <div class="secondary-content">
                  <div class="secondary-item" @click="handleContacts">
                    <t-icon name="usergroup" size="16px" />
                    <span>通讯录</span>
                  </div>
                  <div class="secondary-item" @click="handleAdminBackend">
                    <t-icon name="setting" size="16px" />
                    <span>管理后台</span>
                  </div>
                  <div class="secondary-item" @click="handleInviteMembers">
                    <t-icon name="user-add" size="16px" />
                    <span>邀请成员</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { MessagePlugin } from 'tdesign-vue-next'
import { getSpaceList } from '@/api/space'
import tracking from '@/utils/tracking'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const username = computed(() => userStore.userInfo?.username || 'Admin')
const userInitial = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

// 判断是否为管理员（根据接口返回的 user_info.user_code）
const isAdmin = computed(() => {
  const userInfo = userStore.userInfo
  if (!userInfo) return false
  
  // 根据接口返回的数据结构，user_code 字段在下划线格式中
  const userCode = userInfo.user_code || userInfo.userCode
  return userCode === 'admin'
})

// Mock头像地址
const userAvatar = computed(() => {
  if (userStore.userInfo?.avatar) {
    return userStore.userInfo.avatar
  }
  const seed = username.value || 'user'
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
})

// 企业列表
const spaceList = ref([])
const activeSpaceId = ref('')
const currentEnterprise = ref(null)
const showSecondaryMenu = ref(false)

// 加载企业列表
const loadSpaceList = async () => {
  try {
    const res = await getSpaceList()
    if (res.success || res.code === 200) {
      spaceList.value = res.data || []
      // 设置当前激活的企业（如果有）
      if (spaceList.value.length > 0) {
        activeSpaceId.value = String(spaceList.value[0].id)
        currentEnterprise.value = spaceList.value[0]
        // 确保二级菜单显示（如果弹窗已打开）
        if (props.visible) {
          showSecondaryMenu.value = true
        }
      }
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

// 处理点击遮罩层（外部区域）
const handleClickOverlay = () => {
  emit('update:visible', false)
}

// 处理个人中心
const handleUserCenter = () => {
  MessagePlugin.info('个人中心功能开发中')
  emit('update:visible', false)
}

// 处理企业点击
const handleEnterpriseClick = (space) => {
  activeSpaceId.value = String(space.id)
  currentEnterprise.value = space
  showSecondaryMenu.value = true
}

// 返回主菜单
const handleBack = () => {
  showSecondaryMenu.value = false
}

// 处理新建企业
const handleAddEnterprise = () => {
  router.push('/space')
  emit('update:visible', false)
}

// 处理账号设置
const handleAccountSettings = () => {
  router.push('/settings/account')
  emit('update:visible', false)
}

// 处理偏好设置
const handlePreferenceSettings = () => {
  router.push('/settings')
  emit('update:visible', false)
}

// 处理退出登录
const handleLogout = async () => {
  try {
    tracking.trackLogout(username.value)
    await userStore.logout()
    await MessagePlugin.success('已退出登录')
    router.push('/login')
    emit('update:visible', false)
  } catch (error) {
    console.error('退出登录失败:', error)
    await MessagePlugin.error('退出登录失败，请重试')
  }
}

// 处理通讯录
const handleContacts = () => {
  MessagePlugin.info('通讯录功能开发中')
}

// 处理管理后台（从二级菜单）
const handleAdminBackend = () => {
  if (currentEnterprise.value?.id) {
    const url = `/enterprise-admin/${currentEnterprise.value.id}`
    window.open(url, '_blank')
    emit('update:visible', false)
  } else {
    MessagePlugin.warning('请先选择企业')
  }
}

// 处理管理员后台（从底部菜单）
const handleAdminBackendFromFooter = () => {
  window.open('/admin', '_blank')
  emit('update:visible', false)
}

// 处理邀请成员
const handleInviteMembers = () => {
  MessagePlugin.info('邀请成员功能开发中')
}


// 监听 visible prop 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 如果有已存在的企业数据，立即显示二级菜单
    if (spaceList.value.length > 0) {
      activeSpaceId.value = String(spaceList.value[0].id)
      currentEnterprise.value = spaceList.value[0]
      showSecondaryMenu.value = true
    }
    // 异步加载企业列表
    loadSpaceList()
  } else {
    // 关闭弹窗时重置二级菜单
    showSecondaryMenu.value = false
  }
}, { immediate: true })

onMounted(() => {
  loadSpaceList()
})
</script>

<style scoped lang="scss">
// 浮层遮罩
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9998;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 0;
}

// 弹窗容器 - 固定在左下角
.user-center-popup-wrapper {
  position: fixed;
  bottom: 70px;
  left: 70px;
  z-index: 9999;
  animation: slideUpFromBottom 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left bottom;
}

.user-center-popup {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: visible;
  min-width: 240px;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(0, 0, 0, 0.08);
}

// 从左下向右上的弹出动画 - 苹果风格
@keyframes slideUpFromBottom {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 淡入淡出动画 - 苹果风格
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.popup-main {
  width: 240px;
  max-height: 600px;
  min-height: auto;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 16px 16px 0 0;
  flex: 1;

  // 自定义滚动条 - 苹果风格
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

// 外部底部区域：通知和头像
.popup-external-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0 0 0;
  background: #fff;
  border-top: none;
  border-radius: 0;
  margin-bottom: 0;
  
  // 确保最后一个元素（头像）紧贴底部
  :deep(.t-avatar) {
    margin-bottom: 0;
  }

  .external-notification {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    color: #646a73;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
      color: #1f2329;
    }
  }

  .external-user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    margin-bottom: 0;
    padding-bottom: 0;

    &:hover {
      background: #f5f7fa;
    }

    :deep(.t-avatar) {
      cursor: pointer;
    }
  }
}

.enterprise-section {
  margin-bottom: 0;
  
  .section-title {
    font-size: 11px;
    color: #8e8e93;
    margin-bottom: 4px;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  .enterprise-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 2px;
    position: relative;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &.is-active {
      background: rgba(0, 122, 255, 0.1);
      color: #007aff;

      .enterprise-name {
        color: #007aff;
        font-weight: 500;
      }

      .check-icon {
        color: #007aff;
        margin-left: auto;
      }
    }

    .enterprise-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      flex-shrink: 0;

      .default-icon {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .enterprise-name {
      flex: 1;
      font-size: 14px;
      color: #1f2329;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.add-enterprise {
      color: #007aff;
      border: none;
      background: transparent;
      margin-bottom: 0;
      margin-top: 8px;

      &:hover {
        background: rgba(0, 122, 255, 0.08);
      }

      span {
        color: #007aff;
      }
    }
  }
}

.popup-footer {
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
  padding: 4px 0 0 0;
  margin-top: 8px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .footer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    margin-bottom: 4px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    color: #1f2329;

    &:hover {
      background: #f5f7fa;
    }

    .t-icon {
      color: #646a73;
    }

    // 管理员后台特殊样式 - 橘黄色
    &.admin-backend-item {
      color: #ED7B2F;
      background: linear-gradient(135deg, rgba(237, 123, 47, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%);
      
      .t-icon {
        color: #ED7B2F;
      }

      &:hover {
        background: linear-gradient(135deg, rgba(237, 123, 47, 0.12) 0%, rgba(255, 152, 0, 0.12) 100%);
        color: #ED7B2F;
        transform: translateX(2px);
      }
    }

    // 退出登录特殊样式 - 红色
    &:last-child {
      color: #d32f2f;
      
      .t-icon {
        color: #d32f2f;
      }

      &:hover {
        background: #fff5f5;
        color: #d32f2f;
      }
    }
  }
}

.popup-secondary {
  width: 280px;
  border-left: 0.5px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0 16px 0 0;

  .secondary-content {
    flex: 1;
    padding: 8px;
    overflow-y: auto;

    .secondary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 15px;
      color: #000;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .t-icon {
        color: #8e8e93;
      }
    }
  }
}

// 右侧菜单滑入动画 - 苹果风格
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
