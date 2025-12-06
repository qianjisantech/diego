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
          label-width="100px"
          class="form-content"
        >
          <!-- 企业头像 -->
          <t-form-item label="企业头像" name="avatar">
            <div class="avatar-upload">
              <t-avatar
                :image="formData.avatar"
                :alt="formData.name"
                size="large"
                class="avatar-preview"
              >
                {{ enterpriseInitial }}
              </t-avatar>
              <t-upload
                v-model="uploadFiles"
                :request-method="handleUpload"
                accept="image/*"
                :max="1"
                :show-progress="false"
                theme="image"
                :image-viewer-props="{ closeBtn: true }"
                @success="handleUploadSuccess"
              >
                <template #trigger>
                  <t-button theme="primary" variant="outline" size="small">
                    上传企业头像
                  </t-button>
                </template>
              </t-upload>
            </div>
          </t-form-item>

          <!-- 企业名称 -->
          <t-form-item label="企业名称" name="name">
            <t-input
              v-model="formData.name"
              placeholder="请输入企业名称"
              :maxlength="50"
              clearable
              style="width: 400px"
            />
          </t-form-item>

          <!-- 企业简介 -->
          <t-form-item label="企业简介" name="description">
            <t-textarea
              v-model="formData.description"
              placeholder="介绍一下这个企业"
              :maxlength="500"
              :autosize="{ minRows: 4, maxRows: 8 }"
              clearable
              style="width: 400px"
            />
          </t-form-item>

          <!-- 确定按钮 -->
          <t-form-item>
            <t-button theme="primary" @click="handleSave">
              确定
            </t-button>
            <t-button theme="default" variant="outline" style="margin-left: 12px" @click="handleReset">
              重置
            </t-button>
          </t-form-item>
        </t-form>
      </div>

    </t-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
// import { getEnterpriseInfo, updateEnterpriseInfo } from '@/api/enterprise'

const route = useRoute()
const formRef = ref(null)

// 企业ID
const enterpriseId = computed(() => route.params.id)

// 表单数据
const formData = ref({
  avatar: '',
  name: '',
  description: ''
})

// 表单初始数据（用于重置）
const initialFormData = ref({
  avatar: '',
  name: '',
  description: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入企业名称', type: 'error' },
    { max: 50, message: '企业名称不能超过50个字符', type: 'warning' }
  ],
  description: [
    { max: 500, message: '企业简介不能超过500个字符', type: 'warning' }
  ]
}

// 上传文件列表
const uploadFiles = ref([])

// 企业名称首字母
const enterpriseInitial = computed(() => {
  return formData.value.name?.charAt(0)?.toUpperCase() || '企'
})

// 上传方法
const handleUpload = async (file) => {
  // 验证文件类型
  if (!file.raw?.type.startsWith('image/')) {
    MessagePlugin.warning('请上传图片文件')
    return Promise.reject(new Error('请上传图片文件'))
  }

  // 验证文件大小（限制5MB）
  if (file.raw?.size > 5 * 1024 * 1024) {
    MessagePlugin.warning('图片大小不能超过5MB')
    return Promise.reject(new Error('图片大小不能超过5MB'))
  }

  // TODO: 实际上传到服务器
  // 这里先返回本地预览
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        url: e.target.result
      })
    }
    reader.readAsDataURL(file.raw)
  })
}

// 上传成功回调
const handleUploadSuccess = (context) => {
  if (context.response?.url) {
    formData.value.avatar = context.response.url
  }
}

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    // TODO: 调用API保存企业信息
    // await updateEnterpriseInfo(enterpriseId.value, formData.value)
    MessagePlugin.success('保存成功')
    // 更新初始数据
    initialFormData.value = { ...formData.value }
  } catch (error) {
    console.error('保存失败:', error)
    MessagePlugin.error('保存失败，请重试')
  }
}

// 重置
const handleReset = () => {
  formData.value = { ...initialFormData.value }
  formRef.value?.clearValidate()
  uploadFiles.value = []
}

// 加载企业信息
const loadEnterpriseInfo = async () => {
  try {
    // TODO: 调用API获取企业信息
    // const res = await getEnterpriseInfo(enterpriseId.value)
    // enterpriseInfo.value = res.data
    // formData.value = {
    //   avatar: res.data.avatar || '',
    //   name: res.data.name || '',
    //   description: res.data.description || ''
    // }
    
    // 临时使用默认值
    formData.value.name = '千机伞科技'
    initialFormData.value.name = '千机伞科技'
  } catch (error) {
    console.error('获取企业信息失败:', error)
    MessagePlugin.error('获取企业信息失败')
  }
}

onMounted(() => {
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
    margin-bottom: 24px;
  }

  :deep(.t-form__label) {
    font-weight: 500;
    color: #1d1d1f;
  }

  .avatar-upload {
    display: flex;
    align-items: flex-start;
    gap: 20px;

    .avatar-preview {
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 3px solid rgba(255, 255, 255, 0.8);
    }
  }
}
</style>

