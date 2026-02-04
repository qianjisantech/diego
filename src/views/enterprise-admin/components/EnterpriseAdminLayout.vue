<template>
  <div class="enterprise-admin-layout">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-left">
        <div class="logo">
          <t-icon name="app" size="24px" class="dots-icon"  @click="handleCompanyIconClick" />
          <t-avatar 
            :image="enterpriseAvatar" 
            :alt="enterpriseName" 
            size="small"
            class="enterprise-avatar"
          >
            {{ enterpriseInitial }}
          </t-avatar>
          <span class="logo-text">{{ enterpriseName }}</span>
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

    <!-- 应用抽屉 -->
    <t-drawer
      v-model:visible="showCompanyDialog"
      :header="enterpriseName || '应用'"
      size="400px"
      placement="left"
      :footer="false"
      class="app-drawer-wrapper"
    >
      <div class="app-drawer">
        <!-- 应用网格 -->
        <div class="app-grid-container">
          <t-row :gutter="[8, 8]">
            <t-col
              v-for="app in appList"
              :key="app.key"
              :span="8"
            >
              <div
                class="app-item"
                @click="handleAppClick(app)"
              >
                <div class="app-icon-wrapper" :style="{ background: app.bgColor }">
                  <t-icon :name="app.icon" size="20px" />
                </div>
                <div class="app-name">{{ app.name }}</div>
              </div>
            </t-col>
          </t-row>
        </div>

        <!-- 编辑应用侧栏按钮 -->
        <div class="app-actions">
          <t-button theme="default" size="medium" block @click="handleEditAppSidebar">
            编辑应用侧栏
          </t-button>
        </div>
      </div>
    </t-drawer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getEnterprise } from '@/api/enterprise/enterprise.js'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 企业信息
const enterpriseId = computed(() => route.params.id)
const enterpriseName = ref('')
const enterpriseInfo = ref(null)
const enterpriseAvatar = ref('')

// 企业名称首字母
const enterpriseInitial = computed(() => {
  return enterpriseName.value?.charAt(0)?.toUpperCase() || '企'
})

// 弹窗控制
const showCompanyDialog = ref(false)

// 处理企业图标点击
const handleCompanyIconClick = () => {
  console.log('========================================')
  console.log('🏢 [EnterpriseAdminLayout] 点击企业图标')
  console.log('📊 [EnterpriseAdminLayout] 当前企业ID:', enterpriseId.value)
  console.log('📊 [EnterpriseAdminLayout] 企业名称:', enterpriseName.value)
  console.log('📊 [EnterpriseAdminLayout] 弹窗状态:', showCompanyDialog.value, '->', true)
  console.log('========================================')
  showCompanyDialog.value = true
}

// Mock企业数据
const mockCompanyData = ref({
  id: 'ENT-2024-001',
  name: '千机伞科技',
  description: '专注于企业数字化解决方案的科技公司，致力于为企业提供高效、智能的管理工具。',
  avatar: '',
  version: '专业版',
  createTime: '2021年11月03日',
  memberCount: 156,
  projectCount: 28,
  status: '正常'
})

// 应用列表数据
const appList = ref([
  { key: 'teambition', name: 'Teambition', icon: 'app', bgColor: '#0052D9' },
  { key: 'suosi', name: '所思', icon: 'app', bgColor: '#0052D9' },
  { key: 'timeview', name: '时间视图', icon: 'time', bgColor: '#0052D9' },
  { key: 'testcase', name: '测试用例', icon: 'browse', bgColor: '#0052D9' },
  { key: 'ci', name: '持续集成', icon: 'code', bgColor: '#0052D9' },
  { key: 'version', name: '版本', icon: 'file', bgColor: '#00A870' },
  { key: 'datalake', name: 'Data Lake', icon: 'chart', bgColor: '#0052D9' },
  { key: 'cockpit', name: '驾驶舱', icon: 'location', bgColor: '#0052D9' },
  { key: 'resource', name: '资源管理', icon: 'folder', bgColor: '#0052D9' },
  { key: 'devops', name: 'DevOps', icon: 'setting', bgColor: '#0052D9' },
  { key: 'mytasks', name: '我的任务', icon: 'check-circle', bgColor: '#0052D9' },
  { key: 'workbench', name: '工作台', icon: 'view-module', bgColor: '#0052D9' },
  { key: 'workhours', name: '工时', icon: 'time-filled', bgColor: '#0052D9' }
])

// 处理应用点击
const handleAppClick = (app) => {
  console.log('点击应用:', app.name)
  // TODO: 根据应用key跳转到对应页面
  showCompanyDialog.value = false
}

// 编辑应用侧栏
const handleEditAppSidebar = () => {
  console.log('编辑应用侧栏')
  // TODO: 实现编辑应用侧栏功能
  showCompanyDialog.value = false
}

// 用户信息
const username = computed(() => userStore.userInfo?.username || 'Admin')
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
    key: 'basic',
    label: '基础信息',
    items: [
      { key: 'enterprise-info', label: '企业信息', icon: 'file' }
    ]
  },
  {
    key: 'management',
    label: null,
    items: [
      {
        key: 'members',
        label: '成员管理',
        children: [
          { key: 'members-list', label: '成员', icon: 'user' },
          { key: 'organization', label: '组织架构', icon: 'usergroup' }
        ]
      },
      {
        key: 'settings',
        label: '企业设置',
            children: [
              { key: 'item-type-management', label: '事项类型管理', icon: 'checklist' },
              {
                key: 'custom-templates',
                label: '自定义模板',
                icon: 'edit',
                children: [
                  { key: 'custom-templates', label: '模板列表', icon: 'list' },
                ]
              },
            ]
      },

    ]
  },
  // {
  //   key: 'other',
  //   label: null,
  //   items: [
  //     {
  //       key: 'permissions',
  //       label: '权限',
  //       children: [
  //         { key: 'enterprise-permissions', label: '企业权限', icon: 'lock-on' },
  //         { key: 'project-permissions', label: '项目权限', icon: 'lock-on' }
  //       ]
  //     }
  //   ]
  // }
]

// 菜单状态
const activeMenu = ref('enterprise-info')
const expandedMenus = ref(['basic', 'members', 'settings', 'permissions']) // 展开的菜单项

// 处理菜单展开
const handleMenuExpand = (value) => {
  expandedMenus.value = value
}

// 处理菜单折叠
const handleMenuCollapse = (value) => {
  expandedMenus.value = value
}

// 路由映射
const routeMap = {
  'enterprise-info': `/enterprise-admin/${enterpriseId.value}/info`,
  'members-list': `/enterprise-admin/${enterpriseId.value}/members`,
  'organization': `/enterprise-admin/${enterpriseId.value}/organization`,
  'custom-templates': `/enterprise-admin/${enterpriseId.value}/custom-templates`,
  'item-type-management': `/enterprise-admin/${enterpriseId.value}/item-type-management`,
  'template-design': `/enterprise-admin/${enterpriseId.value}/template-design`,
  'enterprise-permissions': `/enterprise-admin/${enterpriseId.value}/enterprise-permissions`,
  'project-permissions': `/enterprise-admin/${enterpriseId.value}/project-permissions`
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
  if (path.includes('/info') || path.endsWith(`/enterprise-admin/${enterpriseId.value}`)) {
    activeMenu.value = 'enterprise-info'
    if (path.endsWith(`/enterprise-admin/${enterpriseId.value}`)) {
      router.push(`/enterprise-admin/${enterpriseId.value}/info`)
    }
  } else if (path.includes('/members') && !path.includes('/organization')) {
    activeMenu.value = 'members-list'
  } else if (path.includes('/organization')) {
    activeMenu.value = 'organization'
  } else if (path.includes('/custom-templates')) {
    activeMenu.value = 'custom-templates'
  } else if (path.includes('/item-type-management')) {
    activeMenu.value = 'item-type-management'
  } else if (path.includes('/enterprise-permissions')) {
    activeMenu.value = 'enterprise-permissions'
  } else if (path.includes('/project-permissions')) {
    activeMenu.value = 'project-permissions'
  }
}

// 加载企业信息
const loadEnterpriseInfo = async () => {
  try {
    const res = await getEnterprise(enterpriseId.value)
    if (res.success) {
      enterpriseName.value = res.data.name || ''
      enterpriseAvatar.value = res.data.avatar || ''
    }
  } catch (error) {
    console.error('获取企业信息失败:', error)
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateActiveMenu()
  // 存储企业ID到用户store
  if (enterpriseId.value) {
    userStore.setSelectedCompany(enterpriseId.value)
  }
})

onMounted(() => {
  updateActiveMenu()
  loadEnterpriseInfo()
  // 初始化时存储企业ID到用户store
  if (enterpriseId.value) {
    userStore.setSelectedCompany(enterpriseId.value)
  }
})
</script>

<style scoped lang="scss">
.enterprise-admin-layout {
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

      .logo-icon {
        color: #007aff;
        flex-shrink: 0;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          color: #0051d5;
          transform: scale(1.05);
        }
      }

      .dots-icon {
        color: #8b8e95;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 4px;
        border-radius: 6px;

        &:hover {
          color: #1f2329;
          background: rgba(0, 0, 0, 0.04);
        }
      }

      .enterprise-avatar {
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
        background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.08) 100%);
        color: #007aff;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 122, 255, 0.12);

        .t-icon {
          color: #007aff;
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

      .t-menu-item {
        padding-left: 52px;
        font-size: 13px;
        margin-left: 12px;
        margin-right: 12px;
      }
    }
  }
}

// 右侧内容区 - Vercel风格
.admin-content {
  flex: 1;
  overflow-y: auto;
  background: #fafbfc;
  padding: 0;
  height: 100%;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.12);
    border-radius: 10px;
    transition: background 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

// 菜单展开动画
.slide-expand-enter-active,
.slide-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-expand-enter-from,
.slide-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-expand-enter-to,
.slide-expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

// 应用抽屉样式
:deep(.app-drawer-wrapper) {
  .t-drawer__mask {
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

.app-drawer {
  padding: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .app-grid-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 12px;
    min-height: 0;

    :deep(.t-row) {
      margin: 0;
      display: flex;
      flex-wrap: wrap;
    }

    :deep(.t-col) {
      padding: 0 4px;
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }

    .app-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: var(--td-bg-color-container-hover);
      }

      .app-icon-wrapper {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-bottom: 6px;
        transition: transform 0.2s;
      }

      .app-name {
        font-size: 12px;
        color: var(--td-text-color-primary);
        text-align: center;
        line-height: 1.3;
      }

      &:hover .app-icon-wrapper {
        transform: scale(1.05);
      }
    }
  }

  .app-actions {
    flex-shrink: 0;
    padding-top: 8px;
    margin-top: 8px;
  }
}
</style>

