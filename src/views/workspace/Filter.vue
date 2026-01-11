<template>
  <div class="filter-page">
    <t-card :bordered="false" class="filter-card">
      <div class="task-header">
        <div class="header-left">
          <div class="title-info">
            <h3 class="task-title">筛选器</h3>
            <t-tag v-if="activeFilterCount > 0" theme="primary" variant="light" size="small">
              {{ activeFilterCount }} 个条件
            </t-tag>
          </div>
        </div>
        <div class="header-right">
          <t-button
            theme="default"
            variant="outline"
            size="small"
            @click="handleResetFilters"
          >
            <template #icon>
              <t-icon name="refresh" />
            </template>
            重置
          </t-button>
          <t-button
            theme="primary"
            size="small"
            @click="handleApplyAndGoToIssues"
          >
            <template #icon>
              <t-icon name="check" />
            </template>
            应用并查看事项
          </t-button>
        </div>
      </div>

      <div class="filter-content">
        <IssueFilter
          :filter-conditions="localFilterConditions"
          :filtered-count="filteredCount"
          :user-list="userList"
          :space-list="spaceList"
          @update:filter-conditions="handleUpdateConditions"
          @apply="handleApply"
        />
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useWorkspaceStore } from '@/store/workspace'
import { useUserStore } from '@/store/user'
import { getUserList } from '@/api/user'
import IssueFilter from './components/issue/IssueFilter.vue'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const userStore = useUserStore()

// 用户列表和组织列表
const userList = ref([])
const spaceList = ref([])

// 本地筛选条件
const localFilterConditions = ref([
  { id: 0, field: 'keyword', value: '' }
])
let filterIdCounter = 1

// 筛选后的数量（暂时不显示，因为需要实际数据）
const filteredCount = ref(null)

// 计算激活的筛选条件数量
const activeFilterCount = computed(() => {
  return localFilterConditions.value.filter(
    f => f.value !== '' && f.value !== null && f.value !== undefined
  ).length
})

// 更新筛选条件
const handleUpdateConditions = (conditions) => {
  localFilterConditions.value = conditions
}

// 应用筛选
const handleApply = (conditions) => {
  localFilterConditions.value = conditions
  MessagePlugin.success('筛选条件已保存')
}

// 重置筛选器
const handleResetFilters = () => {
  localFilterConditions.value = [
    { id: 0, field: 'keyword', value: '' }
  ]
  filterIdCounter = 1
  MessagePlugin.success('已重置筛选条件')
}

// 应用筛选并跳转到事项列表
const handleApplyAndGoToIssues = () => {
  // 保存筛选条件到 store（如果 store 支持的话）
  // 或者通过路由参数传递
  const activeConditions = localFilterConditions.value.filter(
    f => f.value !== '' && f.value !== null && f.value !== undefined
  )
  
  if (activeConditions.length === 0) {
    MessagePlugin.warning('请至少设置一个筛选条件')
    return
  }

  // 保存筛选条件到 localStorage，以便事项页面读取
  localStorage.setItem('workspace_filter_conditions', JSON.stringify(activeConditions))
  
  MessagePlugin.success(`已应用 ${activeConditions.length} 个筛选条件`)
  
  // 跳转到事项列表
  router.push('/workspace/issue')
}

// 加载用户列表
const fetchUserList = async () => {
  try {
    const res = await getUserList()
    if (res.success || res.code === 200) {
      userList.value = res.data || []
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 设置组织列表（直接使用 userStore 中的数据）
const setupSpaceList = () => {
  spaceList.value = userStore.userCompanies || []
}

// 从 localStorage 加载已保存的筛选条件
const loadSavedFilters = () => {
  try {
    const saved = localStorage.getItem('workspace_filter_conditions')
    if (saved) {
      const conditions = JSON.parse(saved)
      if (Array.isArray(conditions) && conditions.length > 0) {
        localFilterConditions.value = conditions.map((c, index) => ({
          ...c,
          id: filterIdCounter++
        }))
        // 如果没有条件，至少保留一个空的
        if (localFilterConditions.value.length === 0) {
          localFilterConditions.value = [{ id: 0, field: 'keyword', value: '' }]
        }
      }
    }
  } catch (error) {
    console.error('加载已保存的筛选条件失败:', error)
  }
}

// 监听用户企业数据变化
watch(() => userStore.userCompanies, (newCompanies) => {
  if (newCompanies) {
    setupSpaceList()
  }
}, { immediate: true })

onMounted(() => {
  fetchUserList()
  loadSavedFilters()
})
</script>

<style scoped lang="scss">
.filter-page {
  height: 100%;

  .filter-card {
    height: 100%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    :deep(.t-card__body) {
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .task-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;

        .title-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .task-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2329;
          margin: 0;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .filter-content {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>



