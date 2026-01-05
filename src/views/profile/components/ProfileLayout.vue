<template>
  <div class="profile-layout">
    <!-- 顶部导航栏 -->
    <div class="profile-header">
      <div class="header-left">
        <div class="logo">
          <t-icon name="user-setting" size="24px" class="profile-icon" />
          <span class="logo-text">个人设置</span>
        </div>
      </div>
      <div class="header-right">
        <t-icon name="notification" size="20px" class="header-icon" />
        <t-icon name="help-circle" size="20px" class="header-icon" />
        <t-avatar :image="userAvatar" :alt="username" size="small" />
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="profile-body">
      <!-- 左侧导航栏 -->
      <div class="profile-sidebar">
        <t-menu
          :value="activeMenu"
          @change="handleMenuChange"
        >
          <t-menu-item value="account">
            <template #icon>
              <t-icon name="user-circle" size="18px" />
            </template>
            账号设置
          </t-menu-item>
          <t-menu-item value="settings">
            <template #icon>
              <t-icon name="setting" size="18px" />
            </template>
            偏好设置
          </t-menu-item>
        </t-menu>
      </div>

      <!-- 右侧内容区 -->
      <div class="profile-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 用户信息
const username = computed(() => userStore.userInfo?.name || userStore.userInfo?.username || 'Admin')
const userAvatar = computed(() => {
  if (userStore.userInfo?.avatar) {
    return userStore.userInfo.avatar
  }
  const seed = username.value || 'user'
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
})

// 菜单状态
const activeMenu = ref('account')

// 路由映射
const routeMap = {
  'account': '/profile/account',
  'settings': '/profile/settings'
}

// 处理菜单变化
const handleMenuChange = (value) => {
  activeMenu.value = value
  const targetRoute = routeMap[value]
  if (targetRoute && route.path !== targetRoute) {
    router.push(targetRoute)
  }
}

// 根据当前路由设置激活菜单
const updateActiveMenu = () => {
  const path = route.path
  if (path.includes('/account')) {
    activeMenu.value = 'account'
  } else if (path.includes('/settings')) {
    activeMenu.value = 'settings'
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateActiveMenu()
})

onMounted(() => {
  updateActiveMenu()
})
</script>

<style scoped lang="scss">
.profile-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #fafbfc;
  overflow: hidden;
}

// 顶部导航栏 - 苹果/Vercel风格
.profile-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px 0 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);

  .header-left {
    display: flex;
    align-items: center;
    padding-left: 24px;
    margin-left: 0;

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .profile-icon {
        color: #0052D9;
        flex-shrink: 0;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 4px;
        border-radius: 6px;

        &:hover {
          color: #0051d5;
          transform: scale(1.05);
        }
      }

      .logo-text {
        font-size: 15px;
        font-weight: 600;
        color: #1d1d1f;
        letter-spacing: -0.01em;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      color: #8b8e95;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 8px;
      border-radius: 8px;

      &:hover {
        color: #1f2329;
        background: rgba(0, 0, 0, 0.04);
      }
    }
  }
}

// 主体内容区
.profile-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// 左侧导航栏 - 飞书/苹果风格
.profile-sidebar {
  width: 256px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  padding: 20px 0;

  // 自定义滚动条 - 更精致的样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 10px;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }

  // TDesign Menu 样式定制
  :deep(.t-menu) {
    border: none;
    background: transparent;

    .t-menu-item {
      padding: 10px 20px;
      margin: 2px 12px;
      font-size: 14px;
      color: #1d1d1f;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      &.t-is-active {
        background: linear-gradient(135deg, rgba(0, 82, 217, 0.12) 0%, rgba(0, 82, 217, 0.08) 100%);
        color: #0052D9;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 82, 217, 0.12);

        .t-icon {
          color: #0052D9;
        }
      }

      .t-icon {
        color: #8b8e95;
        margin-right: 12px;
        transition: color 0.2s;
      }
    }
  }
}

// 右侧内容区
.profile-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #fafbfc;
}
</style>

