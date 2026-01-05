<template>
  <div class="feedback-float-button" @click="handleClick">
    <div class="button-icon">
      <t-icon name="chat" size="24px" />
    </div>
    <div class="button-text">问题反馈</div>
  </div>

  <!-- 反馈对话框 -->
  <t-dialog
    v-model:visible="showDialog"
    header="问题反馈"
    width="700px"
    :footer="false"
    class="feedback-dialog"
    @close="handleDialogClose"
  >
    <div class="feedback-form">
      <t-form :data="feedbackForm" :rules="feedbackFormRules" label-width="100px" @submit="handleSubmit">
        <t-form-item label="标题" name="title">
          <t-input
            v-model="feedbackForm.title"
            placeholder="简要描述您的反馈"
            :maxlength="100"
            clearable
          />
        </t-form-item>

        <t-form-item label="类型" name="type">
          <div class="type-card-group">
            <div
              v-for="typeOption in feedbackTypeOptions"
              :key="typeOption.value"
              class="type-card"
              :class="{ active: feedbackForm.type === typeOption.value }"
              @click="feedbackForm.type = typeOption.value"
            >
              <div class="type-card-icon" :style="{ color: typeOption.color }">
                <t-icon :name="typeOption.icon" size="24px" />
              </div>
              <div class="type-card-content">
                <div class="type-card-title">{{ typeOption.label }}</div>
                <div class="type-card-desc">{{ typeOption.description }}</div>
              </div>
              <div v-if="feedbackForm.type === typeOption.value" class="type-card-check">
                <t-icon name="check-circle-filled" size="20px" />
              </div>
            </div>
          </div>
        </t-form-item>

        <t-form-item label="详细描述" name="content">
          <t-textarea
            v-model="feedbackForm.content"
            placeholder="请详细描述您遇到的问题或建议..."
            :autosize="{ minRows: 6, maxRows: 12 }"
            :maxlength="1000"
            clearable
          />
          <div class="form-tip">支持 Markdown 格式</div>
        </t-form-item>

        <t-form-item label="联系方式" name="contactInfo">
          <t-input
            v-model="feedbackForm.contactInfo"
            placeholder="邮箱或电话，方便我们与您联系（可选）"
            clearable
          />
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" :loading="submitting">
              提交反馈
            </t-button>
            <t-button theme="default" variant="outline" @click="handleDialogClose">
              取消
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { createFeedback } from '@/api/feedback.js'

// 反馈类型选项
const feedbackTypeOptions = [
  {
    value: 'bug',
    label: '问题反馈',
    description: '报告系统存在的问题或错误',
    icon: 'bug',
    color: '#e34d59'
  },
  {
    value: 'feature',
    label: '功能建议',
    description: '建议添加新的功能特性',
    icon: 'lightbulb',
    color: '#0052d9'
  },
  {
    value: 'improvement',
    label: '改进建议',
    description: '对现有功能的改进意见',
    icon: 'chart-bubble',
    color: '#29cc85'
  },
  {
    value: 'other',
    label: '其他',
    description: '其他类型的反馈',
    icon: 'chat',
    color: '#646a73'
  }
]

// 对话框显示状态
const showDialog = ref(false)
const submitting = ref(false)

// 反馈表单数据
const feedbackForm = ref({
  title: '',
  type: 'bug',
  content: '',
  contactInfo: ''
})

// 表单验证规则
const feedbackFormRules = {
  title: [
    { required: true, message: '请输入反馈标题', type: 'error' }
  ],
  type: [
    { required: true, message: '请选择反馈类型', type: 'error' }
  ],
  content: [
    { required: true, message: '请输入详细描述', type: 'error' },
    { max: 1000, message: '详细描述不能超过1000个字符', type: 'warning' }
  ]
}

// 点击悬浮按钮
const handleClick = () => {
  showDialog.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  showDialog.value = false
  // 重置表单
  feedbackForm.value = {
    title: '',
    type: 'bug',
    content: '',
    contactInfo: ''
  }
}

// 提交反馈
const handleSubmit = async ({ validateResult, firstError }) => {
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }

  try {
    submitting.value = true
    const res = await createFeedback(feedbackForm.value)
    if (res.success) {
      await MessagePlugin.success('反馈提交成功，感谢您的反馈！')
      handleDialogClose()
    } else {
      await MessagePlugin.error(res.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    await MessagePlugin.error('提交反馈失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.feedback-float-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--tencent-blue-gradient);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.18), 0 2px 8px rgba(0, 122, 255, 0.12);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 82, 217, 0.4), 0 4px 12px rgba(0, 82, 217, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  .button-icon {
    color: #fff;
    margin-bottom: 2px;
  }

  .button-text {
    font-size: 11px;
    color: #fff;
    font-weight: 500;
    line-height: 1;
  }
}

// 反馈对话框样式
:deep(.feedback-dialog) {
  .t-dialog__mask {
    background-color: rgba(0, 0, 0, 0.4) !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .t-dialog {
    border: none !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  }
}

.feedback-form {
  padding: 8px 0;
}

.type-card-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.type-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;

  &:hover {
    border-color: rgba(0, 82, 217, 0.3);
    background: rgba(0, 82, 217, 0.02);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.active {
    border-color: #0052D9;
    background: rgba(0, 82, 217, 0.05);
    box-shadow: 0 0 0 3px rgba(0, 82, 217, 0.1);

    .type-card-check {
      display: block;
    }
  }

  .type-card-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);
  }

  .type-card-content {
    flex: 1;
    min-width: 0;

    .type-card-title {
      font-size: 14px;
      font-weight: 500;
      color: #1f2329;
      margin-bottom: 4px;
    }

    .type-card-desc {
      font-size: 12px;
      color: #86909c;
      line-height: 1.4;
    }
  }

  .type-card-check {
    display: none;
    flex-shrink: 0;
    color: #0052D9;
  }
}

.form-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
}
</style>

