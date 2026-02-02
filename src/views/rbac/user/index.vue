<template>
  <div class="user-container">
    <t-card class="user-card">
      <!-- 操作按钮区域 -->
      <div class="action-bar">
        <t-space>
          <t-button
            v-permission="'rbac:user:add'"
            theme="primary"
            size="medium"
            @click="handleCreate"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
          <t-button theme="primary" @click="handleSearch">查询</t-button>
          <t-button theme="default" @click="handleReset">重置</t-button>
        </t-space>
      </div>

      <!-- 搜索条件 -->
      <div class="search-bar">
        <t-form :data="searchForm" layout="inline">
          <t-form-item label="用户名" name="username">
            <t-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px;" />
          </t-form-item>
          <t-form-item label="用户编码" name="userCode">
            <t-input v-model="searchForm.userCode" placeholder="请输入用户编码" clearable style="width: 200px;" />
          </t-form-item>
          <t-form-item label="状态" name="status">
            <t-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
              <t-option :value="1" label="正常" />
              <t-option :value="0" label="禁用" />
            </t-select>
          </t-form-item>
        </t-form>
      </div>

      <t-table
        :data="userList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        stripe
        hover
        class="user-table"
      >
        <template #avatar="{ row }">
          <t-avatar v-if="row.avatar" :image="row.avatar" size="40px" />
          <t-avatar v-else size="40px">
            {{ row.username?.charAt(0)?.toUpperCase() }}
          </t-avatar>
        </template>

        <template #status="{ row }">
          <t-tag
            :theme="row.status === 1 ? 'success' : 'default'"
            size="small"
          >
            {{ row.status === 1 ? '正常' : '禁用' }}
          </t-tag>
        </template>

        <template #roles="{ row }">
          <t-space v-if="row.roles && row.roles.length > 0">
            <t-tag
              v-for="role in row.roles"
              :key="role.id"
              theme="primary"
              size="small"
              variant="outline"
            >
              {{ role.roleName }}
            </t-tag>
          </t-space>
          <span v-else style="color: #bbb">未分配角色</span>
        </template>

        <template #lastLoginTime="{ row }">
          <span v-if="row.lastLoginTime">{{ row.lastLoginTime }}</span>
          <span v-else style="color: #bbb">从未登录</span>
        </template>

        <template #operation="{ row }">
          <t-dropdown :min-column-width="120" trigger="click">
            <t-button theme="default" variant="text" shape="square">
              <t-icon name="ellipsis" size="20px" />
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item v-permission="'rbac:user:edit'" @click="handleEdit(row)">
                <t-icon name="edit" style="margin-right: 8px" />
                编辑
              </t-dropdown-item>
              <t-dropdown-item v-permission="'rbac:user:delete'" @click="handleDelete(row)">
                <t-icon name="delete" style="margin-right: 8px; color: #e34d59" />
                <span style="color: #e34d59">删除</span>
              </t-dropdown-item>
              <t-dropdown-item divider />
              <t-dropdown-item v-permission="'rbac:user:assignRole'" @click="handleAssignRole(row)">
                <t-icon name="usergroup" style="margin-right: 8px" />
                分配角色
              </t-dropdown-item>
              <t-dropdown-item v-permission="'rbac:user:resetPwd'" @click="handleResetPassword(row)">
                <t-icon name="lock-on" style="margin-right: 8px" />
                重置密码
              </t-dropdown-item>
              <t-dropdown-item v-permission="'rbac:user:edit'" @click="handleToggleStatus(row)">
                <t-icon :name="row.status === 1 ? 'poweroff' : 'check-circle'" style="margin-right: 8px" />
                {{ row.status === 1 ? '禁用' : '启用' }}
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </template>
      </t-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <t-pagination
          v-model="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-size-options="[10, 20, 50, 100]"
          show-page-size
          show-page-number
          show-jumper
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </t-card>

    <!-- 编辑用户弹窗 -->
    <t-dialog
      v-model:visible="showEditDialog"
      header="编辑用户"
      width="600px"
      :confirm-btn="{ content: '确定', loading: editLoading }"
      @confirm="handleConfirmEdit"
    >
      <t-form ref="editFormRef" :data="editForm" :rules="editRules" label-width="100px">
        <t-form-item label="用户名" name="username">
          <t-input v-model="editForm.username" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="用户编码" name="userCode">
          <t-input v-model="editForm.userCode" placeholder="请输入用户编码" />
        </t-form-item>
        <t-form-item label="昵称" name="nickname">
          <t-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="editForm.email" placeholder="请输入邮箱" />
        </t-form-item>
        <t-form-item label="手机号" name="phone">
          <t-input v-model="editForm.phone" placeholder="请输入手机号" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="editForm.status">
            <t-radio :value="1">正常</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 分配角色弹窗 -->
    <t-dialog
      v-model:visible="showRoleDialog"
      header="分配角色"
      width="500px"
      :confirm-btn="{ content: '确定', loading: roleLoading }"
      @confirm="handleConfirmRole"
    >
      <div class="role-assign-content">
        <div class="user-info">
          <t-avatar v-if="currentUser?.avatar" :image="currentUser.avatar" size="50px" />
          <t-avatar v-else size="50px">
            {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
          </t-avatar>
          <div class="user-detail">
            <div class="user-name">{{ currentUser?.username }}</div>
            <div class="user-code">{{ currentUser?.userCode }}</div>
          </div>
        </div>

        <t-divider />

        <div class="role-select">
          <t-radio-group v-model="selectedRole">
            <t-radio
              v-for="role in allRoles"
              :key="role.id"
              :value="role.id"
            >
              <div class="role-item">
                <span class="role-name">{{ role.roleName }}</span>
                <span class="role-desc">{{ role.description }}</span>
              </div>
            </t-radio>
          </t-radio-group>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { getUserPage, getRoleList, assignUserRoles, resetPassword, updateUser, deleteUser } from '@/api/admin/rbac.js'

const loading = ref(false)
const roleLoading = ref(false)
const editLoading = ref(false)
const showRoleDialog = ref(false)
const showEditDialog = ref(false)
const currentUser = ref(null)
const editFormRef = ref(null)

// 搜索表单
const searchForm = ref({
  username: '',
  userCode: '',
  status: undefined
})

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 用户列表
const userList = ref([])

// 所有角色列表
const allRoles = ref([])

// 选中的角色ID（单选）
const selectedRole = ref(null)

// 编辑表单
const editForm = ref({
  username: '',
  userCode: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1
})

// 编辑表单验证规则
const editRules = {
  username: [
    { required: true, message: '用户名不能为空', type: 'error' },
    { min: 3, max: 50, message: '用户名长度必须在3-50个字符之间', type: 'error' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', type: 'error' }
  ],
  userCode: [
    { required: true, message: '用户编码不能为空', type: 'error' },
    { max: 50, message: '用户编码不能超过50个字符', type: 'error' }
  ],
  nickname: [
    { max: 50, message: '昵称不能超过50个字符', type: 'error' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '邮箱格式不正确', type: 'warning' },
    { max: 100, message: '邮箱不能超过100个字符', type: 'error' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', type: 'warning' }
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
    colKey: 'username',
    title: '用户名',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'userCode',
    title: '用户编码',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'email',
    title: '邮箱',
    width: 180,
    align: 'left',
    ellipsis: true
  },
  {
    colKey: 'phone',
    title: '手机号',
    width: 130,
    align: 'center'
  },
  {
    colKey: 'roles',
    title: '角色',
    width: 200,
    align: 'left'
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'lastLoginTime',
    title: '最后登录时间',
    width: 180,
    align: 'center'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 80,
    align: 'center',
    fixed: 'right'
  }
]

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    const res = await getUserPage(params)
    userList.value = res.data.records
    pagination.value.total = res.data.total
  } catch (error) {
    await MessagePlugin.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 加载角色列表
const loadRoleList = async () => {
  try {
    const res = await getRoleList()
    allRoles.value = res.data
  } catch (error) {
    await MessagePlugin.error('加载角色列表失败')
  }
}

// 新增用户
const handleCreate = () => {
  MessagePlugin.info('新增用户功能开发中')
  // TODO: 打开新增用户对话框
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    username: '',
    userCode: '',
    status: undefined
  }
  pagination.value.current = 1
  loadUserList()
}

// 分页改变
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  loadUserList()
}

// 每页条数改变
const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  loadUserList()
}

// 分配角色
const handleAssignRole = (row) => {
  currentUser.value = row
  // 设置当前用户已有的角色（单选，取第一个）
  selectedRole.value = row.roles && row.roles.length > 0 ? row.roles[0].id : null
  showRoleDialog.value = true
}

// 确认分配角色
const handleConfirmRole = async () => {
  if (!currentUser.value) return

  roleLoading.value = true
  try {
    // 单选角色，传递数组包含一个角色ID
    const roleIds = selectedRole.value ? [selectedRole.value] : []
    await assignUserRoles(currentUser.value.id, roleIds)
    await MessagePlugin.success('分配角色成功')
    showRoleDialog.value = false
    await loadUserList()
  } catch (error) {
    await MessagePlugin.error('分配角色失败')
  } finally {
    roleLoading.value = false
  }
}

// 重置密码
const handleResetPassword = (row) => {
  const dialog = DialogPlugin.confirm({
    header: '确认重置密码',
    body: `确定要重置用户 "${row.username}" 的密码吗？重置后的密码为：123456`,
    confirmBtn: '确定',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await resetPassword(row.id)
        await MessagePlugin.success('密码重置成功')
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error('密码重置失败')
      }
    }
  })
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  const dialog = DialogPlugin.confirm({
    header: `确认${action}`,
    body: `确定要${action}用户 "${row.username}" 吗？`,
    confirmBtn: '确定',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        // TODO: 调用切换状态的API
        // await updateUserStatus(row.id, row.status === 1 ? 0 : 1)
        await MessagePlugin.success(`${action}成功`)
        loadUserList()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error(`${action}失败`)
      }
    }
  })
}

// 处理编辑用户
const handleEdit = (row) => {
  currentUser.value = row
  editForm.value = {
    username: row.username,
    userCode: row.userCode,
    nickname: row.nickname || '',
    email: row.email || '',
    phone: row.phone || '',
    status: row.status
  }
  showEditDialog.value = true
}

// 确认编辑用户
const handleConfirmEdit = async () => {
  // 验证表单
  const valid = await editFormRef.value.validate()
  if (!valid) {
    return
  }

  try {
    editLoading.value = true
    await updateUser(currentUser.value.id, editForm.value)
    await MessagePlugin.success('编辑用户成功')
    showEditDialog.value = false
    loadUserList()
  } catch (error) {
    await MessagePlugin.error(error.message || '编辑用户失败')
  } finally {
    editLoading.value = false
  }
}

// 处理删除用户
const handleDelete = (row) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除用户 "${row.username}" 吗？删除后不可恢复。`,
    confirmBtn: { content: '删除', theme: 'danger' },
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteUser(row.id)
        await MessagePlugin.success('删除用户成功')
        loadUserList()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error(error.message || '删除用户失败')
      }
    }
  })
}

onMounted(() => {
  loadUserList()
  loadRoleList()
})
</script>

<style scoped lang="less">
.user-container {
  padding: 2px;
}

.user-card {
  background: #fff;
  border-radius: 8px;

  :deep(.t-card__body) {
    padding: 24px;
  }
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}

.search-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;

  :deep(.t-form) {
    .t-form__item {
      margin-bottom: 0;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.role-assign-content {
  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .user-detail {
      flex: 1;

      .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #1f2329;
        margin-bottom: 4px;
      }

      .user-code {
        font-size: 14px;
        color: #8a8e99;
      }
    }
  }

  .role-select {
    :deep(.t-checkbox-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .role-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .role-name {
        font-size: 14px;
        font-weight: 500;
        color: #1f2329;
      }

      .role-desc {
        font-size: 12px;
        color: #8a8e99;
      }
    }
  }
}
</style>
