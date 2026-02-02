<template>
  <t-dialog
    v-model:visible="dialogVisible"
    :header="isEdit ? '编辑事项' : '新建事项'"
    width="600px"
    height="400px"
    :close-on-overlay-click="false"
    :confirm-btn="null"
    :cancel-btn="null"
    @close="handleClose"
  >
    <!-- 数据加载中 -->
    <div v-if="dataLoading" class="dialog-loading">
      <t-loading size="large" text="加载中..." />
    </div>

    <!-- 表单内容 -->
    <t-form
      v-else
      ref="formRef"
      :data="formData"
      :rules="rules"
      label-align="left"
      label-width="100px"
      @submit="handleSubmit"
    >
      <!-- 组织 - 必填 -->
      <t-form-item label="组织" name="spaceId" class="compact-field">
        <t-select
          v-model="formData.spaceId"
          placeholder="请选择组织"
          filterable
          :disabled="isEdit"
          @change="handleSpaceChange"
        >
          <t-option
            v-for="space in spaceList"
            :key="space.id"
            :value="space.id"
            :label="space.name"
          >
            <div class="space-option">
              <span class="space-name">{{ space.name }}</span>
              <span v-if="space.keyword" class="space-keyword">[{{ space.keyword }}]</span>
            </div>
          </t-option>
        </t-select>
      </t-form-item>

      <!-- 事项类型 - 必填 -->
      <t-form-item label="事项类型" name="issueType" class="compact-field">
        <t-select v-model="formData.issueType" placeholder="请选择事项类型" :disabled="isEdit">
          <t-option label="任务" :value="1" />
          <t-option label="bug" :value="2" />
          <t-option label="需求" :value="3" />
          <t-option label="线上问题" :value="4" />
        </t-select>
      </t-form-item>

      <!-- Tab 页面 -->
      <t-tabs v-model="activeTab" class="compact-field">
        <!-- 必填信息 Tab -->
        <t-tab-panel value="required" label="必填信息">
          <div class="tab-content">
            <!-- 概要 - 必填 -->
            <t-form-item class="compact-field" label="概要" name="summary">
              <t-input
                v-model="formData.summary"
                placeholder="请输入事项概要"
                maxlength="200"
                show-limit-number
              />
            </t-form-item>

            <!-- 描述 - 富文本编辑器 -->
            <t-form-item label="描述" name="description" class="compact-field">
              <RichTextEditor
                v-model="formData.description"
                placeholder="请输入事项描述..."
                :height="20"
              />
            </t-form-item>

            <!-- 经办人 - 必填 -->
            <t-form-item class="compact-field" label="经办人" name="assigneeId">
              <t-select
                v-model="formData.assigneeId"
                placeholder="请选择经办人"
                filterable
                style="width: 400px;"
                @change="handleAssigneeChange"
              >
                <t-option
                  v-for="user in userList"
                  :key="user.id"
                  :value="user.id"
                  :label="`${user.username} (${user.email || '无邮箱'})`"
                >
                  <div class="user-option">
                    <span>{{ user.username }}</span>
                    <span class="user-email">({{ user.email || '无邮箱' }})</span>
                  </div>
                </t-option>
              </t-select>
            </t-form-item>

            <!-- 优先级 - 必填 -->
            <t-form-item label="优先级" name="priority" class="compact-field">
              <t-select v-model="formData.priority" placeholder="请选择优先级" style="width: 200px;">
                <t-option label="高" :value="1" />
                <t-option label="中" :value="2" />
                <t-option label="低" :value="3" />
              </t-select>
            </t-form-item>

            <!-- 开始日期 - 必填 -->
            <t-form-item label="开始日期" name="startDate" class="compact-field">
              <t-date-picker
                v-model="formData.startDate"
                placeholder="请选择开始日期"
                style="width: 300px;"
              />
            </t-form-item>

            <!-- 截止日期 - 必填 -->
            <t-form-item label="截止日期" name="dueDate" class="compact-field">
              <t-date-picker
                v-model="formData.dueDate"
                placeholder="请选择截止日期"
                style="width: 300px;"
              />
            </t-form-item>

            <!-- 预估工时 - 必填 -->
            <t-form-item label="预估工时" name="estimatedHours" class="compact-field">
              <t-input-number
                v-model="formData.estimatedHours"
                placeholder="请输入预估工时（小时）"
                :min="0"
                :step="0.5"
                :decimal-places="1"
                style="width: 250px;"
              />
            </t-form-item>
          </div>
        </t-tab-panel>

        <!-- 选填信息 Tab -->
        <t-tab-panel value="optional" label="选填信息">
          <div class="tab-content">
            <!-- 排期信息 -->
            <div class="schedule-section">
              <div class="section-header">
                <div class="section-title">排期信息</div>
                <t-button
                  theme="primary"
                  variant="outline"
                  size="small"
                  @click="handleAddSchedule"
                >
                  <template #icon>
                    <t-icon name="add" />
                  </template>
                  新增排期
                </t-button>
              </div>

              <div v-if="formData.schedule.length === 0" class="schedule-empty">
                <t-icon name="calendar" size="48px" class="empty-icon" />
                <p class="empty-text">暂无排期信息</p>
                <p class="empty-tip">点击"新增排期"按钮添加排期</p>
              </div>

              <div v-else class="schedule-list">
                <div
                  v-for="(item, index) in formData.schedule"
                  :key="index"
                  class="schedule-item"
                >
                  <div class="schedule-header">
                    <t-select
                      v-model="item.role"
                      placeholder="请选择角色"
                      class="role-select"
                      @change="handleRoleChange(index, $event)"
                    >
                      <t-option label="产品" value="product" />
                      <t-option label="后端" value="backend" />
                      <t-option label="前端" value="frontend" />
                      <t-option label="测试" value="test" />
                      <t-option label="设计" value="design" />
                      <t-option label="运维" value="ops" />
                      <t-option label="其他" value="other" />
                    </t-select>
                    <t-button
                      theme="danger"
                      variant="text"
                      size="small"
                      @click="handleRemoveSchedule(index)"
                    >
                      <template #icon>
                        <t-icon name="delete" />
                      </template>
                      删除
                    </t-button>
                  </div>
                  <div class="schedule-form">
                    <div class="form-row">
                      <div class="form-item">
                        <label>负责人</label>
                        <t-select
                          v-model="item.assigneeId"
                          placeholder="请选择负责人"
                          filterable
                          clearable
                        >
                          <t-option
                            v-for="user in userList"
                            :key="user.id"
                            :value="user.id"
                            :label="`${user.username} (${user.email || '无邮箱'})`"
                          />
                        </t-select>
                      </div>
                      <div class="form-item">
                        <label>预估工时（小时）</label>
                        <t-input-number
                          v-model="item.estimatedHours"
                          placeholder="请输入预估工时"
                          :min="0"
                          :step="0.5"
                        />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-item full-width">
                        <label>排期时间</label>
                        <t-date-range-picker
                          v-model="item.dateRange"
                          placeholder="选择开始和结束日期"
                          clearable
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
    </t-form>

    <template #footer>
      <div class="dialog-footer">
        <t-button theme="default" variant="outline" @click="handleClose">
          取消
        </t-button>
        <t-button theme="primary" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </t-button>
      </div>
    </template>
  </t-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getUserList } from '@/api/user'
import { createIssue, updateIssue } from '@/api/console/issue.js'
import { useUserStore } from '@/store/user'
import RichTextEditor from './RichTextEditor.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  issue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])
const userStore = useUserStore()

const dialogVisible = ref(false)
const formRef = ref(null)
const spaceList = ref([])
const userList = ref([])
const isEdit = ref(false)
const activeTab = ref('required')
const dataLoading = ref(false)

// 角色名称映射
const roleNameMap = {
  product: '产品',
  backend: '后端',
  frontend: '前端',
  test: '测试',
  design: '设计',
  ops: '运维',
  other: '其他'
}

// 表单数据
const formData = ref({
  spaceId: null,
  issue_type: null,
  summary: '',
  priority: 2, // 默认中等优先级
  description: '',
  assigneeId: null,
  startDate: '',
  dueDate: '',
  estimatedHours: null,
  schedule: []
})

// 表单验证规则
const rules = {
  spaceId: [
    { required: true, message: '请选择组织', type: 'error' }
  ],
  issueType: [
    { required: true, message: '请选择事项类型', type: 'error' }
  ],
  summary: [
    { required: true, message: '请输入概要', type: 'error' },
    { max: 200, message: '概要不能超过200个字符', type: 'warning' }
  ],
  description: [
    { required: true, message: '请输入描述', type: 'error' }
  ],
  assigneeId: [
    { required: true, message: '请选择经办人', type: 'error' }
  ],
  priority: [
    { required: true, message: '请选择优先级', type: 'error' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', type: 'error' }
  ],
  dueDate: [
    { required: true, message: '请选择截止日期', type: 'error' }
  ],
  estimatedHours: [
    { required: true, message: '请输入预估工时', type: 'error' }
  ]
}

// 监听 visible 变化
watch(() => props.visible, async (val) => {
  // 立即显示/隐藏弹窗
  dialogVisible.value = val

  if (val) {
    // 显示loading
    dataLoading.value = true

    try {
      // 加载数据
      await loadData()

      if (props.issue) {
        // 编辑模式
        isEdit.value = true

        // 解析排期字符串
        let scheduleData = []
        if (props.issue.schedule) {
          try {
            scheduleData = typeof props.issue.schedule === 'string'
              ? JSON.parse(props.issue.schedule)
              : props.issue.schedule
          } catch (error) {
            console.error('解析排期数据失败:', error)
            scheduleData = []
          }
        }

        formData.value = {
          ...props.issue,
          spaceId: props.issue.spaceId || props.issue.space_id,
          issueType: props.issue.issueType || props.issue.issue_type,
          assigneeId: props.issue.assigneeId || props.issue.assignee_id,
          startDate: props.issue.startDate || props.issue.start_date || '',
          dueDate: props.issue.dueDate || props.issue.due_date || '',
          estimatedHours: props.issue.estimatedHours || props.issue.estimated_hours || null,
          schedule: scheduleData
        }
      } else {
        // 新建模式
        isEdit.value = false
        resetForm()
      }
      activeTab.value = 'required'
    } finally {
      // 数据加载完成，隐藏loading
      dataLoading.value = false
    }
  }
})

// 设置组织列表（直接使用 userStore 中的数据）
const setupSpaceList = () => {
  spaceList.value = userStore.userCompanies || []
}

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 监听用户企业数据变化
watch(() => userStore.userCompanies, (newCompanies) => {
  if (newCompanies && userStore) {
    setupSpaceList()
  }
}, { immediate: true })

// 加载数据
const loadData = async () => {
  await Promise.all([
    setupSpaceList(),
    fetchUserList()
  ])
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await getUserList()
    if (res.success) {
      userList.value = res.data || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 处理组织变化
const handleSpaceChange = (value) => {
  console.log('选择的组织ID:', value)
}

// 处理经办人变化
const handleAssigneeChange = (value) => {
  console.log('选择的经办人ID:', value)
}

// 重置表单
const resetForm = () => {
  formData.value = {
    spaceId: null,
    issueType: null,
    summary: '',
    priority: 2, // 默认中等优先级
    description: '',
    assigneeId: null,
    startDate: '',
    dueDate: '',
    estimatedHours: null,
    schedule: []
  }
  activeTab.value = 'required'
  formRef.value?.clearValidate()
}

// 新增排期
const handleAddSchedule = () => {
  formData.value.schedule.push({
    role: '',
    roleName: '',
    assigneeId: null,
    dateRange: [],
    estimatedHours: null
  })
}

// 删除排期
const handleRemoveSchedule = (index) => {
  formData.value.schedule.splice(index, 1)
}

// 角色变化处理
const handleRoleChange = (index, value) => {
  formData.value.schedule[index].roleName = roleNameMap[value] || value
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }

  try {
    // 构建提交数据 - 按照后端DTO的嵌套结构
    const submitData = {
      issueType: formData.value.issueType,
      summary: formData.value.summary,
      description: formData.value.description,
      status: 1, // 默认状态：待处理
      priority: formData.value.priority,
      startDate: formData.value.startDate,
      dueDate: formData.value.dueDate,
      estimatedHours: formData.value.estimatedHours
    }

    // 处理组织信息 - 嵌套对象（必填）
    const space = spaceList.value.find(s => s.id === formData.value.spaceId)
    if (!space) {
      await MessagePlugin.error('组织信息不存在，请重新选择')
      return
    }
    submitData.space = {
      spaceId: space.id,
      spaceName: space.name,
      spaceKeyword: space.keyword || ''
    }

    // 处理经办人信息 - 嵌套对象（必填）
    const assignee = userList.value.find(u => u.id === formData.value.assigneeId)
    if (!assignee) {
      await MessagePlugin.error('经办人信息不存在，请重新选择')
      return
    }
    submitData.assignee = {
      assigneeId: assignee.id,
      assigneeName: assignee.username,
      assigneeCode: assignee.userCode || assignee.username
    }

    // 处理报告人信息 - 嵌套对象（后端会自动使用当前登录用户，所以这里可以不传）
    // 如果需要指定报告人，可以在这里添加

    // 处理排期数据
    if (formData.value.schedule && formData.value.schedule.length > 0) {
      submitData.schedule = JSON.stringify(formData.value.schedule)
    } else {
      submitData.schedule = ''
    }

    let res
    if (isEdit.value) {
      // 编辑
      res = await updateIssue(props.issue.id, submitData)
    } else {
      // 新建
      res = await createIssue(submitData)
    }

    if (res.success || res.code === 200) {
      await MessagePlugin.success(isEdit.value ? '事项更新成功' : '事项创建成功')
      emit('success')
      handleClose()
    } else {
      await MessagePlugin.error(res.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    await MessagePlugin.error(isEdit.value ? '更新失败' : '创建失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  if (props.visible) {
    loadData()
  }
})
</script>

<style scoped lang="scss">
// 弹窗加载状态
.dialog-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 20px 0;
}
 .compact-field{
   width: 100%;
   margin-top: 8px;
   margin-bottom: 12px;
 }

/* 苹果风格：输入/选择控件圆角、统一高度（移除自定义边框，避免与组件内部边框叠加） */
:deep(.t-input),
:deep(.t-select),
:deep(.t-date-picker),
:deep(.t-input-number) {
  height: 36px !important;
  min-height: 36px !important;
  border-radius: 8px !important;
  padding: 6px 12px !important;
  /* 不设置 border/background，以避免与组件内部已有样式产生多层边框 */
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}
/* 提升选择框的边框可见性（使用内联阴影避免与组件内部边框叠加） */
:deep(.t-select) {
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08) !important;
  border-radius: 8px !important;
}
:deep(.t-select:focus-within),
:deep(.t-select):focus {
  box-shadow: inset 0 0 0 1px rgba(0,122,255,0.25) !important;
}
/* 使下拉框内的提示文字垂直居中 */
:deep(.t-select .t-input__wrap),
:deep(.t-select .t-input__inner),
:deep(.t-select__inner) {
  display: flex !important;
  align-items: center !important;
  height: 36px !important;
}
:deep(.t-select .t-input__placeholder) {
  margin: 0 !important;
  line-height: normal !important;
}

 /* 标签（label）风格更轻柔 */
 :deep(.t-form-item__label) {
   color: #6b6b72 !important;
   font-weight: 600 !important;
   font-size: 13px !important;
   padding-right: 8px;
 }

 /* tabs 调整为更简洁的风格 */
 .form-tabs :deep(.t-tabs__nav) {
   background: transparent !important;
   border-bottom: 1px solid #eef0f2 !important;
   padding-bottom: 6px;
 }
 .form-tabs .tab-content {
   padding: 12px 0 !important;
 }
.user-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-email {
    font-size: 12px;
    color: #8f959e;
  }
}

.space-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .space-name {
    flex: 1;
  }

  .space-keyword {
    font-size: 12px;
    color: #0052d9;
    background: #e6f0ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.t-form-item__label) {
  font-weight: 500;
  color: #1f2329;
}

:deep(.t-form-item) {
  margin-bottom: 24px;
}

:deep(.t-input),
:deep(.t-select),
:deep(.t-date-picker),
:deep(.t-input-number) {
  width: 100%;
}

// Tab 样式
.form-tabs {
  margin-top: 16px;

  :deep(.t-tabs__nav) {
    border-bottom: 1px solid #e7e7e7;
  }

  .tab-content {
    padding: 20px 0;
  }
}

// 排期信息样式
.schedule-section {
  margin-top: 24px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e7e7e7;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2329;
    }
  }

  .schedule-empty {
    text-align: center;
    padding: 40px 20px;
    background: #fafbfc;
    border-radius: 8px;
    border: 1px dashed #d0d7de;

    .empty-icon {
      color: #8f959e;
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 14px;
      font-weight: 500;
      color: #1f2329;
      margin: 0 0 8px 0;
    }

    .empty-tip {
      font-size: 12px;
      color: #8f959e;
      margin: 0;
    }
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .schedule-item {
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 8px;
    border: 1px solid #e7e7e7;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
    }

    .schedule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;

      .role-select {
        width: 200px;
      }
    }

    .schedule-form {
      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .form-item {
          flex: 1;
          display: flex;
          flex-direction: column;

          &.full-width {
            flex: 1 1 100%;
          }

          label {
            font-size: 13px;
            font-weight: 500;
            color: #646a73;
            margin-bottom: 8px;
          }

          :deep(.t-select),
          :deep(.t-input-number),
          :deep(.t-date-range-picker) {
            width: 100%;
          }
        }
      }
    }
  }


  :deep(.w-e-text-container) {
    min-height: 100px !important;
  }

  :deep(.w-e-scroll) {
    min-height: 100px !important;
  }
}

/* 紧凑样式覆盖：减小表单字段垂直间距，缩小 tab 内容内边距，排期区域间距 */
:deep(.t-form-item) {
  margin-bottom: 12px !important;
}
.form-tabs :deep(.t-tabs__nav) {
  margin-bottom: 8px !important;
}
.form-tabs .tab-content {
  padding: 10px 0 !important;
}
.schedule-list {
  gap: 12px !important;
}
.schedule-item {
  padding: 12px !important;
}
.schedule-header {
  margin-bottom: 8px !important;
  padding-bottom: 8px !important;
}
.schedule-form .form-row {
  gap: 12px !important;
  margin-bottom: 8px !important;
}
:deep(.t-form-item__label) {
  margin-bottom: 6px !important;
}

</style>
