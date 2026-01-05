<template>
  <div class="account-settings-page">
    <div class="settings-content">
        <!-- 基本信息 -->
        <t-card title="基本信息" class="setting-card">
          <t-form label-align="left" label-width="100px">
            <t-form-item label="用户名">
              <t-input v-model="accountData.username" placeholder="请输入用户名" />
            </t-form-item>
            <t-form-item label="邮箱">
              <t-input v-model="accountData.email" disabled />
            </t-form-item>
            <t-form-item label="手机号">
              <t-input v-model="accountData.phone" placeholder="请输入手机号" />
            </t-form-item>
          </t-form>
        </t-card>

        <!-- 头像设置 -->
        <t-card title="头像设置" class="setting-card">
          <div class="avatar-section">
            <t-avatar size="80px" :image="accountData.avatar">
              {{ accountData.user_code ? accountData.user_code.charAt(0) : accountData.username?.charAt(0) || 'A' }}
            </t-avatar>
            <div class="avatar-actions">
              <t-button theme="primary" variant="outline" @click="handleChangeAvatar">更换头像</t-button>
              <p class="tip">支持JPG、PNG格式，大小不超过2MB</p>
            </div>
          </div>
        </t-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <t-space>
            <t-button theme="primary" @click="handleSave" :loading="loading">
              <template #icon>
                <t-icon name="check" />
              </template>
              保存设置
            </t-button>
            <t-button theme="default" variant="outline" @click="handleReset">
              <template #icon>
                <t-icon name="refresh" />
              </template>
              重置
            </t-button>
          </t-space>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getUserSettings, updateAccountSettings } from '@/api/settings.js'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(false)

// 用户账号数据
const accountData = ref({
  user_code: '',
  username: '',
  email: '',
  phone: '',
  avatar: ''
})

// 初始数据（用于重置）
const initialData = ref({
  user_code: '',
  username: '',
  email: '',
  phone: '',
  avatar: ''
})

// 获取用户设置数据
const fetchUserSettings = async () => {
  try {
    loading.value = true
    const res = await getUserSettings()
    if (res.success) {
      // 账号设置
      if (res.data.account) {
        accountData.value = { ...res.data.account }
        initialData.value = { ...res.data.account }
      } else {
        // 如果没有返回账号数据，使用 userStore 中的数据
        const userInfo = userStore.userInfo
        accountData.value = {
          user_code: userInfo?.user_code || userInfo?.userCode || '',
          username: userInfo?.username || userInfo?.name || '',
          email: userInfo?.email || '',
          phone: userInfo?.phone || '',
          avatar: userInfo?.avatar || ''
        }
        initialData.value = { ...accountData.value }
      }
    } else {
      // 如果接口失败，使用 userStore 中的数据
      const userInfo = userStore.userInfo
      accountData.value = {
        user_code: userInfo?.user_code || userInfo?.userCode || '',
        username: userInfo?.username || userInfo?.name || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        avatar: userInfo?.avatar || ''
      }
      initialData.value = { ...accountData.value }
    }
  } catch (error) {
    console.error('获取设置失败:', error)
    // 如果接口失败，使用 userStore 中的数据
    const userInfo = userStore.userInfo
    accountData.value = {
      user_code: userInfo?.user_code || userInfo?.userCode || '',
      username: userInfo?.username || userInfo?.name || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      avatar: userInfo?.avatar || ''
    }
    initialData.value = { ...accountData.value }
  } finally {
    loading.value = false
  }
}

// 保存设置
const handleSave = async () => {
  try {
    loading.value = true
    const res = await updateAccountSettings(accountData.value)
    if (res.success) {
      await MessagePlugin.success('账号设置保存成功')
      // 更新 userStore 中的用户信息
      if (userStore.userInfo) {
        userStore.userInfo.username = accountData.value.username
        userStore.userInfo.phone = accountData.value.phone
        userStore.userInfo.avatar = accountData.value.avatar
      }
      // 更新初始数据
      initialData.value = { ...accountData.value }
    } else {
      await MessagePlugin.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    await MessagePlugin.error('保存设置失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  accountData.value = { ...initialData.value }
  MessagePlugin.info('已重置为原始数据')
}

// 更换头像
const handleChangeAvatar = () => {
  MessagePlugin.info('更换头像功能开发中')
}

onMounted(() => {
  fetchUserSettings()
})
</script>

<style scoped lang="scss">
.account-settings-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 32px;
}

.settings-content {
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

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;

  .avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .tip {
      font-size: 12px;
      color: #86909c;
      margin: 0;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
</style>

