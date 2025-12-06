<template>
  <div class="organization-page">
    <t-card :bordered="false" class="organization-card">
      <template #header>
        <div class="card-header">
          <h3 class="page-title">组织架构</h3>
        </div>
      </template>

      <!-- 操作栏 -->
      <div class="action-bar">
        <t-space>
          <t-button theme="default" variant="outline" @click="handleExpandAll">
            {{ isExpandedAll ? '收起全部' : '展开全部' }}
          </t-button>
          <t-button theme="primary" @click="handleAddDepartment">
            <template #icon>
              <t-icon name="add" />
            </template>
            创建部门
          </t-button>
        </t-space>
      </div>

      <!-- 组织架构树 -->
      <div class="organization-tree">
        <t-tree
          v-if="treeData.length > 0"
          :data="treeData"
          :keys="treeKeys"
          :expand-all="isExpandedAll"
          :activable="true"
          :hover="true"
          line
          @click="handleNodeClick"
        >
          <template #label="{ node }">
            <div class="tree-node">
              <div class="node-info">
                <t-icon :name="node.data.icon || 'folder'" size="18px" class="node-icon" />
                <span class="node-name">{{ node.data.name }}</span>
                <t-tag theme="primary" variant="light" size="small" style="margin-left: 8px">
                  {{ node.data.memberCount || 0 }}人
                </t-tag>
              </div>
              <div class="node-actions">
                <t-link theme="primary" size="small" @click.stop="handleEditDepartment(node)">
                  编辑
                </t-link>
                <t-link theme="primary" size="small" @click.stop="handleAddSubDepartment(node)">
                  添加子部门
                </t-link>
                <t-link theme="danger" size="small" @click.stop="handleDeleteDepartment(node)">
                  删除
                </t-link>
              </div>
            </div>
          </template>
        </t-tree>
        <t-empty v-else description="暂无组织架构数据" />
      </div>
    </t-card>

    <!-- 创建/编辑部门对话框 -->
    <t-dialog
      v-model:visible="showDepartmentDialog"
      :header="dialogTitle"
      width="600px"
      :footer="false"
      class="department-dialog"
      @close="handleDialogClose"
    >
      <t-form
        ref="departmentFormRef"
        :data="departmentForm"
        :rules="departmentFormRules"
        label-width="120px"
        @submit="handleSubmitDepartment"
      >
        <t-form-item label="部门名称" name="name">
          <t-input
            v-model="departmentForm.name"
            placeholder="请输入部门名称"
            :maxlength="50"
            clearable
          />
        </t-form-item>
        <t-form-item label="上级部门" name="parentId">
          <t-select
            v-model="departmentForm.parentId"
            placeholder="请选择上级部门"
            :options="parentDepartmentOptions"
            :disabled="true"
          />
        </t-form-item>
        <t-form-item label="部门负责人" name="leader">
          <t-select
            v-model="departmentForm.leader"
            placeholder="请搜索并选择部门负责人"
            filterable
            clearable
            :options="leaderOptions"
            :loading="loadingLeaders"
            @change="handleLeaderChange"
          >
            <template #option="{ option }">
              <div class="leader-option">
                <t-avatar
                  :image="option.avatar"
                  :alt="option.label"
                  size="small"
                >
                  {{ option.label?.charAt(0) }}
                </t-avatar>
                <div class="leader-info">
                  <div class="leader-name">{{ option.label }}</div>
                  <div class="leader-email">{{ option.email }}</div>
                </div>
              </div>
            </template>
            <template #selected="{ option }">
              <div class="leader-selected">
                <t-avatar
                  :image="option.avatar"
                  :alt="option.label"
                  size="small"
                >
                  {{ option.label?.charAt(0) }}
                </t-avatar>
                <span>{{ option.label }}</span>
              </div>
            </template>
          </t-select>
        </t-form-item>
        <t-form-item label="部门图标" name="icon">
          <div class="icon-selector">
            <div
              v-for="icon in departmentIcons"
              :key="icon.value"
              class="icon-item"
              :class="{ active: departmentForm.icon === icon.value }"
              @click="departmentForm.icon = icon.value"
            >
              <div class="icon-box" :style="{ background: icon.color }">
                <t-icon :name="icon.icon" size="20px" />
              </div>
            </div>
          </div>
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" block>确认</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
// import { getOrganizationTree, deleteDepartment, createDepartment, updateDepartment } from '@/api/enterprise'

const route = useRoute()
const departmentFormRef = ref(null)

// 企业ID
const enterpriseId = computed(() => route.params.id)

// 企业名称
const enterpriseName = ref('企业')

// 展开全部
const isExpandedAll = ref(false)

// 树形数据
const treeData = ref([])

// 树节点键配置
const treeKeys = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 对话框控制
const showDepartmentDialog = ref(false)
const dialogTitle = ref('创建部门')
const parentNode = ref(null) // 父节点，用于添加子部门
const editingNode = ref(null) // 正在编辑的节点

// 部门表单数据
const departmentForm = ref({
  name: '',
  description: '',
  parentId: null,
  leader: null,
  leaderName: '',
  leaderAvatar: '',
  icon: 'folder'
})

// 部门图标选项
const departmentIcons = ref([
  { value: 'folder', icon: 'folder', color: '#0052D9' },
  { value: 'user', icon: 'user', color: '#0052D9' },
  { value: 'location', icon: 'location', color: '#0052D9' },
  { value: 'chart', icon: 'chart', color: '#0052D9' },
  { value: 'setting', icon: 'setting', color: '#0052D9' },
  { value: 'file', icon: 'file', color: '#0052D9' },
  { value: 'edit', icon: 'edit', color: '#ED7B2F' },
  { value: 'browse', icon: 'browse', color: '#00A870' },
  { value: 'time', icon: 'time', color: '#0052D9' },
  { value: 'usergroup', icon: 'usergroup', color: '#0052D9' },
  { value: 'view-module', icon: 'view-module', color: '#0052D9' },
  { value: 'code', icon: 'code', color: '#0052D9' },
  { value: 'check-circle', icon: 'check-circle', color: '#00A870' },
  { value: 'help-circle', icon: 'help-circle', color: '#0052D9' },
  { value: 'notification', icon: 'notification', color: '#ED7B2F' }
])

// 上级部门选项（扁平化树形数据）
const parentDepartmentOptions = computed(() => {
  // 默认显示企业选项
  const options = [{ label: enterpriseName.value, value: 'enterprise' }]
  
  const flattenTree = (nodes, level = 0) => {
    nodes.forEach(node => {
      const prefix = '  '.repeat(level)
      options.push({
        label: `${prefix}${node.name}`,
        value: node.id
      })
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1)
      }
    })
  }
  
  flattenTree(treeData.value)
  return options
})

// 表单验证规则
const departmentFormRules = {
  name: [
    { required: true, message: '请输入部门名称', type: 'error' },
    { max: 50, message: '部门名称不能超过50个字符', type: 'warning' }
  ],
  parentId: [
    { required: true, message: '请选择上级部门', type: 'error' }
  ],
  leader: [
    { required: true, message: '请选择部门负责人', type: 'error' }
  ],
  icon: [
    { required: true, message: '请选择部门图标', type: 'error' }
  ],
  description: [
    { max: 200, message: '部门描述不能超过200个字符', type: 'warning' }
  ]
}

// 生成唯一ID
let nextId = 1000
const generateId = () => {
  return nextId++
}

// 展开/收起全部
const handleExpandAll = () => {
  isExpandedAll.value = !isExpandedAll.value
}

// 节点点击
const handleNodeClick = (context) => {
  console.log('节点点击:', context)
}

// 创建部门（根部门）
const handleAddDepartment = () => {
  parentNode.value = null
  editingNode.value = null
  dialogTitle.value = '新建部门'
  departmentForm.value = {
    name: '',
    description: '',
    parentId: 'enterprise',
    leader: null,
    leaderName: '',
    leaderAvatar: '',
    icon: 'folder'
  }
  showDepartmentDialog.value = true
}

// 编辑部门
const handleEditDepartment = (node) => {
  parentNode.value = null
  editingNode.value = node
  dialogTitle.value = '编辑部门'
  departmentForm.value = {
    name: node.data.name || '',
    description: node.data.description || '',
    parentId: node.data.parentId || null,
    leader: node.data.leader || null,
    leaderName: node.data.leaderName || '',
    leaderAvatar: node.data.leaderAvatar || '',
    icon: node.data.icon || 'folder'
  }
  showDepartmentDialog.value = true
}

// 添加子部门
const handleAddSubDepartment = (node) => {
  parentNode.value = node
  editingNode.value = null
  dialogTitle.value = '新建部门'
  departmentForm.value = {
    name: '',
    description: '',
    parentId: node.data.id,
    leader: null,
    leaderName: '',
    leaderAvatar: '',
    icon: 'folder'
  }
  showDepartmentDialog.value = true
}

// 成员列表（用于选择负责人）
const leaderOptions = ref([])
const loadingLeaders = ref(false)

// 加载成员列表（用于选择负责人）
const loadLeadersList = async () => {
  loadingLeaders.value = true
  try {
    // TODO: 调用API获取成员列表
    // const res = await getMembersList(enterpriseId.value, { status: 'active' })
    // const members = res.data.list || []
    // leaderOptions.value = members.map(member => ({
    //   value: member.id,
    //   label: member.name,
    //   email: member.email,
    //   avatar: member.avatar
    // }))

    // 临时使用模拟数据
    leaderOptions.value = [
      {
        value: 1,
        label: '张三',
        email: 'zhangsan@example.com',
        avatar: ''
      },
      {
        value: 2,
        label: '李四',
        email: 'lisi@example.com',
        avatar: ''
      },
      {
        value: 3,
        label: '王五',
        email: 'wangwu@example.com',
        avatar: ''
      },
      {
        value: 4,
        label: '赵六',
        email: 'zhaoliu@example.com',
        avatar: ''
      },
      {
        value: 5,
        label: '钱七',
        email: 'qianqi@example.com',
        avatar: ''
      }
    ]
  } catch (error) {
    console.error('获取成员列表失败:', error)
    MessagePlugin.error('获取成员列表失败')
  } finally {
    loadingLeaders.value = false
  }
}

// 负责人选择变化
const handleLeaderChange = (value) => {
  if (value) {
    const selectedLeader = leaderOptions.value.find(leader => leader.value === value)
    if (selectedLeader) {
      departmentForm.value.leaderName = selectedLeader.label
      departmentForm.value.leaderAvatar = selectedLeader.avatar || ''
    }
  } else {
    departmentForm.value.leader = null
    departmentForm.value.leaderName = ''
    departmentForm.value.leaderAvatar = ''
  }
}

// 提交部门表单
const handleSubmitDepartment = async ({ validateResult, firstError }) => {
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }

  try {
    if (editingNode.value) {
      // 编辑部门
      editingNode.value.data.name = departmentForm.value.name
      editingNode.value.data.description = departmentForm.value.description
      editingNode.value.data.leader = departmentForm.value.leader
      editingNode.value.data.leaderName = departmentForm.value.leaderName
      editingNode.value.data.leaderAvatar = departmentForm.value.leaderAvatar
      editingNode.value.data.icon = departmentForm.value.icon
      MessagePlugin.success('编辑成功')
    } else {
      // 创建部门
      // 一级部门的上级部门是企业
      const parentId = parentNode.value 
        ? parentNode.value.data.id 
        : (departmentForm.value.parentId || 'enterprise')
      
      const newDepartment = {
        id: generateId(),
        name: departmentForm.value.name,
        description: departmentForm.value.description,
        parentId: parentId,
        leader: departmentForm.value.leader,
        leaderName: departmentForm.value.leaderName,
        leaderAvatar: departmentForm.value.leaderAvatar,
        icon: departmentForm.value.icon,
        memberCount: 0,
        children: []
      }

      if (parentNode.value) {
        // 添加子部门
        if (!parentNode.value.data.children) {
          parentNode.value.data.children = []
        }
        parentNode.value.data.children.push(newDepartment)
        MessagePlugin.success('创建子部门成功')
      } else {
        // 添加一级部门（上级部门是企业）
        treeData.value.push(newDepartment)
        MessagePlugin.success('创建部门成功')
      }
    }

    showDepartmentDialog.value = false
    // TODO: 调用API保存部门
    // if (editingNode.value) {
    //   await updateDepartment(enterpriseId.value, editingNode.value.data.id, departmentForm.value)
    // } else {
    //   await createDepartment(enterpriseId.value, {
    //     ...departmentForm.value,
    //     parentId: parentNode.value?.data.id || null
    // })
    // }
  } catch (error) {
    console.error('保存部门失败:', error)
    MessagePlugin.error('保存失败，请重试')
  }
}

// 关闭对话框
const handleDialogClose = () => {
  showDepartmentDialog.value = false
  departmentForm.value = {
    name: '',
    description: '',
    parentId: 'enterprise',
    leader: null,
    leaderName: '',
    leaderAvatar: '',
    icon: 'folder'
  }
  parentNode.value = null
  editingNode.value = null
  departmentFormRef.value?.clearValidate()
}

// 删除部门
const handleDeleteDepartment = async (node) => {
  try {
    // TODO: 调用API删除部门
    // await deleteDepartment(enterpriseId.value, node.data.id)
    MessagePlugin.success('删除成功')
    loadOrganizationTree()
  } catch (error) {
    console.error('删除失败:', error)
    MessagePlugin.error('删除失败，请重试')
  }
}

// 加载企业名称
const loadEnterpriseName = async () => {
  try {
    // TODO: 调用API获取企业信息
    // const res = await getEnterpriseInfo(enterpriseId.value)
    // enterpriseName.value = res.data.name || '企业'
    
    // 临时使用默认值（与EnterpriseAdminLayout.vue保持一致）
    enterpriseName.value = '千机伞科技'
  } catch (error) {
    console.error('获取企业信息失败:', error)
    enterpriseName.value = '企业'
  }
}

// 加载组织架构树
const loadOrganizationTree = async () => {
  try {
    // TODO: 调用API获取组织架构
    // const res = await getOrganizationTree(enterpriseId.value)
    // treeData.value = res.data || []

    // 临时使用模拟数据
    treeData.value = [
      {
        id: 1,
        name: '技术部',
        memberCount: 15,
        children: [
          {
            id: 11,
            name: '前端组',
            memberCount: 5,
            children: []
          },
          {
            id: 12,
            name: '后端组',
            memberCount: 8,
            children: []
          },
          {
            id: 13,
            name: '测试组',
            memberCount: 2,
            children: []
          }
        ]
      },
      {
        id: 2,
        name: '产品部',
        memberCount: 8,
        children: [
          {
            id: 21,
            name: '产品设计',
            memberCount: 4,
            children: []
          },
          {
            id: 22,
            name: '产品运营',
            memberCount: 4,
            children: []
          }
        ]
      },
      {
        id: 3,
        name: '设计部',
        memberCount: 6,
        children: []
      },
      {
        id: 4,
        name: '市场部',
        memberCount: 10,
        children: [
          {
            id: 41,
            name: '市场推广',
            memberCount: 6,
            children: []
          },
          {
            id: 42,
            name: '商务合作',
            memberCount: 4,
            children: []
          }
        ]
      }
    ]
  } catch (error) {
    console.error('获取组织架构失败:', error)
    MessagePlugin.error('获取组织架构失败')
  }
}

onMounted(() => {
  loadEnterpriseName()
  loadOrganizationTree()
  loadLeadersList()
})
</script>

<style scoped lang="scss">
.organization-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.organization-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 0;
  border: none;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: none;
  }

  :deep(.t-card__header) {
    padding: 24px 32px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  :deep(.t-card__body) {
    padding: 32px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2329;
    margin: 0;
  }
}

.action-bar {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.organization-tree {
  min-height: 400px;
  flex: 1;
  overflow-y: auto;

  :deep(.t-tree) {
    .tree-node {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 4px 0;

      .node-info {
        display: flex;
        align-items: center;
        flex: 1;

        .node-icon {
          color: #007aff;
          margin-right: 8px;
        }

        .node-name {
          font-size: 14px;
          color: #1f2329;
          font-weight: 500;
        }
      }

      .node-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .node-actions {
        opacity: 1;
      }
    }
  }
}

// 对话框样式
.leader-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 负责人选择器样式
:deep(.t-select) {
  width: 100%;
}

.leader-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;

  .leader-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .leader-name {
      font-size: 14px;
      color: #1f2329;
      font-weight: 500;
    }

    .leader-email {
      font-size: 12px;
      color: #86909c;
    }
  }
}

.leader-selected {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 12px;
  background: #fafbfc;
  border-radius: 8px;

  .icon-item {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      .icon-box {
        box-shadow: 0 0 0 2px #0052D9;
      }
    }

    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: all 0.2s;
    }
  }
}

// 对话框蒙层透明
:deep(.department-dialog) {
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
</style>





