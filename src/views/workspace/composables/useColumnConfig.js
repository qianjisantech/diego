import { ref, computed } from 'vue'
import { getItem, setItem } from '@/utils/indexedDB'

/**
 * 表格列配置逻辑
 */
export function useColumnConfig() {
  const COLUMN_CONFIG_KEY = 'issue_list_columns'

  // 表格列配置
  const columns = ref([
    {
      colKey: 'row-select',
      type: 'multiple',
      width: 50,
      visible: true,
      fixed: 'left'
    },
    {
      colKey: 'issueNo',
      title: '事项编号',
      width: 180,
      align: 'center',
      visible: true,
      fixed: 'left'
    },
    {
      colKey: 'id',
      title: 'ID',
      width: 80,
      align: 'center',
      visible: false
    },
    {
      colKey: 'summary',
      title: '概要',
      width: 300,
      align: 'left',
      visible: true,
      fixed: true  // 概要字段固定，不可移动
    },
    {
      colKey: 'status',
      title: '状态',
      width: 100,
      align: 'center',
      visible: true
    },
    {
      colKey: 'priority',
      title: '优先级',
      width: 100,
      align: 'center',
      visible: true
    },
    {
      colKey: 'issueType',
      title: '事项类型',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'spaceId',
      title: '组织ID',
      width: 100,
      align: 'center',
      visible: false
    },
    {
      colKey: 'spaceName',
      title: '组织名称',
      width: 150,
      align: 'center',
      visible: false
    },
    {
      colKey: 'assigneeId',
      title: '负责人ID',
      width: 100,
      align: 'center',
      visible: false
    },
    {
      colKey: 'assigneeCode',
      title: '负责人工号',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'assignee',
      title: '负责人',
      width: 120,
      align: 'center',
      visible: true
    },
    {
      colKey: 'reporterId',
      title: '报告人ID',
      width: 100,
      align: 'center',
      visible: false
    },
    {
      colKey: 'reporterCode',
      title: '报告人工号',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'reporter',
      title: '报告人',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'startDate',
      title: '开始日期',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'dueDate',
      title: '截止日期',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'estimatedHours',
      title: '预估工时',
      width: 100,
      align: 'center',
      visible: false
    },
    {
      colKey: 'actualHours',
      title: '实际工时',
      width: 100,
      align: 'center',
      visible: false
    },
    {
      colKey: 'progress',
      title: '进度',
      width: 120,
      align: 'center',
      visible: false
    },
    {
      colKey: 'tags',
      title: '标签',
      width: 150,
      align: 'center',
      visible: false
    },
    {
      colKey: 'createTime',
      title: '创建时间',
      width: 180,
      align: 'center',
      visible: false
    },
    {
      colKey: 'updateTime',
      title: '更新时间',
      width: 180,
      align: 'center',
      visible: false
    }
  ])

  // 穿梭框选中的列keys（排除复选框列）
  const selectedColumnKeys = ref(
    columns.value.filter(col => col.visible && col.colKey !== 'row-select').map(col => col.colKey)
  )

  // 穿梭框数据源（排除复选框列）
  const transferData = computed(() => {
    return columns.value
      .filter(col => col.colKey !== 'row-select')
      .map(col => ({
        value: col.colKey,
        label: col.title,
        disabled: false,
        fixed: col.fixed || false  // 传递固定字段标识
      }))
  })

  // 操作列配置（固定在右侧，不可隐藏）
  const operationColumn = {
    colKey: 'operation',
    title: '操作',
    width: 100,
    align: 'center',
    fixed: 'right'
  }

  // 可见的列（按照 selectedColumnKeys 的顺序排列）
  const visibleColumns = computed(() => {
    // 创建一个 Map 用于快速查找列配置
    const columnMap = new Map(columns.value.map(col => [col.colKey, col]))

    const cols = []

    // 1. 首先添加复选框列（固定在最前面）
    const rowSelectCol = columnMap.get('row-select')
    if (rowSelectCol) {
      cols.push(rowSelectCol)
    }

    // 2. 添加概要列（固定在复选框后面）
    const summaryCol = columnMap.get('summary')
    if (summaryCol && selectedColumnKeys.value.includes('summary')) {
      cols.push(summaryCol)
    }

    // 3. 按照 selectedColumnKeys 的顺序添加其他列（排除 row-select 和 summary）
    selectedColumnKeys.value.forEach(key => {
      const col = columnMap.get(key)
      if (col && key !== 'row-select' && key !== 'summary') {
        cols.push(col)
      }
    })

    // 4. 最后添加操作列（固定在最右侧）
    cols.push(operationColumn)
    return cols
  })

  // 初始化列配置
  const initColumnConfig = async () => {
    try {
      // 先尝试从 IndexedDB 读取
      const savedConfig = await getItem(COLUMN_CONFIG_KEY)

      if (savedConfig && Array.isArray(savedConfig)) {
        selectedColumnKeys.value = savedConfig
        // 同步更新columns的visible属性
        columns.value.forEach(col => {
          col.visible = savedConfig.includes(col.colKey) || col.colKey === 'row-select'
        })
      } else {
        // 如果 IndexedDB 中没有，尝试从 localStorage 迁移
        const localStorageValue = localStorage.getItem(COLUMN_CONFIG_KEY)

        if (localStorageValue) {
          try {
            const parsedValue = JSON.parse(localStorageValue)
            selectedColumnKeys.value = parsedValue

            // 迁移到 IndexedDB
            await setItem(COLUMN_CONFIG_KEY, parsedValue)
            console.log('[Issue] 已从localStorage迁移到IndexedDB')

            // 清除 localStorage 中的旧数据
            localStorage.removeItem(COLUMN_CONFIG_KEY)

            // 同步更新columns的visible属性
            columns.value.forEach(col => {
              col.visible = parsedValue.includes(col.colKey) || col.colKey === 'row-select'
            })
          } catch (err) {
            console.error('[Issue] localStorage 数据解析失败:', err)
          }
        } else {
          console.log('[Issue] 使用默认列配置')
        }
      }
    } catch (error) {
      console.error('[Issue] 初始化列配置失败:', error)
    }
  }

  // 保存列配置
  const handleSaveColumns = async () => {
    console.log('[Issue] 保存列配置，新顺序:', selectedColumnKeys.value)

    // 同步更新columns的visible属性
    columns.value.forEach(col => {
      col.visible = selectedColumnKeys.value.includes(col.colKey) || col.colKey === 'row-select'
    })

    // 保存到 IndexedDB（保留用户拖拽后的顺序）
    try {
      await setItem(COLUMN_CONFIG_KEY, selectedColumnKeys.value)
      console.log('[Issue] 列配置已保存到IndexedDB，共', selectedColumnKeys.value.length, '列')
      console.log('[Issue] 保存的列顺序:', selectedColumnKeys.value.join(' -> '))
    } catch (error) {
      console.error('[Issue] 保存列配置失败:', error)
    }
  }

  // 恢复默认列配置
  const handleResetColumns = async () => {
    // 恢复所有列为选中状态（排除复选框列）
    selectedColumnKeys.value = columns.value
      .filter(col => col.colKey !== 'row-select')
      .map(col => col.colKey)

    // 更新visible属性
    columns.value.forEach(col => {
      col.visible = col.colKey === 'row-select' || selectedColumnKeys.value.includes(col.colKey)
    })

    // 保存到 IndexedDB
    try {
      await setItem(COLUMN_CONFIG_KEY, selectedColumnKeys.value)
      console.log('[Issue] 已重置列配置为默认值')
    } catch (error) {
      console.error('[Issue] 重置列配置失败:', error)
    }
  }

  return {
    columns,
    selectedColumnKeys,
    transferData,
    visibleColumns,
    initColumnConfig,
    handleSaveColumns,
    handleResetColumns
  }
}
