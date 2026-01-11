<template>
  <div class="tracking-log-tab">
    <!-- 筛选条件 -->
    <div class="filter-section">
        <t-form layout="inline" @submit="handleSearch">
          <t-form-item label="事件类型">
            <t-select v-model="searchForm.eventType" placeholder="请选择" clearable style="width: 150px">
              <t-option label="页面访问" value="page_view" />
              <t-option label="用户登录" value="login" />
              <t-option label="用户登出" value="logout" />
              <t-option label="按钮点击" value="button_click" />
              <t-option label="表单提交" value="form_submit" />
              <t-option label="文件上传" value="file_upload" />
              <t-option label="自定义" value="custom" />
            </t-select>
          </t-form-item>
          <t-form-item label="用户名">
            <t-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 150px" />
          </t-form-item>
          <t-form-item label="页面URL">
            <t-input v-model="searchForm.pageUrl" placeholder="请输入页面URL" clearable style="width: 200px" />
          </t-form-item>
          <t-form-item label="关键词">
            <t-input v-model="searchForm.keyword" placeholder="搜索..." clearable style="width: 200px" />
          </t-form-item>
          <t-form-item>
            <t-space :size="12">
              <t-button theme="primary" type="submit">查询</t-button>
              <t-button theme="default" variant="outline" @click="handleReset">重置</t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </div>

      <!-- 表格 -->
      <t-table
        :data="logList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        stripe
        hover
        class="log-table"
      >
        <template #eventType="{ row }">
          <t-tag :theme="getEventTypeTheme(row.eventType)" size="small">
            {{ getEventTypeLabel(row.eventType) }}
          </t-tag>
        </template>

        <template #pageUrl="{ row }">
          <span class="url-text" :title="row.pageUrl">{{ row.pageUrl }}</span>
        </template>

        <template #stayTime="{ row }">
          <span v-if="row.stayTime">{{ formatTime(row.stayTime) }}</span>
          <span v-else>-</span>
        </template>

        <template #loadTime="{ row }">
          <span v-if="row.loadTime" :class="getLoadTimeClass(row.loadTime)">
            {{ row.loadTime }}ms
          </span>
          <span v-else>-</span>
        </template>

        <template #operation="{ row }">
          <t-button theme="primary" variant="text" size="small" @click="handleViewDetail(row)">
            查看详情
          </t-button>
        </template>
      </t-table>

      <!-- 分页 -->
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

    <!-- 详情对话框 -->
    <t-dialog
      v-model:visible="showDetailDialog"
      header="埋点日志详情"
      width="900px"
      :footer="false"
    >
      <div v-if="currentLog" class="log-detail">
        <t-descriptions bordered>
          <t-descriptions-item label="事件类型">
            <t-tag :theme="getEventTypeTheme(currentLog.eventType)" size="small">
              {{ getEventTypeLabel(currentLog.eventType) }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="事件名称">{{ currentLog.eventName || '-' }}</t-descriptions-item>
          <t-descriptions-item label="事件分类">{{ currentLog.eventCategory || '-' }}</t-descriptions-item>
          <t-descriptions-item label="用户名">{{ currentLog.username || '-' }}</t-descriptions-item>
          <t-descriptions-item label="用户工号">{{ currentLog.userCode || '-' }}</t-descriptions-item>
          <t-descriptions-item label="页面URL" :span="2">{{ currentLog.pageUrl || '-' }}</t-descriptions-item>
          <t-descriptions-item label="页面标题">{{ currentLog.pageTitle || '-' }}</t-descriptions-item>
          <t-descriptions-item label="来源页面" :span="2">{{ currentLog.pageReferrer || '-' }}</t-descriptions-item>
          <t-descriptions-item label="元素ID">{{ currentLog.elementId || '-' }}</t-descriptions-item>
          <t-descriptions-item label="元素Class">{{ currentLog.elementClass || '-' }}</t-descriptions-item>
          <t-descriptions-item label="元素文本" :span="2">{{ currentLog.elementText || '-' }}</t-descriptions-item>
          <t-descriptions-item label="会话ID" :span="2">{{ currentLog.sessionId || '-' }}</t-descriptions-item>
          <t-descriptions-item label="IP地址">{{ currentLog.ipAddress || '-' }}</t-descriptions-item>
          <t-descriptions-item label="浏览器">{{ currentLog.browser || '-' }}</t-descriptions-item>
          <t-descriptions-item label="操作系统">{{ currentLog.os || '-' }}</t-descriptions-item>
          <t-descriptions-item label="设备类型">{{ currentLog.deviceType || '-' }}</t-descriptions-item>
          <t-descriptions-item label="停留时间">{{ currentLog.stayTime ? formatTime(currentLog.stayTime) : '-' }}</t-descriptions-item>
          <t-descriptions-item label="加载时间">{{ currentLog.loadTime ? `${currentLog.loadTime}ms` : '-' }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ currentLog.createTime }}</t-descriptions-item>
        </t-descriptions>

        <!-- 扩展数据 -->
        <div v-if="currentLog.extraData" class="extra-data-section">
          <div class="section-title">扩展数据</div>
          <pre class="json-viewer">{{ formatJSON(currentLog.extraData) }}</pre>
        </div>

        <!-- User Agent -->
        <div v-if="currentLog.userAgent" class="user-agent-section">
          <div class="section-title">User Agent</div>
          <div class="user-agent-text">{{ currentLog.userAgent }}</div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

// 搜索表单
const searchForm = reactive({
  eventType: '',
  username: '',
  pageUrl: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const logList = ref([])
const loading = ref(false)
const showDetailDialog = ref(false)
const currentLog = ref(null)

// 表格列定义
const columns = [
  {
    colKey: 'id',
    title: 'ID',
    width: 80
  },
  {
    colKey: 'eventType',
    title: '事件类型',
    width: 120
  },
  {
    colKey: 'eventName',
    title: '事件名称',
    width: 150,
    ellipsis: true
  },
  {
    colKey: 'username',
    title: '用户名',
    width: 120
  },
  {
    colKey: 'pageUrl',
    title: '页面URL',
    width: 250,
    ellipsis: true
  },
  {
    colKey: 'pageTitle',
    title: '页面标题',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'stayTime',
    title: '停留时间',
    width: 130
  },
  {
    colKey: 'loadTime',
    title: '加载时间',
    width: 120
  },
  {
    colKey: 'ipAddress',
    title: 'IP地址',
    width: 140
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: 180
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 100,
    fixed: 'right'
  }
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 埋点日志功能已禁用
    console.log('[Tracking] 埋点日志查看功能已禁用')
    logList.value = []
    pagination.total = 0
  } catch (error) {
    console.error('加载埋点日志失败:', error)
    MessagePlugin.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.eventType = ''
  searchForm.username = ''
  searchForm.pageUrl = ''
  searchForm.keyword = ''
  pagination.current = 1
  loadData()
}

// 分页变化
const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  loadData()
}

const handlePageSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  loadData()
}

// 查看详情
const handleViewDetail = async (row) => {
  // 埋点详情查看功能已禁用
  console.log('[Tracking] 埋点详情查看功能已禁用')
  MessagePlugin.warning('埋点详情查看功能已禁用')
}

// 获取事件类型标签
const getEventTypeLabel = (type) => {
  const typeMap = {
    'page_view': '页面访问',
    'login': '用户登录',
    'logout': '用户登出',
    'button_click': '按钮点击',
    'form_submit': '表单提交',
    'file_upload': '文件上传',
    'custom': '自定义'
  }
  return typeMap[type] || type
}

// 获取事件类型主题色
const getEventTypeTheme = (type) => {
  const themeMap = {
    'page_view': 'primary',
    'login': 'success',
    'logout': 'warning',
    'button_click': 'default',
    'form_submit': 'primary',
    'file_upload': 'warning',
    'custom': 'default'
  }
  return themeMap[type] || 'default'
}

// 格式化时间（毫秒转换为可读格式）
const formatTime = (ms) => {
  if (ms < 1000) {
    return `${ms}ms`
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  } else {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}m${seconds}s`
  }
}

// 获取加载时间样式
const getLoadTimeClass = (loadTime) => {
  if (loadTime < 1000) {
    return 'load-time-fast'
  } else if (loadTime < 3000) {
    return 'load-time-normal'
  } else {
    return 'load-time-slow'
  }
}

// 格式化JSON
const formatJSON = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr)
    return JSON.stringify(obj, null, 2)
  } catch {
    return jsonStr
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.tracking-log-tab {
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

  .log-table {
    .url-text {
      font-size: 13px;
      color: #1f2329;
      word-break: break-all;
    }

    .load-time-fast {
      color: #2ba471;
      font-weight: 500;
    }

    .load-time-normal {
      color: #ed7b2f;
      font-weight: 500;
    }

    .load-time-slow {
      color: #e34d59;
      font-weight: 500;
    }

    :deep(.t-table) {
      border: 1px solid #e7e7e7;
      border-radius: 6px;
    }

    :deep(.t-table__header) {
      background: #f5f7fa;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

.log-detail {
  .extra-data-section,
  .user-agent-section {
    margin-top: 24px;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: #000;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e7e7e7;
    }

    .json-viewer {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
      max-height: 400px;
      overflow-y: auto;
      margin: 0;
    }

    .user-agent-text {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
      word-break: break-all;
    }
  }
}
</style>