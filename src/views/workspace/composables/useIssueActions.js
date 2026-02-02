import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { updateIssue } from '@/api/console/issue.js'

/**
 * Issue 操作逻辑（行内编辑、快速修改等）
 */
export function useIssueActions(fetchIssueList) {
  // 行内编辑状态
  const editingIssueId = ref(null)
  const editingSummary = ref('')

  // 处理编辑事项（概要列的编辑图标）- 进入行内编辑模式
  const handleEditIssue = (row) => {
    editingIssueId.value = row.id
    editingSummary.value = row.summary
  }

  // 保存概要修改（按Enter键）
  const handleSaveSummary = async (row) => {
    if (!editingSummary.value.trim()) {
      await MessagePlugin.warning('概要不能为空')
      editingSummary.value = row.summary
      editingIssueId.value = null
      return
    }

    try {
      // 只更新概要字段
      const res = await updateIssue(row.id, {
        summary: editingSummary.value
      })

      if (res.success || res.code === 200) {
        await MessagePlugin.success('概要已更新')
        // 刷新列表
        fetchIssueList()
      } else {
        await MessagePlugin.error(res.message || '更新失败')
        editingSummary.value = row.summary
      }
    } catch (error) {
      console.error('更新概要失败:', error)
      await MessagePlugin.error('更新失败，请重试')
      editingSummary.value = row.summary
    }

    // 退出编辑模式
    editingIssueId.value = null
    editingSummary.value = ''
  }

  // 取消编辑（失去焦点或按Esc键）
  const handleCancelEdit = () => {
    editingIssueId.value = null
    editingSummary.value = ''
  }

  // 处理复制事项单号
  const handleCopyTaskNumber = async (row) => {
    try {
      await navigator.clipboard.writeText(row.issueNo)
      await MessagePlugin.success(`已复制事项单号：${row.issueNo}`)
    } catch (error) {
      await MessagePlugin.error('复制失败')
    }
  }

  // 快速修改优先级（从下拉菜单选择）
  const handleQuickChangePriority = async (row, newPriority) => {
    try {
      const res = await updateIssue(row.id, { priority: newPriority })
      if (res.success || res.code === 200) {
        await MessagePlugin.success(`优先级已更新为：${newPriority}`)
        // 刷新列表
        fetchIssueList()
      } else {
        await MessagePlugin.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新优先级失败:', error)
      await MessagePlugin.error('更新失败，请重试')
    }
  }

  // 快速修改经办人（从下拉菜单选择）
  const handleQuickChangeAssignee = async (row, newAssignee) => {
    try {
      const res = await updateIssue(row.id, { assigneeId: newAssignee })
      if (res.success || res.code === 200) {
        await MessagePlugin.success(`经办人已更新`)
        // 刷新列表
        fetchIssueList()
      } else {
        await MessagePlugin.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新经办人失败:', error)
      await MessagePlugin.error('更新失败，请重试')
    }
  }

  return {
    editingIssueId,
    editingSummary,
    handleEditIssue,
    handleSaveSummary,
    handleCancelEdit,
    handleCopyTaskNumber,
    handleQuickChangePriority,
    handleQuickChangeAssignee
  }
}
