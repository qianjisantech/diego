<template>
  <div class="role-container">
    <t-card class="role-card">
      <!-- 操作按钮区域 -->
      <div class="action-bar">
        <t-space>
          <t-button
            v-permission="'rbac:role:add'"
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
          <t-form-item label="角色编码" name="roleCode">
            <t-input v-model="searchForm.roleCode" placeholder="请输入角色编码" clearable style="width: 200px;" />
          </t-form-item>
          <t-form-item label="角色名称" name="roleName">
            <t-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable style="width: 200px;" />
          </t-form-item>
          <t-form-item label="状态" name="status">
            <t-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
              <t-option :value="1" label="启用" />
              <t-option :value="0" label="禁用" />
            </t-select>
          </t-form-item>
        </t-form>
      </div>

      <t-table
        :data="roleList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        stripe
        hover
        class="role-table"
      >
        <template #status="{ row }">
          <t-tag
            :theme="row.status === 1 ? 'success' : 'default'"
            size="small"
          >
            {{ row.status === 1 ? '启用' : '禁用' }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-button
            v-permission="'rbac:role:edit'"
            theme="primary"
            variant="text"
            @click="handleEdit(row)"
          >
            编辑
          </t-button>
          <t-button
            v-permission="'rbac:role:assignPermission'"
            theme="primary"
            variant="text"
            @click="handleAssignPermission(row)"
          >
            分配权限
          </t-button>
          <t-button
            v-permission="'rbac:role:delete'"
            theme="danger"
            variant="text"
            @click="handleDelete(row)"
          >
            删除
          </t-button>
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

    <!-- 角色表单弹窗 -->
    <t-dialog
      v-model:visible="showFormDialog"
      :header="formTitle"
      width="600px"
      :confirm-btn="{ content: '确定', loading: formLoading }"
      @confirm="handleConfirm"
    >
      <t-form ref="formRef" :data="formData" :rules="formRules" label-width="100px">
        <t-form-item label="角色编码" name="roleCode">
          <t-input v-model="formData.roleCode" placeholder="请输入角色编码" />
        </t-form-item>
        <t-form-item label="角色名称" name="roleName">
          <t-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </t-form-item>
        <t-form-item label="角色描述" name="description">
          <t-textarea v-model="formData.description" placeholder="请输入角色描述" :autosize="{ minRows: 3, maxRows: 5 }" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="formData.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 分配权限抽屉 -->
    <t-drawer
      v-model:visible="showPermissionDialog"
      title="分配权限"
      :width="1200"
      :confirm-btn="{ content: '确定', loading: permissionLoading }"
      class="permission-drawer"
      @confirm="handleConfirmPermission"
      @cancel="showPermissionDialog = false"
    >
      <div class="drawer-content-wrapper">
        <!-- 操作按钮栏 -->
        <div v-if="!permissionDataLoading" class="drawer-actions">
          <t-space>
            <t-button theme="primary" variant="outline" @click="handleSelectAll">
              全选
            </t-button>
            <t-button theme="primary" variant="outline" @click="handleExpandAll">
              展开全部
            </t-button>
          </t-space>
        </div>

        <!-- 数据加载中 -->
        <div v-if="permissionDataLoading" class="drawer-loading">
          <t-loading size="large" text="加载权限数据中..." />
        </div>

        <!-- 权限树 -->
        <t-tree
          v-else
          v-model="selectedPermissions"
          v-model:expanded="expandedKeys"
          :data="menuTreeData"
          :keys="{ value: 'id', label: 'menuName', children: 'children' }"
          checkable
          value-mode="all"
          hover
        />
      </div>
    </t-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { getRolePage, addRole, updateRole, deleteRole, assignRolePermissions, getRoleMenuIds } from '@/api/admin/rbac.js'
import { getMenuTree } from '@/api/admin/rbac.js'

const loading = ref(false)
const formLoading = ref(false)
const permissionLoading = ref(false)
const permissionDataLoading = ref(false)
const showFormDialog = ref(false)
const showPermissionDialog = ref(false)
const formRef = ref(null)
const currentRole = ref(null)

// 搜索表单
const searchForm = ref({
  roleCode: '',
  roleName: '',
  status: undefined
})

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 角色列表
const roleList = ref([])

// 表格列配置
const columns = [
  {
    colKey: 'roleCode',
    title: '角色编码',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'roleName',
    title: '角色名称',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'description',
    title: '角色描述',
    ellipsis: true,
    align: 'left'
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: 180,
    align: 'center'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 280,
    align: 'center',
    fixed: 'right'
  }
]

// 表单数据
const formData = ref({
  roleCode: '',
  roleName: '',
  description: '',
  status: 1
})

// 表单校验规则
const formRules = {
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 表单标题
const formTitle = computed(() => {
  return currentRole.value ? '编辑角色' : '新增角色'
})

// 菜单树数据
const menuTreeData = ref([])
const selectedPermissions = ref([])
const expandedKeys = ref([]) // 展开的节点keys

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    const res = await getRolePage(params)
    roleList.value = res.data.records
    pagination.value.total = res.data.total
  } catch (error) {
    await MessagePlugin.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 加载菜单树
const loadMenuTree = async () => {
  try {
    const res = await getMenuTree()
    menuTreeData.value = res.data
  } catch (error) {
    await MessagePlugin.error('加载菜单树失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadRoleList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    roleCode: '',
    roleName: '',
    status: undefined
  }
  pagination.value.current = 1
  loadRoleList()
}

// 分页改变
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  loadRoleList()
}

// 每页条数改变
const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  loadRoleList()
}

// 新增
const handleCreate = () => {
  currentRole.value = null
  formData.value = {
    roleCode: '',
    roleName: '',
    description: '',
    status: 1
  }
  showFormDialog.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRole.value = row
  formData.value = {
    id: row.id,
    roleCode: row.roleCode,
    roleName: row.roleName,
    description: row.description,
    status: row.status
  }
  showFormDialog.value = true
}

// 删除
const handleDelete = (row) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除角色 "${row.roleName}" 吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteRole(row.id)
        await MessagePlugin.success('删除成功')
        loadRoleList()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error('删除失败')
      }
    }
  })
}

// 表单确认
const handleConfirm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true
  try {
    if (currentRole.value) {
      await updateRole(currentRole.value.id, formData.value)
      await MessagePlugin.success('更新成功')
    } else {
      await addRole(formData.value)
      await MessagePlugin.success('创建成功')
    }
    showFormDialog.value = false
    loadRoleList()
  } catch (error) {
    await MessagePlugin.error(currentRole.value ? '更新失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

// 分配权限
const handleAssignPermission = async (row) => {
  currentRole.value = row

  // 立即显示抽屉
  showPermissionDialog.value = true
  permissionDataLoading.value = true

  try {
    // 加载角色已有的权限
    const res = await getRoleMenuIds(row.id)
    if (res.success || res.code === 200) {
      selectedPermissions.value = res.data || []
    } else {
      await MessagePlugin.error(res.message || '获取角色权限失败')
      selectedPermissions.value = []
    }
  } catch (error) {
    console.error('获取角色权限失败:', error)
    await MessagePlugin.error('获取角色权限失败')
    selectedPermissions.value = []
  } finally {
    permissionDataLoading.value = false
  }
}

// 确认分配权限
const handleConfirmPermission = async () => {
  if (!currentRole.value) return

  permissionLoading.value = true
  try {
    await assignRolePermissions(currentRole.value.id, selectedPermissions.value)
    await MessagePlugin.success('分配权限成功')
    showPermissionDialog.value = false
  } catch (error) {
    await MessagePlugin.error('分配权限失败')
  } finally {
    permissionLoading.value = false
  }
}

// 全选所有权限
const handleSelectAll = () => {
  // 递归获取所有节点的ID
  const getAllNodeIds = (nodes) => {
    let ids = []
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        ids = ids.concat(getAllNodeIds(node.children))
      }
    })
    return ids
  }
  selectedPermissions.value = getAllNodeIds(menuTreeData.value)
}

// 展开全部节点
const handleExpandAll = () => {
  // 递归获取所有节点的ID用于展开
  const getAllNodeIds = (nodes) => {
    let ids = []
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        ids = ids.concat(getAllNodeIds(node.children))
      }
    })
    return ids
  }
  expandedKeys.value = getAllNodeIds(menuTreeData.value)
}

onMounted(() => {
  loadRoleList()
  loadMenuTree()
})
</script>

<style scoped lang="less">
.role-container {
  padding: 2px;
}

.role-card {
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

// 抽屉样式
:deep(.permission-drawer) {
  .t-drawer__content-wrapper {
    padding-top: 64px; // 为顶部 Header 预留组织
  }
  
  .t-drawer__body {
    padding: 0;
    height: calc(100% - 64px);
    overflow-y: auto;
  }
}

.drawer-content-wrapper {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.drawer-actions {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-component-border);
}

// 抽屉加载状态
.drawer-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 60px 0;
}
</style>
