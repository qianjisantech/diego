<template>
  <div class="settings-container">
    <!-- 左侧菜单 -->
    <div class="settings-sidebar">
      <div class="sidebar-header">
        <t-icon name="setting" size="24px" />
        <h3>系统设置</h3>
      </div>

      <div class="settings-menu">
        <template v-for="(item, index) in settingsMenu" :key="index">
          <!-- 一级菜单 -->
          <div class="menu-group">
            <div
              class="menu-group-title"
              @click="toggleGroup(item.key)"
            >
              <t-icon :name="item.icon" size="18px" />
              <span>{{ item.label }}</span>
              <t-icon
                :name="expandedGroups.includes(item.key) ? 'chevron-down' : 'chevron-right'"
                size="16px"
                class="expand-icon"
              />
            </div>

            <!-- 二级菜单 -->
            <transition name="slide-expand">
              <div v-show="expandedGroups.includes(item.key)" class="menu-group-content">
                <template v-for="child in item.children" :key="child.key">
                  <div>
                    <!-- 二级菜单项 -->
                    <div
                      class="menu-item"
                      :class="{
                        'is-active': activeMenu === child.key && (!child.children || !expandedSubMenus.includes(child.key)),
                        'has-submenu': child.children && child.children.length > 0,
                        'is-expanded': expandedSubMenus.includes(child.key)
                      }"
                      @click="handleMenuClick(child)"
                    >
                      <t-icon v-if="child.icon" :name="child.icon" size="16px" />
                      <span>{{ child.label }}</span>
                      <t-badge v-if="child.badge" :count="child.badge" size="small" />

                      <!-- 三级菜单展开指示器 -->
                      <t-icon
                        v-if="child.children && child.children.length > 0"
                        :name="expandedSubMenus.includes(child.key) ? 'chevron-down' : 'chevron-right'"
                        size="14px"
                        class="submenu-icon"
                      />
                    </div>

                    <!-- 三级菜单 -->
                    <transition name="slide-expand">
                      <div
                        v-if="child.children && expandedSubMenus.includes(child.key)"
                        class="submenu-group"
                      >
                        <div
                          v-for="subItem in child.children"
                          :key="subItem.key"
                          class="submenu-item"
                          :class="{ 'is-active': activeSubMenu === subItem.key }"
                          @click.stop="handleSubMenuClick(child, subItem)"
                        >
                          <span class="submenu-dot"></span>
                          <span>{{ subItem.label }}</span>
                        </div>
                      </div>
                    </transition>
                  </div>
                </template>
              </div>
            </transition>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="settings-content">
      <div class="content-header">
        <div>
          <h2>{{ currentPageTitle }}</h2>
          <p class="content-desc">{{ currentPageDesc }}</p>
        </div>
        <t-button theme="primary" @click="handleSave">
          <template #icon>
            <t-icon name="check" />
          </template>
          保存设置
        </t-button>
      </div>

      <!-- 动态内容区域 -->
      <div class="content-body">
        <!-- 账号设置 -->
        <div v-if="activeMenu === 'account'" class="setting-section">
          <t-card title="基本信息" class="setting-card">
            <t-form label-align="left" label-width="100px">
              <t-form-item label="用户名">
                <t-input v-model="accountData.username" disabled />
              </t-form-item>
              <t-form-item label="姓名">
                <t-input v-model="accountData.name" />
              </t-form-item>
              <t-form-item label="邮箱">
                <t-input  v-model="accountData.email" disabled />
              </t-form-item>
              <t-form-item label="手机号">
                <t-input v-model="accountData.phone" />
              </t-form-item>
            </t-form>
          </t-card>

          <t-card title="头像设置" class="setting-card">
            <div class="avatar-section">
              <t-avatar size="80px" :image="accountData.avatar">
                {{ accountData.name ? accountData.name.charAt(0) : 'A' }}
              </t-avatar>
              <div class="avatar-actions">
                <t-button theme="primary" variant="outline">更换头像</t-button>
                <p class="tip">支持JPG、PNG格式，大小不超过2MB</p>
              </div>
            </div>
          </t-card>
        </div>

        <!-- 通知设置 -->
        <div v-if="activeMenu === 'notification'" class="setting-section">
          <t-card title="通知方式" class="setting-card">
            <div class="notification-item">
              <div class="item-info">
                <h4>任务提醒</h4>
                <p>当有新任务分配时接收通知</p>
              </div>
              <t-switch v-model="notificationSettings.task" />
            </div>
            <t-divider />
            <div class="notification-item">
              <div class="item-info">
                <h4>评论通知</h4>
                <p>当有人评论您的内容时接收通知</p>
              </div>
              <t-switch v-model="notificationSettings.comment" />
            </div>
            <t-divider />
            <div class="notification-item">
              <div class="item-info">
                <h4>系统公告</h4>
                <p>接收系统更新和维护通知</p>
              </div>
              <t-switch v-model="notificationSettings.announcement" />
            </div>
          </t-card>

          <!-- 三级菜单内容 -->
          <t-card v-if="activeSubMenu === 'notification-email'" title="邮件通知规则" class="setting-card">
            <t-form label-align="left" label-width="120px">
              <t-form-item label="接收频率">
                <t-radio-group v-model="emailFrequency">
                  <t-radio value="realtime">实时接收</t-radio>
                  <t-radio value="daily">每日汇总</t-radio>
                  <t-radio value="weekly">每周汇总</t-radio>
                </t-radio-group>
              </t-form-item>
            </t-form>
          </t-card>

          <t-card v-if="activeSubMenu === 'notification-sms'" title="短信通知规则" class="setting-card">
            <p>短信通知仅在紧急情况下发送</p>
          </t-card>

          <t-card v-if="activeSubMenu === 'notification-app'" title="应用内通知规则" class="setting-card">
            <p>配置应用内消息推送规则</p>
          </t-card>
        </div>

        <!-- 系统设置 -->
        <div v-if="activeMenu.startsWith('system')" class="setting-section">
          <t-card title="系统配置" class="setting-card">
            <!-- 语言设置 -->
            <div v-if="activeSubMenu === 'system-language'">
              <t-form label-align="left" label-width="100px">
                <t-form-item label="显示语言">
                  <t-select v-model="systemSettings.language">
                    <t-option value="zh-CN" label="简体中文" />
                    <t-option value="en-US" label="English" />
                  </t-select>
                </t-form-item>
                <t-form-item label="时区">
                  <t-select v-model="systemSettings.timezone">
                    <t-option value="Asia/Shanghai" label="中国标准时间 (UTC+8)" />
                    <t-option value="America/New_York" label="美国东部时间 (UTC-5)" />
                  </t-select>
                </t-form-item>
              </t-form>
            </div>

            <!-- 主题设置 -->
            <div v-if="activeSubMenu === 'system-theme'">
              <t-form label-align="left" label-width="100px">
                <t-form-item label="主题模式">
                  <t-radio-group v-model="systemSettings.theme">
                    <t-radio value="light">浅色</t-radio>
                    <t-radio value="dark">深色</t-radio>
                    <t-radio value="auto">跟随系统</t-radio>
                  </t-radio-group>
                </t-form-item>
                <t-form-item label="主题色">
                  <div class="theme-colors">
                    <div
                      v-for="color in themeColors"
                      :key="color"
                      class="color-item"
                      :class="{ 'is-active': systemSettings.primaryColor === color }"
                      :style="{ background: color }"
                      @click="systemSettings.primaryColor = color"
                    ></div>
                  </div>
                </t-form-item>
              </t-form>
            </div>

            <!-- 默认显示基础设置 -->
            <div v-if="!activeSubMenu && activeMenu === 'system-basic'">
              <p>请从左侧菜单选择具体配置项</p>
            </div>
          </t-card>
        </div>

        <!-- 安全设置 -->
        <div v-if="activeMenu.startsWith('security')" class="setting-section">
          <t-card v-if="activeMenu === 'security-password'" title="修改密码" class="setting-card">
            <t-form label-align="left" label-width="100px">
              <t-form-item label="当前密码">
                <t-input type="password" placeholder="请输入当前密码" />
              </t-form-item>
              <t-form-item label="新密码">
                <t-input type="password" placeholder="请输入新密码" />
              </t-form-item>
              <t-form-item label="确认密码">
                <t-input type="password" placeholder="请再次输入新密码" />
              </t-form-item>
            </t-form>
          </t-card>

          <t-card v-if="activeMenu === 'security-auth'" title="双重认证" class="setting-card">
            <div class="auth-section">
              <div class="auth-item">
                <div class="item-info">
                  <h4>短信验证</h4>
                  <p>通过手机短信验证码进行二次验证</p>
                </div>
                <t-button theme="primary" variant="outline">启用</t-button>
              </div>
              <t-divider />
              <div class="auth-item">
                <div class="item-info">
                  <h4>应用验证器</h4>
                  <p>使用Google Authenticator等应用生成验证码</p>
                </div>
                <t-button theme="primary" variant="outline">启用</t-button>
              </div>
            </div>
          </t-card>

          <t-card v-if="activeMenu === 'security-log'" title="最近登录记录" class="setting-card">
            <t-table
              :data="loginLogs"
              :columns="logColumns"
              row-key="id"
              size="small"
            />
          </t-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getUserSettings, updateAccountSettings, updateNotificationSettings, updateSystemSettings, updatePassword, getLoginLogs } from '@/api/settings.js'

const activeMenu = ref('account')
const activeSubMenu = ref('')
const expandedGroups = ref(['personal', 'system'])
const expandedSubMenus = ref([]) // 记录展开的二级菜单（用于三级菜单）
const loading = ref(false)

// 用户账号数据
const accountData = ref({
  username: '',
  name: '',
  email: '',
  phone: '',
  avatar: ''
})

// 通知设置
const notificationSettings = ref({
  task: true,
  comment: true,
  announcement: true
})

// 系统设置
const systemSettings = ref({
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  theme: 'light',
  primaryColor: '#0052d9'
})

// 邮件通知频率
const emailFrequency = ref('realtime')

// 主题色选项
const themeColors = ['#0052d9', '#00a870', '#e37318', '#c9353f', '#8a54d1']

// 登录日志
const loginLogs = ref([])

const logColumns = [
  { colKey: 'time', title: '登录时间', width: 180 },
  { colKey: 'ip', title: 'IP地址', width: 150 },
  { colKey: 'location', title: '登录地点', width: 120 },
  { colKey: 'device', title: '设备', width: 150 }
]

// 获取用户设置数据
const fetchUserSettings = async () => {
  try {
    loading.value = true
    const res = await getUserSettings()
    if (res.success) {
      // 账号设置
      accountData.value = res.data.account
      // 通知设置
      notificationSettings.value = res.data.notification
      emailFrequency.value = res.data.notification.emailFrequency
      // 系统设置
      systemSettings.value = res.data.system
    } else {
      MessagePlugin.error(res.message || '获取设置失败')
    }
  } catch (error) {
    console.error('获取设置失败:', error)
    MessagePlugin.error('获取设置失败')
  } finally {
    loading.value = false
  }
}

// 获取登录日志
const fetchLoginLogs = async () => {
  try {
    const res = await getLoginLogs({ pageNum: 1, pageSize: 10 })
    if (res.success) {
      loginLogs.value = res.data.list
    }
  } catch (error) {
    console.error('获取登录日志失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserSettings()
  fetchLoginLogs()
})

// 设置菜单配置
const settingsMenu = [
  {
    key: 'personal',
    label: '个人设置',
    icon: 'user',
    children: [
      {
        key: 'account',
        label: '账号设置',
        icon: 'user-circle',
        title: '账号设置',
        desc: '管理您的个人信息和账号安全'
      },
      {
        key: 'notification',
        label: '通知设置',
        icon: 'notification',
        badge: 3,
        title: '通知设置',
        desc: '管理系统通知和消息提醒方式',
        children: [
          {
            key: 'notification-email',
            label: '邮件通知',
            title: '邮件通知设置',
            desc: '配置邮件通知规则和接收频率'
          },
          {
            key: 'notification-sms',
            label: '短信通知',
            title: '短信通知设置',
            desc: '配置短信通知规则'
          },
          {
            key: 'notification-app',
            label: '应用内通知',
            title: '应用内通知设置',
            desc: '配置应用内消息推送规则'
          }
        ]
      },
      {
        key: 'privacy',
        label: '隐私设置',
        icon: 'lock-on',
        title: '隐私设置',
        desc: '管理您的隐私和数据权限'
      }
    ]
  },
  {
    key: 'system',
    label: '系统设置',
    icon: 'tools',
    children: [
      {
        key: 'system-basic',
        label: '基础设置',
        icon: 'setting',
        title: '基础设置',
        desc: '配置系统基础参数和功能',
        children: [
          {
            key: 'system-language',
            label: '语言设置',
            title: '语言和地区设置',
            desc: '选择系统显示语言和时区'
          },
          {
            key: 'system-theme',
            label: '主题外观',
            title: '主题和外观设置',
            desc: '自定义系统主题和界面样式'
          }
        ]
      },
      {
        key: 'system-advanced',
        label: '高级设置',
        icon: 'control-platform',
        title: '高级设置',
        desc: '配置系统高级功能和性能选项'
      }
    ]
  },
  {
    key: 'security',
    label: '安全中心',
    icon: 'secured',
    children: [
      {
        key: 'security-password',
        label: '密码管理',
        icon: 'lock-on',
        title: '密码管理',
        desc: '修改密码和安全问题'
      },
      {
        key: 'security-auth',
        label: '双重认证',
        icon: 'smartphone',
        title: '双重认证',
        desc: '启用双因素身份验证，提升账号安全'
      },
      {
        key: 'security-log',
        label: '登录日志',
        icon: 'calendar',
        title: '登录日志',
        desc: '查看账号最近的登录历史记录'
      }
    ]
  }
]

// 当前页面标题
const currentPageTitle = computed(() => {
  // 如果有激活的三级菜单，显示三级菜单标题
  if (activeSubMenu.value) {
    for (const group of settingsMenu) {
      for (const item of group.children) {
        if (item.children) {
          const subItem = item.children.find(sub => sub.key === activeSubMenu.value)
          if (subItem) {
            return subItem.title
          }
        }
      }
    }
  }

  // 否则显示二级菜单标题
  for (const group of settingsMenu) {
    for (const item of group.children) {
      if (item.key === activeMenu.value) {
        return item.title
      }
    }
  }
  return '设置'
})

// 当前页面描述
const currentPageDesc = computed(() => {
  // 如果有激活的三级菜单，显示三级菜单描述
  if (activeSubMenu.value) {
    for (const group of settingsMenu) {
      for (const item of group.children) {
        if (item.children) {
          const subItem = item.children.find(sub => sub.key === activeSubMenu.value)
          if (subItem) {
            return subItem.desc
          }
        }
      }
    }
  }

  // 否则显示二级菜单描述
  for (const group of settingsMenu) {
    for (const item of group.children) {
      if (item.key === activeMenu.value) {
        return item.desc
      }
    }
  }
  return ''
})

// 切换分组展开/收起
const toggleGroup = (key) => {
  const index = expandedGroups.value.indexOf(key)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(key)
  }
}

// 处理二级菜单点击
const handleMenuClick = (item) => {
  // 如果有三级菜单，切换展开/收起状态
  if (item.children && item.children.length > 0) {
    const index = expandedSubMenus.value.indexOf(item.key)
    if (index > -1) {
      expandedSubMenus.value.splice(index, 1)
    } else {
      expandedSubMenus.value.push(item.key)
    }
    // 设置当前菜单为激活状态
    activeMenu.value = item.key
  } else {
    // 没有三级菜单，直接激活
    activeMenu.value = item.key
    activeSubMenu.value = ''
  }
}

// 处理三级菜单点击
const handleSubMenuClick = (parent, item) => {
  activeMenu.value = parent.key // 保持父菜单激活
  activeSubMenu.value = item.key
}

// 保存设置
const handleSave = async () => {
  try {
    loading.value = true

    // 根据当前激活的菜单保存对应的设置
    if (activeMenu.value === 'account') {
      const res = await updateAccountSettings(accountData.value)
      if (res.success) {
        MessagePlugin.success('账号设置保存成功')
      } else {
        MessagePlugin.error(res.message || '保存失败')
      }
    } else if (activeMenu.value === 'notification' || activeSubMenu.value.startsWith('notification-')) {
      const data = {
        ...notificationSettings.value,
        emailFrequency: emailFrequency.value
      }
      const res = await updateNotificationSettings(data)
      if (res.success) {
        MessagePlugin.success('通知设置保存成功')
      } else {
        MessagePlugin.error(res.message || '保存失败')
      }
    } else if (activeMenu.value.startsWith('system') || activeSubMenu.value.startsWith('system-')) {
      const res = await updateSystemSettings(systemSettings.value)
      if (res.success) {
        MessagePlugin.success('系统设置保存成功')
      } else {
        MessagePlugin.error(res.message || '保存失败')
      }
    } else if (activeMenu.value.startsWith('security')) {
      MessagePlugin.success('安全设置保存成功')
    } else {
      MessagePlugin.success('设置已保存')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    MessagePlugin.error('保存设置失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.settings-container {
  display: flex;
  height: calc(100vh - 64px - 12px);
  background: #f5f5f5;
  gap: 8px;

  // 左侧菜单
  .settings-sidebar {
    width: 260px;
    background: #fff;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      border-bottom: 1px solid #e7e7e7;
      background: #fff;
      color: #1f2329;

      .t-icon {
        color: #0052d9;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .settings-menu {
      flex: 1;
      overflow-y: auto;
      padding: 12px 8px;

      .menu-group {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .menu-group-title {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2329;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s;
          user-select: none;

          .expand-icon {
            margin-left: auto;
            color: #646a73;
            transition: transform 0.3s;
          }

          &:hover {
            background: #f5f7fa;
          }
        }

        .menu-group-content {
          padding-left: 12px;
          margin-top: 4px;

          .menu-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            margin-bottom: 2px;
            font-size: 13px;
            color: #646a73;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.3s;
            position: relative;

            .submenu-icon {
              margin-left: auto;
              color: #bbb;
              transition: transform 0.3s;
            }

            &:hover {
              background: #f5f7fa;
              color: #1f2329;
            }

            &.is-active {
              background: rgba(0, 82, 217, 0.1);
              color: #0052d9;
              font-weight: 500;

              .t-icon {
                color: #0052d9;
              }

              &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 60%;
                background: #0052d9;
                border-radius: 0 2px 2px 0;
              }
            }

            // 有三级菜单的二级菜单项，展开时的样式
            &.has-submenu.is-expanded {
              background: #f5f7fa;
              color: #1f2329;
              font-weight: 500;

              .submenu-icon {
                color: #0052d9;
              }
            }
          }

          .submenu-group {
            padding-left: 44px;
            margin-top: 0;
            margin-bottom: 4px;

            .submenu-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              margin-bottom: 2px;
              font-size: 12px;
              color: #8f959e;
              cursor: pointer;
              border-radius: 4px;
              transition: all 0.3s;

              .submenu-dot {
                width: 4px;
                height: 4px;
                background: #d0d0d0;
                border-radius: 50%;
                transition: all 0.3s;
              }

              &:hover {
                background: #f5f7fa;
                color: #646a73;

                .submenu-dot {
                  background: #646a73;
                }
              }

              &.is-active {
                background: rgba(0, 82, 217, 0.08);
                color: #0052d9;
                font-weight: 500;

                .submenu-dot {
                  background: #0052d9;
                  width: 6px;
                  height: 6px;
                }
              }
            }
          }
        }
      }
    }
  }

  // 右侧内容
  .settings-content {
    flex: 1;
    background: #fff;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .content-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid #e7e7e7;
      background: #fafafa;

      h2 {
        margin: 0 0 4px 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2329;
      }

      .content-desc {
        margin: 0;
        font-size: 13px;
        color: #646a73;
      }
    }

    .content-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;

      .setting-section {
        .setting-card {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 24px;

          .avatar-actions {
            .tip {
              margin: 8px 0 0 0;
              font-size: 12px;
              color: #8f959e;
            }
          }
        }

        .notification-item,
        .auth-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;

          .item-info {
            h4 {
              margin: 0 0 4px 0;
              font-size: 14px;
              font-weight: 500;
              color: #1f2329;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: #8f959e;
            }
          }
        }

        .theme-colors {
          display: flex;
          gap: 12px;

          .color-item {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;

            &:hover {
              transform: scale(1.1);
            }

            &.is-active {
              &::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #fff;
                font-size: 18px;
                font-weight: bold;
              }
            }
          }
        }
      }
    }
  }
}

// 展开动画
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
  max-height: 1000px;
  opacity: 1;
}
</style>
