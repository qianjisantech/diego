<template>
  <div class="self-enterprises-shell">
    <div class="center-card-wrapper">
      <div class="brand">
        <AppLogo :clickable="false" />
      </div>
      <t-card class="enterprise-card" shadow="always">
            <div class="card-header">
          <div>
            <div class="header-title">进入企业</div>
            <div class="header-subtitle">我们将在企业中为您提供 Cooperise服务</div>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else>
            <div v-if="companies.length === 0" class="empty">
              <div class="empty-message">您当前还没有企业</div>
              <div class="empty-actions">
                <t-button theme="primary" size="medium" @click="createCompany">创建新的企业</t-button>
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
                    <t-avatar v-if="company.icon" :image="company.icon" size="50" />
                    <div v-else class="avatar-initial">{{ ((company.company_name  || '未命名企业')).charAt(0) }}</div>
                  </div>
                  <div class="info">
                    <div class="name">{{ ((company.company_name  || '未命名企业'))}}</div>
                  </div>
                  <t-icon name="chevron-right" size="18px" />
                </div>
              </div>

              <div class="enterprise-add">
                <div class="enterprise-row add-row" @click="createCompany">
                  <div class="avatar add-avatar">
                    <t-icon name="add" size="18px" />
                  </div>
                  <div class="info">
                    <div class="name">创建新的企业</div>
                    <div class="meta">可申请企业，邀请成员加入</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getSelfCompanies } from '@/api/company.js'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const companies = ref([])
const loading = ref(false)

const loadCompaniesSimple = async () => {
  loading.value = true
  try {
    const res = await getSelfCompanies()
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

const createCompany = () => {
  router.push('/self/enterprise/create')
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
/* minimal styles copied from SelfEnterprises.vue for list page */
.self-enterprises-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f7fbff 0%, #eef7ff 100%);
  padding: 56px 20px;
  font-family: "Google Sans", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #202124;
}
.center-card-wrapper {
  width: 422px;
  position: relative;
  z-index: 5;
  /* small vertical offset for balance */
  transform: translateY(-30px);
}
.brand {
  text-align: center;
  margin-bottom: 18px;
  margin-top: -44px;
}
.brand :deep(.app-logo) {
  transform-origin: center;
  transform: scale(0.67);
}
.enterprise-card {
  border-radius: 32px;
  padding: 12px;
  background: #ffffff;
  /* stronger black background shadow and rounded corners */
  box-shadow: 0 30px 80px rgba(0,0,0,0.45), 0 12px 36px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.18);
  border: none;
  width: 432px;
  height: 675px;
  min-width: 432px;
  min-height: 675px;
  overflow: hidden;
  box-sizing: border-box;
}
.card-body {
  padding: 12px 8px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 6px;
}
.header-subtitle {
  font-size: 13px;
  color: #9aa0a6; /* 浅灰色 */
}
.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* align list content left with header text; reduce container padding */
  padding: 4px 2px 4px 8px;
  /* Fixed max-height to fit 5 full rows */
  max-height: 500px;
  overflow-y: auto;
  margin: 0;
  width: 100%;
}
.enterprise-add {
  margin-top: 12px;
  padding: 8px 4px;
  max-width: 400px;

}
.enterprise-row {
  display: flex;
  align-items: center;
  gap: 12px;
  /* fixed height equal to avatar (50px) */
  height: 50px;
  /* remove left padding so avatar lines up with header text */

  border-radius: 10px;
  background: transparent;
  transition: box-shadow .18s ease, transform .12s ease;

}
.enterprise-row:hover {
  /* hover effect removed per design: no transform or shadow */
  transform: none;
  box-shadow: none;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 6px rgba(16,24,40,0.04) inset;
}
.avatar-initial {
  font-weight: 700;
  color: #202124;
  font-size: 18px;
}
.add-avatar {
  background: transparent;
  border: 1px dashed rgba(60,64,67,0.08);
  color: #1a73e8;
}
</style>


