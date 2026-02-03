<template>
  <div class="enterprise-info-page">
    <t-card :bordered="false" class="info-card">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        
        <t-form
          ref="formRef"
          :data="formData"
          :rules="formRules"
          label-width="120px"
          class="form-content"
        >
          <!-- 企业名称 -->
          <t-form-item label="企业名称" name="enterpriseName">
            <t-input
              v-model="formData.enterpriseName"
              placeholder="请输入企业名称"
              :maxlength="50"
              clearable
              style="width: 400px"
            />
          </t-form-item>

          <!-- 企业简称 -->
          <t-form-item label="企业简称" name="shortName">
            <t-input
              v-model="formData.shortName"
              placeholder="请输入企业简称"
              :maxlength="20"
              clearable
              style="width: 400px"
            />
          </t-form-item>

          <!-- 企业编码 -->
          <t-form-item label="企业编码" name="enterpriseCode">
            <t-input
              v-model="formData.enterpriseCode"
              placeholder="企业编码"
              :maxlength="30"
              clearable
              :disabled="true"
              style="width: 400px"
            />
          </t-form-item>



          <!-- 企业描述 -->
          <t-form-item label="企业描述" name="description">
            <t-textarea
              v-model="formData.description"
              placeholder="介绍一下这个企业"
              :maxlength="500"
              :autosize="{ minRows: 3, maxRows: 5 }"
              clearable
              style="width: 400px"
            />
          </t-form-item>





          <!-- 确定按钮 -->
          <t-form-item>
            <t-button theme="primary" @click="handleSave">
              保存
            </t-button>
          </t-form-item>
        </t-form>
      </div>

      <!-- 更多操作 -->
      <div class="info-section">
        <h3 class="section-title">更多操作</h3>
        
        <div class="operation-content">
          <!-- 企业归属 -->
          <div class="operation-item">
            <div class="operation-label">企业归属</div>
            <t-button theme="default" @click="handleTransfer">
              移交
            </t-button>
          </div>

          <!-- 删除企业 -->
          <div class="operation-item">
            <div class="operation-label">删除企业</div>
            <div class="delete-warning">
              一旦你删除了企业，企业内所有项目、部门、成员，项目中所有内容以及所关联的所思文档都将会被永久删除。这是一个不可恢复的操作，请谨慎对待！
            </div>
            <t-button theme="danger" @click="handleDelete">
              删除企业
            </t-button>
          </div>
        </div>
      </div>

    </t-card>

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="deleteDialogVisible"
      header="确认删除企业"
      :confirm-btn="{ content: '确认删除', theme: 'danger' }"
      :cancel-btn="{ content: '取消' }"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      <div class="delete-confirm-content">
        <p>一旦你删除了企业，企业内所有项目、部门、成员，项目中所有内容以及所关联的所思文档都将会被永久删除。这是一个不可恢复的操作，请谨慎对待！</p>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getEnterprise, updateEnterprise, deleteEnterprise } from '@/api/enterprise/enterprise.js'

const route = useRoute()
const formRef = ref(null)

// 企业ID
const enterpriseId = computed(() => {
  const id = route.params.id || 1
  console.log('企业ID:', id)
  return id
})

// 表单数据
const formData = ref({
  id: null,
  enterpriseCode: '',
  enterpriseName: '',
  shortName: '',
  description: ''
})



// 表单验证规则
const formRules = {
  enterpriseName: [
    { required: true, message: '请输入企业名称', type: 'error' },
    { max: 50, message: '企业名称不能超过50个字符', type: 'warning' }
  ],
  shortName: [
    { max: 20, message: '企业简称不能超过20个字符', type: 'warning' }
  ],
  enterpriseCode: [
    { max: 30, message: '企业编码不能超过30个字符', type: 'warning' }
  ],
  description: [
    { max: 500, message: '企业描述不能超过500个字符', type: 'warning' }
  ]
}

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    // 调用API保存企业信息
    const res = await updateEnterprise(enterpriseId.value, formData.value)
    if (res.success) {
      await MessagePlugin.success('保存成功')
      // 更新成功后重新加载数据
      await loadEnterpriseInfo()
    } else {
      await MessagePlugin.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    await MessagePlugin.error('保存失败，请重试')
  }
}

// 删除对话框
const deleteDialogVisible = ref(false)

// 移交
const handleTransfer = () => {
  MessagePlugin.info('移交功能待实现')
}

// 删除
const handleDelete = () => {
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    // 调用API删除企业
    const res = await deleteEnterprise(enterpriseId.value)
    if (res.success) {
      await MessagePlugin.success('删除成功')
      // 跳转到企业列表页面
      window.location.href = '/enterprise-admin'
    } else {
      await MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    await MessagePlugin.error('删除失败，请重试')
  }
}

// 取消删除
const cancelDelete = () => {
  deleteDialogVisible.value = false
}

// 加载企业信息
const loadEnterpriseInfo = async () => {
  try {
    console.log('开始加载企业信息，ID:', enterpriseId.value)
    // 调用API获取企业信息
    const res = await getEnterprise(enterpriseId.value)
    console.log('loadEnterpriseInfo API返回结果:', res)
    
    if (res.success) {
      console.log('企业信息数据:', res.data)
      // 将API返回的下划线命名转换为小驼峰命名
      formData.value = {
        id: res.data.id || null,
        enterpriseCode: res.data.code || '',
        enterpriseName: res.data.name || '',
        shortName: res.data.shortName || '',
        description: res.data.description || ''
      }

      console.log('表单数据已更新:', formData.value)
      await MessagePlugin.success('加载成功')
    } else {
      console.error('获取企业信息失败:', res.message)
      await MessagePlugin.error(res.message || '获取企业信息失败')
    }
  } catch (error) {
    console.error('获取企业信息失败:', error)
    await MessagePlugin.error('获取企业信息失败')
  }
}

onMounted(() => {
  console.log('组件挂载，开始加载企业信息')
  loadEnterpriseInfo()
})
</script>

<style scoped lang="scss">
.enterprise-info-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.t-card__body) {
    padding: 32px;
    flex: 1;
    overflow-y: auto;
  }
}

.info-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    letter-spacing: -0.01em;
  }
}

.form-content {
  :deep(.t-form-item) {
    margin-bottom: 20px;
  }

  :deep(.t-form__label) {
    font-weight: 500;
    color: #1d1d1f;
  }
}

.operation-content {
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.operation-item {
  padding: 20px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.operation-label {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.delete-warning {
  font-size: 14px;
  color: #e34d59;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(227, 77, 89, 0.08);
  border-radius: 8px;
  border-left: 3px solid #e34d59;
}

.delete-confirm-content {
  p {
    margin-bottom: 0;
    line-height: 1.6;
    color: #1d1d1f;
  }
}
</style>