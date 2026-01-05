<template>
  <div class="table-view">
    <div class="view-header">
      <h3>{{ viewData?.name || '表格视图' }}</h3>
      <div class="view-header-info">
        <span class="issue-count">共 {{ issueList.length }} 条事项</span>
      </div>
      <div class="view-actions">
        <t-button theme="default" size="medium" @click="handleRefresh">
          <template #icon><t-icon name="refresh" /></template>
          刷新
        </t-button>
        <t-button theme="default" size="medium" @click="showColumnConfig">
          <template #icon><t-icon name="setting" /></template>
          列配置
        </t-button>
      </div>
    </div>

    <div class="table-content">
      <t-table
        v-if="issueList.length > 0"
        :data="issueList"
        :columns="displayColumns"
        :loading="loading"
        row-key="id"
        stripe
        hover
        size="medium"
        :pagination="{
          total: issueData?.total || 0,
          current: issueData?.current || 1,
          pageSize: issueData?.size || 100
        }"
        @page-change="handlePageChange"
      >
        <template #issue_no="{ row }">
          <t-link theme="primary" hover="color" @click="handleViewDetail(row)">
            {{ row.issueNo || '-' }}
          </t-link>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.status)" variant="light">
            {{ getStatusText(row.status) }}
          </t-tag>
        </template>

        <template #priority="{ row }">
          <t-tag :theme="getPriorityTheme(row.priority)" variant="light">
            {{ getPriorityText(row.priority) }}
          </t-tag>
        </template>

        <template #issue_type="{ row }">
          <span>{{ getIssueTypeText(row.issueType) }}</span>
        </template>

        <template #progress="{ row }">
          <t-progress
            :percentage="row.progress || 0"
            :theme="row.progress >= 100 ? 'success' : 'primary'"
            size="small"
          />
        </template>

        <template #tags="{ row }">
          <t-tag v-for="tag in parseTags(row.tags)" :key="tag" size="small" variant="light">
            {{ tag }}
          </t-tag>
          <span v-if="!row.tags">-</span>
        </template>

        <template #create_time="{ row }">
          <span>{{ formatDateTime(row.createTime) }}</span>
        </template>

        <template #update_time="{ row }">
          <span>{{ formatDateTime(row.updateTime) }}</span>
        </template>

        <template #start_date="{ row }">
          <span>{{ formatDate(row.startDate) }}</span>
        </template>

        <template #due_date="{ row }">
          <span>{{ formatDate(row.dueDate) }}</span>
        </template>

        <template #action="{ row }">
          <t-link theme="primary" hover="color" @click="handleViewDetail(row)">
            查看
          </t-link>
        </template>
      </t-table>

      <div v-else class="table-placeholder">
        <t-icon name="inbox" size="64px" />
        <p>暂无事项数据</p>
        <p class="hint">请尝试调整视图筛选条件</p>
      </div>
    </div>

    <!-- 列配置抽屉 -->
    <ColumnConfigDrawer
      v-model="columnConfigVisible"
      :selected-column-keys="selectedColumnKeys"
      :transfer-data="allColumnOptions"
      @save="handleColumnConfigSave"
      @reset="handleColumnConfigReset"
    />
  </div>
</template>

<script setup>
import { defineProps, computed, ref, defineEmits, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ColumnConfigDrawer from '../components/issue/ColumnConfigDrawer.vue'
import { getItem, setItem, migrateFromLocalStorage } from '@/utils/indexedDB'

const props = defineProps({
  viewData: {
    type: Object,
    default: null
  },
  viewId: {
    type: String,
    required: true
  },
  issueData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['refresh'])

const router = useRouter()
const loading = ref(false)
const columnConfigVisible = ref(false)
const selectedColumnKeys = ref([])

// 事项列表
const issueList = computed(() => {
  return props.issueData?.records || []
})

// 所有可配置的列
const allColumnOptions = [
  { label: '概要', value: 'summary', fixed: true },
  { label: '事项编号', value: 'issue_no' },
  { label: 'ID', value: 'id' },
  { label: '状态', value: 'status' },
  { label: '优先级', value: 'priority' },
  { label: '事项类型', value: 'issue_type' },
  { label: '组织ID', value: 'space_id' },
  { label: '组织名称', value: 'space_name' },
  { label: '负责人ID', value: 'assignee_id' },
  { label: '负责人工号', value: 'assignee_code' },
  { label: '负责人', value: 'assignee_name' },
  { label: '报告人ID', value: 'reporter_id' },
  { label: '报告人工号', value: 'reporter_code' },
  { label: '报告人', value: 'reporter_name' },
  { label: '开始日期', value: 'start_date' },
  { label: '截止日期', value: 'due_date' },
  { label: '预估工时', value: 'estimated_hours' },
  { label: '实际工时', value: 'actual_hours' },
  { label: '进度', value: 'progress' },
  { label: '标签', value: 'tags' },
  { label: '创建时间', value: 'create_time' },
  { label: '更新时间', value: 'update_time' }
]

// 列定义映射
const columnDefinitions = {
  issue_no: {
    colKey: 'issue_no',
    title: '事项编号',
    width: 180,
    cell: 'issue_no'
  },
  id: {
    colKey: 'id',
    title: 'ID',
    width: 80
  },
  summary: {
    colKey: 'summary',
    title: '概要',
    width: 300,
    ellipsis: true
  },
  status: {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: 'status'
  },
  priority: {
    colKey: 'priority',
    title: '优先级',
    width: 100,
    cell: 'priority'
  },
  issue_type: {
    colKey: 'issue_type',
    title: '事项类型',
    width: 120,
    cell: 'issue_type'
  },
  space_id: {
    colKey: 'spaceId',
    title: '组织ID',
    width: 100
  },
  space_name: {
    colKey: 'spaceName',
    title: '组织名称',
    width: 150
  },
  assignee_id: {
    colKey: 'assigneeId',
    title: '负责人ID',
    width: 100
  },
  assignee_code: {
    colKey: 'assigneeCode',
    title: '负责人工号',
    width: 120
  },
  assignee_name: {
    colKey: 'assigneeName',
    title: '负责人',
    width: 120
  },
  reporter_id: {
    colKey: 'reporterId',
    title: '报告人ID',
    width: 100
  },
  reporter_code: {
    colKey: 'reporterCode',
    title: '报告人工号',
    width: 120
  },
  reporter_name: {
    colKey: 'reporterName',
    title: '报告人',
    width: 120
  },
  start_date: {
    colKey: 'start_date',
    title: '开始日期',
    width: 120,
    cell: 'start_date'
  },
  due_date: {
    colKey: 'due_date',
    title: '截止日期',
    width: 120,
    cell: 'due_date'
  },
  estimated_hours: {
    colKey: 'estimatedHours',
    title: '预估工时',
    width: 100
  },
  actual_hours: {
    colKey: 'actualHours',
    title: '实际工时',
    width: 100
  },
  progress: {
    colKey: 'progress',
    title: '进度',
    width: 120,
    cell: 'progress'
  },
  tags: {
    colKey: 'tags',
    title: '标签',
    width: 150,
    cell: 'tags'
  },
  create_time: {
    colKey: 'create_time',
    title: '创建时间',
    width: 180,
    cell: 'create_time'
  },
  update_time: {
    colKey: 'update_time',
    title: '更新时间',
    width: 180,
    cell: 'update_time'
  }
}

// 默认显示的列
const defaultColumnKeys = [
  'summary',
  'issue_no',
  'status',
  'priority',
  'assignee_name',
  'start_date',
  'due_date',
  'progress'
]

// 显示的列（根据用户配置）
const displayColumns = computed(() => {
  const cols = selectedColumnKeys.value.map(key => columnDefinitions[key]).filter(Boolean)

  // 添加操作列
  cols.push({
    colKey: 'action',
    title: '操作',
    width: 100,
    cell: 'action',
    fixed: 'right'
  })

  return cols
})

// 初始化列配置
const initColumnConfig = async () => {
  const storageKey = `table_view_columns_${props.viewId}`

  try {
    // 先尝试从 IndexedDB 读取
    const savedConfig = await getItem(storageKey)

    if (savedConfig) {
      selectedColumnKeys.value = savedConfig
    } else {
      // 如果 IndexedDB 中没有，尝试从 localStorage 迁移
      const localStorageValue = localStorage.getItem(storageKey)

      if (localStorageValue) {
        try {
          const parsedValue = JSON.parse(localStorageValue)
          selectedColumnKeys.value = parsedValue

          // 迁移到 IndexedDB
          await setItem(storageKey, parsedValue)
          console.log('[TableView] 已从localStorage迁移到IndexedDB:', storageKey)

          // 可选：清除 localStorage 中的旧数据
          localStorage.removeItem(storageKey)
        } catch (err) {
          console.error('[TableView] localStorage 数据解析失败:', err)
          selectedColumnKeys.value = [...defaultColumnKeys]
        }
      } else {
        // 使用默认配置
        selectedColumnKeys.value = [...defaultColumnKeys]
        console.log('[TableView] 使用默认列配置:', defaultColumnKeys)
      }
    }

    console.log('[TableView] 当前显示字段数量:', selectedColumnKeys.value.length, '/ 总字段数量:', allColumnOptions.length)
  } catch (error) {
    console.error('[TableView] 初始化列配置失败:', error)
    selectedColumnKeys.value = [...defaultColumnKeys]
  }
}

// 显示列配置
const showColumnConfig = () => {
  columnConfigVisible.value = true
}

// 保存列配置
const handleColumnConfigSave = async (keys) => {
  selectedColumnKeys.value = keys
  const storageKey = `table_view_columns_${props.viewId}`

  try {
    await setItem(storageKey, keys)
    console.log('[TableView] 列配置已保存到IndexedDB:', keys)
  } catch (error) {
    console.error('[TableView] 保存列配置失败:', error)
  }
}

// 重置列配置
const handleColumnConfigReset = async () => {
  selectedColumnKeys.value = [...defaultColumnKeys]
  const storageKey = `table_view_columns_${props.viewId}`

  try {
    await setItem(storageKey, defaultColumnKeys)
    console.log('[TableView] 已重置列配置为默认值:', defaultColumnKeys)
  } catch (error) {
    console.error('[TableView] 重置列配置失败:', error)
  }
}

// 状态主题映射
const getStatusTheme = (status) => {
  const themeMap = {
    0: 'success',    // 已完成
    1: 'default',    // 待处理
    2: 'primary',    // 进行中
    3: 'warning'     // 待审核
  }
  return themeMap[status] || 'default'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    0: '已完成',
    1: '待处理',
    2: '进行中',
    3: '待审核'
  }
  return textMap[status] || '-'
}

// 优先级主题映射
const getPriorityTheme = (priority) => {
  const themeMap = {
    1: 'danger',   // 高
    2: 'warning',  // 中
    3: 'default'   // 低
  }
  return themeMap[priority] || 'default'
}

// 优先级文本映射
const getPriorityText = (priority) => {
  const textMap = {
    1: '高',
    2: '中',
    3: '低'
  }
  return textMap[priority] || '-'
}

// 事项类型文本映射
const getIssueTypeText = (type) => {
  const textMap = {
    1: '任务',
    2: '需求',
    3: '缺陷',
    4: '故事'
  }
  return textMap[type] || '-'
}

// 解析标签
const parseTags = (tags) => {
  if (!tags) return []
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags)
    } catch {
      return tags.split(',').filter(Boolean)
    }
  }
  return Array.isArray(tags) ? tags : []
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 刷新数据
const handleRefresh = () => {
  emit('refresh')
}

// 分页变化
const handlePageChange = (pageInfo) => {
  console.log('[分页变化]', pageInfo)
  // TODO: 实现分页查询
}

// 查看详情
const handleViewDetail = (row) => {
  // TODO: 跳转到事项详情页
  console.log('[查看详情]', row)
}

// 组件挂载时初始化列配置
onMounted(() => {
  initColumnConfig()
})
</script>

<style scoped lang="scss">
.table-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e7e7e7;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }

    .view-header-info {
      flex: 1;
      margin-left: 16px;

      .issue-count {
        font-size: 13px;
        color: #646a73;
      }
    }

    .view-actions {
      display: flex;
      gap: 8px;
    }
  }

  .table-content {
    flex: 1;
    padding: 0;
    overflow: auto;

    .table-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #646a73;

      .t-icon {
        color: #bbb;
        margin-bottom: 16px;
      }

      p {
        margin: 4px 0;
        font-size: 14px;

        &.hint {
          color: #bbb;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
