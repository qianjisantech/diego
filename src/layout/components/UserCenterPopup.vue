<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="popup-overlay" @click="handleClickOverlay">
        <div class="user-center-popup-wrapper" @click.stop>
          <div class="user-center-popup">
            <!-- 左侧主菜单 -->
            <div class="popup-main">

              <!-- 个人信息模块（支持像企业一样可勾选） -->
              <div class="personal-section">
                <div class="personal-title">个人</div>
                <div
                  class="personal-item"
                  :class="{ 'is-active': isPersonalSelected }"
                  @click="handlePersonalClick"
                >
                  <div class="enterprise-icon personal-icon">
                    <t-avatar size="26px" :image="userAvatar" :alt="username">{{ userInitial }}</t-avatar>
                  </div>
                  <span class="enterprise-name">{{ username || '个人' }}</span>
                  <t-icon v-if="isPersonalSelected" name="check" size="16px" class="check-icon" />
                </div>
              </div>

              <!-- 企业部分 -->
              <div class="enterprise-section">
                <div class="section-title">企业</div>
                <div
                  v-for="company in companyList"
                  :key="company.id"
                  class="enterprise-item"
                  :class="{ 'is-active': company.isDefault }"
                  @click="handleEnterpriseClick(company)"
                >
                  <div class="enterprise-icon">
                    <t-icon v-if="company.icon" :name="company.icon" size="20px" />
                    <div v-else class="default-icon">{{ (company.companyName  || '企').charAt(0) }}</div>
                  </div>
                  <span class="enterprise-name">{{ company.companyName  }}</span>
                  <t-icon v-if="company.isDefault" name="check" size="16px" class="check-icon" />
                </div>
                <div class="enterprise-item add-enterprise" @click="handleAddEnterprise">
                  <t-icon name="add" size="18px" />
                  <span style="font-size: 14px;">新建企业</span>
                </div>
              </div>

              <!-- 底部操作 -->
              <div class="popup-footer">
                <div class="footer-item" @click="handlePersonalSettings">
                  <t-icon name="user-setting" size="16px" />
                  <span>个人设置</span>
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
  <InviteModal
    v-model:visible="showInviteModal"
    :company-id="userStore.selectedCompanyId || currentEnterprise?.id"
    @opened="(id) => console.log('[UserCenterPopup] invite opened, companyId:', id)"
    @copied="(link) => console.log('[UserCenterPopup] invite copied:', link)"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { MessagePlugin } from 'tdesign-vue-next'
import { activateEnterprise } from '@/api/enterprise/enterprise.js'

import InviteModal from '@/components/InviteModal.vue'
import { eventBus } from '@/utils/eventBus.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const router = useRouter()
const userStore = useUserStore()
const localSelectedCompany = ref('')
const copySelectedCompany = async () => {
  const id = userStore.selectedCompanyId || localSelectedCompany.value || window.__selectedCompanyId || ''
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(String(id))
    } else {
      const ta = document.createElement('textarea')
      ta.value = String(id)
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    await MessagePlugin.success('已复制企业ID: ' + id)
  } catch (e) {
    console.error('复制企业ID失败', e)
    await MessagePlugin.error('复制失败')
  }
}

// 邀请弹窗控制
const showInviteModal = ref(false)

// 用户信息：优先使用 profile 返回的 user_info.name 字段
const username = computed(() => {
  return userStore.userInfo?.name || userStore.userInfo?.username || 'Admin'
})
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

// 企业列表（直接使用 userStore 中的 companies）
const companyList = computed(() => userStore.userCompanies || [])
const activeEnterpriseId = ref('')
const currentEnterprise = ref(null)
const showSecondaryMenu = ref(false)

// 个人选中状态（与企业分开）
const isPersonalSelected = ref(false)

// 点击个人项：与企业选中互不干扰，仅切换个人选中状态
const handlePersonalClick = () => {
  isPersonalSelected.value = !isPersonalSelected.value
}

// 初始化企业选择状态
const initCompanySelection = () => {
      if (companyList.value.length > 0) {
        // try to find server-designated default company first
        const defaultCompany = companyList.value.find(c => c.is_default || c.isDefault)
        const initial = defaultCompany ? defaultCompany : companyList.value[0]
        activeEnterpriseId.value = String(initial.id)
        currentEnterprise.value = initial
        // 确保二级菜单显示（如果弹窗已打开）
        if (props.visible) {
          showSecondaryMenu.value = true
        }
        // update user store selected company as source of truth
        try { userStore.setSelectedCompany(initial.id) } catch (e) {}
        localSelectedCompany.value = String(initial.id)
    }

  console.warn('个人用户弹窗列表',JSON.stringify(companyList.value))
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

// 处理企业点击 - 调用激活接口并切换企业
const handleEnterpriseClick = async (company) => {
  try {
    const res = await activateCompany(company.id)
      if (res && (res.success || res.code === 200)) {
      activeEnterpriseId.value = String(company.id)
      currentEnterprise.value = company
      showSecondaryMenu.value = true
      await MessagePlugin.success('已切换企业，正在刷新系统...')
      // update user store selected company (this will emit event)
      try { userStore.setSelectedCompany(company.id) } catch (e) {}
      // 先关闭弹窗，等待动画完成后刷新页面以让整个系统使用新的企业上下文
      emit('update:visible', false)
      setTimeout(() => {
        try {
          window.location.reload()
        } catch (e) {
          // 如果 reload 失败，退回到路由刷新
          router.go(0)
        }
      }, 180)
      return
    }
    // 回退行为：即使响应非标准也切换本地显示，并更新 user store
    activeEnterpriseId.value = String(company.id)
    currentEnterprise.value = company
    showSecondaryMenu.value = true
    try { userStore.setSelectedCompany(company.id) } catch (e) {}
    try { localSelectedCompany.value = String(company.id) } catch (e) {}
    emit('update:visible', false)
  } catch (error) {
    console.error('激活企业接口失败:', error)
    await MessagePlugin.error('切换企业失败，请重试')
  }
}

// 返回主菜单
const handleBack = () => {
  showSecondaryMenu.value = false
}

// 处理新建企业（在新标签页打开创建页面）
const handleAddEnterprise = () => {
  window.open('/enterprise/my-list', '_blank')
  emit('update:visible', false)
}

// 处理个人设置
const handlePersonalSettings = () => {
  window.open('/profile', '_blank')
  emit('update:visible', false)
}

// 处理退出登录
const handleLogout = async () => {
  try {

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
  console.log('[UserCenterPopup] handleInviteMembers clicked, currentEnterprise:', currentEnterprise.value)
  // 先关闭头像弹窗，保证界面只显示邀请模态框
  emit('update:visible', false)
  // 等待弹窗关闭动画/DOM 更新后再打开模态框（避免遮罩层遮挡）
  setTimeout(() => {
    showInviteModal.value = true
  }, 120)
}


// 监听 visible prop 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 如果有已存在的企业数据，立即显示二级菜单和初始化企业选择
    if (companyList.value.length > 0) {
      activeEnterpriseId.value = String(companyList.value[0].id)
      currentEnterprise.value = companyList.value[0]
      showSecondaryMenu.value = true
    }
    // 初始化企业选择状态
    initCompanySelection()
  } else {
    // 关闭弹窗时重置二级菜单
    showSecondaryMenu.value = false
  }
}, { immediate: true })

// 监听用户企业数据变化
watch(() => userStore.userCompanies, (newCompanies) => {
  if (newCompanies && newCompanies.length > 0 && userStore) {
    // 当存在企业时，优先使用企业上下文，取消个人选中
    isPersonalSelected.value = false
    initCompanySelection()
  } else {
    // 无企业时，默认选中个人
    isPersonalSelected.value = true
    activeEnterpriseId.value = ''
    currentEnterprise.value = null
    localSelectedCompany.value = ''
  }
}, { immediate: true })

onMounted(() => {
  initCompanySelection()
})
// keep localSelectedCompany in sync with store
watch(() => userStore.selectedCompanyId, (v) => {
  localSelectedCompany.value = v || localSelectedCompany.value
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
  gap:4px;
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
      background: rgba(0, 0, 0, 0.04);
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
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      /* 腾讯云蓝渐变 */
      background: linear-gradient(135deg, #00A1F1 0%, #0078D7 100%);
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
    
    /* 使每一项背景撑满容器 */
    width: 100%;
    box-sizing: border-box;

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

/* 个人信息模块 */
.personal-section {
  padding: 2px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 0.5px solid rgba(0,0,0,0.04);

  .personal-row {
    display: flex;
    align-items: center;

  }

  .personal-avatar {
    flex-shrink: 0;
  }

  .personal-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .personal-name {
      font-weight: 400;
      color: #1f2329;
      font-size: 16px;
    }

    .personal-email {
      font-size: 12px;
      color: #8f959e;
    }
  }

  .personal-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
 
  /* 个人项（与企业项样式一致，头像与姓名水平对齐） */
  .personal-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 5px ;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    width: 100%;
    box-sizing: border-box;
  }

  .personal-item .personal-icon {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: linear-gradient(135deg, #E8F1FF 0%, #FCEFF6 100%);
    color: #fff;
  }

  .personal-item .enterprise-name {
    flex: 1;
    font-size: 14px;
    color: #1f2329;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .personal-item.is-active {
    background: rgba(0, 0, 0, 0.04);
    /* 保持文字/图标颜色不变，只有背景变为浅灰 */
  }
  .personal-item.is-active .check-icon {
    color: #007aff;
    margin-left: auto;
  }
}

/* 个人模块样式 - 更苹果风 */
.personal-section {
  background: transparent;
  padding: 12px 12px 8px 12px;
}
.personal-title {
  font-size: 12px;
  color: #9aa0a6;
  margin-bottom: 8px;
  text-transform: none;
}
.personal-avatar :deep(.t-avatar) {
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  background: linear-gradient(135deg, #E8F1FF 0%, #FCEFF6 100%);
}
.personal-name {
  font-weight: 700;
  color: #1f2329;
  font-size: 16px;
}
.personal-email {
  font-size: 12px;
  color: #8f959e;
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
