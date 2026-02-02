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
    <div class="center-card-wrapper create-visible">
      <div class="brand">
        <AppLogo :clickable="false" />
      </div>
      <div class="enterprise-card">
        <div class="card-header">
          <div class="header-left">
            <div class="header-title">创建企业</div>
            <div class="header-subtitle">创建一个新的企业或团队</div>
          </div>
        </div>
        <div class="card-body">
          <div class="create-form no-panel">
            <div class="form-row">
              <label class="field-label">企业名称</label>
              <t-input v-model="form.name" placeholder="请输入企业名称" />
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
              <t-select v-model="form.size" :options="[{label:'1 ~ 10 人',value:'1-10'},{label:'11 ~ 50 人',value:'11-50'},{label:'50 人以上',value:'50+'}]" />
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import {createMyEnterprise} from '@/api/console/myenterprise.js'
import AppLogo from '@/components/AppLogo.vue'

const router = useRouter()
const submitting = ref(false)
const form = ref({
  name: '',
  code: '',
  industry: '',
  size: '1-10'
})
const industryValues = ref([])
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

const onIndustryChange = (val) => {
  const values = Array.isArray(val) ? val : [val]
  form.value.industry = values.length ? values.join('|') : ''
}

const cancelCreateForm = () => {
  router.push('/enterprise/my-list')
}

const submitCreate = async () => {
  if (!form.value.name) {
    await MessagePlugin.warning('请输入企业名称')
    return
  }
  if (!form.value.industry) {
    await MessagePlugin.warning('请选择行业')
    return
  }
  if (!form.value.size) {
    await MessagePlugin.warning('请选择公司规模')
    return
  }
  submitting.value = true
  try {
    const payload = {
      name: form.value.name,
      industry: form.value.industry || undefined,
      size: form.value.size || undefined
    }
    const res = await createMyEnterprise(payload)
    if (res && (res.success)) {
      await router.push('/workspace')
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
</script>

<style scoped>
/* reuse compact create form styles */
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
.center-card-wrapper.create-visible {
  transform: translateY(-10px) !important;
  width: 422px;
  position: relative;
  z-index: 5;
  margin: 0 auto;
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
  padding: 20px;
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
  color: #9aa0a6;
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
.create-form {
  display:flex;
  flex-direction:column;
  gap:12px;
  max-width:380px;
  margin:0 auto;
}
.form-row { display:flex; flex-direction:column; gap:6px; }
.form-actions { display:flex; gap:8px; justify-content:space-between; margin-top:8px; align-items:center; }
.form-row.form-actions {
  /* Ensure actions row is horizontal and buttons aligned */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
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


