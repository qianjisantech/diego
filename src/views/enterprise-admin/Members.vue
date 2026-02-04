<template>
  <div class="members-page">
    <t-card :bordered="false" class="members-card">
      <!-- 操作栏 -->
      <div class="action-bar">
        <t-space>
          <t-button theme="primary" @click="handleAddMember">
            <template #icon>
              <t-icon name="user-add" />
            </template>
            添加成员
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
      <t-form :data="filterForm" layout="inline" label-width="60px" class="filter-section">
        <t-form-item label="姓名" name="username">
          <t-input
            v-model="filterForm.name"
            placeholder="请输入姓名"
            clearable
            style="width: 200px"
            @enter="handleSearch"
          />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input
            v-model="filterForm.email"
            placeholder="请输入邮箱"
            clearable
            style="width: 200px"
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
            <t-option value="active" label="已激活" />
            <t-option value="inactive" label="未激活" />
            <t-option value="pending" label="待邀请" />
          </t-select>
        </t-form-item>
      </t-form>

      <!-- 成员列表 -->
      <div class="members-table">
        <t-table
          :data="membersList"
          :columns="columns"
          :loading="loading"
          row-key="id"
          :pagination="pagination"
          hover
          stripe
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #avatar="{ row }">
            <t-avatar :image="row.avatar" :alt="row.name" size="small">
              {{ row.name?.charAt(0) || 'U' }}
            </t-avatar>
          </template>

          <template #status="{ row }">
            <t-tag
              :theme="getStatusTheme(row.status)"
              variant="light"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </t-tag>
          </template>

          <template #role="{ row }">
            <t-tag theme="primary" variant="light" size="small">
              {{ row.role || '成员' }}
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
                @click="handleRemove(row)"
              >
                移除
              </t-button>
            </t-space>
          </template>
        </t-table>
      </div>
    </t-card>

    <!-- 添加成员对话框 -->
    <t-dialog
      v-model:visible="addMemberDialogVisible"
      header="添加成员"
      :confirm-btn="{ content: '确定', theme: 'primary', loading: submitLoading }"
      :cancel-btn="{ content: '取消' }"
      width="500px"
      @confirm="handleSaveMember"
      @cancel="handleCancelAdd"
    >
      <t-form
        ref="addMemberFormRef"
        :data="addMemberForm"
        :rules="addMemberFormRules"
        label-width="80px"
        @submit="handleSaveMember"
      >
        <t-form-item label="姓名" name="name">
          <t-input
            v-model="addMemberForm.name"
            placeholder="请输入姓名"
            :maxlength="50"
            clearable
          />
        </t-form-item>

        <t-form-item label="邮箱" name="email">
          <t-input
            v-model="addMemberForm.email"
            placeholder="请输入邮箱"
            :maxlength="100"
            clearable
          />
        </t-form-item>

        <t-form-item label="角色" name="role">
          <t-select
            v-model="addMemberForm.role"
            placeholder="请选择角色"
            clearable
          >
            <t-option value="admin" label="管理员" />
            <t-option value="member" label="成员" />
          </t-select>
        </t-form-item>

        <t-form-item label="部门" name="department">
          <t-input
            v-model="addMemberForm.department"
            placeholder="请输入部门"
            :maxlength="50"
            clearable
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getEnterpriseMemberPage, deleteEnterpriseMember, createEnterpriseMember } from '@/api/enterprise/enterprisemember.js'

const route = useRoute()

// 企业ID
const enterpriseId = computed(() => route.params.id)

// 搜索和筛选
const filterForm = ref({
  name: '',
  email: '',
  status: ''
})

// 加载状态
const loading = ref(false)

// 成员列表
const membersList = ref([])

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 添加成员对话框
const addMemberDialogVisible = ref(false)
const addMemberFormRef = ref(null)
const submitLoading = ref(false)

// 添加成员表单
const addMemberForm = ref({
  name: '',
  email: '',
  role: 'member',
  department: ''
})

// 添加成员表单验证规则
const addMemberFormRules = {
  name: [
    { required: true, message: '请输入姓名', type: 'error' },
    { max: 50, message: '姓名不能超过50个字符', type: 'warning' }
  ],
  email: [
    { required: true, message: '请输入邮箱', type: 'error' },
    { email: true, message: '请输入正确的邮箱格式', type: 'warning' },
    { max: 100, message: '邮箱不能超过100个字符', type: 'warning' }
  ],
  role: [
    { required: true, message: '请选择角色', type: 'error' }
  ],
  department: [
    { max: 50, message: '部门不能超过50个字符', type: 'warning' }
  ]
}

// 表格列配置
const columns = [
  {
    colKey: 'avatar',
    title: '头像',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'name',
    title: '姓名',
    width: 120
  },
  {
    colKey: 'email',
    title: '邮箱',
    width: 200
  },
  {
    colKey: 'role',
    title: '角色',
    width: 100
  },
  {
    colKey: 'department',
    title: '部门',
    width: 150
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100
  },
  {
    colKey: 'joinTime',
    title: '加入时间',
    width: 180
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    fixed: 'right'
  }
]

// 获取状态主题
const getStatusTheme = (status) => {
  const themeMap = {
    active: 'success',
    inactive: 'default',
    pending: 'warning'
  }
  return themeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '已激活',
    inactive: '未激活',
    pending: '待邀请'
  }
  return textMap[status] || '未知'
}

// 搜索
const handleSearch = () => {
  loadMembersList()
}

// 重置筛选
const handleResetFilter = () => {
  filterForm.value = {
    name: '',
    email: '',
    status: ''
  }
  loadMembersList()
}

// 分页变化
const handlePageChange = (page) => {
  pagination.value.current = page
  loadMembersList()
}

const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
  loadMembersList()
}

// 添加成员
const handleAddMember = () => {
  addMemberForm.value = {
    name: '',
    email: '',
    role: 'member',
    department: ''
  }
  addMemberDialogVisible.value = true
}

// 保存成员
const handleSaveMember = async () => {
  const valid = await addMemberFormRef.value?.validate()
  if (!valid) return

  submitLoading.value = true
  try {
    const res = await createEnterpriseMember(addMemberForm.value)
    if (res.success) {
      await MessagePlugin.success('添加成功')
      addMemberDialogVisible.value = false
      loadMembersList()
    } else {
      await MessagePlugin.error(res.message || '添加失败')
    }
  } catch (error) {
    console.error('添加成员失败:', error)
    await MessagePlugin.error('添加失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 取消添加
const handleCancelAdd = () => {
  addMemberDialogVisible.value = false
  addMemberForm.value = {
    name: '',
    email: '',
    role: 'member',
    department: ''
  }
}

// 编辑成员
const handleEdit = (row) => {
  MessagePlugin.info(`编辑成员: ${row.name}`)
}

// 移除成员
const handleRemove = async (row) => {
  try {
    const res = await deleteEnterpriseMember(row.id)
    if (res.success) {
      MessagePlugin.success('移除成功')
      loadMembersList()
    } else {
      MessagePlugin.error(res.message || '移除失败')
    }
  } catch (error) {
    console.error('移除失败:', error)
    MessagePlugin.error('移除失败，请重试')
  }
}

// 加载成员列表
const loadMembersList = async () => {
  loading.value = true
  try {
    const res = await getEnterpriseMemberPage({
      enterpriseId: enterpriseId.value,
      current: pagination.value.current,
      size: pagination.value.size,
      name: filterForm.value.name,
      email: filterForm.value.email,
      status: filterForm.value.status
    })
    if (res.success) {
      membersList.value = res.data.list || []
      pagination.value.total = res.data.total || 0
    } else {
      await MessagePlugin.error(res.message || '获取成员列表失败')
    }
  } catch (error) {
    console.error('获取成员列表失败:', error)
    await MessagePlugin.error('获取成员列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMembersList()
})
</script>

<style scoped lang="scss">
.members-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.members-card {
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
      width: 60px;
      text-align: left;
      padding-right: 12px;
      margin-right: 0;
    }
  }
}

.members-table {
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
</style>





