<template>
  <div class="members-page">
    <t-card :bordered="false" class="members-card">
      <template #header>
        <div class="card-header">
          <h3 class="page-title">成员</h3>
        </div>
      </template>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
// import { getMembersList, removeMember } from '@/api/enterprise'

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
  MessagePlugin.info('添加成员功能开发中')
}

// 编辑成员
const handleEdit = (row) => {
  MessagePlugin.info(`编辑成员: ${row.name}`)
}

// 移除成员
const handleRemove = async (row) => {
  try {
    // TODO: 调用API移除成员
    // await removeMember(enterpriseId.value, row.id)
    MessagePlugin.success('移除成功')
    loadMembersList()
  } catch (error) {
    console.error('移除失败:', error)
    MessagePlugin.error('移除失败，请重试')
  }
}

// 加载成员列表
const loadMembersList = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取成员列表
    // const res = await getMembersList(enterpriseId.value, {
    //   page: pagination.value.current,
    //   pageSize: pagination.value.pageSize,
    //   name: filterForm.value.name,
    //   email: filterForm.value.email,
    //   status: filterForm.value.status
    // })
    // membersList.value = res.data.list || []
    // pagination.value.total = res.data.total || 0

    // 临时使用模拟数据
    membersList.value = [
      {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        avatar: '',
        role: '管理员',
        department: '技术部',
        status: 'active',
        joinTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: '李四',
        email: 'lisi@example.com',
        avatar: '',
        role: '成员',
        department: '产品部',
        status: 'active',
        joinTime: '2024-02-20 14:20:00'
      },
      {
        id: 3,
        name: '王五',
        email: 'wangwu@example.com',
        avatar: '',
        role: '成员',
        department: '设计部',
        status: 'pending',
        joinTime: '2024-03-10 09:15:00'
      }
    ]
    pagination.value.total = 3
  } catch (error) {
    console.error('获取成员列表失败:', error)
    MessagePlugin.error('获取成员列表失败')
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





