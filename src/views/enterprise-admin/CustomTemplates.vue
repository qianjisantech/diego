<template>
  <div class="custom-templates-page">
    <t-card :bordered="false" class="templates-card">
      <!-- 操作栏 -->
      <div class="action-bar">
        <t-space>
          <t-button theme="primary" @click="handleCreateTemplate">
            <template #icon>
              <t-icon name="add-circle" />
            </template>
            新建模板
          </t-button>
          <t-button theme="default" @click="handleSearch">
            <template #icon>
              <t-icon name="search" />
            </template>
            查询
          </t-button>
          <t-button theme="default" variant="outline" @click="handleResetFilter">
            <template #icon>
              <t-icon name="refresh" />
            </template>
            重置
          </t-button>
        </t-space>
      </div>

      <!-- 搜索和筛选 -->
      <t-form :data="filterForm" layout="inline" label-width="80px" class="filter-section">
        <t-form-item label="模板名称" name="name">
          <t-input
            v-model="filterForm.name"
            placeholder="请输入模板名称"
            clearable
            style="width: 200px"
            @enter="handleSearch"
          />
        </t-form-item>
        <t-form-item label="模板编码" name="code">
          <t-input
            v-model="filterForm.code"
            placeholder="请输入模板编码"
            clearable
            style="width: 180px"
            @enter="handleSearch"
          />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <t-option value="active" label="启用" />
            <t-option value="inactive" label="禁用" />
          </t-select>
        </t-form-item>
      </t-form>

      <!-- 模板列表 -->
      <div class="templates-table">
        <t-table
          :data="templatesList"
          :columns="columns"
          :loading="loading"
          row-key="id"
          :pagination="pagination"
          hover
          stripe
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #status="{ row }">
            <t-tag
              :theme="getStatusTheme(row.status)"
              variant="light"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </t-tag>
          </template>

          <template #operation="{ row }">
            <t-space size="small">
              <t-button
                theme="primary"
                variant="text"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </t-button>
              <t-button
                theme="danger"
                variant="text"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </t-button>
              <t-button
                theme="default"
                variant="text"
                size="small"
                @click="handleConfigure(row)"
              >
                配置
              </t-button>
            </t-space>
          </template>
        </t-table>
      </div>
    </t-card>

    <!-- 新建模板对话框 -->
    <t-dialog
      v-model:visible="createDialogVisible"
      header="新建模板"
      :width="'40%'"
      :footer="true"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: createLoading }"
      cancel-btn="关闭"
      @confirm="handleSubmitCreate"
      @cancel="handleCancelCreate"
      class="template-dialog"
      @close="handleCancelCreate"
    >
      <t-form
        ref="createFormRef"
        :data="createForm"
        :rules="createFormRules"
        label-width="120px"
        @submit="handleSubmitCreate"
      >
        <t-form-item label="模板名称" name="name">
          <t-input
            v-model="createForm.name"
            placeholder="请输入模板名称"
            clearable
          />
        </t-form-item>

        <t-form-item label="模板描述" name="description">
          <t-textarea
            v-model="createForm.description"
            placeholder="请输入模板描述（可选）"
            :maxlength="200"
            show-count
          />
        </t-form-item>

        <t-form-item label="状态" name="status">
          <t-radio-group v-model="createForm.status">
            <t-radio value="1">启用</t-radio>
            <t-radio value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="是否默认模板" name="isDefault">
          <t-radio-group v-model="createForm.isDefault">
            <t-radio :value="true">是</t-radio>
            <t-radio :value="false">否</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 编辑模板对话框 -->
    <t-dialog
      v-model:visible="editDialogVisible"
      header="编辑模板"
      :width="'40%'"
      :footer="true"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: editLoading }"
      cancel-btn="关闭"
      @confirm="handleSubmitEdit"
      @cancel="handleCancelEdit"
      @close="handleCancelEdit"
    >
      <t-form
        ref="editFormRef"
        :data="editForm"
        :rules="editFormRules"
        label-width="120px"
        @submit="handleSubmitEdit"
      >
        <t-form-item label="模板编码" name="code">
          <t-input
            v-model="editForm.code"
            placeholder="模板编码"
            readonly
            disabled
          />
        </t-form-item>

        <t-form-item label="模板名称" name="name">
          <t-input
            v-model="editForm.name"
            placeholder="请输入模板名称"
            clearable
          />
        </t-form-item>

        <t-form-item label="模板描述" name="description">
          <t-textarea
            v-model="editForm.description"
            placeholder="请输入模板描述（可选）"
            :maxlength="200"
            show-count
          />
        </t-form-item>

        <t-form-item label="状态" name="status">
          <t-radio-group v-model="editForm.status">
            <t-radio value="1">启用</t-radio>
            <t-radio value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="是否默认模板" name="isDefault">
          <t-radio-group v-model="editForm.isDefault">
            <t-radio :value="true">是</t-radio>
            <t-radio :value="false">否</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getTemplateListPage, createTemplate, updateTemplate, deleteTemplate, copyTemplate, getTemplateDetail, getTemplateFields, createTemplateField, updateTemplateField, deleteTemplateField, saveTemplateFields } from '@/api/template'

const route = useRoute()

// 企业ID
const enterpriseId = computed(() => route.params.id)

// 搜索和筛选
const filterForm = ref({
  name: '',
  code: '',
  status: ''
})

// 加载状态
const loading = ref(false)

// 模板列表
const templatesList = ref([])

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 新建模板对话框
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)

// 编辑模板对话框
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editingTemplateId = ref(null)


// 新建模板表单
const createForm = ref({
  name: '',
  description: '',
  status: '1', // 默认启用
  isDefault: false
})

// 编辑模板表单
const editForm = ref({
  name: '',
  description: '',
  status: '1',
  isDefault: false
})

// 表单验证规则
const createFormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 1, max: 50, message: '模板名称长度在1-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 编辑表单验证规则（与新建相同）
const editFormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 1, max: 50, message: '模板名称长度在1-50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 表格列配置
const columns = [
  {
    colKey: 'name',
    title: '模板名称',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'code',
    title: '模板编码',
    width: 180,
    ellipsis: true
  },
  {
    colKey: 'description',
    title: '描述',
    width: 250,
    ellipsis: true
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 200,
    fixed: 'right'
  }
]

// 获取状态主题
const getStatusTheme = (status) => {
  const themeMap = {
    active: 'success',
    inactive: 'default'
  }
  return themeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '启用',
    inactive: '禁用'
  }
  return textMap[status] || '未知'
}

// 获取字段类型文本
const getFieldTypeText = (type) => {
  const typeMap = {
    tabs:'选项卡',
    input:'输入框',
    text: '文本',
    textarea: '多行文本',
    select: '下拉选择',
    radio: '单选',
    checkbox: '多选',
    date: '日期',
    number: '数字',
    email: '邮箱',
    url: '链接'
  }
  return typeMap[type] || type || '未知'
}

// 获取位置文本
// position helper removed

// 搜索
const handleSearch = () => {
  loadTemplatesList()
}

// 重置筛选
const handleResetFilter = () => {
  filterForm.value = {
    name: '',
    code: '',
    status: ''
  }
  loadTemplatesList()
}

// 分页变化
const handlePageChange = (page) => {
  pagination.value.current = page
  loadTemplatesList()
}

const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
  loadTemplatesList()
}

// 新建模板
const handleCreateTemplate = () => {
  createForm.value = {
    name: '',
    description: '',
    status: '1',
    isDefault: false
  }
  createDialogVisible.value = true
}

// 提交创建模板
const handleSubmitCreate = async () => {
  try {
    await createFormRef.value.validate()
  } catch (error) {
    console.error('表单验证失败:', error)
    return
  }

  createLoading.value = true

  try {
    const submitData = {
      name: createForm.value.name,
      description: createForm.value.description || '',
      company_id: Number(enterpriseId.value),
      company_code: 'COMP001', // 可以根据实际情况获取
      company_name: '示例公司', // 可以根据实际情况获取
      status: parseInt(createForm.value.status),
      is_default: createForm.value.isDefault
    }

    await createTemplate(submitData)

    MessagePlugin.success('创建成功')
    createDialogVisible.value = false
    loadTemplatesList()
  } catch (error) {
    console.error('创建失败:', error)
    MessagePlugin.error('创建失败，请重试')
  } finally {
    createLoading.value = false
  }
}

// 取消创建模板
const handleCancelCreate = () => {
  createDialogVisible.value = false
  createForm.value = {
    name: '',
    description: '',
    status: '1',
    isDefault: false
  }
}

// 提交编辑模板
const handleSubmitEdit = async () => {
  try {
    await editFormRef.value.validate()
  } catch (error) {
    console.error('表单验证失败:', error)
    return
  }

  editLoading.value = true

  try {
    const submitData = {
      name: editForm.value.name,
      description: editForm.value.description || '',
      status: parseInt(editForm.value.status),
      is_default: editForm.value.isDefault
    }

    await updateTemplate(editingTemplateId.value, submitData)

    MessagePlugin.success('编辑成功')
    editDialogVisible.value = false
    loadTemplatesList()
  } catch (error) {
    console.error('编辑失败:', error)
    MessagePlugin.error('编辑失败，请重试')
  } finally {
    editLoading.value = false
  }
}

// 取消编辑模板
const handleCancelEdit = () => {
  editDialogVisible.value = false
  editingTemplateId.value = null
  editForm.value = {
    code: '',
    name: '',
    description: '',
    status: '1',
    isDefault: false
  }
}

const handleEdit = async (row) => {
  editingTemplateId.value = row.id

  try {
    const res = await getTemplateDetail(row.id)
    const templateData = res.data

    // 填充编辑表单
    editForm.value = {
      code: templateData.code || '',
      name: templateData.name || '',
      description: templateData.description || '',
      status: templateData.status?.toString() || '1',
      isDefault: templateData.is_default || false
    }

    editDialogVisible.value = true
  } catch (error) {
    console.error('获取模板详情失败:', error)
    MessagePlugin.error('获取模板详情失败，请重试')
  }
}

// 配置模板
const handleConfigure = (row) => {
  if (!row) return
  // 跳转到模板设计页面
  router.push({ path: `/enterprise-admin/${enterpriseId.value}/template-design`, query: { templateId: row.id } })
}

// 新增字段

// 取消新增
const cancelNewField = () => {
  templateFields.value = templateFields.value.filter(f => !f._isNew)
  isAddingField.value = false
}

// 保存新增字段
const saveNewField = async () => {
  const draft = templateFields.value.find(f => f._isNew)
  if (!draft) return

  // 简单校验
  if (!draft.fieldName || !draft.fieldCode) {
    MessagePlugin.error('请填写字段名称和字段编码')
    return
  }

  savingField.value = true
  try {
    const submitData = {
      template_id: configuringTemplateId.value,
      field_code: draft.fieldCode,
      field_name: draft.fieldName,
      field_type: draft.fieldType,
      field_default_value: draft.fieldDefaultValue || null,
      is_edit: draft.isEdit ? 1 : 0,
      is_required: draft.isRequired ? 1 : 0,
      prompt_content: draft.promptContent || '',
      // position removed
    }

    const res = await createTemplateField(submitData)
    const created = res.data
    // 替换临时行
    const idx = templateFields.value.findIndex(f => f.id === draft.id)
    if (idx !== -1) {
      // API 返回已被 camelCase 转换
      templateFields.value.splice(idx, 1, created)
    }
    MessagePlugin.success('新增字段成功')
    isAddingField.value = false
  } catch (error) {
    console.error('新增字段失败:', error)
    MessagePlugin.error('新增字段失败，请重试')
  } finally {
    savingField.value = false
  }
}

// 编辑字段：切换到行内编辑状态，保存或取消由另一个操作处理
const handleEditField = (row) => {
  if (!row) return
  // 如果是临时新增，直接进入编辑状态
  if (row._isNew) {
    row._isEditing = true
    return
  }
  if (!row._isEditing) {
    row._backup = { ...row }
    row._isEditing = true
  }
}

// 取消行编辑
const handleCancelEditField = (row) => {
  if (!row) return
  if (row._isNew) {
    templateFields.value = templateFields.value.filter(f => f.id !== row.id)
    isAddingField.value = false
    return
  }
  if (row._backup) {
    const idx = templateFields.value.findIndex(f => f.id === row.id)
    if (idx !== -1) {
      templateFields.value.splice(idx, 1, row._backup)
    }
    delete row._backup
  }
  row._isEditing = false
}

// 保存行编辑（对已存在字段调用更新接口，对新增行调用创建接口）
const handleSaveField = async (row) => {
  // 仅在前端保存（不触发接口）
  if (!row) return

  // 简单校验
  if (!row.fieldName || !row.fieldCode) {
    MessagePlugin.error('请填写字段名称和字段编码')
    return
  }

  // 对于临时新增行：将其标记为已保存（本地），退出编辑状态
  if (row._isNew) {
    delete row._isNew
    row._isEditing = false
    MessagePlugin.success('新增字段已本地保存')
    isAddingField.value = false
    return
  }

  // 对于已存在行：移除备份，退出编辑状态（本地保存）
  if (row._backup) {
    delete row._backup
  }
  row._isEditing = false
  MessagePlugin.success('字段已本地保存')
}

// 删除字段（调用后端接口，删除成功后刷新列表）
const handleDeleteField = async (row) => {
  if (!row) return
  if (row._isNew) {
    templateFields.value = templateFields.value.filter(f => f.id !== row.id)
    isAddingField.value = false
    MessagePlugin.success('已取消新增字段')
    return
  }

  try {
    await deleteTemplateField(row.id)
    MessagePlugin.success('删除成功')
    // 刷新字段列表（弹窗仍保持打开）
    const res = await getTemplateFields(configuringTemplateId.value)
    const data = res.data || []
    // removed sort handling
    templateFields.value = data
  } catch (error) {
    console.error('删除字段失败:', error)
    MessagePlugin.error('删除字段失败，请重试')
  }
}

// Note: move/up/down and sort logic removed per request

// 全局取消（关闭并清理临时数据）
const handleCancelConfig = () => {
  configDrawerVisible.value = false
  // 清理新增临时行
  templateFields.value = templateFields.value.filter(f => !f._isNew)
  isAddingField.value = false
}

// 全局保存：创建所有临时新增字段并刷新列表
const handleSaveConfig = async () => {
  console.log('templateFields.value',templateFields.value)

  savingConfig.value = true
  try {
    // 将当前所有字段作为 payload 发送给后端批量保存接口 (移除 sort 字段)
    const fieldsPayload = templateFields.value.map(f => ({
      id: f._isNew ? undefined : f.id,
      template_id: f.templateId ? String(f.templateId) : String(configuringTemplateId.value),
      field_code: f.fieldCode,
      field_name: f.fieldName,
      field_type: f.fieldType,
      field_default_value: f.fieldDefaultValue || null,
      is_edit: f.isEdit ? 1 : 0,
      is_required: f.isRequired ? 1 : 0,
      prompt_content: f.promptContent || '',
      // position removed
    }))

    const submitData = {
      template_id: String(configuringTemplateId.value),
      fields: fieldsPayload
    }

    await saveTemplateFields(submitData)
    MessagePlugin.success('保存成功')

    // 刷新字段列表
    const res = await getTemplateFields(configuringTemplateId.value)
    const data = res.data || []
    // keep backend order as-is (sort removed)
    templateFields.value = data
    isAddingField.value = false
  } catch (error) {
    console.error('保存配置失败:', error)
    MessagePlugin.error('保存配置失败，请重试')
  } finally {
    savingConfig.value = false
  }
}

// 删除模板
const handleDelete = async (row) => {
  try {
    await deleteTemplate(row.id)
    MessagePlugin.success('删除成功')
    loadTemplatesList()
  } catch (error) {
    console.error('删除失败:', error)
    MessagePlugin.error('删除失败，请重试')
  }
}

// 设计模板 - 跳转到模板设计页面，带上 templateId 查询参数
import { useRouter } from 'vue-router'
const router = useRouter()
const handleDesignTemplate = (row) => {
  if (!row) return
  router.push({ path: `/enterprise-admin/${enterpriseId.value}/template-design`, query: { templateId: row.id } })
}

// 加载模板列表
const loadTemplatesList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.value.current,
      size: pagination.value.pageSize,
      name: filterForm.value.name,
      description: '',
      code: filterForm.value.code,
      companyId: Number(enterpriseId.value),
      status: filterForm.value.status === 'active' ? 1 : filterForm.value.status === 'inactive' ? 0 : undefined
    }

    // 如果有类型筛选，需要根据业务逻辑映射
    // 这里先注释，等待后端确认字段映射
    // if (filterForm.value.type) {
    //   params.type = filterForm.value.type
    // }

    const res = await getTemplateListPage(params)

    // 假设API返回的数据结构为 { data: { records: [], total: 0, current: 1, size: 10 } }
    // 根据实际API响应调整数据结构
    const records = res.data?.records || res.data?.list || []

    // 数据结构映射，将API字段映射为前端需要的字段
    templatesList.value = records.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      code: item.code, // 模板编码
      type: 'task', // API中没有type字段，默认为task，可根据业务需要调整
      status: item.status === 1 ? 'active' : 'inactive', // API返回1/0，前端使用active/inactive
      creatorName: '系统', // API中没有创建者信息，使用默认值
      creatorAvatar: '', // API中没有头像信息
      createdAt: '暂无', // API中没有时间字段
      updatedAt: '暂无', // API中没有时间字段
      isDefault: item.is_default, // 是否默认模板
      companyName: item.company_name // 企业名称
    }))

    pagination.value.total = res.data?.total || 0
    pagination.value.current = res.data?.current || pagination.value.current
    pagination.value.pageSize = res.data?.size || pagination.value.pageSize

  } catch (error) {
    console.error('获取模板列表失败:', error)
  MessagePlugin.error('获取模板列表失败')
    // 如果API调用失败，使用模拟数据作为fallback
    templatesList.value = [
      {
        id: 1,
        name: '软件开发任务模板',
        description: '用于软件开发项目的标准任务模板',
        type: 'task',
        status: 'active',
        creatorName: '张三',
        creatorAvatar: '',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-20 14:20:00'
      }
    ]
    pagination.value.total = 1
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTemplatesList()
})
</script>

<style scoped lang="scss">
.custom-templates-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.templates-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.t-card__header) {
    padding: 24px 32px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  :deep(.t-card__body) {
    padding: 24px 32px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
    letter-spacing: -0.01em;
  }
}

.action-bar {
  margin-bottom: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 0;
  margin-left: 0;
}

.filter-section {
  margin-bottom: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 0;
  margin-left: 0;

  :deep(.t-form) {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    padding: 0;
  }

  :deep(.t-form-item) {
    margin-bottom: 0;
    margin-left: 0;
    padding-left: 0;

    .t-form__label {
      width: 80px;
      text-align: left;
      padding-right: 12px;
      margin-right: 0;
    }
  }
}

.templates-table {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.t-table) {
    height: 100%;
    display: flex;
    flex-direction: column;

    .t-table__header {
      background: rgba(250, 250, 250, 0.8);
      backdrop-filter: saturate(180%) blur(10px);
      -webkit-backdrop-filter: saturate(180%) blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .t-table__body {
      flex: 1;
      overflow-y: auto;
    }

    .t-table__content {
      flex: 1;
      overflow: hidden;
    }
  }

  // 优化表格样式
  :deep(.t-table__row) {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }
  }

  :deep(.t-table__cell) {
    padding: 16px 12px;
  }

  // 自定义滚动条
  :deep(.t-table__body) {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.12);
      border-radius: 10px;
      transition: background 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}

// 对话框蒙层透明 - 参考部门弹窗样式
:deep(.template-dialog) {
  .t-dialog__mask {
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .t-dialog {
    border: none !important;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  }
}

// 对话框底部按钮样式 - 右下角对齐
:deep(.dialog-footer) {
  text-align: right;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  .t-form-item__content {
    justify-content: flex-end;
  }
}

// 配置抽屉样式
.template-config-drawer {
  :deep(.t-drawer__content) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
  }
}

.config-content {
  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .fields-table {
    :deep(.t-table) {
      background: transparent;

      .t-table__header {
        background: rgba(250, 250, 250, 0.8);
        backdrop-filter: saturate(180%) blur(10px);
        -webkit-backdrop-filter: saturate(180%) blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .t-table__body {
        .t-table__row {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            background: rgba(0, 0, 0, 0.02);
          }
        }
      }

      .t-table__cell {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }

      .default-value {
        color: #666;
        font-style: italic;
      }
    }
  }
}

// 配置弹窗固定宽高并滚动
:deep(.template-config-dialog) {
  .t-dialog {
    width: 1000px !important;
    max-height: 720px !important;
    border-radius: 8px;
  }

  .t-dialog__body {
    max-height: 620px;
    overflow-y: auto;
    padding: 16px 24px;
  }
}
</style>
