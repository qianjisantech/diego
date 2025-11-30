<template>
  <div class="tracking-report-tab">
    <!-- 柱状图：埋点类型统计 -->
    <div class="chart-section">
      <t-card title="埋点类型统计" class="chart-card">
        <!-- 埋点类型统计筛选条件 -->
        <div class="filter-section">
          <t-form layout="inline" @submit="handleTypeStatsSearch">
            <t-form-item label="时间维度">
              <t-select v-model="typeStatsDateType" placeholder="请选择" style="width: 150px">
                <t-option label="按日" value="day" />
                <t-option label="按月" value="month" />
                <t-option label="按年" value="year" />
              </t-select>
            </t-form-item>
            <t-form-item label="开始日期">
              <t-date-picker v-model="typeStatsDateRange[0]" placeholder="开始日期" style="width: 180px" />
            </t-form-item>
            <t-form-item label="结束日期">
              <t-date-picker v-model="typeStatsDateRange[1]" placeholder="结束日期" style="width: 180px" />
            </t-form-item>
            <t-form-item>
              <t-space :size="12">
                <t-button theme="primary" type="submit">查询</t-button>
                <t-button theme="default" variant="outline" @click="handleTypeStatsReset">重置</t-button>
              </t-space>
            </t-form-item>
          </t-form>
        </div>
        <div v-if="typeStatsLoading" class="loading-container">
          <t-loading size="large" text="加载中..." />
        </div>
        <div v-else class="chart-container">
          <div class="chart-header">
            <div class="chart-title">各埋点类型数量统计</div>
            <div class="chart-legend">
              <span v-for="(item, index) in typeStatsData" :key="index" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: getColorByIndex(index) }"></span>
                <span class="legend-label">{{ item.eventTypeLabel }}</span>
              </span>
            </div>
          </div>
          <div class="bar-chart">
            <div v-for="(item, index) in typeStatsData" :key="index" class="bar-item">
              <div class="bar-label">{{ item.dateLabel }}</div>
              <div class="bar-wrapper">
                <div
                  v-for="(typeData, typeIndex) in item.types"
                  :key="typeIndex"
                  class="bar"
                  :style="{
                    height: `${(typeData.count / maxCount) * 100}%`,
                    backgroundColor: getColorByIndex(typeIndex),
                    width: `${100 / item.types.length}%`
                  }"
                  :title="`${typeData.eventTypeLabel}: ${typeData.count}`"
                >
                  <span v-if="typeData.count > 0" class="bar-value">{{ typeData.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 用户活跃量统计 -->
    <div class="user-stats-section">
      <t-card title="用户活跃量统计" class="stats-card">
        <!-- 用户活跃量统计筛选条件 -->
        <div class="filter-section">
          <t-form layout="inline" @submit="handleUserStatsSearch">
            <t-form-item label="时间维度">
              <t-select v-model="userStatsDateType" placeholder="请选择" style="width: 150px">
                <t-option label="按日" value="day" />
                <t-option label="按月" value="month" />
                <t-option label="按年" value="year" />
              </t-select>
            </t-form-item>
            <t-form-item label="开始日期">
              <t-date-picker v-model="userStatsDateRange[0]" placeholder="开始日期" style="width: 180px" />
            </t-form-item>
            <t-form-item label="结束日期">
              <t-date-picker v-model="userStatsDateRange[1]" placeholder="结束日期" style="width: 180px" />
            </t-form-item>
            <t-form-item>
              <t-space :size="12">
                <t-button theme="primary" type="submit">查询</t-button>
                <t-button theme="default" variant="outline" @click="handleUserStatsReset">重置</t-button>
              </t-space>
            </t-form-item>
          </t-form>
        </div>
        <div v-if="userStatsLoading" class="loading-container">
          <t-loading size="large" text="加载中..." />
        </div>
        <div v-else class="user-stats-container">
          <div class="stats-summary">
            <div class="summary-item">
              <div class="summary-label">总活跃用户</div>
              <div class="summary-value">{{ userStatsData.totalUsers || 0 }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">总访问次数</div>
              <div class="summary-value">{{ userStatsData.totalVisits || 0 }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">平均活跃度</div>
              <div class="summary-value">{{ userStatsData.avgActivity || 0 }}</div>
            </div>
          </div>
          <div class="user-list">
            <t-table
              :data="userStatsData.dailyStats || []"
              :columns="userColumns"
              :loading="userStatsLoading"
              row-key="timeDimension"
              stripe
              hover
              class="user-table"
            >
              <template #activeUserCount="{ row }">
                <div class="progress-bar-wrapper">
                  <div class="progress-bar" :style="{ width: `${(row.activeUserCount / maxActiveUserCount) * 100}%`, backgroundColor: '#0052D9' }">
                    <span class="progress-value">{{ row.activeUserCount }}</span>
                  </div>
                </div>
              </template>
              <template #totalCount="{ row }">
                <div class="progress-bar-wrapper">
                  <div class="progress-bar" :style="{ width: `${(row.totalCount / maxTotalCount) * 100}%`, backgroundColor: '#00A870' }">
                    <span class="progress-value">{{ row.totalCount }}</span>
                  </div>
                </div>
              </template>
              <template #avgPerUser="{ row }">
                <div class="progress-bar-wrapper">
                  <div class="progress-bar" :style="{ width: `${(row.avgPerUser / maxAvgPerUser) * 100}%`, backgroundColor: '#ED7B2F' }">
                    <span class="progress-value">{{ row.avgPerUser }}</span>
                  </div>
                </div>
              </template>
            </t-table>
          </div>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getTrackingTypeStats, getTrackingUserStats } from '@/api/tracking'

// 埋点类型统计筛选条件
const typeStatsDateType = ref('day')
const typeStatsDateRange = ref([null, null])

// 埋点类型统计
const typeStatsData = ref([])
const typeStatsLoading = ref(false)

// 用户活跃量统计筛选条件
const userStatsDateType = ref('day')
const userStatsDateRange = ref([null, null])

// 用户活跃量统计
const userStatsData = ref({
  totalUsers: 0,
  totalVisits: 0,
  avgActivity: 0,
  dailyStats: [] // 按日期的统计数据
})
const userStatsLoading = ref(false)

// 事件类型映射
const eventTypeMap = {
  'page_view': '页面访问',
  'login': '用户登录',
  'logout': '用户登出',
  'button_click': '按钮点击',
  'form_submit': '表单提交',
  'file_upload': '文件上传',
  'custom': '自定义'
}

// 颜色数组
const colors = ['#0052D9', '#00A870', '#ED7B2F', '#E34D59', '#834EC2', '#F5A623', '#8B9DC3']

// 获取颜色
const getColorByIndex = (index) => {
  return colors[index % colors.length]
}

// 计算最大数量（用于柱状图高度）
const maxCount = computed(() => {
  let max = 0
  typeStatsData.value.forEach(item => {
    item.types.forEach(type => {
      if (type.count > max) {
        max = type.count
      }
    })
  })
  return max || 1 // 避免除零
})

// 计算最大访问次数（用于可视化）
const maxTotalCount = computed(() => {
  if (!userStatsData.value.dailyStats || userStatsData.value.dailyStats.length === 0) {
    return 1
  }
  return Math.max(...userStatsData.value.dailyStats.map(item => item.totalCount || 0), 1)
})

// 计算最大活跃用户数（用于进度条）
const maxActiveUserCount = computed(() => {
  if (!userStatsData.value.dailyStats || userStatsData.value.dailyStats.length === 0) {
    return 1
  }
  return Math.max(...userStatsData.value.dailyStats.map(item => item.activeUserCount || 0), 1)
})

// 计算最大人均访问次数（用于进度条）
const maxAvgPerUser = computed(() => {
  if (!userStatsData.value.dailyStats || userStatsData.value.dailyStats.length === 0) {
    return 1
  }
  return Math.max(...userStatsData.value.dailyStats.map(item => item.avgPerUser || 0), 1)
})

// 用户活跃量表格列
const userColumns = [
  {
    colKey: 'dateLabel',
    title: '日期',
    width: 150
  },
  {
    colKey: 'activeUserCount',
    title: '活跃用户数',
    width: 200
  },
  {
    colKey: 'totalCount',
    title: '总访问次数',
    width: 200
  },
  {
    colKey: 'avgPerUser',
    title: '人均访问次数',
    width: 200
  }
]

// 格式化日期标签（辅助函数）
const formatDateLabel = (item) => {
  // 根据实际返回的数据结构来格式化日期标签
  if (item.date) {
    return item.date
  }
  if (item.year && item.month && item.day) {
    return `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`
  }
  if (item.year && item.month) {
    return `${item.year}-${String(item.month).padStart(2, '0')}`
  }
  if (item.year) {
    return `${item.year}`
  }
  return ''
}

// 初始化埋点类型统计日期范围（默认最近7天）
const initTypeStatsDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  typeStatsDateRange.value = [start, end]
}

// 初始化用户活跃量统计日期范围（默认最近7天）
const initUserStatsDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  userStatsDateRange.value = [start, end]
}

// 加载埋点类型统计
const loadTypeStats = async () => {
  typeStatsLoading.value = true
  try {
    const params = {
      dateType: typeStatsDateType.value,
      startDate: typeStatsDateRange.value[0] ? formatDate(typeStatsDateRange.value[0]) : null,
      endDate: typeStatsDateRange.value[1] ? formatDate(typeStatsDateRange.value[1]) : null
    }
    const res = await getTrackingTypeStats(params)
    if (res.success || res.code === 200) {
      // 后端返回扁平数组格式: [{ time_dimension, event_type, count }, ...]
      // 需要按 time_dimension 分组转换为柱状图需要的格式
      const data = res.data || []
      
      if (data.length === 0) {
        typeStatsData.value = generateMockTypeStats()
        return
      }
      
      // 按 time_dimension 分组
      const groupedData = new Map()
      
      data.forEach(item => {
        const timeKey = item.time_dimension || item.timeDimension
        const eventType = item.event_type || item.eventType
        const count = item.count || 0
        
        if (!timeKey || !eventType) return
        
        if (!groupedData.has(timeKey)) {
          groupedData.set(timeKey, [])
        }
        
        groupedData.get(timeKey).push({
          eventType: eventType,
          eventTypeLabel: eventTypeMap[eventType] || eventType,
          count: count
        })
      })
      
      // 转换为组件需要的格式，并按日期排序
      typeStatsData.value = Array.from(groupedData.entries())
        .map(([timeDimension, types]) => {
          // 格式化日期标签
          let dateLabel = timeDimension
          try {
            const date = new Date(timeDimension)
            if (dateType.value === 'day') {
              // 按日：显示 11/20
              dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
            } else if (dateType.value === 'month') {
              // 按月：显示 2025-11
              dateLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            } else {
              // 按年：显示 2025
              dateLabel = `${date.getFullYear()}`
            }
          } catch (e) {
            // 如果日期解析失败，使用原始值
            dateLabel = timeDimension
          }
          
          return {
            dateLabel: dateLabel,
            timeDimension: timeDimension, // 保留原始值用于排序
            types: types
          }
        })
        .sort((a, b) => {
          // 按时间维度排序
          return a.timeDimension.localeCompare(b.timeDimension)
        })
      
      // 如果数据为空，使用模拟数据
      if (typeStatsData.value.length === 0) {
        typeStatsData.value = generateMockTypeStats()
      }
    } else {
      // 如果没有数据，使用模拟数据
      typeStatsData.value = generateMockTypeStats()
    }
  } catch (error) {
    console.error('加载埋点类型统计失败:', error)
    MessagePlugin.error('加载埋点类型统计失败')
    // 使用模拟数据
    typeStatsData.value = generateMockTypeStats()
  } finally {
    typeStatsLoading.value = false
  }
}

// 加载用户活跃量统计
const loadUserStats = async () => {
  userStatsLoading.value = true
  try {
    const params = {
      dateType: userStatsDateType.value,
      startDate: userStatsDateRange.value[0] ? formatDate(userStatsDateRange.value[0]) : null,
      endDate: userStatsDateRange.value[1] ? formatDate(userStatsDateRange.value[1]) : null
    }
    const res = await getTrackingUserStats(params)
    if (res.success || res.code === 200) {
      // 后端返回按日期统计的数据格式: [{ time_dimension, active_user_count, total_count }, ...]
      const data = res.data || []
      
      if (data.length === 0) {
        userStatsData.value = generateMockUserStats()
        return
      }
      
      // 计算统计数据
      const totalVisits = data.reduce((sum, item) => sum + (item.total_count || 0), 0)
      // 计算总活跃用户数（取所有日期中活跃用户数的最大值，或者累加去重后的用户数）
      // 由于后端返回的是按日期的统计，我们取所有日期中活跃用户数的最大值作为参考
      const maxActiveUsers = Math.max(...data.map(item => item.active_user_count || 0))
      // 或者计算所有日期的活跃用户数总和（如果用户在不同日期都活跃）
      const totalActiveUsers = data.reduce((sum, item) => sum + (item.active_user_count || 0), 0)
      const avgActivity = data.length > 0 ? Math.round(totalVisits / data.length) : 0
      
      // 格式化日期标签并排序
      const dailyStats = data
        .map(item => {
          const timeDimension = item.time_dimension || item.timeDimension
          let dateLabel = timeDimension
          
          try {
            const date = new Date(timeDimension)
            if (userStatsDateType.value === 'day') {
              // 按日：显示 11/20
              dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
            } else if (userStatsDateType.value === 'month') {
              // 按月：显示 2025-11
              dateLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            } else {
              // 按年：显示 2025
              dateLabel = `${date.getFullYear()}`
            }
          } catch (e) {
            dateLabel = timeDimension
          }
          
          const activeUserCount = item.active_user_count || item.activeUserCount || 0
          const totalCount = item.total_count || item.totalCount || 0
          const avgPerUser = activeUserCount > 0 ? Math.round(totalCount / activeUserCount) : 0
          
          return {
            dateLabel,
            timeDimension,
            activeUserCount,
            totalCount,
            avgPerUser
          }
        })
        .sort((a, b) => a.timeDimension.localeCompare(b.timeDimension))
      
      userStatsData.value = {
        totalUsers: maxActiveUsers, // 使用最大活跃用户数
        totalVisits,
        avgActivity,
        dailyStats
      }
    } else {
      // 使用模拟数据
      userStatsData.value = generateMockUserStats()
    }
  } catch (error) {
    console.error('加载用户活跃量统计失败:', error)
    MessagePlugin.error('加载用户活跃量统计失败')
    // 使用模拟数据
    userStatsData.value = generateMockUserStats()
  } finally {
    userStatsLoading.value = false
  }
}

// 生成模拟的埋点类型统计数据
const generateMockTypeStats = () => {
  const eventTypes = ['page_view', 'login', 'button_click', 'form_submit', 'file_upload']
  const dates = []
  const days = typeStatsDateType.value === 'day' ? 7 : typeStatsDateType.value === 'month' ? 6 : 5
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    if (typeStatsDateType.value === 'day') {
      date.setDate(date.getDate() - i)
      dates.push({
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        types: eventTypes.map(type => ({
          eventType: type,
          eventTypeLabel: eventTypeMap[type],
          count: Math.floor(Math.random() * 100) + 10
        }))
      })
    } else if (typeStatsDateType.value === 'month') {
      date.setMonth(date.getMonth() - i)
      dates.push({
        dateLabel: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        types: eventTypes.map(type => ({
          eventType: type,
          eventTypeLabel: eventTypeMap[type],
          count: Math.floor(Math.random() * 500) + 50
        }))
      })
    } else {
      date.setFullYear(date.getFullYear() - i)
      dates.push({
        dateLabel: `${date.getFullYear()}`,
        types: eventTypes.map(type => ({
          eventType: type,
          eventTypeLabel: eventTypeMap[type],
          count: Math.floor(Math.random() * 5000) + 500
        }))
      })
    }
  }
  return dates
}

// 生成模拟的用户活跃量数据
const generateMockUserStats = () => {
  const dailyStats = []
  const days = userStatsDateType.value === 'day' ? 7 : userStatsDateType.value === 'month' ? 6 : 5
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    if (userStatsDateType.value === 'day') {
      date.setDate(date.getDate() - i)
      const activeUserCount = Math.floor(Math.random() * 10) + 1
      const totalCount = Math.floor(Math.random() * 200) + 50
      dailyStats.push({
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        timeDimension: formatDate(date),
        activeUserCount,
        totalCount,
        avgPerUser: Math.round(totalCount / activeUserCount)
      })
    } else if (userStatsDateType.value === 'month') {
      date.setMonth(date.getMonth() - i)
      const activeUserCount = Math.floor(Math.random() * 20) + 5
      const totalCount = Math.floor(Math.random() * 1000) + 200
      dailyStats.push({
        dateLabel: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        timeDimension: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        activeUserCount,
        totalCount,
        avgPerUser: Math.round(totalCount / activeUserCount)
      })
    } else {
      date.setFullYear(date.getFullYear() - i)
      const activeUserCount = Math.floor(Math.random() * 50) + 10
      const totalCount = Math.floor(Math.random() * 5000) + 1000
      dailyStats.push({
        dateLabel: `${date.getFullYear()}`,
        timeDimension: `${date.getFullYear()}`,
        activeUserCount,
        totalCount,
        avgPerUser: Math.round(totalCount / activeUserCount)
      })
    }
  }
  
  const totalVisits = dailyStats.reduce((sum, item) => sum + item.totalCount, 0)
  const maxActiveUsers = Math.max(...dailyStats.map(item => item.activeUserCount))
  const avgActivity = dailyStats.length > 0 ? Math.round(totalVisits / dailyStats.length) : 0
  
  return {
    totalUsers: maxActiveUsers,
    totalVisits,
    avgActivity,
    dailyStats
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 埋点类型统计搜索
const handleTypeStatsSearch = () => {
  loadTypeStats()
}

// 埋点类型统计重置
const handleTypeStatsReset = () => {
  initTypeStatsDateRange()
  loadTypeStats()
}

// 用户活跃量统计搜索
const handleUserStatsSearch = () => {
  loadUserStats()
}

// 用户活跃量统计重置
const handleUserStatsReset = () => {
  initUserStatsDateRange()
  loadUserStats()
}

onMounted(() => {
  initTypeStatsDateRange()
  initUserStatsDateRange()
  loadTypeStats()
  loadUserStats()
})
</script>

<style scoped lang="scss">
.tracking-report-tab {
  .filter-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 6px;

    :deep(.t-form) {
      .t-form-item {
        margin-bottom: 0;
      }
    }
  }

  .chart-section {
    margin-bottom: 24px;

    .chart-card {
      :deep(.t-card__body) {
        padding: 24px;
      }

      .filter-section {
        margin-bottom: 24px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .chart-container {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        .chart-title {
          font-size: 16px;
          font-weight: 500;
          color: #1f2329;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;

            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
            }

            .legend-label {
              color: #5e6e82;
            }
          }
        }
      }

      .bar-chart {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        min-height: 300px;
        padding: 20px 0;

        .bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          .bar-label {
            font-size: 12px;
            color: #5e6e82;
            margin-bottom: 8px;
          }

          .bar-wrapper {
            display: flex;
            align-items: flex-end;
            width: 100%;
            height: 250px;
            gap: 2px;

            .bar {
              position: relative;
              min-height: 4px;
              border-radius: 2px 2px 0 0;
              transition: all 0.3s ease;
              cursor: pointer;

              &:hover {
                opacity: 0.8;
              }

              .bar-value {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 11px;
                color: #1f2329;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }

  .user-stats-section {
    .stats-card {
      :deep(.t-card__body) {
        padding: 24px;
      }

      .filter-section {
        margin-bottom: 24px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .user-stats-container {
      .stats-summary {
        display: flex;
        gap: 32px;
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e7e7e7;

        .summary-item {
          .summary-label {
            font-size: 14px;
            color: #5e6e82;
            margin-bottom: 8px;
          }

          .summary-value {
            font-size: 24px;
            font-weight: 600;
            color: #1f2329;
          }
        }
      }

      .user-list {
        .user-table {
          :deep(.t-table) {
            border: 1px solid #e7e7e7;
            border-radius: 6px;
          }

          :deep(.t-table__header) {
            background: #f5f7fa;
          }

          .progress-bar-wrapper {
            width: 100%;
            height: 28px;
            background: #f5f7fa;
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;

            .progress-bar {
              height: 100%;
              border-radius: 4px;
              transition: width 0.3s ease;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              padding-right: 8px;
              min-width: 40px;

              .progress-value {
                font-size: 12px;
                color: #fff;
                font-weight: 500;
                white-space: nowrap;
              }
            }
          }

          .stat-value {
            font-size: 14px;
            font-weight: 500;
            color: #1f2329;
          }
        }
      }
    }
  }
}
</style>

