<template>
  <div class="preference-settings-page">
    <!-- 使用原先的设置组件，但只显示偏好设置相关内容 -->
    <div class="settings-content-wrapper">
      <div class="content-header">
        <div>
          <h2>偏好设置</h2>
          <p class="content-desc">管理系统通知、系统设置和安全选项</p>
        </div>
        <t-button theme="primary" @click="handleSave" :loading="loading">
          <template #icon>
            <t-icon name="check" />
          </template>
          保存设置
        </t-button>
      </div>

      <div class="content-body">
        <!-- 通知设置 -->
        <div class="setting-section">
          <t-card title="通知设置" class="setting-card">
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
                <h4>公告通知</h4>
                <p>当有新的系统公告时接收通知</p>
              </div>
              <t-switch v-model="notificationSettings.announcement" />
            </div>
          </t-card>

          <t-card title="邮件通知频率" class="setting-card">
            <t-radio-group v-model="emailFrequency">
              <t-radio value="realtime">实时通知</t-radio>
              <t-radio value="daily">每日汇总</t-radio>
              <t-radio value="weekly">每周汇总</t-radio>
              <t-radio value="never">不接收</t-radio>
            </t-radio-group>
            <p class="tip">邮件通知仅在紧急情况下发送</p>
          </t-card>
        </div>

        <!-- 系统设置 -->
        <div class="setting-section">
          <t-card title="系统设置" class="setting-card">
            <t-form label-align="left" label-width="120px">
              <t-form-item label="显示语言">
                <t-select v-model="systemSettings.language" style="width: 200px">
                  <t-option value="zh-CN" label="简体中文" />
                  <t-option value="en-US" label="English" />
                </t-select>
              </t-form-item>
              <t-form-item label="时区">
                <t-select v-model="systemSettings.timezone" style="width: 200px">
                  <t-option value="Asia/Shanghai" label="中国标准时间 (UTC+8)" />
                  <t-option value="America/New_York" label="美国东部时间 (UTC-5)" />
                </t-select>
              </t-form-item>
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
          </t-card>
        </div>

        <!-- 安全设置 -->
        <div class="setting-section">
          <t-card title="安全设置" class="setting-card">
            <t-form label-align="left" label-width="120px">
              <t-form-item label="当前密码">
                <t-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" style="width: 300px" />
              </t-form-item>
              <t-form-item label="新密码">
                <t-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" style="width: 300px" />
              </t-form-item>
              <t-form-item label="确认密码">
                <t-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" style="width: 300px" />
              </t-form-item>
              <t-form-item>
                <t-button theme="primary" @click="handleChangePassword" :loading="passwordLoading">
                  修改密码
                </t-button>
              </t-form-item>
            </t-form>
          </t-card>

          <t-card title="登录日志" class="setting-card">
            <t-table
              :data="loginLogs"
              :columns="logColumns"
              :loading="loading"
              row-key="id"
              stripe
              hover
            />
          </t-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getUserSettings, updateNotificationSettings, updateSystemSettings, updatePassword, getLoginLogs } from '@/api/settings.js'

const loading = ref(false)
const passwordLoading = ref(false)

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

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

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
      // 通知设置
      if (res.data.notification) {
        notificationSettings.value = res.data.notification
        emailFrequency.value = res.data.notification.emailFrequency || 'realtime'
      }
      // 系统设置
      if (res.data.system) {
        systemSettings.value = res.data.system
      }
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
      loginLogs.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取登录日志失败:', error)
  }
}

// 保存设置
const handleSave = async () => {
  try {
    loading.value = true

    // 保存通知设置
    const notificationData = {
      ...notificationSettings.value,
      emailFrequency: emailFrequency.value
    }
    const notificationRes = await updateNotificationSettings(notificationData)
    if (!notificationRes.success) {
      await MessagePlugin.error(notificationRes.message || '保存通知设置失败')
      return
    }

    // 保存系统设置
    const systemRes = await updateSystemSettings(systemSettings.value)
    if (!systemRes.success) {
      await MessagePlugin.error(systemRes.message || '保存系统设置失败')
      return
    }

    await MessagePlugin.success('偏好设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    await MessagePlugin.error('保存设置失败，请重试')
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    MessagePlugin.warning('请填写完整信息')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    MessagePlugin.warning('两次输入的密码不一致')
    return
  }

  try {
    passwordLoading.value = true
    const res = await updatePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    if (res.success) {
      await MessagePlugin.success('密码修改成功')
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      await MessagePlugin.error(res.message || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    await MessagePlugin.error('修改密码失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  fetchUserSettings()
  fetchLoginLogs()
})
</script>

<style scoped lang="scss">
.preference-settings-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 32px;
}

.settings-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2329;
    margin: 0 0 4px 0;
  }

  .content-desc {
    font-size: 14px;
    color: #86909c;
    margin: 0;
  }
}

.content-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);

  :deep(.t-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
  }

  :deep(.t-card__body) {
    padding: 24px;
  }
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;

  .item-info {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: 500;
      color: #1f2329;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 12px;
      color: #86909c;
      margin: 0;
    }
  }
}

.tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 12px;
}

.theme-colors {
  display: flex;
  gap: 12px;
  align-items: center;

  .color-item {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;

    &:hover {
      transform: scale(1.1);
    }

    &.is-active {
      border-color: #0052d9;
      box-shadow: 0 0 0 2px rgba(0, 82, 217, 0.2);
    }
  }
}
</style>



















