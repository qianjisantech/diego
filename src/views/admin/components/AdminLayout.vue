<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-left">
        <div class="logo">
          <t-icon name="control-platform" size="24px" class="admin-icon" />
          <span class="logo-text">管理员后台</span>
        </div>
      </div>
      <div class="header-right">
        <t-icon name="notification" size="20px" class="header-icon" />
        <t-icon name="help-circle" size="20px" class="header-icon" />
        <t-avatar :image="userAvatar" :alt="username" size="small" />
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="admin-body">
      <!-- 左侧导航栏 -->
      <div class="admin-sidebar">
        <t-menu
          :value="activeMenu"
          :expanded="expandedMenus"
          @change="handleMenuChange"
          @expand="handleMenuExpand"
        >
          <template v-for="(group, index) in menuGroups" :key="index">
            <!-- 菜单组标题（目录，使用 submenu 实现折叠功能） -->
            <t-submenu v-if="group.label" :value="group.key">
              <template #title>
                <span>{{ group.label }}</span>
              </template>
              <template v-for="item in group.items" :key="item.key">
                <!-- 有子菜单的项（菜单，需要图标） -->
                <t-submenu v-if="item.children && item.children.length > 0" :value="item.key">
                  <template #title>
                    <t-icon v-if="item.icon" :name="item.icon" size="18px" />
                    <span>{{ item.label }}</span>
                  </template>
                  <t-menu-item
                    v-for="child in item.children"
                    :key="child.key"
                    :value="child.key"
                  >
                    <template #icon>
                      <t-icon v-if="child.icon" :name="child.icon" size="18px" />
                    </template>
                    {{ child.label }}
                  </t-menu-item>
                </t-submenu>
                <!-- 普通菜单项（菜单，需要图标） -->
                <t-menu-item v-else :value="item.key">
                  <template #icon>
                    <t-icon v-if="item.icon" :name="item.icon" size="18px" />
                  </template>
                  {{ item.label }}
                </t-menu-item>
              </template>
            </t-submenu>
            <!-- 无组标题的菜单项 -->
            <template v-else>
              <template v-for="item in group.items" :key="item.key">
                <!-- 有子菜单的项（菜单，需要图标） -->
                <t-submenu v-if="item.children && item.children.length > 0" :value="item.key">
                  <template #title>
                    <t-icon v-if="item.icon" :name="item.icon" size="18px" />
                    <span>{{ item.label }}</span>
                  </template>
                  <t-menu-item
                    v-for="child in item.children"
                    :key="child.key"
                    :value="child.key"
                  >
                    <template #icon>
                      <t-icon v-if="child.icon" :name="child.icon" size="18px" />
                    </template>
                    {{ child.label }}
                  </t-menu-item>
                </t-submenu>
                <!-- 普通菜单项（菜单，需要图标） -->
                <t-menu-item v-else :value="item.key">
                  <template #icon>
                    <t-icon v-if="item.icon" :name="item.icon" size="18px" />
                  </template>
                  {{ item.label }}
                </t-menu-item>
              </template>
            </template>
          </template>
        </t-menu>
      </div>

      <!-- 右侧内容区 -->
      <div class="admin-content">
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

// 菜单配置
const menuGroups = [
  {
    key: 'dashboard',
    label: null,
    items: [
      { key: 'dashboard', label: '仪表盘', icon: 'dashboard' }
    ]
  },
  {
    key: 'content',
    label: '内容管理',
    items: [
      { key: 'announcement', label: '公告', icon: 'notification' },
      { key: 'changelog', label: '发布日志', icon: 'file-paste' },
      { key: 'records', label: '记录管理', icon: 'book' }
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    items: [
      { key: 'users', label: '用户管理', icon: 'user' },
      { key: 'roles', label: '角色管理', icon: 'usergroup' },
      { key: 'menus', label: '菜单管理', icon: 'menu-fold' },
      { key: 'dict', label: '字典管理', icon: 'dashboard' },
      { key: 'config', label: '配置管理', icon: 'setting' }
    ]
  }
]

// 菜单状态
const activeMenu = ref('dashboard')
const expandedMenus = ref(['content', 'system'])

// 处理菜单展开
const handleMenuExpand = (value) => {
  expandedMenus.value = value
}

// 路由映射
const routeMap = {
  'dashboard': '/admin/dashboard',
  'announcement': '/admin/announcement',
  'changelog': '/admin/changelog',
  'records': '/admin/records',
  'users': '/admin/rbac/user',
  'roles': '/admin/rbac/role',
  'menus': '/admin/rbac/menu',
  'dict': '/admin/rbac/dict',
  'config': '/admin/rbac/config'
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
  if (path.includes('/dashboard')) {
    activeMenu.value = 'dashboard'
  } else if (path.includes('/announcement')) {
    activeMenu.value = 'announcement'
  } else if (path.includes('/changelog')) {
    activeMenu.value = 'changelog'
  } else if (path.includes('/records')) {
    activeMenu.value = 'records'
  } else if (path.includes('/rbac/user')) {
    activeMenu.value = 'users'
  } else if (path.includes('/rbac/role')) {
    activeMenu.value = 'roles'
  } else if (path.includes('/rbac/menu')) {
    activeMenu.value = 'menus'
  } else if (path.includes('/rbac/dict')) {
    activeMenu.value = 'dict'
  } else if (path.includes('/rbac/config')) {
    activeMenu.value = 'config'
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
.admin-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #fafbfc;
  overflow: hidden;
}

// 顶部导航栏 - 苹果/Vercel风格
.admin-header {
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

      .admin-icon {
        color: #ED7B2F;
        flex-shrink: 0;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 4px;
        border-radius: 6px;

        &:hover {
          color: #d66a1f;
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
.admin-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// 左侧导航栏 - 飞书/苹果风格
.admin-sidebar {
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

    .t-menu-group {
      &:first-child {
        margin-top: -20px;
      }
      
      .t-menu-group__title {
        padding: 12px 24px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #8b8e95;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

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
        background: linear-gradient(135deg, rgba(237, 123, 47, 0.12) 0%, rgba(255, 152, 0, 0.08) 100%);
        color: #ED7B2F;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(237, 123, 47, 0.12);

        .t-icon {
          color: #ED7B2F;
        }
      }

      .t-icon {
        color: #8b8e95;
        margin-right: 12px;
        transition: color 0.2s;
      }
    }

    .t-submenu {
      &:first-child {
        margin-top: -20px;
      }
      
      .t-submenu__title {
        padding: 10px 20px;
        margin: 2px 12px;
        font-size: 14px;
        color: #1d1d1f;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .t-icon {
          color: #8b8e95;
          margin-right: 12px;
          transition: color 0.2s;
        }
      }
    }
  }
}

// 右侧内容区
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #fafbfc;
}
</style>

