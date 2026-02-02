<template>
  <div class="menu-container">
    <div class="menu-layout">
      <!-- 左侧：菜单树 -->
      <t-card class="menu-tree-card">
        <div class="card-header">
          <t-button
            v-permission="'rbac:menu:add'"
            theme="primary"
            size="small"
            @click="handleCreate"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
        </div>

        <t-tree
          :data="menuTreeData"
          :keys="{ value: 'id', label: 'menuName', children: 'children' }"
          :expand-all="false"
          :expand-level="0"
          :activable="true"
          :active-ids="activeMenuIds"
          hover
          class="menu-tree"
          @click="handleMenuClick"
        >
          <template #label="{ node }">
            <div class="tree-node-label">
              <t-icon v-if="node.data.icon" :name="node.data.icon" size="16px" />
              <span>{{ node.data.menuName }}</span>
              <t-tag
                v-if="node.data.menuType"
                :theme="getMenuTypeTheme(node.data.menuType)"
                size="small"
                style="margin-left: 8px"
              >
                {{ getMenuTypeText(node.data.menuType) }}
              </t-tag>
            </div>
          </template>
          <template #operations="{ node }">
            <t-space size="small">
              <t-button
                v-if="node.data.menuType < 3"
                v-permission="'rbac:menu:add'"
                theme="primary"
                variant="text"
                size="small"
                @click.stop="handleAddChild(node.data)"
              >
                新增
              </t-button>
              <t-button
                v-permission="'rbac:menu:edit'"
                theme="primary"
                variant="text"
                size="small"
                @click.stop="handleEditMenu(node.data)"
              >
                编辑
              </t-button>
              <t-button
                v-permission="'rbac:menu:delete'"
                theme="danger"
                variant="text"
                size="small"
                @click.stop="handleDeleteMenu(node.data)"
              >
                删除
              </t-button>
            </t-space>
          </template>
        </t-tree>
      </t-card>

      <!-- 右侧：按钮权限列表 -->
      <t-card class="menu-detail-card">
        <div class="card-header">
          <h4>按钮权限</h4>
          <t-button
            v-permission="'rbac:menu:add'"
            theme="primary"
            size="small"
            :disabled="!currentMenu || currentMenu.menuType !== 2"
            @click="handleCreateButton"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
        </div>

        <t-alert
          v-if="!currentMenu"
          theme="info"
          message="请先在左侧选择一个菜单"
          style="margin-bottom: 16px"
        />

        <t-alert
          v-else-if="currentMenu.menuType !== 2"
          theme="warning"
          message="只有菜单类型才能添加按钮权限，请选择菜单类型"
          style="margin-bottom: 16px"
        />

        <div v-else>
          <div class="menu-info">
            <div class="info-item">
              <span class="label">当前菜单：</span>
              <span class="value">{{ currentMenu.menuName }}</span>
            </div>
            <div class="info-item">
              <span class="label">菜单路径：</span>
              <span class="value">{{ currentMenu.path || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">组件地址：</span>
              <span class="value">{{ currentMenu.component || '-' }}</span>
            </div>
          </div>

          <t-table
            :data="buttonList"
            :columns="buttonColumns"
            :loading="buttonLoading"
            row-key="id"
            stripe
            hover
            class="button-table"
          >
            <template #component="{ row }">
              <span>{{ row.component || '-' }}</span>
            </template>

            <template #icon="{ row }">
              <t-icon v-if="row.icon" :name="row.icon" size="20px" />
              <span v-else>-</span>
            </template>

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
                v-permission="'rbac:menu:edit'"
                theme="primary"
                variant="text"
                size="small"
                @click="handleEditButton(row)"
              >
                编辑
              </t-button>
              <t-button
                v-permission="'rbac:menu:delete'"
                theme="danger"
                variant="text"
                size="small"
                @click="handleDeleteButton(row)"
              >
                删除
              </t-button>
            </template>
          </t-table>
        </div>
      </t-card>
    </div>

    <!-- 菜单表单弹窗 -->
    <t-dialog
      v-model:visible="showFormDialog"
      :header="formTitle"
      width="700px"
      :confirm-btn="{ content: '确定', loading: formLoading }"
      @confirm="handleConfirm"
    >
      <t-form ref="formRef" :data="formData" :rules="formRules" label-width="120px">
        <t-form-item label="上级菜单" name="parentId">
          <t-tree-select
            v-model="formData.parentId"
            :data="parentMenuOptions"
            :keys="{ value: 'id', label: 'menuName', children: 'children' }"
            placeholder="请选择上级菜单（不选则为顶级菜单）"
            clearable
          />
        </t-form-item>
        <t-form-item label="菜单类型" name="menuType">
          <t-radio-group v-model="formData.menuType">
            <t-radio :value="1">目录</t-radio>
            <t-radio :value="2">菜单</t-radio>
            <t-radio :value="3">按钮</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="菜单名称" name="menuName">
          <t-input v-model="formData.menuName" placeholder="请输入菜单名称" />
        </t-form-item>
        <t-form-item label="菜单编码" name="menuCode">
          <t-input v-model="formData.menuCode" placeholder="请输入菜单编码" />
        </t-form-item>
        <t-form-item v-if="formData.menuType !== 3" label="路由路径" name="path">
          <t-input v-model="formData.path" placeholder="请输入路由路径，如：/system/user" />
        </t-form-item>
        <t-form-item v-if="formData.menuType === 2" label="组件路径" name="component">
          <t-input v-model="formData.component" placeholder="请输入组件路径，如：system/user/index" />
        </t-form-item>
        <t-form-item v-if="formData.menuType !== 3" label="菜单图标" name="icon">
          <t-input v-model="formData.icon" placeholder="请输入图标名称" />
        </t-form-item>
        <t-form-item label="权限标识" name="permission">
          <t-input v-model="formData.permission" placeholder="请输入权限标识，如：system:user:list" />
        </t-form-item>
        <t-form-item label="排序" name="sortOrder">
          <t-input-number v-model="formData.sortOrder" :min="0" />
        </t-form-item>
        <t-form-item label="是否可见" name="visible">
          <t-radio-group v-model="formData.visible">
            <t-radio :value="1">显示</t-radio>
            <t-radio :value="0">隐藏</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="formData.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { getMenuTree, addMenu, updateMenu, deleteMenu } from '@/api/admin/rbac.js'

const loading = ref(false)
const formLoading = ref(false)
const showFormDialog = ref(false)
const formRef = ref(null)
const currentMenu = ref(null)
const expandAll = ref(true)
const expandedKeys = ref([])

// 菜单树数据
const menuTreeData = ref([])

// 选中的菜单ID
const activeMenuIds = ref([])

// 按钮权限列表
const buttonList = ref([])
const buttonLoading = ref(false)

// 按钮权限表格列配置
const buttonColumns = [
  {
    colKey: 'menuName',
    title: '按钮名称',
    width: 150,
    align: 'left'
  },
  {
    colKey: 'menuCode',
    title: '按钮编码',
    width: 150,
    align: 'left'
  },
  {
    colKey: 'component',
    title: '组件地址',
    width: 200,
    align: 'left',
    ellipsis: true
  },
  {
    colKey: 'permission',
    title: '权限标识',
    width: 200,
    align: 'left',
    ellipsis: true
  },
  {
    colKey: 'icon',
    title: '图标',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'sortOrder',
    title: '排序',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'status',
    title: '状态',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    align: 'center',
    fixed: 'right'
  }
]

// 表单数据
const formData = ref({
  parentId: 0,
  menuName: '',
  menuCode: '',
  menuType: 1,
  path: '',
  component: '',
  icon: '',
  sortOrder: 0,
  visible: 1,
  status: 1,
  permission: ''
})

// 表单校验规则
const formRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

// 表单标题
const formTitle = computed(() => {
  return currentMenu.value ? '编辑菜单' : '新增菜单'
})

// 上级菜单选项（添加根节点选项）
const parentMenuOptions = computed(() => {
  const rootOption = { id: 0, menuName: '根目录', children: [] }
  // 如果是编辑，过滤掉自己和自己的子节点
  if (currentMenu.value) {
    const filtered = filterMenuTree(menuTreeData.value, currentMenu.value.id)
    rootOption.children = filtered
  } else {
    rootOption.children = menuTreeData.value
  }
  return [rootOption]
})

// 过滤菜单树（排除指定节点及其子节点）
const filterMenuTree = (tree, excludeId) => {
  return tree.filter(item => {
    if (item.id === excludeId) {
      return false
    }
    if (item.children && item.children.length > 0) {
      item.children = filterMenuTree(item.children, excludeId)
    }
    return true
  })
}

// 获取菜单类型文本
const getMenuTypeText = (type) => {
  const map = { 1: '目录', 2: '菜单', 3: '按钮' }
  return map[type] || '-'
}

// 获取菜单类型主题
const getMenuTypeTheme = (type) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning' }
  return map[type] || 'default'
}

// 获取所有节点ID
const getAllNodeIds = (tree) => {
  const ids = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(tree)
  return ids
}

// 加载菜单树
const loadMenuTree = async () => {
  loading.value = true
  try {
    const res = await getMenuTree()
    menuTreeData.value = res.data
    // 默认展开所有节点
    if (expandAll.value) {
      expandedKeys.value = getAllNodeIds(menuTreeData.value)
    }
  } catch (error) {
    await MessagePlugin.error('加载菜单树失败')
  } finally {
    loading.value = false
  }
}

// 展开/收起全部
const handleExpandAll = () => {
  expandAll.value = !expandAll.value
  if (expandAll.value) {
    expandedKeys.value = getAllNodeIds(menuTreeData.value)
  } else {
    expandedKeys.value = []
  }
}

// 展开状态改变
const handleExpandChange = (value) => {
  expandedKeys.value = value
}

// 新增
const handleCreate = () => {
  currentMenu.value = null
  formData.value = {
    parentId: 0,
    menuName: '',
    menuCode: '',
    menuType: 1,
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    visible: 1,
    status: 1,
    permission: ''
  }
  showFormDialog.value = true
}

// 新增子菜单
const handleAddChild = (row) => {
  currentMenu.value = null
  formData.value = {
    parentId: row.id,
    menuName: '',
    menuCode: '',
    menuType: row.menuType === 1 ? 2 : 3,
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    visible: 1,
    status: 1,
    permission: ''
  }
  showFormDialog.value = true
}

// 点击菜单节点
const handleMenuClick = (context) => {
  const { node } = context
  activeMenuIds.value = [node.value]
  currentMenu.value = node.data

  // 如果是菜单类型（menuType === 2），加载按钮权限
  if (node.data.menuType === 2) {
    loadButtonList(node.data)
  } else {
    buttonList.value = []
  }
}

// 加载按钮权限列表
const loadButtonList = (menu) => {
  buttonLoading.value = true
  try {
    // 从菜单的children中筛选出按钮类型（menuType === 3）
    if (menu.children && menu.children.length > 0) {
      buttonList.value = menu.children.filter(item => item.menuType === 3)
    } else {
      buttonList.value = []
    }
  } finally {
    buttonLoading.value = false
  }
}

// 编辑菜单
const handleEditMenu = (row) => {
  currentMenu.value = row
  formData.value = {
    id: row.id,
    parentId: row.parentId,
    menuName: row.menuName,
    menuCode: row.menuCode,
    menuType: row.menuType,
    path: row.path,
    component: row.component,
    icon: row.icon,
    sortOrder: row.sortOrder,
    visible: row.visible,
    status: row.status,
    permission: row.permission
  }
  showFormDialog.value = true
}

// 删除菜单
const handleDeleteMenu = async (row) => {
  // 检查是否有子菜单
  if (row.children && row.children.length > 0) {
    await MessagePlugin.warning('该菜单下有子菜单，请先删除子菜单')
    return
  }

  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除菜单 "${row.menuName}" 吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteMenu(row.id)
        await MessagePlugin.success('删除成功')
        // 清空选中状态
        currentMenu.value = null
        activeMenuIds.value = []
        buttonList.value = []
        loadMenuTree()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error('删除失败')
      }
    }
  })
}

// 新增按钮权限
const handleCreateButton = () => {
  if (!currentMenu.value || currentMenu.value.menuType !== 2) {
    MessagePlugin.warning('请先选择一个菜单类型')
    return
  }

  // 设置父ID为当前选中的菜单
  formData.value = {
    parentId: currentMenu.value.id,
    menuName: '',
    menuCode: '',
    menuType: 3,  // 按钮类型
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    visible: 1,
    status: 1,
    permission: ''
  }
  currentMenu.value = null  // 清空currentMenu用于标识是新增
  showFormDialog.value = true
}

// 编辑按钮
const handleEditButton = (row) => {
  currentMenu.value = row
  formData.value = {
    id: row.id,
    parentId: row.parentId,
    menuName: row.menuName,
    menuCode: row.menuCode,
    menuType: row.menuType,
    path: row.path,
    component: row.component,
    icon: row.icon,
    sortOrder: row.sortOrder,
    visible: row.visible,
    status: row.status,
    permission: row.permission
  }
  showFormDialog.value = true
}

// 删除按钮
const handleDeleteButton = async (row) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除按钮 "${row.menuName}" 吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteMenu(row.id)
        await MessagePlugin.success('删除成功')
        // 重新加载按钮列表
        if (currentMenu.value && currentMenu.value.menuType === 2) {
          loadMenuTree()  // 重新加载整个树以更新按钮列表
        }
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
    if (currentMenu.value) {
      await updateMenu(currentMenu.value.id, formData.value)
      await MessagePlugin.success('更新成功')
    } else {
      await addMenu(formData.value)
      await MessagePlugin.success('创建成功')
    }
    showFormDialog.value = false
    loadMenuTree()
  } catch (error) {
    await MessagePlugin.error(currentMenu.value ? '更新失败' : '创建失败')
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  loadMenuTree()
})
</script>

<style scoped lang="less">
.menu-container {
  padding: 2px;
}

.menu-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 150px);
}

.menu-tree-card {
  width: 450px;
  min-width: 450px;
  display: flex;
  flex-direction: column;

  :deep(.t-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e7e7e7;
    flex-shrink: 0;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }
  }

  .menu-tree {
    flex: 1;
    overflow-y: auto;

    .tree-node-label {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      span {
        flex: 1;
      }
    }

    :deep(.t-tree__item) {
      padding: 2px 0;
      margin-bottom: 0;
    }

    :deep(.t-tree__label) {
      width: 100%;
    }

    :deep(.t-tree__line) {
      margin: 0;
    }
  }
}

.menu-detail-card {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.t-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e7e7e7;
    flex-shrink: 0;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }
  }

  .menu-info {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    flex-shrink: 0;

    .info-item {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 500;
        color: #646a73;
        margin-right: 8px;
      }

      .value {
        color: #1f2329;
      }
    }
  }

  .button-table {
    flex: 1;
    overflow: auto;
  }
}
</style>
