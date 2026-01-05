<template>
  <div class="my-view-container">
    <div v-if="loading" class="loading-state">
      <t-loading text="加载中..." size="large" />
    </div>

    <div v-else-if="error" class="error-state">
      <t-icon name="error-circle" size="48px" />
      <p>{{ error }}</p>
      <t-button theme="primary" @click="loadViewData">重试</t-button>
    </div>

    <component
      v-else-if="currentViewComponent"
      :is="currentViewComponent"
      :view-data="viewData"
      :view-id="viewId"
      :issue-data="issueData"
    />

    <div v-else class="empty-state">
      <t-icon name="inbox" size="48px" />
      <p>未找到对应的视图</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getIssueList } from '@/api/workspace'

// 导入不同类型的视图组件
import GanttView from './views/GanttView.vue'
import KanbanView from './views/KanbanView.vue'
import TableView from './views/TableView.vue'
import CalendarView from './views/CalendarView.vue'
import ResourceGanttView from './views/ResourceGanttView.vue'

const route = useRoute()

const loading = ref(false)
const error = ref('')
const viewData = ref(null)
const issueData = ref(null)
const currentViewComponent = shallowRef(null)

// 从 URL 获取视图 ID
const viewId = computed(() => route.query.id)

// 视图类型与组件的映射
const viewComponentMap = {
  'gantt': GanttView,
  'kanban': KanbanView,
  'board': KanbanView, // board 也映射到看板视图
  'table': TableView,
  'calendar': CalendarView,
  'resource-gantt': ResourceGanttView
}

/**
 * 解析视图配置并转换为查询参数
 * @param {string|object} config - 视图配置
 * @returns {object} - 查询参数
 */
const parseViewConfigToQuery = (config) => {
  try {
    // 如果 config 是字符串，解析为对象
    const configObj = typeof config === 'string' ? JSON.parse(config) : config

    const queryParams = {
      current: 1,
      size: 100 // 默认每页100条
    }

    // 解析过滤条件
    if (configObj.filters) {
      const { filters } = configObj

      // 状态筛选
      if (filters.status && filters.status.length > 0) {
        queryParams.status = filters.status
      }

      // 优先级筛选
      if (filters.priority && filters.priority.length > 0) {
        queryParams.priority = filters.priority
      }

      // 负责人筛选
      if (filters.assignee && filters.assignee.length > 0) {
        queryParams.assigneeId = filters.assignee
      }

      // 创建人筛选
      if (filters.creator && filters.creator.length > 0) {
        queryParams.creatorId = filters.creator
      }

      // 关键词筛选
      if (filters.keyword) {
        queryParams.keyword = filters.keyword
      }

      // 日期范围筛选
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          queryParams.startDateFrom = filters.dateRange.start
        }
        if (filters.dateRange.end) {
          queryParams.startDateTo = filters.dateRange.end
        }
      }
    }

    // 解析排序条件
    if (configObj.sort) {
      queryParams.sortField = configObj.sort.field || 'createTime'
      queryParams.sortOrder = configObj.sort.order || 'desc'
    }

    return queryParams
  } catch (err) {
    console.error('[解析视图配置失败]', err)
    return {
      current: 1,
      size: 100
    }
  }
}

/**
 * 加载事项数据
 * @param {object} viewConfig - 视图配置
 * @param {string} viewType - 视图类型
 */
const loadIssueData = async (viewConfig, viewType) => {
  try {
    // 解析视图配置为查询参数
    const queryParams = parseViewConfigToQuery(viewConfig)
    let mockIssueData;
    
    // 使用传入的视图类型
    const currentViewType = viewType || 'table'
    
    if (currentViewType === 'gantt') {
      // 甘特图视图数据（项目进度）
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      // 生成日期辅助函数
      const formatDate = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const formatDateTime = (y, m, d, h = 9, min = 0) => `${formatDate(y, m, d)} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
      
      mockIssueData = {
        total: 35,
        pages: 1,
        current: 1,
        records: [
          // 第一阶段：项目规划
          {
            id: 'phase-1',
            issueNo: 'PHASE-001',
            summary: '项目规划阶段',
            title: '项目规划阶段',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 2, 1),
            updateTime: formatDateTime(year, month - 2, 15, 16, 30),
            startDate: formatDate(year, month - 2, 1),
            dueDate: formatDate(year, month - 2, 15),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'PHASE',
            type: 'phase',
            tags: '["项目管理"]'
          },
          {
            id: 'task-1-1',
            issueNo: 'TASK-001',
            summary: '项目启动会议',
            title: '项目启动会议',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 2, 1, 10),
            updateTime: formatDateTime(year, month - 2, 1, 12),
            startDate: formatDate(year, month - 2, 1),
            dueDate: formatDate(year, month - 2, 1),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["会议"]'
          },
          {
            id: 'task-1-2',
            issueNo: 'TASK-002',
            summary: '需求分析',
            title: '需求分析',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 2, 2),
            updateTime: formatDateTime(year, month - 2, 10, 17),
            startDate: formatDate(year, month - 2, 2),
            dueDate: formatDate(year, month - 2, 10),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["需求", "分析"]'
          },
          {
            id: 'task-1-3',
            issueNo: 'TASK-003',
            summary: '技术选型',
            title: '技术选型',
            status: 0, // 已完成
            priority: '中',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month - 2, 11),
            updateTime: formatDateTime(year, month - 2, 15, 16, 30),
            startDate: formatDate(year, month - 2, 11),
            dueDate: formatDate(year, month - 2, 15),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["技术", "选型"]'
          },
          {
            id: 'task-1-4',
            issueNo: 'TASK-004',
            summary: '项目计划制定',
            title: '项目计划制定',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 2, 12),
            updateTime: formatDateTime(year, month - 2, 14, 18),
            startDate: formatDate(year, month - 2, 12),
            dueDate: formatDate(year, month - 2, 14),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["计划"]'
          },
          
          // 第二阶段：系统设计
          {
            id: 'phase-2',
            issueNo: 'PHASE-002',
            summary: '系统设计阶段',
            title: '系统设计阶段',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month - 2, 16),
            updateTime: formatDateTime(year, month - 1, 2, 17),
            startDate: formatDate(year, month - 2, 16),
            dueDate: formatDate(year, month - 1, 2),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'PHASE',
            type: 'phase',
            tags: '["设计"]'
          },
          {
            id: 'task-2-1',
            issueNo: 'TASK-005',
            summary: '架构设计',
            title: '架构设计',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 2, 16),
            updateTime: formatDateTime(year, month - 2, 22, 17),
            startDate: formatDate(year, month - 2, 16),
            dueDate: formatDate(year, month - 2, 22),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["架构", "设计"]'
          },
          {
            id: 'task-2-2',
            issueNo: 'TASK-006',
            summary: '数据库设计',
            title: '数据库设计',
            status: 0, // 已完成
            priority: '中',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 2, 23),
            updateTime: formatDateTime(year, month - 2, 28, 17),
            startDate: formatDate(year, month - 2, 23),
            dueDate: formatDate(year, month - 2, 28),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["数据库", "设计"]'
          },
          {
            id: 'task-2-3',
            issueNo: 'TASK-007',
            summary: '接口设计',
            title: '接口设计',
            status: 0, // 已完成
            priority: '中',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 1),
            updateTime: formatDateTime(year, month - 1, 2, 17),
            startDate: formatDate(year, month - 1, 1),
            dueDate: formatDate(year, month - 1, 2),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["接口", "设计"]'
          },
          {
            id: 'task-2-4',
            issueNo: 'TASK-008',
            summary: 'UI/UX 设计',
            title: 'UI/UX 设计',
            status: 0, // 已完成
            priority: '中',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 2, 20),
            updateTime: formatDateTime(year, month - 1, 1, 16),
            startDate: formatDate(year, month - 2, 20),
            dueDate: formatDate(year, month - 1, 1),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["UI", "设计"]'
          },
          
          // 第三阶段：开发实现
          {
            id: 'phase-3',
            issueNo: 'PHASE-003',
            summary: '开发实现阶段',
            title: '开发实现阶段',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 1, 3),
            updateTime: formatDateTime(year, month, 5, 17),
            startDate: formatDate(year, month - 1, 3),
            dueDate: formatDate(year, month, 25),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'PHASE',
            type: 'phase',
            tags: '["开发"]'
          },
          {
            id: 'task-3-1',
            issueNo: 'TASK-009',
            summary: '后端开发',
            title: '后端开发',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 3),
            updateTime: formatDateTime(year, month, 3, 17),
            startDate: formatDate(year, month - 1, 3),
            dueDate: formatDate(year, month, 15),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["后端", "开发"]'
          },
          {
            id: 'task-3-2',
            issueNo: 'TASK-010',
            summary: '前端开发',
            title: '前端开发',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 5),
            updateTime: formatDateTime(year, month, 5, 17),
            startDate: formatDate(year, month - 1, 5),
            dueDate: formatDate(year, month, 20),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["前端", "开发"]'
          },
          {
            id: 'task-3-3',
            issueNo: 'TASK-011',
            summary: 'API接口开发',
            title: 'API接口开发',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 8),
            updateTime: formatDateTime(year, month, 2, 17),
            startDate: formatDate(year, month - 1, 8),
            dueDate: formatDate(year, month, 12),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["API", "开发"]'
          },
          {
            id: 'task-3-4',
            issueNo: 'TASK-012',
            summary: '用户认证模块',
            title: '用户认证模块',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 10),
            updateTime: formatDateTime(year, month, 1, 16),
            startDate: formatDate(year, month - 1, 10),
            dueDate: formatDate(year, month, 8),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["认证", "安全"]'
          },
          {
            id: 'task-3-5',
            issueNo: 'TASK-013',
            summary: '权限管理模块',
            title: '权限管理模块',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 12),
            updateTime: formatDateTime(year, month, 4, 15),
            startDate: formatDate(year, month - 1, 12),
            dueDate: formatDate(year, month, 10),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["权限", "RBAC"]'
          },
          {
            id: 'task-3-6',
            issueNo: 'TASK-014',
            summary: '事项管理模块',
            title: '事项管理模块',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 15),
            updateTime: formatDateTime(year, month, 6, 14),
            startDate: formatDate(year, month - 1, 15),
            dueDate: formatDate(year, month, 18),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["事项", "管理"]'
          },
          {
            id: 'task-3-7',
            issueNo: 'TASK-015',
            summary: '甘特图视图',
            title: '甘特图视图',
            status: 2, // 进行中
            priority: '中',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 1, 18),
            updateTime: formatDateTime(year, month, 3, 16),
            startDate: formatDate(year, month - 1, 18),
            dueDate: formatDate(year, month, 15),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["视图", "甘特图"]'
          },
          {
            id: 'task-3-8',
            issueNo: 'TASK-016',
            summary: '看板视图',
            title: '看板视图',
            status: 0, // 已完成
            priority: '中',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 1, 20),
            updateTime: formatDateTime(year, month - 1, 28, 18),
            startDate: formatDate(year, month - 1, 20),
            dueDate: formatDate(year, month - 1, 28),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["视图", "看板"]'
          },
          {
            id: 'task-3-9',
            issueNo: 'TASK-017',
            summary: '数据统计报表',
            title: '数据统计报表',
            status: 2, // 进行中
            priority: '中',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month - 1, 22),
            updateTime: formatDateTime(year, month, 2, 15),
            startDate: formatDate(year, month - 1, 22),
            dueDate: formatDate(year, month, 12),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["报表", "统计"]'
          },
          
          // 第四阶段：测试上线
          {
            id: 'phase-4',
            issueNo: 'PHASE-004',
            summary: '测试上线阶段',
            title: '测试上线阶段',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 20),
            startDate: formatDate(year, month, 26),
            dueDate: formatDate(year, month + 1, 10),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'PHASE',
            type: 'phase',
            tags: '["测试", "上线"]'
          },
          {
            id: 'task-4-1',
            issueNo: 'TASK-018',
            summary: '单元测试',
            title: '单元测试',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 20),
            startDate: formatDate(year, month, 26),
            dueDate: formatDate(year, month, 30),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["测试", "单元"]'
          },
          {
            id: 'task-4-2',
            issueNo: 'TASK-019',
            summary: '集成测试',
            title: '集成测试',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 20),
            startDate: formatDate(year, month + 1, 1),
            dueDate: formatDate(year, month + 1, 5),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["测试", "集成"]'
          },
          {
            id: 'task-4-3',
            issueNo: 'TASK-020',
            summary: '功能测试',
            title: '功能测试',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 20),
            startDate: formatDate(year, month + 1, 2),
            dueDate: formatDate(year, month + 1, 7),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["测试", "功能"]'
          },
          {
            id: 'task-4-4',
            issueNo: 'TASK-021',
            summary: '性能测试',
            title: '性能测试',
            status: 1, // 待处理
            priority: '中',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 20),
            startDate: formatDate(year, month + 1, 3),
            dueDate: formatDate(year, month + 1, 8),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["测试", "性能"]'
          },
          {
            id: 'task-4-5',
            issueNo: 'TASK-022',
            summary: '系统上线',
            title: '系统上线',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 20),
            startDate: formatDate(year, month + 1, 8),
            dueDate: formatDate(year, month + 1, 10),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["上线", "部署"]'
          }
        ]
      };
    } else if (currentViewType === 'board') {
      // 看板视图数据（任务分配）
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      
      // 生成日期辅助函数
      const formatDate = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const formatDateTime = (y, m, d, h = 9, min = 0) => `${formatDate(y, m, d)} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
      
      mockIssueData = {
        total: 40,
        pages: 1,
        current: 1,
        records: [
          // 待分析（status: 1）
          {
            id: 'board-1',
            issueNo: 'REQ-001',
            summary: '用户登录需求分析',
            title: '用户登录需求分析',
            status: 1,
            priority: '高',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 1),
            updateTime: formatDateTime(year, month, 1),
            dueDate: formatDate(year, month, 5),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'REQ',
            type: 'task',
            tags: '["需求", "分析"]'
          },
          {
            id: 'board-2',
            issueNo: 'REQ-002',
            summary: '权限管理需求分析',
            title: '权限管理需求分析',
            status: 1,
            priority: '高',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 2),
            updateTime: formatDateTime(year, month, 2),
            dueDate: formatDate(year, month, 6),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'REQ',
            type: 'task',
            tags: '["需求", "权限"]'
          },
          
          // 待设计（status: 2）
          {
            id: 'board-3',
            issueNo: 'UI-001',
            summary: '首页UI设计',
            title: '首页UI设计',
            status: 2,
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, 3),
            updateTime: formatDateTime(year, month, 3),
            dueDate: formatDate(year, month, 8),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'UI',
            type: 'task',
            tags: '["前端", "设计", "UI"]'
          },
          {
            id: 'board-4',
            issueNo: 'DB-001',
            summary: '用户表设计',
            title: '用户表设计',
            status: 2,
            priority: '中',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 4),
            updateTime: formatDateTime(year, month, 4),
            dueDate: formatDate(year, month, 9),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'DB',
            type: 'task',
            tags: '["后端", "数据库", "设计"]'
          },
          
          // 待评审（status: 3）
          {
            id: 'board-5',
            issueNo: 'REQ-003',
            summary: '需求分析报告评审',
            title: '需求分析报告评审',
            status: 3,
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, 5),
            updateTime: formatDateTime(year, month, 5),
            dueDate: formatDate(year, month, 7),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'REQ',
            type: 'task',
            tags: '["文档", "评审", "需求"]'
          },
          {
            id: 'board-6',
            issueNo: 'ARCH-001',
            summary: '系统架构设计评审',
            title: '系统架构设计评审',
            status: 3,
            priority: '高',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 6),
            updateTime: formatDateTime(year, month, 6),
            dueDate: formatDate(year, month, 10),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'ARCH',
            type: 'task',
            tags: '["架构", "评审", "设计"]'
          },
          
          // 待排期（status: 4）
          {
            id: 'board-7',
            issueNo: 'PLAN-001',
            summary: '开发任务排期',
            title: '开发任务排期',
            status: 4,
            priority: '中',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 7),
            updateTime: formatDateTime(year, month, 7),
            dueDate: formatDate(year, month, 12),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'PLAN',
            type: 'task',
            tags: '["计划", "排期"]'
          },
          {
            id: 'board-8',
            issueNo: 'SPRINT-001',
            summary: 'Sprint计划制定',
            title: 'Sprint计划制定',
            status: 4,
            priority: '中',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 8),
            updateTime: formatDateTime(year, month, 8),
            dueDate: formatDate(year, month, 13),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'SPRINT',
            type: 'task',
            tags: '["计划", "Sprint"]'
          },
          
          // 待开发（status: 5）
          {
            id: 'board-9',
            issueNo: 'FE-001',
            summary: '登录页面开发',
            title: '登录页面开发',
            status: 5,
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, 9),
            updateTime: formatDateTime(year, month, 9),
            dueDate: formatDate(year, month, 15),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'FE',
            type: 'task',
            tags: '["前端", "开发", "页面"]'
          },
          {
            id: 'board-10',
            issueNo: 'BE-001',
            summary: '用户管理API开发',
            title: '用户管理API开发',
            status: 5,
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 10),
            updateTime: formatDateTime(year, month, 10),
            dueDate: formatDate(year, month, 16),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'BE',
            type: 'task',
            tags: '["后端", "开发", "API"]'
          },
          
          // 开发中（status: 6）
          {
            id: 'board-11',
            issueNo: 'FE-002',
            summary: '首页开发',
            title: '首页开发',
            status: 6,
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, 11),
            updateTime: formatDateTime(year, month, 12, 17),
            dueDate: formatDate(year, month, 20),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'FE',
            type: 'task',
            tags: '["前端", "开发", "首页"]'
          },
          {
            id: 'board-12',
            issueNo: 'BE-002',
            summary: '权限管理API开发',
            title: '权限管理API开发',
            status: 6,
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 12),
            updateTime: formatDateTime(year, month, 13, 16),
            dueDate: formatDate(year, month, 22),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'BE',
            type: 'task',
            tags: '["后端", "开发", "权限"]'
          },
          {
            id: 'board-13',
            issueNo: 'FE-003',
            summary: '事项列表页面开发',
            title: '事项列表页面开发',
            status: 6,
            priority: '中',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, 13),
            updateTime: formatDateTime(year, month, 14, 15),
            dueDate: formatDate(year, month, 25),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'FE',
            type: 'task',
            tags: '["前端", "开发", "列表"]'
          },
          
          // 已提测（status: 7）
          {
            id: 'board-14',
            issueNo: 'TEST-001',
            summary: '登录功能提测',
            title: '登录功能提测',
            status: 7,
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 14),
            updateTime: formatDateTime(year, month, 15, 18),
            dueDate: formatDate(year, month, 18),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TEST',
            type: 'task',
            tags: '["测试", "功能"]'
          },
          {
            id: 'board-15',
            issueNo: 'TEST-002',
            summary: '用户管理API提测',
            title: '用户管理API提测',
            status: 7,
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-4',
            creatorName: '赵六',
            createTime: formatDateTime(year, month, 15),
            updateTime: formatDateTime(year, month, 16, 17),
            dueDate: formatDate(year, month, 19),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TEST',
            type: 'task',
            tags: '["测试", "API"]'
          },
          
          // 测试中（status: 8）
          {
            id: 'board-16',
            issueNo: 'TEST-003',
            summary: '首页功能测试',
            title: '首页功能测试',
            status: 8,
            priority: '中',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 16),
            updateTime: formatDateTime(year, month, 17, 16),
            dueDate: formatDate(year, month, 21),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TEST',
            type: 'task',
            tags: '["测试", "功能"]'
          },
          {
            id: 'board-17',
            issueNo: 'TEST-004',
            summary: '权限管理功能测试',
            title: '权限管理功能测试',
            status: 8,
            priority: '中',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-4',
            creatorName: '赵六',
            createTime: formatDateTime(year, month, 17),
            updateTime: formatDateTime(year, month, 18, 15),
            dueDate: formatDate(year, month, 22),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TEST',
            type: 'task',
            tags: '["测试", "权限"]'
          },
          
          // 测试完成（status: 9）
          {
            id: 'board-18',
            issueNo: 'TEST-005',
            summary: '登录功能测试完成',
            title: '登录功能测试完成',
            status: 9,
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, 18),
            updateTime: formatDateTime(year, month, 19, 17),
            dueDate: formatDate(year, month, 20),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TEST',
            type: 'task',
            tags: '["测试", "完成"]'
          },
          {
            id: 'board-19',
            issueNo: 'TEST-006',
            summary: '用户管理API测试完成',
            title: '用户管理API测试完成',
            status: 9,
            priority: '高',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-4',
            creatorName: '赵六',
            createTime: formatDateTime(year, month, 19),
            updateTime: formatDateTime(year, month, 20, 16),
            dueDate: formatDate(year, month, 21),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TEST',
            type: 'task',
            tags: '["测试", "API"]'
          },
          
          // 待验收（status: 10）
          {
            id: 'board-20',
            issueNo: 'ACCEPT-001',
            summary: '登录功能待验收',
            title: '登录功能待验收',
            status: 10,
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-6',
            creatorName: '周八',
            createTime: formatDateTime(year, month, 20),
            updateTime: formatDateTime(year, month, 21, 10),
            dueDate: formatDate(year, month, 23),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'ACCEPT',
            type: 'task',
            tags: '["验收", "功能"]'
          },
          {
            id: 'board-21',
            issueNo: 'ACCEPT-002',
            summary: '首页功能待验收',
            title: '首页功能待验收',
            status: 10,
            priority: '中',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-6',
            creatorName: '周八',
            createTime: formatDateTime(year, month, 21),
            updateTime: formatDateTime(year, month, 22, 11),
            dueDate: formatDate(year, month, 24),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'ACCEPT',
            type: 'task',
            tags: '["验收", "功能"]'
          },
          
          // 验收中（status: 11）
          {
            id: 'board-22',
            issueNo: 'ACCEPT-003',
            summary: '权限管理功能验收',
            title: '权限管理功能验收',
            status: 11,
            priority: '高',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-6',
            creatorName: '周八',
            createTime: formatDateTime(year, month, 22),
            updateTime: formatDateTime(year, month, 23, 14),
            dueDate: formatDate(year, month, 25),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'ACCEPT',
            type: 'task',
            tags: '["验收", "权限"]'
          },
          {
            id: 'board-23',
            issueNo: 'ACCEPT-004',
            summary: '用户管理功能验收',
            title: '用户管理功能验收',
            status: 11,
            priority: '中',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-6',
            creatorName: '周八',
            createTime: formatDateTime(year, month, 23),
            updateTime: formatDateTime(year, month, 24, 15),
            dueDate: formatDate(year, month, 26),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'ACCEPT',
            type: 'task',
            tags: '["验收", "用户"]'
          },
          
          // 待发布（status: 12）
          {
            id: 'board-24',
            issueNo: 'RELEASE-001',
            summary: '登录功能待发布',
            title: '登录功能待发布',
            status: 12,
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 24),
            updateTime: formatDateTime(year, month, 25, 16),
            dueDate: formatDate(year, month, 28),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'RELEASE',
            type: 'task',
            tags: '["发布", "部署"]'
          },
          {
            id: 'board-25',
            issueNo: 'RELEASE-002',
            summary: '首页功能待发布',
            title: '首页功能待发布',
            status: 12,
            priority: '中',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, 25),
            updateTime: formatDateTime(year, month, 26, 17),
            dueDate: formatDate(year, month, 29),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'RELEASE',
            type: 'task',
            tags: '["发布", "部署"]'
          },
          
          // 已发布（status: 0）
          {
            id: 'board-26',
            issueNo: 'RELEASE-003',
            summary: '项目初始化已发布',
            title: '项目初始化已发布',
            status: 0,
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 1, 28),
            updateTime: formatDateTime(year, month, 1, 10),
            dueDate: formatDate(year, month, 1),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'RELEASE',
            type: 'task',
            tags: '["发布", "完成"]'
          },
          {
            id: 'board-27',
            issueNo: 'RELEASE-004',
            summary: '技术选型已发布',
            title: '技术选型已发布',
            status: 0,
            priority: '中',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 1, 29),
            updateTime: formatDateTime(year, month, 2, 11),
            dueDate: formatDate(year, month, 2),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'RELEASE',
            type: 'task',
            tags: '["发布", "技术"]'
          },
          {
            id: 'board-28',
            issueNo: 'RELEASE-005',
            summary: '基础框架已发布',
            title: '基础框架已发布',
            status: 0,
            priority: '高',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month - 1, 30),
            updateTime: formatDateTime(year, month, 3, 14),
            dueDate: formatDate(year, month, 3),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'RELEASE',
            type: 'task',
            tags: '["发布", "框架"]'
          }
        ]
      };
    } else if (currentViewType === 'calendar') {
      // 日历视图数据（项目日历）- 生成最近日期的数据
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      
      // 生成日期辅助函数
      const formatDate = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const formatDateTime = (y, m, d, h = 9, min = 0) => `${formatDate(y, m, d)} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
      
      mockIssueData = {
        total: 20,
        pages: 1,
        current: 1,
        records: [
          // 今天的数据
          {
            id: 'cal-today-1',
            issueNo: 'MEET-TODAY-001',
            summary: '今日晨会',
            title: '今日晨会',
            status: 2, // 进行中
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day, 9, 0),
            updateTime: formatDateTime(year, month, day, 9, 30),
            startDate: formatDate(year, month, day),
            dueDate: formatDate(year, month, day),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "晨会"]'
          },
          {
            id: 'cal-today-2',
            issueNo: 'TASK-TODAY-001',
            summary: '代码审查',
            title: '代码审查',
            status: 2, // 进行中
            priority: '中',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day, 14, 0),
            updateTime: formatDateTime(year, month, day, 15, 0),
            startDate: formatDate(year, month, day),
            dueDate: formatDate(year, month, day),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["代码", "审查"]'
          },
          // 明天的数据
          {
            id: 'cal-tomorrow-1',
            issueNo: 'MEET-TOMORROW-001',
            summary: '项目进度汇报',
            title: '项目进度汇报',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day + 1, 10, 0),
            updateTime: formatDateTime(year, month, day + 1, 10, 0),
            startDate: formatDate(year, month, day + 1),
            dueDate: formatDate(year, month, day + 1),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "汇报"]'
          },
          {
            id: 'cal-tomorrow-2',
            issueNo: 'TASK-TOMORROW-001',
            summary: '功能测试',
            title: '功能测试',
            status: 1, // 待处理
            priority: '中',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, day + 1, 14, 30),
            updateTime: formatDateTime(year, month, day + 1, 14, 30),
            startDate: formatDate(year, month, day + 1),
            dueDate: formatDate(year, month, day + 1),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["测试", "功能"]'
          },
          // 后天的数据
          {
            id: 'cal-day3-1',
            issueNo: 'MEET-DAY3-001',
            summary: '技术方案讨论',
            title: '技术方案讨论',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day + 2, 9, 30),
            updateTime: formatDateTime(year, month, day + 2, 9, 30),
            startDate: formatDate(year, month, day + 2),
            dueDate: formatDate(year, month, day + 2),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "技术"]'
          },
          {
            id: 'cal-day3-2',
            issueNo: 'TASK-DAY3-001',
            summary: '接口联调',
            title: '接口联调',
            status: 1, // 待处理
            priority: '中',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-3',
            creatorName: '王五',
            createTime: formatDateTime(year, month, day + 2, 15, 0),
            updateTime: formatDateTime(year, month, day + 2, 15, 0),
            startDate: formatDate(year, month, day + 2),
            dueDate: formatDate(year, month, day + 2),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["接口", "联调"]'
          },
          // 未来一周的数据
          {
            id: 'cal-week-1',
            issueNo: 'MEET-WEEK-001',
            summary: '周例会',
            title: '周例会',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day + 3, 10, 0),
            updateTime: formatDateTime(year, month, day + 3, 10, 0),
            startDate: formatDate(year, month, day + 3),
            dueDate: formatDate(year, month, day + 3),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "周会"]'
          },
          {
            id: 'cal-week-2',
            issueNo: 'TASK-WEEK-001',
            summary: '性能优化',
            title: '性能优化',
            status: 1, // 待处理
            priority: '中',
            assigneeId: 'user-5',
            assigneeName: '孙七',
            assignee_name: '孙七',
            employeeNo: 'E005',
            employee_no: 'E005',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day + 4, 9, 0),
            updateTime: formatDateTime(year, month, day + 4, 9, 0),
            startDate: formatDate(year, month, day + 4),
            dueDate: formatDate(year, month, day + 4),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["性能", "优化"]'
          },
          {
            id: 'cal-week-3',
            issueNo: 'MEET-WEEK-002',
            summary: '需求评审',
            title: '需求评审',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day + 5, 14, 0),
            updateTime: formatDateTime(year, month, day + 5, 14, 0),
            startDate: formatDate(year, month, day + 5),
            dueDate: formatDate(year, month, day + 5),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "评审"]'
          },
          {
            id: 'cal-week-4',
            issueNo: 'TASK-WEEK-002',
            summary: '文档编写',
            title: '文档编写',
            status: 1, // 待处理
            priority: '低',
            assigneeId: 'user-6',
            assigneeName: '周八',
            assignee_name: '周八',
            employeeNo: 'E006',
            employee_no: 'E006',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: formatDateTime(year, month, day + 6, 10, 0),
            updateTime: formatDateTime(year, month, day + 6, 10, 0),
            startDate: formatDate(year, month, day + 6),
            dueDate: formatDate(year, month, day + 6),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'TASK',
            type: 'task',
            tags: '["文档", "编写"]'
          },
          {
            id: 'cal-week-5',
            issueNo: 'MEET-WEEK-003',
            summary: '项目总结会',
            title: '项目总结会',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day + 7, 15, 0),
            updateTime: formatDateTime(year, month, day + 7, 15, 0),
            startDate: formatDate(year, month, day + 7),
            dueDate: formatDate(year, month, day + 7),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "总结"]'
          },
          // 保留一些旧数据作为历史记录
          {
            id: 'cal-1',
            issueNo: 'MEET-001',
            summary: '项目启动会议',
            title: '项目启动会议',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day - 7, 10, 0),
            updateTime: formatDateTime(year, month, day - 6, 14, 30),
            startDate: formatDate(year, month, day - 7),
            dueDate: formatDate(year, month, day - 7),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "启动"]'
          },
          {
            id: 'cal-2',
            issueNo: 'MEET-002',
            summary: '需求评审会议',
            title: '需求评审',
            status: 0, // 已完成
            priority: '中',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: formatDateTime(year, month, day - 5, 9, 15),
            updateTime: formatDateTime(year, month, day - 3, 11, 20),
            startDate: formatDate(year, month, day - 5),
            dueDate: formatDate(year, month, day - 5),
            projectId: 'project-1',
            projectName: 'DCP 项目管理平台',
            space_keyword: 'MEET',
            type: 'meeting',
            tags: '["会议", "评审"]'
          }
        ]
      };
    } else {
      // 默认列表视图数据
      mockIssueData = {
        total: 12,
        pages: 2,
        current: 1,
        records: [
          {
            id: 'issue-1',
            issueNo: 'DEV-001',
            summary: '项目初始化',
            title: '项目初始化',
            status: 0, // 已完成
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-02 14:30:00',
            dueDate: '2024-01-15',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'DEV',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-2',
            issueNo: 'REQ-001',
            summary: '需求分析',
            title: '需求分析',
            status: 2, // 进行中
            priority: '中',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-03 09:15:00',
            updateTime: '2024-01-05 11:20:00',
            dueDate: '2024-01-20',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'REQ',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-3',
            issueNo: 'UI-001',
            summary: 'UI 设计',
            title: 'UI 设计',
            status: 1, // 待处理
            priority: '中',
            assigneeId: 'user-3',
            assigneeName: '王五',
            assignee_name: '王五',
            employeeNo: 'E003',
            employee_no: 'E003',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: '2024-01-04 14:45:00',
            updateTime: '2024-01-04 14:45:00',
            dueDate: '2024-01-25',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'UI',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-4',
            issueNo: 'FE-001',
            summary: '前端开发',
            title: '前端开发',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-2',
            creatorName: '李四',
            createTime: '2024-01-05 10:30:00',
            updateTime: '2024-01-05 10:30:00',
            dueDate: '2024-02-10',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'FE',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-5',
            issueNo: 'BE-001',
            summary: '后端开发',
            title: '后端开发',
            status: 1, // 待处理
            priority: '高',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-05 11:00:00',
            updateTime: '2024-01-05 11:00:00',
            dueDate: '2024-02-15',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'BE',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-6',
            issueNo: 'DB-001',
            summary: '数据库设计',
            title: '数据库设计',
            status: 2, // 进行中
            priority: 'medium',
            assigneeId: 'user-4',
            assigneeName: '赵六',
            assignee_name: '赵六',
            employeeNo: 'E004',
            employee_no: 'E004',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-06 09:00:00',
            updateTime: '2024-01-07 16:20:00',
            dueDate: '2024-01-30',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'DB',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-7',
            issueNo: 'DOC-001',
            summary: '接口文档编写',
            title: '接口文档编写',
            status: 1, // 待处理
            priority: 'low',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-4',
            creatorName: '赵六',
            createTime: '2024-01-06 14:20:00',
            updateTime: '2024-01-06 14:20:00',
            dueDate: '2024-02-05',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'DOC',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-8',
            issueNo: 'TEST-001',
            summary: '单元测试',
            title: '单元测试',
            status: 1, // 待处理
            priority: 'medium',
            assigneeId: 'user-5',
            assigneeName: '钱七',
            assignee_name: '钱七',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-07 10:15:00',
            updateTime: '2024-01-07 10:15:00',
            dueDate: '2024-02-20',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'TEST',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-9',
            issueNo: 'TEST-002',
            summary: '集成测试',
            title: '集成测试',
            status: 1, // 待处理
            priority: 'high',
            assigneeId: 'user-5',
            assigneeName: '钱七',
            assignee_name: '钱七',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-08 09:30:00',
            updateTime: '2024-01-08 09:30:00',
            dueDate: '2024-02-25',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'TEST',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-10',
            issueNo: 'DEPLOY-001',
            summary: '系统部署',
            title: '系统部署',
            status: 1, // 待处理
            priority: 'medium',
            assigneeId: 'user-6',
            assigneeName: '孙八',
            assignee_name: '孙八',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-08 14:45:00',
            updateTime: '2024-01-08 14:45:00',
            dueDate: '2024-03-01',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'DEPLOY',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-11',
            issueNo: 'TRAIN-001',
            summary: '用户培训',
            title: '用户培训',
            status: 1, // 待处理
            priority: 'low',
            assigneeId: 'user-2',
            assigneeName: '李四',
            assignee_name: '李四',
            employeeNo: 'E002',
            employee_no: 'E002',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-09 10:00:00',
            updateTime: '2024-01-09 10:00:00',
            dueDate: '2024-03-05',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'TRAIN',
            type: 'task',
            tags: '[]'
          },
          {
            id: 'issue-12',
            issueNo: 'ACCEPT-001',
            summary: '项目验收',
            title: '项目验收',
            status: 1, // 待处理
            priority: 'high',
            assigneeId: 'user-1',
            assigneeName: '张三',
            assignee_name: '张三',
            employeeNo: 'E001',
            employee_no: 'E001',
            creatorId: 'user-1',
            creatorName: '张三',
            createTime: '2024-01-09 14:30:00',
            updateTime: '2024-01-09 14:30:00',
            dueDate: '2024-03-10',
            projectId: 'project-1',
            projectName: '测试项目',
            space_keyword: 'ACCEPT',
            type: 'task',
            tags: '[]'
          }
        ]
      };
    }
    
    // 为日历视图生成额外的事件数据
    if (currentViewType === 'calendar') {
      viewData.value.data = {
        events: [
          {
            id: 'event-1',
            title: '项目启动会议',
            start: '2024-01-01T10:00:00',
            end: '2024-01-01T12:00:00',
            allDay: false,
            assignee: '张三',
            priority: '高',
            type: 'meeting',
            location: '会议室A'
          },
          {
            id: 'event-2',
            title: '需求评审',
            start: '2024-01-15T14:00:00',
            end: '2024-01-15T16:00:00',
            allDay: false,
            assignee: '李四',
            priority: '中',
            type: 'review',
            location: '会议室B'
          },
          {
            id: 'event-3',
            title: '系统设计评审',
            start: '2024-02-15T09:30:00',
            end: '2024-02-15T11:30:00',
            allDay: false,
            assignee: '王五',
            priority: '中',
            type: 'review',
            location: '会议室A'
          },
          {
            id: 'event-4',
            title: '项目中期检查',
            start: '2024-03-01',
            end: '2024-03-02',
            allDay: true,
            assignee: '张三',
            priority: '高',
            type: 'inspection',
            location: '线上会议'
          },
          {
            id: 'event-5',
            title: '项目结项',
            start: '2024-04-15',
            end: '2024-04-15',
            allDay: true,
            assignee: '赵六',
            priority: '高',
            type: 'acceptance',
            location: '客户办公室'
          }
        ]
      };
    }

    issueData.value = mockIssueData
  } catch (err) {
    console.error('[加载事项数据] 异常:', err)
    await MessagePlugin.error('加载事项数据失败')
  }
}

// 加载视图数据
const loadViewData = async () => {
  if (!viewId.value) {
    error.value = '缺少视图 ID'
    return
  }

  loading.value = true
  error.value = ''
  issueData.value = null

  try {
    // 根据视图ID获取视图类型（mock数据映射）
    const viewTypeMap = {
      '100001': 'gantt',
      '100002': 'board',
      '100003': 'calendar',
      'view-list': 'table',
      'view-gantt': 'gantt',
      'view-board': 'board',
      'view-calendar': 'calendar'
    }
    
    // 先获取视图类型
    let viewType = viewTypeMap[viewId.value] || 'table'
    
    // 根据视图类型生成不同的假数据
    let viewName, viewConfig, viewData;
    
    if (viewType === 'table') {
      // 列表视图
      viewName = '所有项目';
      viewType = 'table';
      viewConfig = {
        filters: {
          status: ['todo', 'doing', 'done'],
          priority: ['high', 'medium', 'low']
        },
        columns: [
          { field: 'id', title: 'ID', width: 80 },
          { field: 'title', title: '标题', width: 200 },
          { field: 'status', title: '状态', width: 100 },
          { field: 'priority', title: '优先级', width: 100 },
          { field: 'assigneeName', title: '负责人', width: 100 },
          { field: 'dueDate', title: '截止日期', width: 120 },
          { field: 'projectName', title: '所属项目', width: 150 }
        ],
        sort: {
          field: 'createTime',
          order: 'desc'
        }
      };
      viewData = {
        total: 12,
        records: [
          { id: 'project-1', name: '电商平台', status: '进行中', priority: '高', startDate: '2024-01-01', endDate: '2024-03-31' },
          { id: 'project-2', name: '移动应用', status: '计划中', priority: '中', startDate: '2024-02-15', endDate: '2024-05-30' },
          { id: 'project-3', name: '数据分析系统', status: '已完成', priority: '高', startDate: '2023-10-01', endDate: '2024-01-15' }
        ]
      };
    } else if (viewType === 'gantt') {
      // 甘特图视图
      viewName = '项目进度';
      viewConfig = {
        filters: {
          projectId: ['project-1']
        },
        columns: [
          { field: 'id', title: '任务ID', width: 80 },
          { field: 'title', title: '任务名称', width: 200 },
          { field: 'assigneeName', title: '负责人', width: 100 },
          { field: 'progress', title: '进度', width: 100 }
        ]
      };
      viewData = {
        tasks: [
          {
            id: 'task-1',
            title: '项目初始化',
            start: '2024-01-01',
            end: '2024-01-15',
            progress: 100,
            assigneeName: '张三',
            status: 'done'
          },
          {
            id: 'task-2',
            title: '需求分析',
            start: '2024-01-16',
            end: '2024-01-30',
            progress: 80,
            assigneeName: '李四',
            status: 'doing'
          },
          {
            id: 'task-3',
            title: '系统设计',
            start: '2024-02-01',
            end: '2024-02-15',
            progress: 0,
            assigneeName: '王五',
            status: 'todo'
          },
          {
            id: 'task-4',
            title: '开发实现',
            start: '2024-02-16',
            end: '2024-03-30',
            progress: 0,
            assigneeName: '赵六',
            status: 'todo'
          },
          {
            id: 'task-5',
            title: '测试上线',
            start: '2024-04-01',
            end: '2024-04-15',
            progress: 0,
            assigneeName: '孙七',
            status: 'todo'
          }
        ],
        dependencies: [
          { predecessor: 'task-1', successor: 'task-2' },
          { predecessor: 'task-2', successor: 'task-3' },
          { predecessor: 'task-3', successor: 'task-4' },
          { predecessor: 'task-4', successor: 'task-5' }
        ]
      };
    } else if (viewType === 'board') {
      // 看板视图
      viewName = '任务分配';
      viewConfig = {
        columns: [
          { id: 'todo', title: '待办', color: '#909399' },
          { id: 'doing', title: '进行中', color: '#409EFF' },
          { id: 'review', title: '审核中', color: '#E6A23C' },
          { id: 'done', title: '已完成', color: '#67C23A' }
        ]
      };
      viewData = {
        columns: [
          {
            id: 'todo',
            title: '待办',
            tasks: [
              { id: 'task-1', title: 'UI设计', priority: 'high', assigneeName: '张三' },
              { id: 'task-2', title: '数据库设计', priority: 'medium', assigneeName: '李四' },
              { id: 'task-3', title: '接口文档编写', priority: 'low', assigneeName: '王五' }
            ]
          },
          {
            id: 'doing',
            title: '进行中',
            tasks: [
              { id: 'task-4', title: '前端开发', priority: 'high', assigneeName: '赵六' },
              { id: 'task-5', title: '后端开发', priority: 'high', assigneeName: '孙七' }
            ]
          },
          {
            id: 'review',
            title: '审核中',
            tasks: [
              { id: 'task-6', title: '需求分析报告', priority: 'medium', assigneeName: '周八' }
            ]
          },
          {
            id: 'done',
            title: '已完成',
            tasks: [
              { id: 'task-7', title: '项目初始化', priority: 'high', assigneeName: '吴九' },
              { id: 'task-8', title: '技术选型', priority: 'medium', assigneeName: '郑十' }
            ]
          }
        ]
      };
    } else if (viewType === 'calendar') {
      // 日历视图
      viewName = '项目日历';
      viewConfig = {
        filters: {
          projectId: ['project-1']
        },
        viewMode: 'month' // day, week, month
      };
      viewData = {
        events: [
          {
            id: 'event-1',
            title: '项目启动会议',
            start: '2024-01-01T10:00:00',
            end: '2024-01-01T12:00:00',
            color: '#409EFF',
            participants: ['张三', '李四', '王五']
          },
          {
            id: 'event-2',
            title: '需求评审',
            start: '2024-01-15T14:00:00',
            end: '2024-01-15T16:00:00',
            color: '#67C23A',
            participants: ['李四', '赵六', '孙七']
          },
          {
            id: 'event-3',
            title: '系统设计评审',
            start: '2024-02-15T09:30:00',
            end: '2024-02-15T11:30:00',
            color: '#E6A23C',
            participants: ['王五', '周八', '吴九']
          },
          {
            id: 'event-4',
            title: '项目中期检查',
            start: '2024-03-01',
            end: '2024-03-02',
            color: '#F56C6C',
            participants: ['张三', '赵六', '周八']
          },
          {
            id: 'event-5',
            title: '项目结项',
            start: '2024-04-15',
            end: '2024-04-15',
            color: '#909399',
            participants: ['所有人']
          }
        ]
      };
    } else {
      // 默认视图
      viewName = `测试视图 ${viewId.value}`;
      viewConfig = {
        filters: {
          status: ['todo', 'doing', 'done'],
          priority: ['high', 'medium', 'low']
        },
        sort: {
          field: 'createTime',
          order: 'desc'
        }
      };
      viewData = {};
    }
    
    // 使用假数据代替 API 调用
    const mockViewDetail = {
      id: viewId.value,
      name: viewName,
      type: viewType,
      config: viewConfig,
      data: viewData
    }

    viewData.value = {
      id: mockViewDetail.id,
      name: mockViewDetail.name,
      type: mockViewDetail.type,
      config: mockViewDetail.config || {},
      data: mockViewDetail.data || {}
    }

    // 根据视图类型加载对应的组件
    if (viewComponentMap[mockViewDetail.type]) {
      currentViewComponent.value = viewComponentMap[mockViewDetail.type]
    } else {
      error.value = `不支持的视图类型: ${mockViewDetail.type}`
    }

    // 加载事项数据（传入视图类型）
    await loadIssueData(mockViewDetail.config, viewType)
    
    loading.value = false
  } catch (err) {
    loading.value = false
    error.value = err.message || '加载视图失败'
    MessagePlugin.error('加载视图失败')
  }
}

// 监听视图 ID 变化
watch(viewId, (newId) => {
  if (newId) {
    loadViewData()
  }
}, { immediate: true })

onMounted(() => {
  if (viewId.value) {
    loadViewData()
  }
})
</script>

<style scoped lang="scss">
.my-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .loading-state,
  .error-state,
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #646a73;

    .t-icon {
      color: #bbb;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .error-state {
    .t-icon {
      color: #e34d59;
    }
  }
}
</style>
