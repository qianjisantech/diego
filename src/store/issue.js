import {defineStore} from "pinia";
import {ref} from "vue";

export const useIssueStore = defineStore('issue', () => {
    const issueCount = ref(0)
    const searchIssueNumber = ref('')
    const refreshTrigger = ref(0) // 用于触发列表刷新的计数器
    const showCreateIssueDialog = ref(false) // 控制新建事项对话框的显示

    const setIssueCount = (count) => {
        issueCount.value = count
    }

    const setSearchIssueNumber = (issueNumber) => {
        searchIssueNumber.value = issueNumber
    }

    // 触发刷新事项列表
    const refreshIssueList = () => {
        refreshTrigger.value++
    }

    // 触发显示新建事项对话框
    const triggerCreateIssue = () => {
        showCreateIssueDialog.value = true
    }

    // 关闭新建事项对话框
    const closeCreateIssueDialog = () => {
        showCreateIssueDialog.value = false
    }

    return {
        issueCount,
        searchIssueNumber,
        refreshTrigger,
        showCreateIssueDialog,
        setIssueCount,
        setSearchIssueNumber,
        refreshIssueList,
        triggerCreateIssue,
        closeCreateIssueDialog
    }
})
