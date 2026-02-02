<template>
  <div class="self-enterprises-shell">
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
      <div class="decoration-circle circle-4"></div>
      <div class="decoration-circle circle-5"></div>
      <div class="decoration-circle circle-6"></div>
    </div>
    <div class="center-card-wrapper">
      <div class="brand">
        <AppLogo :clickable="false" />
      </div>
      <div class="enterprise-card">
        <div class="card-header">
          <div class="header-left">
            <div class="header-title">进入企业</div>
            <div class="header-subtitle">我们将在企业中为您提供 Cooperise服务</div>
          </div>
          <div class="header-right">
            <a href="#" class="switch-account">切换账号</a>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else>
            <div v-if="companies.length === 0" class="empty">
              <div class="empty-message">您当前还没有企业</div>
              <div class="empty-actions">
                <t-button theme="primary" size="medium" @click="createEnterprise">创建新的企业</t-button>
              </div>
            </div>

            <div v-else>
              <div class="enterprise-list">
                <div
                  v-for="company in companies"
                  :key="company.id"
                  class="enterprise-row"
                  @click="openEnterprise(company)"
                >
                  <div class="avatar" :style="getAvatarStyle(company.company_name || company.id)">
                    <t-avatar v-if="company.icon" :image="company.icon" size="40" />
                    <div v-else class="avatar-initial">{{ ((company.company_name  || '未命名企业')).charAt(0) }}</div>
                  </div>
                  <div class="info">
                    <div class="name">{{ ((company.company_name  || '未命名企业'))}}</div>
                  </div>
                  <t-icon name="chevron-right" size="16px" />
                </div>
              </div>

              <div class="enterprise-add">
                <div class="enterprise-row add-row" @click="createEnterprise">
                  <div class="avatar add-avatar">
                    <t-icon name="add" size="16px" />
                  </div>
                  <div class="info">
                    <div class="name">创建新的企业</div>
                    <div class="meta">可用于企业、组织或团队</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import  { getEnterpriseInviteInfo} from '@/api/console/invite.js'
import  { getMyEnterpriseList} from '@/api/console/myenterprise.js'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const companies = ref([])
const loading = ref(false)

const loadCompaniesSimple = async () => {
  loading.value = true
  try {
    const res = await getMyEnterpriseList()
    const payload = res?.data ?? res
    const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
    companies.value = list.map(c => ({
      id: c.id,
      company_name: c.companyName|| '' ,
      company_code: c.companyCode || ''
    }))
  } catch (e) {
    console.error('加载企业列表失败:', e)
    companies.value = []
  } finally {
    loading.value = false
  }
}

const openEnterprise = (company) => {
  if (company?.id) {
    router.push(`/enterprise-admin/${company.id}`)
  }
}

const createEnterprise= () => {
  router.push('/enterprise/create')
}

onMounted(loadCompaniesSimple)

// avatar color helpers
const avatarColors = [
  ['#FCEFF6', '#F8EAF6'],
  ['#E8F8F5', '#DFF3EF'],
  ['#FFF7E6', '#FFF0D9'],
  ['#F3E8FF', '#EFE0FF'],
  ['#E8F1FF', '#DEE8FF'],
  ['#F7F9E8', '#F3F7DA'],
  ['#FDEFF2', '#FBEFF4'],
  ['#EFF8F6', '#E6F3F0']
]
const hashString = (str = '') => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
const getAvatarStyle = (key) => {
  const idx = hashString(String(key || '')) % avatarColors.length
  const c = avatarColors[idx]
  return {
    background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`,
    color: '#1f2329'
  }
}
</script>

<style scoped>
/* minimal styles copied from MyEnterprises.vue for list page */
.self-enterprises-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #e3e8ed 100%);
  padding: 56px 20px;
  font-family: "Google Sans", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #202124;
}
.center-card-wrapper {
  width: 422px;
  position: relative;
  z-index: 5;
  /* small vertical offset for balance */
  transform: translateY(-10px);
}
.brand {
  text-align: center;
  margin-bottom: 18px;
  margin-top: -44px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.brand :deep(.app-logo) {
  transform-origin: center;
  transform: scale(1.5);
}
.enterprise-card {
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e8e9eb;
  width: 422px;
  height: 600px;
  min-width: 422px;
  min-height: 600px;
  overflow: hidden;
  box-sizing: border-box;
  margin-top: 60px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 20px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.header-left {
  flex: 1;
}
.header-title {
  font-size: 23px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 4px;
}
.header-subtitle {
  font-size: 14px;
  color: #9aa0a6; /* 浅灰色 */
}
.header-right {
  margin-left: 16px;
}
.switch-account {
  font-size: 14px;
  color: #1a73e8;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.switch-account:hover {
  color: #1557b0;
  text-decoration: underline;
}
.card-body {
  padding: 16px 20px 20px;
}
.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Fixed max-height to fit 5 full rows */
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
  width: 100%;
}
.enterprise-add {
  margin-top: 16px;
  width: 100%;
}
.enterprise-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: transparent;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.enterprise-row:hover {
  background-color: #f7f8fa;
}
.enterprise-row.add-row {
  border: 1px dashed #e0e0e0;
  margin-top: 8px;
  padding: 16px 20px;
}
.enterprise-row.add-row:hover {
  background-color: #f0f7ff;
  border-color: #d6e4ff;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(16,24,40,0.04) inset;
  flex-shrink: 0;
}
.avatar-initial {
  font-weight: 600;
  color: #202124;
  font-size: 16px;
}
.add-avatar {
  background: transparent;
  border: 1px dashed #e0e0e0;
  color: #1a73e8;
}
.enterprise-row.add-row .add-avatar {
  border: none;
  background-color: #f0f7ff;
  color: #1a73e8;
}
.info {
  flex: 1;
  min-width: 0;
}
.name {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  font-size: 12px;
  color: #9aa0a6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.loading {
  text-align: center;
  padding: 40px 20px;
  color: #9aa0a6;
  font-size: 14px;
}
.empty {
  text-align: center;
  padding: 40px 20px;
}
.empty-message {
  font-size: 16px;
  color: #202124;
  margin-bottom: 20px;
}
.empty-actions {
  display: flex;
  justify-content: center;
}
/* 滚动条样式 */
.enterprise-list::-webkit-scrollbar {
  width: 6px;
}
.enterprise-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.enterprise-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.enterprise-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 背景装饰样式 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.08) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(96, 168, 255, 0.06) 0%, transparent 70%);
  bottom: -80px;
  left: -80px;
  animation: float 10s ease-in-out infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(47, 120, 230, 0.05) 0%, transparent 70%);
  top: 50%;
  left: 10%;
  animation: float 12s ease-in-out infinite;
}

.circle-4 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.04) 0%, transparent 70%);
  top: 20%;
  right: 15%;
  animation: float 9s ease-in-out infinite reverse;
}

.circle-5 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(96, 168, 255, 0.05) 0%, transparent 70%);
  bottom: 30%;
  right: 25%;
  animation: float 11s ease-in-out infinite;
}

.circle-6 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(47, 120, 230, 0.06) 0%, transparent 70%);
  top: 40%;
  left: 30%;
  animation: float 7s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}
</style>


