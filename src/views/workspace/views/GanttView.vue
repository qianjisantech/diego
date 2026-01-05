<template>
  <div class="gantt-view">
    <div class="view-header">
      <div class="header-left">
        <h3>{{ viewData?.name || '甘特图视图' }}</h3>
        <!-- 图例 -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-bar status-completed"></div>
            <span>已完成</span>
          </div>
          <div class="legend-item">
            <div class="legend-bar status-in-progress"></div>
            <span>进行中</span>
          </div>
          <div class="legend-item">
            <div class="legend-bar status-pending"></div>
            <span>未开始</span>
          </div>
        </div>
      </div>
      <div class="view-actions">
        <t-space>
          <t-button
            size="medium"
            :variant="timeScale === 'day' ? 'base' : 'outline'"
            @click="timeScale = 'day'"
          >
            日
          </t-button>
          <t-button
            size="medium"
            :variant="timeScale === 'week' ? 'base' : 'outline'"
            @click="timeScale = 'week'"
          >
            周
          </t-button>
          <t-button
            size="medium"
            :variant="timeScale === 'month' ? 'base' : 'outline'"
            @click="timeScale = 'month'"
          >
            月
          </t-button>
        </t-space>
        <t-button theme="default" size="medium" @click="handleFilter">
          <template #icon><t-icon name="filter" /></template>
          筛选
          <t-badge v-if="activeFilterCount > 0" :count="activeFilterCount" :offset="[-6, 6]" />
        </t-button>
        <t-button theme="default" size="medium" @click="handleToday">
          今天
        </t-button>
      </div>
    </div>

    <div class="gantt-content">
      <div class="gantt-container">
        <!-- 左侧任务列表 -->
        <div class="task-list">
          <div class="task-list-header">
            <div class="column task-name">任务名称</div>
            <div class="column assignee">负责人</div>
            <div class="column duration">工期</div>
          </div>
          <div class="task-list-body">
            <div
              v-for="task in ganttTasks"
              :key="task.id"
              class="task-row"
              :style="{ paddingLeft: task.level * 20 + 'px' }"
            >
              <div class="column task-name">
                <t-icon
                  v-if="task.children"
                  :name="task.expanded ? 'chevron-down' : 'chevron-right'"
                  size="14px"
                  class="expand-icon"
                  @click="toggleTask(task)"
                />
                <span>{{ task.name }}</span>
              </div>
              <div class="column assignee">
                <div v-if="task.assignee && task.assignee !== '未分配'" class="assignee-info">
                  <t-avatar size="24px">
                    {{ task.assignee.charAt(0) }}
                  </t-avatar>
                  <span class="assignee-text">{{ task.assigneeDisplay }}</span>
                </div>
                <span v-else class="assignee-text no-assignee">未分配</span>
              </div>
              <div class="column duration">{{ task.duration }}天</div>
            </div>
          </div>
        </div>

        <!-- 右侧时间轴和甘特图 -->
        <div class="gantt-chart">
          <div class="timeline-header">
            <div
              v-for="date in timelineDates"
              :key="date.key"
              class="timeline-cell"
              :class="{ today: date.isToday }"
            >
              <div class="date-label">{{ date.label }}</div>
              <div class="day-label">{{ date.day }}</div>
            </div>
          </div>
          <div class="gantt-bars">
            <div v-for="task in ganttTasks" :key="task.id" class="bar-row">
              <div
                v-if="!task.children"
                class="gantt-bar"
                :style="getBarStyle(task)"
              >
                <div class="bar-content" :class="`status-${task.status}`">
                  <span class="bar-text">{{ task.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选弹窗 -->
    <FilterDialog
      v-model="filterVisible"
      :filter-conditions="filterConditions"
      :filtered-count="filteredGanttTasks.length"
      @update:filter-conditions="handleFilterUpdate"
    />

    <!-- 分页组件 -->
    <div class="pagination-container">
      <t-pagination
        v-model="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-size-options="[10, 20, 50]"
        show-page-size
        show-page-number
        show-jumper
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import FilterDialog from '@/views/workspace/components/issue/FilterDialog.vue'

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

const timeScale = ref('day')

// 分页相关
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 筛选相关
const filterVisible = ref(false)
const filterConditions = ref([
  { id: 0, field: 'keyword', value: '' }
])
let filterIdCounter = 1

// 计算有效的筛选条件数量
const activeFilterCount = computed(() => {
  return filterConditions.value.filter(condition => condition.value).length
})

// 状态映射（匹配后端Integer状态）
const statusMap = {
  0: 'completed',    // 已完成
  1: 'pending',      // 待处理
  2: 'in-progress',  // 进行中
  3: 'in-progress'   // 待审核
}

// 计算进度百分比
const calculateProgress = (status) => {
  const progressMap = {
    0: 100,  // 已完成
    1: 0,    // 待处理
    2: 50,   // 进行中
    3: 75    // 待审核
  }
  return progressMap[status] || 0
}

// 计算工期（天数）
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 1
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 1
}

// 原始任务数据（从事项数据转换）
const rawGanttTasks = computed(() => {
  const issues = props.issueData?.records || []

  return issues.map(issue => {
    const assigneeName = issue.assigneeName || issue.assignee_name || '未分配'
    const employeeNo = issue.employeeNo || issue.employee_no || ''
    const assigneeDisplay = assigneeName === '未分配' 
      ? '未分配' 
      : employeeNo 
        ? `${assigneeName}(${employeeNo})` 
        : assigneeName

    return {
      id: issue.id,
      name: issue.title || '无标题',
      level: 0,
      startDate: issue.startDate || issue.createTime,
      endDate: issue.dueDate || issue.startDate || issue.createTime,
      duration: calculateDuration(issue.startDate || issue.createTime, issue.dueDate || issue.startDate || issue.createTime),
      assignee: assigneeName,
      assigneeDisplay: assigneeDisplay,
      employeeNo: employeeNo,
      progress: calculateProgress(issue.status),
      status: statusMap[issue.status] || 'pending',
      // 用于筛选的原始数据
      originalIssue: issue
    }
  })
})

// 筛选后的甘特图任务数据
const filteredGanttTasks = computed(() => {
  return rawGanttTasks.value.filter(task => {
    // 遍历所有筛选条件
    for (const condition of filterConditions.value) {
      if (!condition.value) continue // 跳过空值

      const field = condition.field
      const value = condition.value
      const issue = task.originalIssue

      if (field === 'keyword') {
        // 关键词筛选（搜索标题或单号）
        const keyword = value.toLowerCase()
        const matchTitle = task.name?.toLowerCase().includes(keyword)
        const matchNumber = issue.issueNo?.toLowerCase().includes(keyword)
        if (!matchTitle && !matchNumber) return false
      } else if (field === 'status') {
        // 状态筛选
        const statusValue = typeof value === 'string' ? parseInt(value) : value
        if (issue.status !== statusValue) return false
      } else if (field === 'priority') {
        // 优先级筛选
        if (issue.priority !== value) return false
      } else if (field === 'assignee') {
        // 经办人筛选
        if (task.assignee !== value) return false
      }
    }

    return true
  })
})

// 更新分页总数（使用 watch 监听筛选后的数据变化）
watch(filteredGanttTasks, (newTasks) => {
  pagination.value.total = newTasks.length
  // 如果当前页超出范围，重置到第一页
  const maxPage = Math.ceil(newTasks.length / pagination.value.pageSize) || 1
  if (pagination.value.current > maxPage) {
    pagination.value.current = 1
  }
}, { immediate: true })

// 甘特图任务数据（使用筛选后的数据，并应用分页）
const ganttTasks = computed(() => {
  const filtered = filteredGanttTasks.value
  // 计算分页
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filtered.slice(start, end)
})

// 计算时间轴的起止日期
const timelineRange = computed(() => {
  const tasks = ganttTasks.value
  if (tasks.length === 0) {
    // 如果没有任务，默认显示当前月份
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start, end }
  }

  // 找出所有任务的最早和最晚日期
  let minDate = new Date(tasks[0].startDate)
  let maxDate = new Date(tasks[0].endDate)

  tasks.forEach(task => {
    const startDate = new Date(task.startDate)
    const endDate = new Date(task.endDate)
    if (startDate < minDate) minDate = startDate
    if (endDate > maxDate) maxDate = endDate
  })

  // 前后各扩展7天
  minDate.setDate(minDate.getDate() - 7)
  maxDate.setDate(maxDate.getDate() + 7)

  return { start: minDate, end: maxDate }
})

// 生成时间轴日期
const timelineDates = computed(() => {
  const dates = []
  const today = new Date()
  const { start, end } = timelineRange.value

  const currentDate = new Date(start)
  while (currentDate <= end) {
    const isToday = currentDate.toDateString() === today.toDateString()

    dates.push({
      key: currentDate.toISOString(),
      label: `${currentDate.getMonth() + 1}月`,
      day: currentDate.getDate(),
      isToday
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
})

// 计算甘特条的样式
const getBarStyle = (task) => {
  const { start: timelineStart } = timelineRange.value
  const taskStart = new Date(task.startDate)
  const taskEnd = new Date(task.endDate)

  const dayWidth = 60 // 每天的宽度
  const startOffset = Math.floor((taskStart - timelineStart) / (1000 * 60 * 60 * 24))
  const duration = Math.floor((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1

  return {
    left: `${startOffset * dayWidth}px`,
    width: `${duration * dayWidth - 4}px`
  }
}

const toggleTask = (task) => {
  task.expanded = !task.expanded
  MessagePlugin.info(`${task.expanded ? '展开' : '收起'}: ${task.name}`)
}

const handleToday = () => {
  MessagePlugin.success('跳转到今天')
}

const handleFilter = () => {
  filterVisible.value = true
}

const handleFilterUpdate = (conditions) => {
  filterConditions.value = conditions
  filterIdCounter = Math.max(...conditions.map(c => c.id), 0) + 1
  // 筛选后重置到第一页
  pagination.value.current = 1
}

// 处理页码变化
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
}

// 处理每页条数变化
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
}
</script>

<style scoped lang="scss">
.gantt-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding-bottom: 10px;

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e7e7e7;

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2329;
      }

      .legend {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background: #f5f5f5;
        border-radius: 6px;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #646a73;

          .legend-bar {
            width: 32px;
            height: 14px;
            border-radius: 3px;

            &.status-completed {
              background: linear-gradient(135deg, #00a870 0%, #00c48c 100%);
            }

            &.status-in-progress {
              background: var(--tencent-blue-gradient);
            }

            &.status-pending {
              background: linear-gradient(135deg, #bbb 0%, #ddd 100%);
            }
          }
        }
      }
    }

    .view-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .gantt-content {
    flex: 1;
    overflow: auto;
    display: flex;
    min-height: 0;

      .gantt-container {
        display: flex;
        width: 100%;
        height: fit-content;
        min-height: 0;

      // 左侧任务列表
      .task-list {
        flex-shrink: 0;
        width: 400px;
        border-right: 1px solid #e7e7e7;
        display: flex;
        flex-direction: column;
        background: #fafafa;

        .task-list-header {
          display: flex;
          align-items: center;
          height: 60px;
          border-bottom: 2px solid #e7e7e7;
          background: #f5f5f5;
          font-weight: 600;
          font-size: 13px;
          color: #646a73;

          .column {
            padding: 0 12px;

            &.task-name {
              flex: 1;
            }

            &.assignee {
              width: 180px;
              text-align: left;
            }

            &.duration {
              width: 80px;
              text-align: center;
            }
          }
        }

        .task-list-body {
          flex: 1;
          overflow-y: auto;

          .task-row {
            display: flex;
            align-items: center;
            height: 50px;
            border-bottom: 1px solid #e7e7e7;
            background: #fff;
            transition: background 0.2s;

            &:hover {
              background: #f5f7fa;
            }

            .column {
              padding: 0 12px;
              display: flex;
              align-items: center;

              &.task-name {
                flex: 1;
                gap: 8px;
                font-size: 14px;
                color: #1f2329;

                .expand-icon {
                  cursor: pointer;
                  color: #646a73;
                  flex-shrink: 0;

                  &:hover {
                    color: #0052d9;
                  }
                }
              }

              &.assignee {
                width: 180px;
                justify-content: flex-start;
                gap: 8px;

                .assignee-info {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }

                .assignee-text {
                  font-size: 13px;
                  color: #1f2329;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;

                  &.no-assignee {
                    color: #8a8e99;
                  }
                }
              }

              &.duration {
                width: 80px;
                justify-content: center;
                font-size: 13px;
                color: #646a73;
              }
            }
          }
        }
      }

      // 右侧甘特图
      .gantt-chart {
        flex: 1;
        overflow-x: auto;
        overflow-y: auto;
        position: relative;

        .timeline-header {
          display: flex;
          height: 60px;
          border-bottom: 2px solid #e7e7e7;
          background: #f5f5f5;
          position: sticky;
          top: 0;
          z-index: 10;

          .timeline-cell {
            flex-shrink: 0;
            width: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-right: 1px solid #e7e7e7;
            font-size: 12px;
            color: #646a73;

            &.today {
              background: #e8f4ff;
              color: #0052d9;
              font-weight: 600;
            }

            .date-label {
              font-size: 11px;
              margin-bottom: 4px;
            }

            .day-label {
              font-size: 14px;
              font-weight: 600;
            }
          }
        }

        .gantt-bars {
          position: relative;
          min-height: auto;

          .bar-row {
            height: 50px;
            border-bottom: 1px solid #e7e7e7;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              background: repeating-linear-gradient(
                to right,
                transparent,
                transparent 59px,
                #e7e7e7 59px,
                #e7e7e7 60px
              );
              pointer-events: none;
            }

            .gantt-bar {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              height: 28px;
              cursor: pointer;
              z-index: 1;

              .bar-content {
                height: 100%;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

                &:hover {
                  transform: scale(1.02);
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                }

                &.status-completed {
                  background: linear-gradient(135deg, #00a870 0%, #00c48c 100%);
                }

                &.status-in-progress {
                  background: linear-gradient(135deg, #0052d9 0%, #3e7dff 100%);
                }

                &.status-pending {
                  background: linear-gradient(135deg, #bbb 0%, #ddd 100%);
                }

                .bar-text {
                  font-size: 12px;
                  color: #fff;
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 24px 10px;
    margin-top: 16px;
    border-top: 1px solid #e7e7e7;
    background: #fff;
    flex-shrink: 0;
  }
}
</style>
