<template>
  <div class="feedback-page">
    <!-- 顶部操作栏 -->
    <div class="feedback-header">
      <div class="header-actions">
        <t-button v-permission="'feedback:add'" theme="primary" @click="showNewFeedbackDialog = true">
          <template #icon><t-icon name="add" /></template>
          新建反馈
        </t-button>
        <t-button theme="primary" @click="handleSearch">
          <template #icon><t-icon name="search" /></template>
          查询
        </t-button>
        <t-button theme="default" @click="handleReset">
          <template #icon><t-icon name="refresh" /></template>
          重置
        </t-button>
      </div>
    </div>

    <!-- 状态标签栏 - Tab 样式 -->
    <div class="feedback-tabs">
      <div class="tabs-container">
        <div
          class="tab-item"
          :class="{ active: filterStatus === 'all' }"
          @click="handleFilterStatusChange('all')"
        >
          <t-icon name="queue" size="16px" />
          <span class="tab-label">全部</span>
          <span class="tab-count">{{ allCount }}</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: filterStatus === 'open' }"
          @click="handleFilterStatusChange('open')"
        >
          <t-icon name="error-circle" size="16px" />
          <span class="tab-label">未解决</span>
          <span class="tab-count">{{ openCount }}</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: filterStatus === 'closed' }"
          @click="handleFilterStatusChange('closed')"
        >
          <t-icon name="check-circle" size="16px" />
          <span class="tab-label">已解决</span>
          <span class="tab-count">{{ closedCount }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选条件栏 - 水平布局 -->
    <div class="feedback-filters">
      <div class="filters-row">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索反馈标题或内容..."
          clearable
          class="filter-input"
          @enter="handleSearch"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>

        <t-select v-model="filterType" placeholder="类型" class="filter-select">
          <t-option value="all" label="所有类型" />
          <t-option value="bug" label="问题反馈" />
          <t-option value="feature" label="功能建议" />
          <t-option value="improvement" label="改进建议" />
          <t-option value="other" label="其他" />
        </t-select>

        <t-select v-model="sortBy" placeholder="排序" class="filter-select">
          <t-option value="mostLiked" label="点赞最多" />
          <t-option value="newest" label="最新创建" />
          <t-option value="oldest" label="最早创建" />
          <t-option value="mostCommented" label="评论最多" />
        </t-select>
      </div>
    </div>

    <!-- 反馈列表 -->
    <div class="feedback-list">
      <div
        v-for="feedback in feedbackList"
        :key="feedback.id"
        class="feedback-item"
        :class="{ selected: selectedFeedback?.id === feedback.id }"
        @click="selectFeedback(feedback)"
      >
        <div class="feedback-item-header">
          <div class="feedback-status">
            <t-icon
              :name="feedback.status === 'open' ? 'error-circle' : 'check-circle'"
              :class="feedback.status"
              size="18px"
            />
          </div>
          <div class="feedback-main">
            <div class="feedback-title">{{ feedback.title }}</div>
            <div class="feedback-meta">
              <span class="type-badge" :class="feedback.type">
                {{ getTypeLabel(feedback.type) }}
              </span>
              <span class="meta-text">
                #{{ feedback.id }} 由 {{ getFeedbackAuthor(feedback) }} 创建于 {{ feedback.createTime || '-' }}
              </span>
              <span
                class="comment-count"
                :class="{ 'has-comments': feedback.feedbackComments && feedback.feedbackComments.length > 0 }"
                @click.stop="toggleComments(feedback)"
              >
                <t-icon
                  :name="feedback.showComments ? 'chevron-up' : 'chat'"
                  size="14px"
                />
                <span v-if="feedback.feedbackComments && feedback.feedbackComments.length > 0">
                  {{ feedback.feedbackComments.length }}
                </span>
                <span v-else>评论</span>
              </span>
            </div>
          </div>
          <div class="feedback-actions" @click.stop>
            <t-button
              v-if="canEditFeedback(feedback)"
              v-permission="'feedback:edit'"
              theme="primary"
              variant="outline"
              size="small"
              @click="handleEditFeedback(feedback)"
            >
              <template #icon>
                <t-icon name="edit" />
              </template>
              编辑
            </t-button>
            <t-button
              v-if="canDeleteFeedback(feedback)"
              v-permission="'feedback:delete'"
              theme="danger"
              variant="outline"
              size="small"
              @click="handleDeleteFeedback(feedback)"
            >
              <template #icon>
                <t-icon name="delete" />
              </template>
              删除
            </t-button>
            <t-button
              :theme="feedback.liked ? 'primary' : 'default'"
              :variant="feedback.liked ? 'base' : 'outline'"
              size="small"
              @click="handleLike(feedback)"
            >
              <template #icon>
                <t-icon :name="feedback.liked ? 'thumb-up' : 'thumb-up-1'" />
              </template>
              {{ feedback.likes || 0 }}
            </t-button>
          </div>
        </div>

        <!-- 评论区域 - 使用 transition 添加展开/收起动画 -->
        <transition name="slide-fade">
          <div v-if="feedback.showComments" class="feedback-comments" @click.stop>
            <!-- 评论列表 -->
            <div v-if="feedback.feedbackComments && feedback.feedbackComments.length > 0" class="comment-list-inline">
              <div v-for="comment in feedback.feedbackComments" :key="comment.id" class="comment-item-inline">
                <div class="comment-header-inline">
                  <span class="comment-author">{{ getCommentAuthor(comment) }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                  <t-button
                    v-if="canDeleteComment(comment)"
                    v-permission="'feedback:comment:delete'"
                    theme="danger"
                    variant="text"
                    size="small"
                    @click="handleDeleteCommentInline(feedback.id, comment.id)"
                  >
                    删除
                  </t-button>
                </div>
                <div class="comment-content-inline">{{ comment.content }}</div>
                <div v-if="comment.replyTo" class="comment-reply-to">
                  回复 @{{ comment.replyTo }}
                </div>
              </div>
            </div>

            <!-- 添加评论输入框 -->
            <div class="add-comment-inline">
              <t-input
                v-model="feedback.newCommentText"
                placeholder="写下你的评论..."
                clearable
                @enter="handleAddCommentInline(feedback)"
              >
                <template #suffix>
                  <t-button
                    theme="primary"
                    variant="text"
                    size="small"
                    :disabled="!feedback.newCommentText || !feedback.newCommentText.trim()"
                    @click="handleAddCommentInline(feedback)"
                  >
                    发表
                  </t-button>
                </template>
              </t-input>
            </div>
          </div>
        </transition>
      </div>

      <div v-if="feedbackList.length === 0" class="empty-state">
        <t-icon name="inbox" size="48px" />
        <p>暂无反馈</p>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="feedback-pagination">
      <t-pagination
        v-model="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-size-options="[10, 20, 50, 100]"
        show-jumper
        show-page-size
        @change="handlePageChange"
      />
    </div>

    <!-- 新建/编辑反馈弹窗 -->
    <t-dialog
      v-model:visible="showNewFeedbackDialog"
      :header="isEditMode ? '编辑反馈' : '新建反馈'"
      width="700px"
      :footer="false"
    >
      <div class="new-feedback-form">
        <div class="form-group">
          <label class="form-label">标题 <span class="required">*</span></label>
          <t-input
            v-model="newFeedback.title"
            placeholder="简要描述您的反馈"
            size="large"
          />
        </div>

        <div class="form-group">
          <label class="form-label">类型 <span class="required">*</span></label>
          <div class="type-card-group">
            <div
              v-for="typeOption in feedbackTypeOptions"
              :key="typeOption.value"
              class="type-card"
              :class="{ active: newFeedback.type === typeOption.value }"
              @click="newFeedback.type = typeOption.value"
            >
              <div class="type-card-icon" :style="{ color: typeOption.color }">
                <t-icon :name="typeOption.icon" size="24px" />
              </div>
              <div class="type-card-content">
                <div class="type-card-title">{{ typeOption.label }}</div>
                <div class="type-card-desc">{{ typeOption.description }}</div>
              </div>
              <div class="type-card-check">
                <t-icon name="check-circle-filled" size="20px" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">详细描述 <span class="required">*</span></label>
          <t-textarea
            v-model="newFeedback.content"
            placeholder="请详细描述您遇到的问题或建议..."
            :autosize="{ minRows: 8, maxRows: 16 }"
          />
          <div class="form-tip">支持 Markdown 格式</div>
        </div>

        <div class="form-group">
          <label class="form-label">联系方式（可选）</label>
          <t-input
            v-model="newFeedback.contactInfo"
            placeholder="邮箱或电话，方便我们与您联系"
          />
        </div>

        <div class="form-actions">
          <t-button theme="default" variant="outline" @click="handleCancelNew">
            取消
          </t-button>
          <t-button theme="primary" @click="handleSubmitNew" :loading="submitting">
            {{ isEditMode ? '保存修改' : '提交反馈' }}
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 反馈详情抽屉 -->
    <t-drawer
      v-model:visible="showDetailDrawer"
      :header="`#${selectedFeedback?.id} ${selectedFeedback?.title}`"
      size="600px"
      :footer="false"
    >
      <div v-if="selectedFeedback" class="feedback-detail">
        <div class="detail-header">
          <div class="status-badge" :class="selectedFeedback.status">
            <t-icon
              :name="selectedFeedback.status === 'open' ? 'error-circle' : 'check-circle'"
              size="16px"
            />
            {{ selectedFeedback.status === 'open' ? '未解决' : '已解决' }}
          </div>
          <span class="type-badge" :class="selectedFeedback.type">
            {{ getTypeLabel(selectedFeedback.type) }}
          </span>
        </div>

        <div class="detail-meta">
          <span>{{ getFeedbackAuthor(selectedFeedback) }}</span> 创建于 {{ selectedFeedback.createTime || '-' }}
          <span v-if="selectedFeedback.updateBy" class="update-info">
            · 由 {{ getFeedbackUpdater(selectedFeedback) }} 更新于 {{ selectedFeedback.updateTime || '-' }}
          </span>
        </div>

        <div class="detail-content">
          <h3>详细描述</h3>
          <div class="content-text">{{ selectedFeedback.content }}</div>
        </div>

        <div v-if="selectedFeedback.contactInfo" class="detail-section">
          <h3>联系方式</h3>
          <div class="content-text">{{ selectedFeedback.contactInfo }}</div>
        </div>

        <div class="detail-section">
          <h3>评论 ({{ commentList.length }})</h3>

          <!-- 评论列表 -->
          <div v-if="loadingComments" class="comment-loading">
            <t-loading text="加载评论中..." size="small" />
          </div>

          <div v-else-if="commentList.length > 0" class="comment-list">
            <div v-for="comment in commentList" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ getCommentAuthor(comment) }}</span>
                <span class="comment-time">{{ comment.createTime }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions">
                <t-button
                  v-permission="'feedback:comment:delete'"
                  theme="danger"
                  variant="text"
                  size="small"
                  @click="handleDeleteComment(comment.id)"
                >
                  删除
                </t-button>
              </div>
            </div>
          </div>

          <div v-else class="comment-placeholder">
            <t-icon name="chat" size="32px" />
            <p>暂无评论</p>
          </div>

          <!-- 添加评论 -->
          <div class="add-comment">
            <t-textarea
              v-model="newComment"
              placeholder="写下你的评论..."
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
            <div class="add-comment-actions">
              <t-button
                theme="primary"
                size="small"
                :loading="submittingComment"
                :disabled="!newComment.trim()"
                @click="handleAddComment"
              >
                发表评论
              </t-button>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <t-button
            v-if="selectedFeedback.status === 'open'"
            v-permission="'feedback:edit'"
            theme="success"
            @click="handleCloseFeedback"
          >
            <t-icon name="check-circle" />
            标记为已解决
          </t-button>
          <t-button
            v-else
            theme="default"
            @click="handleReopenFeedback"
          >
            <t-icon name="error-circle" />
            重新打开
          </t-button>
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { useUserStore } from '@/store/user'
import {
  getFeedbackPage,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  likeFeedback,
  unlikeFeedback,
  getFeedbackComments,
  addFeedbackComment,
  deleteFeedbackComment
} from '@/api/feedback.js'
import {
  TYPE_TO_INT,
  INT_TO_TYPE,
  STATUS_TO_INT,
  INT_TO_STATUS,
  PRIORITY_TO_INT,
  INT_TO_PRIORITY,
  toBackendData,
  toFrontendData
} from '@/constants/feedback.js'

const userStore = useUserStore()
const currentUser = computed(() => userStore.userInfo)

const searchKeyword = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const sortBy = ref('mostLiked') // 默认按点赞数排序
const showNewFeedbackDialog = ref(false)
const showDetailDrawer = ref(false)
const selectedFeedback = ref(null)
const submitting = ref(false)
const loading = ref(false)
const commentList = ref([])
const loadingComments = ref(false)
const newComment = ref('')
const submittingComment = ref(false)

// 反馈类型选项配置
const feedbackTypeOptions = [
  {
    value: 'bug',
    label: '问题反馈',
    description: '报告系统错误或功能异常',
    icon: 'bug',
    color: '#d73a49'
  },
  {
    value: 'feature',
    label: '功能建议',
    description: '建议新增功能或特性',
    icon: 'lightbulb',
    color: '#0969da'
  },
  {
    value: 'improvement',
    label: '改进建议',
    description: '优化现有功能或体验',
    icon: 'arrow-up',
    color: '#8250df'
  },
  {
    value: 'other',
    label: '其他',
    description: '其他类型的反馈',
    icon: 'ellipsis',
    color: '#656d76'
  }
]

const newFeedback = ref({
  title: '',
  type: 'bug',
  content: '',
  contactInfo: ''
})

// 编辑模式相关状态
const isEditMode = ref(false)
const editingFeedbackId = ref(null)

// 反馈数据列表
const feedbackList = ref([])

// 分页相关参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const openCount = ref(0)
const closedCount = ref(0)
const allCount = ref(0)
// 加载反馈列表（分页）
const loadFeedbackList = async () => {
  try {
    loading.value = true

    // 构建查询参数（需要将前端值转换为后端值）
    const params = {
      current: pagination.value.current,
      size: pagination.value.pageSize,
      keyword: searchKeyword.value.trim() || undefined,
      type: filterType.value === 'all' ? undefined : TYPE_TO_INT[filterType.value],
      status: filterStatus.value === 'all' ? undefined : STATUS_TO_INT[filterStatus.value]
    }

    const res = await getFeedbackPage(params)

    if (res.success) {
      // 处理分页数据（将后端数据转换为前端格式）
      feedbackList.value = (res.data.records || []).map(feedback => {
        const frontendFeedback = toFrontendData(feedback)
        return {
          ...frontendFeedback,
          // 处理创建人信息
          createdByName: feedback.createdByName || feedback.creatorName || feedback.createdBy || '-',
          createdByCode: feedback.createdByCode || feedback.createdBy || '-',
          // 处理更新人信息
          updateByName: feedback.updateByName || feedback.updatorName || feedback.updateBy || '-',
          updateByCode: feedback.updateByCode || feedback.updateBy || '-',
          // 前端状态
          feedbackComments: [],
          newCommentText: '',
          showComments: false
        }
      })

      // 更新分页信息
      pagination.value.total = res.data.total || 0
      pagination.value.current = res.data.current || 1

      // 更新统计数据（从后端返回或本地计算）
      openCount.value = res.data.opened
      closedCount.value = res.data.closed
      allCount.value = res.data.all

      // 为每个反馈加载评论
      await loadAllComments()
    } else {
      MessagePlugin.error(res.message || '获取反馈列表失败')
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    MessagePlugin.error('获取反馈列表失败')
  } finally {
    loading.value = false
  }
}

// 加载所有反馈的评论
const loadAllComments = async () => {
  const promises = feedbackList.value.map(async (feedback) => {
    try {
      const res = await getFeedbackComments(feedback.id)
      if (res.success) {
        feedback.feedbackComments = res.data || []
      }
    } catch (error) {
      console.error(`加载反馈 ${feedback.id} 的评论失败:`, error)
    }
  })
  await Promise.all(promises)
}

// 处理查询按钮点击
const handleSearch = () => {
  pagination.value.current = 1 // 重置到第一页
  loadFeedbackList()
}

// 处理重置按钮点击
const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = 'all'
  filterType.value = 'all'
  sortBy.value = 'mostLiked'
  pagination.value.current = 1
  loadFeedbackList()
  MessagePlugin.success('已重置筛选条件')
}

// 处理分页变化
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  pagination.value.pageSize = pageInfo.pageSize
  loadFeedbackList()
}

// 处理点赞/取消点赞
const handleLike = async (feedback) => {
  try {
    if (feedback.liked) {
      // 取消点赞
      const res = await unlikeFeedback(feedback.id)
      if (res.success) {
        feedback.liked = false
        feedback.likes = (feedback.likes || 0) - 1
        MessagePlugin.success('已取消点赞')
      } else {
        MessagePlugin.error(res.message || '操作失败')
      }
    } else {
      // 点赞
      const res = await likeFeedback(feedback.id)
      if (res.success) {
        feedback.liked = true
        feedback.likes = (feedback.likes || 0) + 1
        MessagePlugin.success('点赞成功')
      } else {
        MessagePlugin.error(res.message || '操作失败')
      }
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    MessagePlugin.error('操作失败')
  }
}

// 处理状态筛选切换
const handleFilterStatusChange = (status) => {
  filterStatus.value = status
  pagination.value.current = 1 // 重置到第一页
  loadFeedbackList()
}

const getTypeLabel = (type) => {
  const labels = {
    bug: '问题反馈',
    feature: '功能建议',
    improvement: '改进建议',
    other: '其他'
  }
  return labels[type] || type
}

const selectFeedback = (feedback) => {
  selectedFeedback.value = feedback
  showDetailDrawer.value = true
  // 加载评论
  loadComments(feedback.id)
}

// 加载评论列表
const loadComments = async (feedbackId) => {
  try {
    loadingComments.value = true
    const res = await getFeedbackComments(feedbackId)
    if (res.success) {
      commentList.value = res.data || []
    } else {
      MessagePlugin.error(res.message || '获取评论失败')
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    MessagePlugin.error('获取评论失败')
  } finally {
    loadingComments.value = false
  }
}

// 添加评论
const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    MessagePlugin.warning('请输入评论内容')
    return
  }

  try {
    submittingComment.value = true
    const res = await addFeedbackComment(selectedFeedback.value.id, {
      content: newComment.value
    })
    if (res.success) {
      MessagePlugin.success('评论发表成功')
      newComment.value = ''
      // 重新加载评论列表
      await loadComments(selectedFeedback.value.id)
      // 更新反馈列表中的评论数
      const feedback = feedbackList.value.find(f => f.id === selectedFeedback.value.id)
      if (feedback) {
        feedback.comments = (feedback.comments || 0) + 1
      }
    } else {
      MessagePlugin.error(res.message || '发表评论失败')
    }
  } catch (error) {
    console.error('发表评论失败:', error)
    MessagePlugin.error('发表评论失败')
  } finally {
    submittingComment.value = false
  }
}

// 删除评论
const handleDeleteComment = async (commentId) => {
  try {
    const res = await deleteFeedbackComment(selectedFeedback.value.id, commentId)
    if (res.success) {
      MessagePlugin.success('评论删除成功')
      // 重新加载评论列表
      await loadComments(selectedFeedback.value.id)
      // 更新反馈列表中的评论数
      const feedback = feedbackList.value.find(f => f.id === selectedFeedback.value.id)
      if (feedback && feedback.comments > 0) {
        feedback.comments = feedback.comments - 1
      }
    } else {
      MessagePlugin.error(res.message || '删除评论失败')
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    MessagePlugin.error('删除评论失败')
  }
}

const handleSubmitNew = async () => {
  if (!newFeedback.value.title) {
    MessagePlugin.warning('请填写标题')
    return
  }
  if (!newFeedback.value.content) {
    MessagePlugin.warning('请填写详细描述')
    return
  }

  submitting.value = true

  try {
    // 将前端数据转换为后端格式
    const backendData = toBackendData(newFeedback.value)

    let res
    if (isEditMode.value) {
      // 编辑模式：更新反馈
      res = await updateFeedback(editingFeedbackId.value, backendData)
      if (res.success) {
        MessagePlugin.success('反馈更新成功！')
      } else {
        MessagePlugin.error(res.message || '更新失败')
      }
    } else {
      // 新建模式：创建反馈
      res = await createFeedback(backendData)
      if (res.success) {
        MessagePlugin.success('反馈提交成功！')
      } else {
        MessagePlugin.error(res.message || '提交失败')
      }
    }

    if (res.success) {
      showNewFeedbackDialog.value = false
      handleCancelNew()
      loadFeedbackList() // 重新加载列表
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    MessagePlugin.error(isEditMode.value ? '更新失败' : '提交失败')
  } finally {
    submitting.value = false
  }
}

const handleCancelNew = () => {
  newFeedback.value = {
    title: '',
    type: 'bug',
    content: '',
    contactInfo: ''
  }
  isEditMode.value = false
  editingFeedbackId.value = null
}

const handleCloseFeedback = async () => {
  if (!selectedFeedback.value) return

  try {
    // 转换为后端格式
    const backendData = toBackendData({
      ...selectedFeedback.value,
      status: 'closed'
    })

    const res = await updateFeedback(selectedFeedback.value.id, backendData)
    if (res.success) {
      selectedFeedback.value.status = 'closed'
      MessagePlugin.success('已标记为已解决')
      loadFeedbackList() // 重新加载列表
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    MessagePlugin.error('操作失败')
  }
}

const handleReopenFeedback = async () => {
  if (!selectedFeedback.value) return

  try {
    // 转换为后端格式
    const backendData = toBackendData({
      ...selectedFeedback.value,
      status: 'open'
    })

    const res = await updateFeedback(selectedFeedback.value.id, backendData)
    if (res.success) {
      selectedFeedback.value.status = 'open'
      MessagePlugin.success('已重新打开')
      loadFeedbackList() // 重新加载列表
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    MessagePlugin.error('操作失败')
  }
}

// 判断是否可以删除反馈
const canDeleteFeedback = (feedback) => {
  if (!currentUser.value) return false
  // admin 或创建人可以删除
  return currentUser.value.username === 'admin' ||
         feedback.submitterId === currentUser.value.id ||
         feedback.createdBy === currentUser.value.username
}

// 判断是否可以删除评论
const canDeleteComment = (comment) => {
  if (!currentUser.value) return false
  // admin 或评论创建人可以删除
  return currentUser.value.username === 'admin' ||
         comment.userId === currentUser.value.id ||
         comment.createdBy === currentUser.value.username
}

// 判断是否可以编辑反馈
const canEditFeedback = (feedback) => {
  if (!currentUser.value) return false
  // admin 或创建人可以编辑
  return currentUser.value.username === 'admin' ||
         feedback.submitterId === currentUser.value.id ||
         feedback.createdBy === currentUser.value.username
}

// 编辑反馈
const handleEditFeedback = (feedback) => {
  isEditMode.value = true
  editingFeedbackId.value = feedback.id
  newFeedback.value = {
    title: feedback.title,
    type: feedback.type,
    content: feedback.content,
    contactInfo: feedback.contactInfo || ''
  }
  showNewFeedbackDialog.value = true
}

// 删除反馈
const handleDeleteFeedback = (feedback) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除反馈"${feedback.title}"吗？此操作不可撤销。`,
    confirmBtn: {
      content: '确定',
      theme: 'danger'
    },
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        const res = await deleteFeedback(feedback.id)
        if (res.success) {
          MessagePlugin.success('反馈删除成功')
          loadFeedbackList()
          confirmDialog.hide()
        } else {
          MessagePlugin.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除反馈失败:', error)
        MessagePlugin.error('删除反馈失败')
      }
    }
  })
}

// 在列表中添加评论
const handleAddCommentInline = async (feedback) => {
  if (!feedback.newCommentText || !feedback.newCommentText.trim()) {
    return
  }

  try {
    const res = await addFeedbackComment(feedback.id, {
      content: feedback.newCommentText.trim()
    })

    if (res.success) {
      MessagePlugin.success('评论发表成功')
      feedback.newCommentText = ''
      // 重新加载该反馈的评论
      const commentsRes = await getFeedbackComments(feedback.id)
      if (commentsRes.success) {
        feedback.feedbackComments = commentsRes.data || []
        // 更新评论数
        feedback.comments = feedback.feedbackComments.length
      }
    } else {
      MessagePlugin.error(res.message || '发表评论失败')
    }
  } catch (error) {
    console.error('发表评论失败:', error)
    MessagePlugin.error('发表评论失败')
  }
}

// 在列表中删除评论
const handleDeleteCommentInline = async (feedbackId, commentId) => {
  try {
    const res = await deleteFeedbackComment(feedbackId, commentId)
    if (res.success) {
      MessagePlugin.success('评论已删除')
      // 重新加载该反馈的评论
      const feedback = feedbackList.value.find(f => f.id === feedbackId)
      if (feedback) {
        const commentsRes = await getFeedbackComments(feedbackId)
        if (commentsRes.success) {
          feedback.feedbackComments = commentsRes.data || []
          // 更新评论数
          feedback.comments = feedback.feedbackComments.length
        }
      }
    } else {
      MessagePlugin.error(res.message || '删除评论失败')
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    MessagePlugin.error('删除评论失败')
  }
}

// 切换评论展开/收起
const toggleComments = (feedback) => {
  feedback.showComments = !feedback.showComments
}

// 获取反馈创建人名称（优先使用 name）
const getFeedbackAuthor = (feedback) => {
  if (!feedback) return '-'
  // 优先使用 createdByName（创建人姓名）
  if (feedback.createdByName && feedback.createdByName.trim()) {
    return feedback.createdByName
  }
  // 其次使用 creatorName
  if (feedback.creatorName && feedback.creatorName.trim()) {
    return feedback.creatorName
  }
  // 再尝试 createdBy（可能是 username 或 name）
  if (feedback.createdBy && feedback.createdBy.trim()) {
    return feedback.createdBy
  }
  // 最后尝试当前用户
  if (currentUser.value?.name) {
    return currentUser.value.name
  }
  return '-'
}

// 获取反馈更新人名称（优先使用 name）
const getFeedbackUpdater = (feedback) => {
  if (!feedback) return '-'
  // 优先使用 updateByName（更新人姓名）
  if (feedback.updateByName && feedback.updateByName.trim()) {
    return feedback.updateByName
  }
  // 其次使用 updatorName
  if (feedback.updatorName && feedback.updatorName.trim()) {
    return feedback.updatorName
  }
  // 再尝试 updateBy（可能是 username 或 name）
  if (feedback.updateBy && feedback.updateBy.trim()) {
    return feedback.updateBy
  }
  return '-'
}

// 获取评论作者名称（优先使用 name）
const getCommentAuthor = (comment) => {
  // 优先使用 createdByName（创建人姓名）
  if (comment.createdByName && comment.createdByName.trim()) {
    return comment.createdByName
  }
  // 其次使用 creatorName 字段
  if (comment.creatorName && comment.creatorName.trim()) {
    return comment.creatorName
  }
  // 再尝试 createdBy（可能是 username 或 name）
  if (comment.createdBy && comment.createdBy.trim()) {
    return comment.createdBy
  }
  // 如果有 userId，可以尝试从 userStore 获取用户名
  if (comment.userId && currentUser.value?.id === comment.userId) {
    return currentUser.value.name || currentUser.value.username || '当前用户'
  }
  // 如果有 userName 字段
  if (comment.userName && comment.userName.trim()) {
    return comment.userName
  }
  // 最后使用当前登录用户作为备用
  if (currentUser.value?.name || currentUser.value?.username) {
    return currentUser.value.name || currentUser.value.username
  }
  // 实在没有就显示匿名
  return '匿名用户'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前'
  } else {
    return time.split(' ')[0]
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadFeedbackList()
})
</script>

<style scoped lang="scss">
.feedback-page {
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .feedback-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e7e7e7;
    background: #fff;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  // 状态标签栏 - Tab 样式
  .feedback-tabs {
    background: #ffffff;
    border-bottom: 1px solid #d0d7de;
    padding: 0 24px;

    .tabs-container {
      display: flex;
      gap: 8px;
      align-items: center;

      .tab-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        cursor: pointer;
        font-size: 14px;
        color: #656d76;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        position: relative;
        user-select: none;

        .t-icon {
          color: #656d76;
          transition: color 0.2s;
        }

        .tab-label {
          font-weight: 500;
        }

        .tab-count {
          padding: 2px 8px;
          background: #f6f8fa;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #656d76;
          transition: all 0.2s;
        }

        &:hover {
          color: #1f2329;
          background: #f6f8fa;

          .t-icon {
            color: #1f2329;
          }

          .tab-count {
            background: #e1e4e8;
          }
        }

        &.active {
          color: var(--tencent-blue-dark);
          border-bottom-color: var(--tencent-blue-dark);
          font-weight: 600;

          .t-icon {
            color: var(--tencent-blue-dark);
          }

          .tab-count {
            background: var(--tencent-blue-50);
            color: var(--tencent-blue-dark);
          }
        }
      }
    }
  }

  // 筛选条件栏 - 水平布局
  .feedback-filters {
    padding: 16px 24px;
    border-bottom: 1px solid #d0d7de;
    background: #f6f8fa;

    .filters-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .filter-input {
        flex: 1;
        max-width: 400px;

        :deep(.t-input__inner) {
          border-radius: 6px;
          border-color: #d0d7de;

          &:hover {
            border-color: #bfc6ce;
          }

          &:focus {
            border-color: #0969da;
            box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
          }
        }
      }

      .filter-select {
        width: 180px;

        :deep(.t-select__wrap) {
          border-radius: 6px;
          border-color: #d0d7de;

          &:hover {
            border-color: #bfc6ce;
          }
        }

        :deep(.t-is-focused .t-select__wrap) {
          border-color: #0969da;
          box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
        }
      }
    }
  }

  .feedback-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 24px;
    border-left: 1px solid #e7e7e7;

    .feedback-item {
      border-bottom: 1px solid #d0d7de;
      padding: 16px;
      margin: 0 -16px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: transparent;
        transition: background 0.2s;
      }

      &:hover {
        background: #f6f8fa;

        &::before {
          background: #0969da;
        }
      }

      &.selected {
        background: #ddf4ff;
        border-color: #54aeff;

        &::before {
          background: #0969da;
        }
      }

      .feedback-item-header {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .feedback-status {
          flex-shrink: 0;

          .t-icon {
            &.open {
              color: #00a870;
            }

            &.closed {
              color: #8a63d2;
            }
          }
        }

        .feedback-main {
          flex: 1;
          min-width: 0;

          .feedback-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2329;
            margin-bottom: 8px;
            line-height: 1.4;
            transition: color 0.2s;

            &:hover {
              color: #0969da;
            }
          }

          .feedback-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            font-size: 12px;
            color: #656d76;

            .type-badge {
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;

              &.bug {
                background: #ffe8e8;
                color: #d54941;
              }

              &.feature {
                background: #e8f4ff;
                color: #0052d9;
              }

              &.improvement {
                background: #fff4e8;
                color: #e37318;
              }

              &.other {
                background: #f0f0f0;
                color: #646a73;
              }
            }

            .meta-text {
              color: #8a8e99;
            }

            .comment-count {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #646a73;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s;
              user-select: none;

              &:hover {
                background: #f0f5ff;
                color: #0969da;

                .t-icon {
                  color: #0969da;
                }
              }

              &.has-comments {
                color: #0969da;
                font-weight: 500;

                .t-icon {
                  color: #0969da;
                }
              }

              .t-icon {
                transition: transform 0.2s;
              }
            }
          }
        }

        .feedback-actions {
          flex-shrink: 0;
          display: flex;
          gap: 8px;
          align-items: center;
          display: flex;
          align-items: center;
          margin-left: 12px;
        }
      }

      // 评论区域样式 - GitHub 风格
      .feedback-comments, .feedback-no-comments {
        margin-top: 12px;
        padding: 16px;
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        animation: slideIn 0.3s ease-out;

        &:hover {
          border-color: #bfc6ce;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .comments-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2329;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #d0d7de;

          .t-icon {
            color: #656d76;
          }
        }

        .comment-list-inline {
          margin-bottom: 12px;

          .comment-item-inline {
            position: relative;
            padding: 12px;
            background: #f6f8fa;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            margin-bottom: 10px;
            transition: all 0.2s;

            &:hover {
              background: #ffffff;
              border-color: #0969da;
              box-shadow: 0 1px 3px rgba(9, 105, 218, 0.12);
            }

            &:last-child {
              margin-bottom: 0;
            }

            // GitHub 样式的左边线条
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 3px;
              background: transparent;
              border-radius: 6px 0 0 6px;
              transition: background 0.2s;
            }

            &:hover::before {
              background: #0969da;
            }

            .comment-header-inline {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;

              .comment-author {
                font-size: 14px;
                font-weight: 600;
                color: #1f2329;
                transition: color 0.2s;

                &:hover {
                  color: #0969da;
                }
              }

              .comment-time {
                font-size: 12px;
                color: #656d76;
                font-weight: 400;

                &::before {
                  content: '•';
                  margin: 0 6px 0 2px;
                  color: #d0d7de;
                }
              }

              .t-button {
                margin-left: auto;
                opacity: 0;
                transition: opacity 0.2s;
              }
            }

            &:hover .comment-header-inline .t-button {
              opacity: 1;
            }

            .comment-content-inline {
              font-size: 14px;
              color: #1f2329;
              line-height: 1.6;
              word-break: break-word;
              padding: 4px 0;
            }

            .comment-reply-to {
              margin-top: 8px;
              padding: 6px 10px;
              font-size: 12px;
              color: #0969da;
              background: #ddf4ff;
              border-radius: 4px;
              display: inline-block;
            }
          }
        }

        .add-comment-inline {
          margin-top: 12px;

          :deep(.t-input) {
            font-size: 14px;
            border-radius: 6px;
            border-color: #d0d7de;
            transition: all 0.2s;

            &:hover {
              border-color: #bfc6ce;
            }

            &:focus-within {
              border-color: #0969da;
              box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
            }
          }
        }
      }

      .feedback-no-comments {
        padding: 12px 16px;
        background: #f6f8fa;
      }
    }

    // 评论展开/收起动画
    .slide-fade-enter-active {
      transition: all 0.3s ease-out;
    }

    .slide-fade-leave-active {
      transition: all 0.25s cubic-bezier(1, 0.5, 0.8, 1);
    }

    .slide-fade-enter-from {
      transform: translateY(-10px);
      opacity: 0;
      max-height: 0;
    }

    .slide-fade-leave-to {
      transform: translateY(-5px);
      opacity: 0;
      max-height: 0;
    }

    // 评论区域滑入动画
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #656d76;
      background: #f6f8fa;
      border: 2px dashed #d0d7de;
      border-radius: 6px;
      margin: 24px 0;

      .t-icon {
        color: #d0d7de;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        margin: 0;
        font-weight: 500;
      }
    }
  }
}

.new-feedback-form {
  padding: 20px 0;

  .form-group {
    margin-bottom: 24px;

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1f2329;
      margin-bottom: 8px;

      .required {
        color: #e34d59;
      }
    }

    .form-tip {
      font-size: 12px;
      color: #8a8e99;
      margin-top: 6px;
    }

    .type-card-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .type-card {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #ffffff;
        border: 2px solid #d0d7de;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: #0969da;
          box-shadow: 0 2px 8px rgba(9, 105, 218, 0.12);
          transform: translateY(-1px);
        }

        &.active {
          border-color: #0969da;
          background: #f6f8fa;
          box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.12);

          .type-card-check {
            opacity: 1;
          }
        }

        .type-card-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.2s;
        }

        .type-card-content {
          flex: 1;
          min-width: 0;

          .type-card-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2329;
            margin-bottom: 4px;
          }

          .type-card-desc {
            font-size: 12px;
            color: #656d76;
            line-height: 1.5;
          }
        }

        .type-card-check {
          position: absolute;
          top: 12px;
          right: 12px;
          color: #0969da;
          opacity: 0;
          transition: opacity 0.2s;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e7e7e7;
  }
}

.feedback-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;

      &.open {
        background: #e8fff5;
        color: #00a870;
      }

      &.closed {
        background: #f3e8ff;
        color: #8a63d2;
      }
    }

    .type-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.bug {
        background: #ffe8e8;
        color: #d54941;
      }

      &.feature {
        background: #e8f4ff;
        color: #0052d9;
      }

      &.improvement {
        background: #fff4e8;
        color: #e37318;
      }

      &.other {
        background: #f0f0f0;
        color: #646a73;
      }
    }
  }

  .detail-meta {
    font-size: 13px;
    color: #656d76;
    margin-bottom: 24px;
    line-height: 1.6;

    .update-info {
      color: #8a8e99;
      margin-left: 4px;
    }
  }

  .detail-content,
  .detail-section {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      margin: 0 0 12px 0;
    }

    .content-text {
      font-size: 14px;
      line-height: 1.6;
      color: #1f2329;
      white-space: pre-wrap;
      background: #f5f7fa;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e7e7e7;
    }

    .comment-loading {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .comment-list {
      margin-bottom: 20px;

      .comment-item {
        position: relative;
        padding: 16px;
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        margin-bottom: 16px;
        transition: all 0.2s;

        &:hover {
          border-color: #0969da;
          box-shadow: 0 3px 8px rgba(9, 105, 218, 0.12);
        }

        &:last-child {
          margin-bottom: 0;
        }

        // GitHub 风格的头部条纹
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0969da 0%, #54aeff 100%);
          border-radius: 6px 6px 0 0;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover::before {
          opacity: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #d0d7de;

          .comment-author {
            font-size: 14px;
            font-weight: 600;
            color: #1f2329;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.2s;
            cursor: pointer;

            &:hover {
              color: #0969da;
            }

            &::before {
              content: '';
              display: inline-block;
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              flex-shrink: 0;
            }
          }

          .comment-time {
            font-size: 12px;
            color: #656d76;
            font-weight: 400;
          }
        }

        .comment-content {
          font-size: 14px;
          line-height: 1.6;
          color: #1f2329;
          white-space: pre-wrap;
          margin-bottom: 12px;
          padding: 8px 0;
        }

        .comment-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid #f6f8fa;
          opacity: 0;
          transition: opacity 0.2s;
        }

        &:hover .comment-actions {
          opacity: 1;
        }
      }
    }

    .comment-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 40px;
      color: #656d76;
      background: #f6f8fa;
      border: 2px dashed #d0d7de;
      border-radius: 6px;
      margin-bottom: 20px;
      transition: all 0.2s;

      &:hover {
        background: #ffffff;
        border-color: #bfc6ce;
      }

      .t-icon {
        color: #d0d7de;
        margin-bottom: 12px;
      }

      p {
        font-size: 14px;
        margin: 0;
        font-weight: 500;
      }
    }

    .add-comment {
      background: #ffffff;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 16px;
      transition: all 0.2s;

      &:hover {
        border-color: #bfc6ce;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      }

      &:focus-within {
        border-color: #0969da;
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
      }

      :deep(.t-textarea) {
        border: none;
        box-shadow: none;

        .t-textarea__inner {
          font-size: 14px;
          line-height: 1.6;
          padding: 8px 0;

          &::placeholder {
            color: #656d76;
          }

          &:focus {
            box-shadow: none;
          }
        }
      }

      .add-comment-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #d0d7de;
      }
    }
  }

  .detail-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e7e7e7;
  }
}

// ========== 响应式适配 ==========

// 平板屏幕 (768px - 1024px)
@media (max-width: 1024px) {
  .feedback-page {
    max-width: 100%;

    .feedback-header {
      padding: 16px;

      .header-actions {
        gap: 8px;
        flex-wrap: wrap;
      }
    }

    .feedback-tabs {
      padding: 0 16px;

      .tabs-container {
        gap: 4px;

        .tab-item {
          padding: 10px 16px;
          font-size: 13px;

          .tab-count {
            font-size: 11px;
            padding: 1px 6px;
          }
        }
      }
    }

    .feedback-filters {
      padding: 12px 16px;

      .filters-row {
        gap: 8px;

        .filter-input {
          max-width: 300px;
        }

        .filter-select {
          width: 150px;
        }
      }
    }

    .feedback-list {
      padding: 0 16px;

      .feedback-item {
        .feedback-item-header {
          flex-wrap: wrap;

          .feedback-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 12px;
            margin-left: 0;
          }
        }
      }
    }
  }

  .new-feedback-form {
    .form-group {
      .type-radio-group {
        grid-template-columns: 1fr;
      }
    }
  }
}

// 手机屏幕 (768px 以下)
@media (max-width: 768px) {
  .feedback-page {
    .feedback-header {
      padding: 12px;

      .header-actions {
        width: 100%;
        justify-content: space-between;

        .t-button {
          flex: 1;
          min-width: 0;

          :deep(.t-button__text) {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .feedback-tabs {
      padding: 0 12px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }

      .tabs-container {
        gap: 4px;
        min-width: max-content;

        .tab-item {
          padding: 10px 12px;
          font-size: 12px;
          white-space: nowrap;

          .tab-label {
            display: none; // 隐藏文字只保留图标
          }

          .tab-count {
            font-size: 11px;
            padding: 1px 6px;
          }
        }
      }
    }

    .feedback-filters {
      padding: 12px;

      .filters-row {
        flex-wrap: wrap;
        gap: 8px;

        .filter-input {
          width: 100%;
          max-width: 100%;
        }

        .filter-select {
          flex: 1;
          min-width: calc(50% - 4px);
        }
      }
    }

    .feedback-list {
      padding: 0 12px;

      .feedback-item {
        padding: 12px;
        margin: 0 -12px;

        .feedback-item-header {
          gap: 8px;

          .feedback-status {
            .t-icon {
              font-size: 16px;
            }
          }

          .feedback-main {
            .feedback-title {
              font-size: 14px;
            }

            .feedback-meta {
              font-size: 11px;
              gap: 6px;

              .type-badge {
                font-size: 11px;
                padding: 1px 6px;
              }
            }
          }

          .feedback-actions {
            width: 100%;
            margin-top: 8px;
            gap: 6px;

            .t-button {
              font-size: 12px;
            }
          }
        }

        .feedback-comments,
        .feedback-no-comments {
          padding: 12px;
          margin-top: 12px;

          .comment-item-inline {
            padding: 8px;

            .comment-header-inline {
              flex-wrap: wrap;

              .comment-author {
                font-size: 12px;
              }

              .comment-time {
                font-size: 11px;
              }
            }

            .comment-content-inline {
              font-size: 12px;
            }
          }
        }
      }

      .empty-state {
        padding: 40px 20px;

        .t-icon {
          font-size: 36px;
        }

        p {
          font-size: 14px;
        }
      }
    }
  }

  .new-feedback-form {
    .form-group {
      margin-bottom: 20px;

      .form-label {
        font-size: 13px;
      }
    }

    .form-actions {
      flex-direction: column-reverse;

      .t-button {
        width: 100%;
      }
    }
  }

  .feedback-detail {
    .detail-header {
      flex-wrap: wrap;
      gap: 6px;

      .status-badge,
      .type-badge {
        font-size: 12px;
        padding: 3px 10px;
      }
    }

    .detail-content,
    .detail-section {
      h3 {
        font-size: 14px;
      }

      .content-text {
        font-size: 13px;
        padding: 12px;
      }

      .comment-list {
        .comment-item {
          padding: 12px;

          .comment-header {
            .comment-author {
              font-size: 13px;

              &::before {
                width: 18px;
                height: 18px;
              }
            }

            .comment-time {
              font-size: 11px;
            }
          }

          .comment-content {
            font-size: 13px;
          }
        }
      }

      .add-comment {
        padding: 12px;

        :deep(.t-textarea) {
          .t-textarea__inner {
            font-size: 13px;
          }
        }
      }
    }

    .detail-actions {
      margin-top: 24px;
      padding-top: 16px;

      .t-button {
        width: 100%;
        margin-bottom: 8px;
      }
    }
  }

  // 抽屉在移动端全屏显示
  :deep(.t-drawer) {
    .t-drawer__content-wrapper {
      width: 100% !important;
      max-width: 100% !important;
    }
  }

  // 对话框在移动端优化
  :deep(.t-dialog) {
    width: 90% !important;
    max-width: 500px !important;
  }
}

// 小屏手机 (480px 以下)
@media (max-width: 480px) {
  .feedback-page {
    .feedback-header {
      .header-actions {
        flex-direction: column;

        .t-button {
          width: 100%;
        }
      }
    }

    .feedback-tabs {
      .tabs-container {
        .tab-item {
          padding: 8px 10px;

          .tab-label {
            display: inline; // 小屏显示文字
            font-size: 11px;
          }
        }
      }
    }

    .feedback-filters {
      .filters-row {
        .filter-select {
          width: 100%;
          min-width: 100%;
        }
      }
    }

    .feedback-list {
      .feedback-item {
        .feedback-item-header {
          .feedback-main {
            .feedback-title {
              font-size: 13px;
            }

            .feedback-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
          }

          .feedback-actions {
            flex-wrap: wrap;

            .t-button {
              flex: 1;
              min-width: calc(50% - 3px);
            }
          }
        }
      }
    }
  }

  :deep(.t-dialog) {
    width: 95% !important;
  }
}
</style>
