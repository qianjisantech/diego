<template>
  <div class="self-enterprises-shell">
    <div class="center-card-wrapper" :class="{ 'create-visible': showCreateForm }">
      <div class="brand">
        <AppLogo :clickable="false" />
      </div>
      <t-card class="enterprise-card" shadow="always">
        <div class="card-header">
          <div v-if="!showCreateForm">
            <div class="header-title">进入企业</div>
            <div class="header-subtitle">选择已有企业或创建新的企业开始使用</div>
          </div>
          <div v-if="!showCreateForm" class="header-action" @click="switchAccount">切换账号</div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else>
            <template v-if="!showCreateForm">
              <div v-if="companies.length === 0" class="empty">
                <div class="empty-message">您当前还没有企业</div>
                <div class="empty-actions">
                  <t-button theme="primary" size="medium" @click="createCompany">创建新的企业</t-button>
                </div>
              </div>

              <div v-else class="enterprise-list">
                <div
                  v-for="company in companies"
                  :key="company.id"
                  class="enterprise-row"
                  @click="openEnterprise(company)"
                >
                  <div class="avatar">
                    <t-avatar v-if="company.icon" :image="company.icon" size="40" />
                    <div v-else class="avatar-initial">{{ ((company.company_name  || '未命名企业')).charAt(0) }}</div>
                  </div>
                  <div class="info">
                    <div class="name">{{ ((company.company_name  || '未命名企业'))}}</div>
                  </div>
                  <t-icon name="chevron-right" size="18px" />
                </div>

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
            </template>

            <template v-else>
              <div class="create-form no-panel">
                <div class="form-row form-top">
                  <div class="create-title">输入团队或企业名称</div>
                </div>

                <div class="form-row">
                  <label class="field-label">企业名称</label>
                  <t-input v-model="form.company_name" placeholder="企业名称" />
                </div>

                <div class="form-row">
                  <label class="field-label">请选择行业</label>
                  <t-cascader
                    v-model="industryValues"
                    :options="industryOptions"
                    placeholder="请选择行业"
                    clearable
                    @change="onIndustryChange"
                  />
                </div>

                <div class="form-row">
                  <label class="field-label">公司规模</label>
                  <t-select v-model="form.company_size" :options="[{label:'1 ~ 10 人',value:'1-10'},{label:'11 ~ 50 人',value:'11-50'},{label:'50 人以上',value:'50+'}]" />
                </div>

                <div class="form-row form-actions">
                  <div class="actions-left">
                    <t-button theme="default" variant="outline" @click="cancelCreateForm">返回</t-button>
                  </div>
                  <div class="actions-right">
                    <t-button theme="primary" :loading="submitting" @click="submitCreate">完成创建</t-button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getSelfCompanies, createCompany as apiCreateCompany } from '@/api/company.js'
import AppLogo from '@/components/AppLogo.vue'
const router = useRouter()
const route = useRoute()

const companies = ref([])
const loading = ref(false)
const showCreateForm = ref(false)
const submitting = ref(false)
const form = ref({
  company_name: '',
  company_code: '',
  industry: '',   //行业
  company_size: '1-10'
})

// 行业联级数据（常见行业及子类示例）
const industryOptions = ref([
  {
    label: '互联网/信息技术',
    value: 'internet',
    children: [
      { label: '计算机软件', value: 'internet_software' },
      { label: '硬件设施服务', value: 'internet_hardware_service' },
      { label: '电子商务', value: 'internet_ecommerce' },
      { label: '移动互联网', value: 'internet_mobile' },
      { label: '社交/媒体', value: 'internet_social' },
      { label: '搜索/广告', value: 'internet_ad' }
    ]
  },
  {
    label: '教育/培训',
    value: 'education',
    children: [
      { label: '学前教育', value: 'education_preschool' },
      { label: 'K12教育', value: 'education_k12' },
      { label: '职业培训', value: 'education_vocational' },
      { label: '在线教育', value: 'education_online' }
    ]
  },
  {
    label: '制造业',
    value: 'manufacturing',
    children: [
      { label: '电子制造', value: 'manufacturing_electronics' },
      { label: '机械/重工', value: 'manufacturing_heavy' },
      { label: '家电/数码', value: 'manufacturing_appliances' },
      { label: '工业零部件', value: 'manufacturing_parts' }
    ]
  },
  {
    label: '贸易/批发/零售',
    value: 'trade',
    children: [
      { label: '批发', value: 'trade_wholesale' },
      { label: '零售/商超', value: 'trade_retail' },
      { label: '跨境电商', value: 'trade_crossborder' }
    ]
  },
  {
    label: '房地产/建筑',
    value: 'real_estate',
    children: [
      { label: '房地产开发', value: 'real_estate_develop' },
      { label: '建筑设计', value: 'construction_design' },
      { label: '建材', value: 'construction_material' }
    ]
  },
  {
    label: '金融',
    value: 'finance',
    children: [
      { label: '银行', value: 'finance_bank' },
      { label: '保险', value: 'finance_insurance' },
      { label: '证券/投资', value: 'finance_securities' },
      { label: '基金/理财', value: 'finance_fund' }
    ]
  },
  {
    label: '物流/运输/仓储',
    value: 'logistics',
    children: [
      { label: '快递/同城配送', value: 'logistics_express' },
      { label: '供应链/仓储', value: 'logistics_warehouse' },
      { label: '货运/运输', value: 'logistics_transport' }
    ]
  },
  {
    label: '餐饮/酒店/旅游',
    value: 'hospitality',
    children: [
      { label: '餐饮', value: 'hospitality_catering' },
      { label: '酒店/住宿', value: 'hospitality_hotel' },
      { label: '旅游/景区', value: 'hospitality_travel' }
    ]
  },
  {
    label: '医疗/健康',
    value: 'health',
    children: [
      { label: '医疗机构', value: 'health_medical' },
      { label: '医疗器械', value: 'health_device' },
      { label: '医药/制药', value: 'health_pharma' }
    ]
  },
  {
    label: '传媒/娱乐/文体',
    value: 'media',
    children: [
      { label: '影视/娱乐', value: 'media_film' },
      { label: '游戏', value: 'media_game' },
      { label: '新闻/出版', value: 'media_news' }
    ]
  },
  {
    label: '能源/环境/农业',
    value: 'energy',
    children: [
      { label: '新能源', value: 'energy_new' },
      { label: '传统能源', value: 'energy_traditional' },
      { label: '农业', value: 'agriculture' }
    ]
  },
  {
    label: '企业服务/软件/咨询',
    value: 'enterprise_service',
    children: [
      { label: '咨询/顾问', value: 'service_consulting' },
      { label: '人力资源', value: 'service_hr' },
      { label: '财务/法务', value: 'service_finance' }
    ]
  }
])

// cascader state: selected values path (array)
const industryValues = ref([])

// find label by value
const findLabelByValue = (value, options) => {
  for (const opt of options) {
    if (opt.value === value) return opt.label
    if (opt.children) {
      const child = findLabelByValue(value, opt.children)
      if (child) return child
    }
  }
  return null
}

const onIndustryChange = (val) => {
  if (!val) {
    form.value.industry = ''
    return
  }
  const values = Array.isArray(val) ? val : [val]
  if (values.length === 0) {
    form.value.industry = ''
    return
  }
  // Send the selected value path (joined by '|') to backend
  form.value.industry = values.join('|')
}

const openEnterprise = (company) => {
  if (company?.id) {
    router.push(`/enterprise-admin/${company.id}`)
  }
}

const openCreateForm = () => {
  showCreateForm.value = true
}

const cancelCreateForm = () => {
  router.push('/self/enterprise')
}

const createCompany = () => {
  // navigate to create route which shows the inline create card
  router.push('/self/enterprise/create')
}

// keep showCreateForm in sync with route
watch(() => route.path, (p) => {
  showCreateForm.value = p === '/self/enterprise/create'
}, { immediate: true })

const submitCreate = async () => {
  if (!form.value.company_name) {
    await MessagePlugin.warning('请输入企业名称')
    return
  }
  submitting.value = true
  try {
    const payload = {
      company_name: form.value.company_name,
      company_code: form.value.company_code || undefined,
      industry: form.value.industry || undefined,
      company_size: form.value.company_size || undefined
    }
    const res = await apiCreateCompany(payload)
    if (res && (res.success || res.code === 200)) {
      await MessagePlugin.success('创建成功')
      const newId = res.data?.id || res.data?.company?.id
      if (newId) {
        await router.push(`/enterprise-admin/${newId}`)
        return
      }
      // reload list and return
      await loadCompaniesSimple()
      showCreateForm.value = false
    } else {
      await MessagePlugin.error(res?.message || '创建失败')
    }
  } catch (error) {
    console.error('创建企业失败:', error)
    await MessagePlugin.error('创建企业失败，请重试')
  } finally {
    submitting.value = false
  }
}
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
    console.log('JSON.stringify(company)',JSON.stringify( companies.value))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('加载企业列表失败:', e)
    companies.value = []
  } finally {
    loading.value = false
  }
}
onMounted(() => {

  loadCompaniesSimple()
})
</script>

<style scoped>
.self-enterprises-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  /* stronger background: vivid radial accents + pronounced vertical gradient */
  background:
    radial-gradient(circle at 80% 18%, rgba(64,144,255,0.18) 0%, rgba(64,144,255,0.08) 18%, rgba(255,255,255,0) 40%),
    radial-gradient(circle at 10% 78%, rgba(255,120,90,0.10) 0%, rgba(255,120,90,0.03) 18%, rgba(255,255,255,0) 40%),
    linear-gradient(180deg, #f2f9ff 0%, #e6f2ff 35%, #eef8ff 65%, #fbfdff 100%);
  padding: 56px 20px;
}

/* large soft circle on the right (decorative) */
.self-enterprises-shell::after {
  content: "";
  position: absolute;
  right: -80px;
  top: 8%;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, rgba(64,144,255,0.20) 0%, rgba(64,144,255,0.06) 40%, rgba(64,144,255,0.02) 60%, rgba(255,255,255,0) 100%);
  filter: blur(36px);
  transform: translateZ(0);
  pointer-events: none;
  z-index: 0;
}
.center-card-wrapper {
  width: 460px;
  position: relative;
  z-index: 5; /* sit above decorative background */
  /* raise the card slightly above vertical center */
  /* move card up by additional 100px (was 150px) to shift page down 50px */
  transform: translateY(calc(-4vh - 100px));
  -webkit-transform: translateY(calc(-4vh - 100px));
}
/* when create form is visible, move card down by 0px relative to default (was 50px) */
.center-card-wrapper.create-visible {
  /* adjust: move the create page down by 100px relative to previous value */
  transform: translateY(calc(-4vh - 100px)) !important;
  -webkit-transform: translateY(calc(-4vh - 100px)) !important;
}
.brand {
  text-align: center;
  margin-bottom: 18px;
}
.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  margin: 0 auto 8px;
  padding: 6px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00a8ff, #6ec1ff);
  color: #fff;
  box-shadow: 0 6px 18px rgba(16,36,66,0.08);
}
/* enlarge AppLogo mark and text when used inside brand-logo */
.brand-logo :deep(.app-logo) > svg:first-child {
  width: 140px;
  height: 140px;
}
.brand-logo :deep(.logo-text-svg) {
  transform: scale(1.6);
  transform-origin: left center;
  display: inline-block;
  margin-left: 12px;
}
.brand-title {
  font-size: 34px;
  font-weight: 700;
  color: #048bff;
  letter-spacing: 0.02em;
}
.brand-subtitle {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 4px;
}
.enterprise-card {
  border-radius: 18px;
  padding: 18px 18px 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,252,255,0.95));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 12px 30px rgba(16,36,66,0.08);
  border: 1px solid rgba(226,233,245,0.8);
  min-width: 420px;
  min-height: 420px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px 14px;
  border-bottom: 1px solid rgba(230,236,246,0.6);
  gap: 12px;
}
.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1724;
}
.header-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
.header-action {
  font-size: 13px;
  color: #0052d9;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.18s ease;
}
.header-action:hover {
  background: rgba(0,82,217,0.06);
}
.card-body {
  padding: 8px 4px 12px 4px;
}
.loading,
.empty {
  padding: 24px;
  text-align: center;
  color: #888;
}
.empty-message {
  font-size: 16px;
  color: #5a6472;
  margin-bottom: 12px;
}
.empty-actions {
  display: flex;
  justify-content: center;
}
.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 4px;
}
.enterprise-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(248,250,255,0.6));
  box-shadow: 0 3px 10px rgba(16,36,66,0.04);
}
.enterprise-row:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 26px rgba(16,36,66,0.08);
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(244,248,255,0.9));
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,#f3f6fb,#eaf2ff);
  color: #fff;
  flex-shrink: 0;
  box-shadow: inset 0 -6px 12px rgba(0,0,0,0.03);
}
.avatar-initial {
  font-weight: 800;
  color: #0f1724;
  font-size: 18px;
}
.add-avatar {
  background: transparent;
  border: 1px dashed #e6e6e6;
  color: #007aff;
}
.enterprise-row.add-row {
  background: linear-gradient(90deg, rgba(96,168,255,0.08), rgba(255,179,208,0.04));
  border: 1px dashed rgba(96,120,160,0.12);
  cursor: pointer;
  padding: 6px 12px;
  align-items: center;
}
.enterprise-row.add-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16,36,66,0.06);
}
.enterprise-row.add-row .avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg,#fff,#f5f7fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f78e6;
  border: none;
}
.enterprise-row.add-row .name {
  color: #0f1724;
  font-weight: 700;
}
.enterprise-row.add-row .meta {
  color: #64748b;
  font-size: 12px;
  margin-top: 6px;
}
.create-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px 16px 16px;
}
.create-form.no-panel {
  padding: 8px 4px;
  gap: 16px;
  background: transparent;
}
.create-form.no-panel .form-top {
  padding-bottom: 0;
  border-bottom: none;
}
.create-form.no-panel .form-actions {
  margin-top: 4px;
}
.form-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.create-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f1724;
  margin-left: 8px;
  letter-spacing: -0.025em;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-row label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}
.form-top :deep(.t-button) {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.06);
  background: #fff;
  box-shadow: 0 2px 6px rgba(16,36,66,0.06);
}




.form-row :deep(.t-input__wrap):focus-within,
.form-row :deep(.t-select__wrap):focus-within,
.form-row :deep(.t-cascader__wrap):focus-within {
  border-color: rgba(0,82,217,0.28);
  box-shadow: 0 12px 30px rgba(16,36,66,0.08);
}
.form-row :deep(.t-input__inner),
.form-row :deep(.t-select__inner),
.form-row :deep(.t-input__inner) input,
.form-row :deep(.t-select__inner) input {
  padding: 0;
  background: transparent;
  font-size: 15px;
  color: #1f2937;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
.form-row :deep(.t-input__inner):focus,
.form-row :deep(.t-select__inner):focus,
.form-row :deep(.t-input__inner) input:focus,
.form-row :deep(.t-select__inner) input:focus {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
.form-row :deep(.t-input__inner)::placeholder,
.form-row :deep(.t-select__inner)::placeholder {
  color: #9ca3af;
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 12px;
  align-items: center;
}
.form-actions .actions-left,
.form-actions .actions-right {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.form-actions :deep(.t-button) {
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  min-width: 100px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16,36,66,0.08);
}
.form-actions :deep(.t-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16,36,66,0.12);
}
.form-actions :deep(.t-button--primary) {
  background: linear-gradient(90deg,#0099ff,#048bff);
  border: none;
  color: #fff;
  min-width: 140px;
}
.form-actions :deep(.t-button--default) {
  background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(248,250,255,0.6));
  border: 1px solid rgba(226,233,245,0.8);
  color: #64748b;
}

.form-row.form-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  width: 100%;
}
.form-actions .actions-left {
  margin-right: auto;
}
.form-actions .actions-right {
  margin-left: auto;
}

.info {
  flex: 1;
  min-width: 0;
}
.name {
  font-weight: 600;
  color: #1f2329;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.add-row {
  margin-top: 6px;
  color: #007aff;
}
</style>
