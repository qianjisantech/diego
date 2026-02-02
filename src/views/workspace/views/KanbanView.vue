<template>
  <div class="kanban-view">
    <div class="view-header">
      <h3>{{ viewData?.name || '看板视图' }}</h3>
      <div class="view-actions">
        <t-button class="filter-btn" theme="default" size="medium" @click="handleFilter">
          <template #icon><t-icon name="filter" /></template>
          筛选
          <t-badge v-if="activeFilterCount > 0" :count="activeFilterCount" :offset="[-6, 6]" />
        </t-button>
        <t-button theme="default" size="medium" @click="handleRefresh">
          <template #icon><t-icon name="refresh" /></template>
          刷新
        </t-button>
      </div>
    </div>

    <div class="kanban-content">
      <div class="kanban-columns">
        <!-- 看板列 -->
        <div
          v-for="column in kanbanColumns"
          :key="column.id"
          class="kanban-column"
        >
          <div class="column-header">
            <div class="column-title">
              <span class="title-text">{{ column.name }}</span>
              <span class="count-badge">{{ column.items.length }}</span>
            </div>
            <t-dropdown :min-column-width="120">
              <t-icon name="more" class="more-icon" />
              <t-dropdown-menu>
                <t-dropdown-item @click="handleEditColumn(column)">
                  编辑列
                </t-dropdown-item>
                <t-dropdown-item @click="handleAddCard(column)">
                  添加卡片
                </t-dropdown-item>
                <t-dropdown-item divider />
                <t-dropdown-item @click="handleDeleteColumn(column)">
                  删除列
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>

          <!-- 卡片列表 -->
          <div
            class="column-cards"
            :class="{ 'drag-over': dragOverColumnId === column.id }"
            @dragover.prevent="handleDragOver($event, column)"
            @dragleave="handleDragLeave($event, column)"
            @drop.prevent="handleDrop($event, column)"
          >
            <div
              v-for="item in column.items"
              :key="item.id"
              class="kanban-card"
              :class="{ 'dragging': draggingCardId === item.id }"
              draggable="true"
              @dragstart="handleDragStart($event, item, column)"
              @dragend="handleDragEnd"
              @click="handleCardClick(item)"
            >
              <div class="card-header">
                <span class="card-id">{{ item.issueNo || `#${item.id}` }}</span>
                <t-tag
                  v-if="item.priority"
                  size="small"
                  :theme="getPriorityTheme(item.priority)"
                  variant="light"
                >
                  {{ item.priority }}
                </t-tag>
              </div>
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">
                <div class="card-tags" v-if="item.tags && item.tags.length > 0">
                  <t-tag
                    v-for="(tag, index) in item.tags"
                    :key="index"
                    size="small"
                    variant="outline"
                  >
                    {{ tag }}
                  </t-tag>
                </div>
                <div class="card-footer">
                  <div class="assignee-info">
                    <t-avatar v-if="item.assignee" size="20px">
                      {{ item.assignee.charAt(0) }}
                    </t-avatar>
                    <span class="assignee-name">{{ item.assignee }}</span>
                  </div>
                  <span class="card-date" v-if="item.dueDate !== '-'">
                    <t-icon name="time" size="12px" />
                    {{ item.dueDate }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 空状态提示 -->
            <div v-if="column.items.length === 0" class="empty-column">
              <t-icon name="inbox" size="32px" />
              <p>暂无事项</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选弹窗 -->
    <FilterDialog
      v-model="filterVisible"
      :filter-conditions="filterConditions"
      :filtered-count="filteredKanbanItems.length"
      @update:filter-conditions="handleFilterUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import FilterDialog from '@/views/workspace/components/issue/FilterDialog.vue'
import { updateIssue } from '@/api/console/issue.js'

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

// 筛选弹窗状态
const filterVisible = ref(false)

// 拖拽相关状态
const draggingCardId = ref(null)
const draggingCard = ref(null)
const draggingFromColumn = ref(null)
const dragOverColumnId = ref(null)

// 筛选条件
const filterConditions = ref([
  { id: 0, field: 'keyword', value: '' }
])
let filterIdCounter = 1

// 计算有效的筛选条件数量
const activeFilterCount = computed(() => {
  return filterConditions.value.filter(condition => condition.value).length
})

// 状态映射配置（匹配后端Integer状态）
const statusColumns = [
  { id: 'PENDING_ANALYSIS', name: '待分析', status: 1 },
  { id: 'PENDING_DESIGN', name: '待设计', status: 2 },
  { id: 'PENDING_REVIEW', name: '待评审', status: 3 },
  { id: 'PENDING_SCHEDULE', name: '待排期', status: 4 },
  { id: 'PENDING_DEVELOP', name: '待开发', status: 5 },
  { id: 'DEVELOPING', name: '开发中', status: 6 },
  { id: 'SUBMITTED_TEST', name: '已提测', status: 7 },
  { id: 'TESTING', name: '测试中', status: 8 },
  { id: 'TEST_COMPLETED', name: '测试完成', status: 9 },
  { id: 'PENDING_ACCEPTANCE', name: '待验收', status: 10 },
  { id: 'ACCEPTING', name: '验收中', status: 11 },
  { id: 'PENDING_RELEASE', name: '待发布', status: 12 },
  { id: 'RELEASED', name: '已发布', status: 0 }
]

// 筛选后的事项列表
const filteredIssues = computed(() => {
  const issues = props.issueData?.records || []
  
  return issues.filter(issue => {
    // 遍历所有筛选条件
    for (const condition of filterConditions.value) {
      if (!condition.value) continue // 跳过空值

      const field = condition.field
      const value = condition.value

      if (field === 'keyword') {
        // 关键词筛选（搜索概要或单号）
        const keyword = value.toLowerCase()
        const matchSummary = issue.summary?.toLowerCase().includes(keyword)
        const matchNumber = issue.issue_no?.toLowerCase().includes(keyword)
        if (!matchSummary && !matchNumber) return false
      } else if (field === 'status') {
        // 状态筛选
        const statusValue = typeof value === 'string' ? parseInt(value) : value
        if (issue.status !== statusValue) return false
      } else if (field === 'priority') {
        // 优先级筛选
        if (issue.priority !== value) return false
      } else if (field === 'assignee') {
        // 经办人筛选
        const assigneeName = issue.assignee_name || issue.assigneeName || '未分配'
        if (assigneeName !== value) return false
      }
    }

    return true
  })
})

// 计算筛选后的所有事项数量（用于统计）
const filteredKanbanItems = computed(() => {
  return filteredIssues.value
})

// 根据事项数据生成看板列
const kanbanColumns = computed(() => {
  const issues = filteredIssues.value
  return statusColumns.map(column => {
    // 筛选出对应状态的事项
    const items = issues.filter(issue => issue.status === column.status).map(issue => {
      // 解析tags字段（如果是JSON字符串）
      let tags = []
      if (issue.tags) {
        try {
          tags = typeof issue.tags === 'string' ? JSON.parse(issue.tags) : issue.tags
        } catch (e) {
          tags = []
        }
      }

      return {
        id: issue.id,
        issueNo: issue.issue_no,
        title: issue.summary || '无标题',
        priority: issue.priority || '-',
        tags: tags,
        assignee: issue.assignee_name || '未分配',
        dueDate: formatDate(issue.due_date || issue.create_time),
        spaceKeyword: issue.space_keyword || ''
      }
    })
    return {
      id: column.id,
      name: column.name,
      status: column.status,
      items
    }
  })
})

// 优先级主题映射（匹配后端中文优先级）
const getPriorityTheme = (priority) => {
  const themeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'default',
    '紧急': 'danger'
  }
  return themeMap[priority] || 'default'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const handleFilter = () => {
  filterVisible.value = true
}

const handleFilterUpdate = (conditions) => {
  filterConditions.value = conditions
  filterIdCounter = Math.max(...conditions.map(c => c.id), 0) + 1
}

const handleRefresh = () => {
  emit('refresh')
  MessagePlugin.success('刷新成功')
}

const handleAddColumn = () => {
  MessagePlugin.info('添加列功能')
}

const handleEditColumn = (column) => {
  MessagePlugin.info(`编辑列: ${column.name}`)
}

const handleDeleteColumn = (column) => {
  MessagePlugin.warning(`删除列: ${column.name}`)
}

const handleAddCard = (column) => {
  MessagePlugin.info(`在 ${column.name} 中添加卡片`)
}

const handleCardClick = (item) => {
  MessagePlugin.info(`查看卡片: ${item.title}`)
}

// 拖拽开始
const handleDragStart = (event, item, column) => {
  draggingCardId.value = item.id
  draggingCard.value = item
  draggingFromColumn.value = column
  
  // 设置拖拽数据
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', item.id)
  
  // 添加拖拽样式
  event.target.style.opacity = '0.5'
}

// 拖拽悬停
const handleDragOver = (event, column) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  // 如果拖拽到不同的列，高亮显示
  if (draggingFromColumn.value && draggingFromColumn.value.id !== column.id) {
    dragOverColumnId.value = column.id
  }
}

// 拖拽离开
const handleDragLeave = (event, column) => {
  // 检查是否真的离开了列区域（而不是进入子元素）
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    dragOverColumnId.value = null
  }
}

// 放置卡片
const handleDrop = async (event, targetColumn) => {
  event.preventDefault()
  
  if (!draggingCard.value || !draggingFromColumn.value) {
    return
  }
  
  // 如果拖拽到同一列，不处理
  if (draggingFromColumn.value.id === targetColumn.id) {
    dragOverColumnId.value = null
    return
  }
  
  // 更新卡片状态
  const newStatus = targetColumn.status
  const cardId = draggingCard.value.id
  
  try {
    // 调用 API 更新事项状态
    const res = await updateIssue(cardId, { status: newStatus })
    
    if (res.success || res.code === 200) {
      MessagePlugin.success(`已将事项移动到"${targetColumn.name}"`)
      // 触发刷新
      emit('refresh')
    } else {
      MessagePlugin.error(res.message || '更新事项状态失败')
    }
  } catch (error) {
    console.error('更新事项状态失败:', error)
    MessagePlugin.error('更新事项状态失败，请重试')
  } finally {
    dragOverColumnId.value = null
  }
}

// 拖拽结束
const handleDragEnd = (event) => {
  // 恢复样式
  event.target.style.opacity = '1'
  
  // 重置拖拽状态
  draggingCardId.value = null
  draggingCard.value = null
  draggingFromColumn.value = null
  dragOverColumnId.value = null
}
</script>

<style scoped lang="scss">
.kanban-view {
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
    background: #fff;
    border-bottom: 1px solid #e7e7e7;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }

    .view-actions {
      display: flex;
      gap: 8px;

      .filter-btn {
        background: linear-gradient(135deg, #f5f2ff 0%, #ede9fe 100%);
        color: #667eea;
        border-color: transparent;

        &:hover {
          background: linear-gradient(135deg, #ede9fe 0%, #e5dffe 100%);
          color: #764ba2;
        }
      }
    }
  }

  .kanban-content {
    flex: 1;
    padding: 20px;
    overflow-x: auto;
    overflow-y: hidden;

    .kanban-columns {
      display: flex;
      gap: 16px;
      min-height: 100%;
      padding-bottom: 20px;

      .kanban-column {
        flex-shrink: 0;
        width: 300px;
        background: #f0f0f0;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 200px);

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fff;
          border-radius: 8px 8px 0 0;

          .column-title {
            display: flex;
            align-items: center;
            gap: 8px;

            .title-text {
              font-size: 14px;
              font-weight: 600;
              color: #1f2329;
            }

            .count-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 20px;
              height: 20px;
              padding: 0 6px;
              background: #fff;
              border-radius: 10px;
              font-size: 12px;
              color: #646a73;
            }
          }

          .more-icon {
            cursor: pointer;
            color: #646a73;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;

            &:hover {
              background: rgba(0, 0, 0, 0.06);
              color: #0052d9;
            }
          }
        }

        .column-cards {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 100px;
          transition: background-color 0.2s;
          
          &.drag-over {
            background-color: rgba(102, 126, 234, 0.05);
            border: 2px dashed #667eea;
            border-radius: 8px;
          }

          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-thumb {
            background: #dcdcdc;
            border-radius: 3px;
          }

          .kanban-card {
            background: #fff;
            border-radius: 8px;
            padding: 14px;
            cursor: grab;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
            user-select: none;

            &:hover {
              box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
              transform: translateY(-3px);
              border: 1px solid rgba(102, 126, 234, 0.1);
            }

            &:active {
              cursor: grabbing;
            }

            &.dragging {
              opacity: 0.5;
              transform: rotate(3deg);
            }

            .card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;

              .card-id {
                font-size: 12px;
                color: #646a73;
                font-weight: 500;
              }
            }

            .card-title {
              font-size: 14px;
              color: #1f2329;
              line-height: 1.5;
              margin-bottom: 12px;
              word-break: break-word;
            }

            .card-meta {
              .card-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 8px;
                min-height: 20px;
              }

              .card-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .assignee-info {
                  display: flex;
                  align-items: center;
                  gap: 6px;

                  .assignee-name {
                    font-size: 12px;
                    color: #646a73;
                  }
                }

                .card-date {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  font-size: 12px;
                  color: #646a73;
                }
              }
            }
          }

          // 空状态
          .empty-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #bbb;

            .t-icon {
              margin-bottom: 12px;
            }

            p {
              margin: 0;
              font-size: 13px;
            }
          }
        }
      }
    }
  }

  // 筛选弹窗样式
  .filter-content {
    padding: 16px 0;

    .filter-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #1f2329;
      }
    }
  }
}
</style>
