<template>
  <div class="item-type-management-page">
    <t-card :bordered="false" class="item-types-card">
      <div class="action-bar">
        <t-space>
          <t-button theme="primary" @click="handleCreateItemType">
            <template #icon>
              <t-icon name="add-circle" />
            </template>
            新建事项类型
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

      <t-form :data="filterForm" layout="inline" label-width="80px" class="filter-section">
        <t-form-item label="类型名称" name="name">
          <t-input
            v-model="filterForm.name"
            placeholder="请输入类型名称"
            clearable
            style="width: 200px"
            @enter="handleSearch"
          />
        </t-form-item>
        <t-form-item label="类型编码" name="code">
          <t-input
            v-model="filterForm.code"
            placeholder="请输入类型编码"
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

      <div class="item-types-table">
        <t-table
          :data="itemTypesList"
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
            </t-space>
          </template>
        </t-table>
      </div>
    </t-card>

    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      width="600px"
      :confirm-btn="{
        content: '确定',
        theme: 'primary',
        loading: submitting
      }"
      @confirm="handleSubmit"
    >
      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        label-width="100px"
        @submit="handleSubmit"
      >
        <t-form-item label="类型名称" name="name">
          <t-input
            v-model="formData.name"
            placeholder="请输入类型名称"
            clearable
          />
        </t-form-item>
        <t-form-item label="类型编码" name="code">
          <t-input
            v-model="formData.code"
            placeholder="请输入类型编码"
            clearable
          />
        </t-form-item>
        <t-form-item label="部门" name="departmentId">
          <t-select
            v-model="formData.departmentId"
            placeholder="请选择部门"
            clearable
            filterable
            style="width: 100%"
          >
            <t-option
              v-for="dept in departmentList"
              :key="dept.id"
              :value="dept.id"
              :label="dept.name"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number
            v-model="formData.sort"
            :min="0"
            placeholder="请输入排序"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="formData.status">
            <t-radio value="active">启用</t-radio>
            <t-radio value="inactive">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea
            v-model="formData.description"
            placeholder="请输入描述"
            :maxlength="500"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建事项类型')
const formRef = ref(null)
const departmentList = ref([])

const filterForm = reactive({
  name: '',
  code: '',
  status: ''
})

const formData = reactive({
  id: null,
  name: '',
  code: '',
  departmentId: null,
  sort: 0,
  status: 'active',
  description: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入类型名称', type: 'error' }
  ],
  code: [
    { required: true, message: '请输入类型编码', type: 'error' }
  ]
}

const columns = [
  { colKey: 'name', title: '类型名称', width: 200 },
  { colKey: 'code', title: '类型编码', width: 180 },
  { colKey: 'departmentName', title: '部门', width: 150 },
  { colKey: 'sort', title: '排序', width: 100 },
  { colKey: 'description', title: '描述', ellipsis: true },
  { colKey: 'status', title: '状态', width: 100, cell: 'status' },
  { colKey: 'createTime', title: '创建时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right', cell: 'operation' }
]

const itemTypesList = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const getStatusTheme = (status) => {
  return status === 'active' ? 'success' : 'default'
}

const getStatusText = (status) => {
  return status === 'active' ? '启用' : '禁用'
}

const handleSearch = async () => {
  loading.value = true
  try {
    // 模拟查询数据
    const mockData = [
      {
        id: 1,
        name: 'Bug修复',
        code: 'BUG',
        departmentId: 1,
        departmentName: '技术部',
        sort: 1,
        status: 'active',
        description: '软件缺陷修复',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '功能开发',
        code: 'FEATURE',
        departmentId: 1,
        departmentName: '技术部',
        sort: 2,
        status: 'active',
        description: '新功能开发',
        createTime: '2024-01-02 11:00:00'
      }
    ]
    
    // 应用筛选
    let filteredData = [...mockData]
    if (filterForm.name) {
      filteredData = filteredData.filter(item => item.name.includes(filterForm.name))
    }
    if (filterForm.code) {
      filteredData = filteredData.filter(item => item.code.includes(filterForm.code))
    }
    if (filterForm.status) {
      filteredData = filteredData.filter(item => item.status === filterForm.status)
    }
    
    itemTypesList.value = filteredData
    pagination.total = filteredData.length
  } catch (error) {
    console.error('查询失败:', error)
    MessagePlugin.error('查询失败')
  } finally {
    loading.value = false
  }
}

const handleResetFilter = () => {
  filterForm.name = ''
  filterForm.code = ''
  filterForm.status = ''
  handleSearch()
}

const handleCreateItemType = () => {
  dialogTitle.value = '新建事项类型'
  formData.id = null
  formData.name = ''
  formData.code = ''
  formData.departmentId = null
  formData.sort = 0
  formData.status = 'active'
  formData.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑事项类型'
  formData.id = row.id
  formData.name = row.name
  formData.code = row.code
  formData.departmentId = row.departmentId
  formData.sort = row.sort
  formData.status = row.status
  formData.description = row.description
  dialogVisible.value = true
}

const handleDelete = (row) => {
  MessagePlugin.confirm(`确定要删除事项类型"${row.name}"吗？`, {
    title: '确认删除',
    onConfirm: async () => {
      try {
        // 模拟删除
        MessagePlugin.success('删除成功')
        await handleSearch()
      } catch (error) {
        console.error('删除失败:', error)
        MessagePlugin.error('删除失败')
      }
    }
  })
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (valid === true) {
    submitting.value = true
    try {
      // 模拟提交
      MessagePlugin.success(formData.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      await handleSearch()
    } catch (error) {
      console.error('操作失败:', error)
      MessagePlugin.error('操作失败')
    } finally {
      submitting.value = false
    }
  }
}

const handlePageChange = async (page) => {
  pagination.current = page
  await handleSearch()
}

const handlePageSizeChange = async (size) => {
  pagination.pageSize = size
  pagination.current = 1
  await handleSearch()
}

const loadDepartmentList = async () => {
  try {
    // 模拟加载部门列表
    departmentList.value = [
      { id: 1, name: '技术部' },
      { id: 2, name: '市场部' },
      { id: 3, name: '财务部' }
    ]
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

onMounted(async () => {
  await loadDepartmentList()
  await handleSearch()
})
</script>

<style scoped lang="scss">
.item-type-management-page {
  padding: 24px;
}

.item-types-card {
  min-height: calc(100vh - 120px);
}

.action-bar {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-types-table {
  margin-top: 20px;
}
</style>