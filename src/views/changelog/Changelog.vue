<template>
  <div class="changelog-page">
    <!-- 顶部操作栏 -->
    <div class="changelog-header">

      <div class="header-right">
        <t-space :size="12">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索版本或内容..."
            clearable
            style="width: 280px"
          >
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
          <t-button
            v-permission="'changelog:add'"
            theme="primary"
            @click="handleCreate"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
        </t-space>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <t-loading text="加载中..." size="large" />
    </div>

    <!-- 发布日志列表 -->
    <div v-else class="changelog-list" style="flex: 1; overflow-y: auto; padding: 16px 24px;">
      <div
        v-for="changelog in filteredChangelogList"
        :key="changelog.id"
        class="changelog-card"
        @click="viewDetail(changelog.id)"
      >
        <div class="card-header">
          <div class="version-info">
            <span class="version-badge">{{ changelog.version }}</span>
            <span class="type-badge" :class="getTypeClass(changelog.type)">
              {{ getTypeLabel(changelog.type) }}
            </span>
          </div>
          <div class="date-info">
            <t-icon name="time" size="14px" />
            <span>{{ formatDate(changelog.publishDate) }}</span>
          </div>
        </div>

        <h3 class="card-title">{{ changelog.title }}</h3>

        <div class="card-summary">
          {{ getContentSummary(changelog.content) }}
        </div>

        <div class="card-footer">
          <span class="publisher-info">
            <t-icon name="user" size="14px" />
            {{ changelog.createdBy || '系统管理员' }}
          </span>
          <t-space :size="8">
            <t-button theme="primary" variant="text" size="small" @click.stop="viewDetail(changelog.id)">
              查看详情
              <t-icon name="chevron-right" size="14px" />
            </t-button>
            <t-button
              v-permission="'changelog:edit'"
              theme="primary"
              variant="text"
              size="small"
              @click.stop="handleEdit(changelog)"
            >
              编辑
            </t-button>
            <t-button
              v-permission="'changelog:delete'"
              theme="danger"
              variant="text"
              size="small"
              @click.stop="handleDelete(changelog)"
            >
              删除
            </t-button>
          </t-space>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredChangelogList.length === 0" class="empty-state">
        <t-icon name="file-paste" size="64px" />
        <h3>暂无发布日志</h3>
        <p class="empty-description">还没有创建任何发布日志，开始记录您的第一个版本更新吧</p>
        <t-button
          v-permission="'changelog:add'"
          theme="primary"
          size="large"
          @click="handleCreate"
        >
          <template #icon>
            <t-icon name="add" />
          </template>
          创建第一个发布日志
        </t-button>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <ChangelogFormDialog
      v-model:visible="showFormDialog"
      :changelog="currentChangelog"
      @success="handleFormSuccess"
    />

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="showDeleteDialog"
      header="删除确认"
      :on-confirm="confirmDelete"
      :on-cancel="cancelDelete"
    >
      <p>确定要删除发布日志 <strong>{{ deleteTarget?.version }}</strong> 吗？</p>
      <p style="color: #e34d59; margin-top: 8px;">此操作不可恢复，请谨慎操作！</p>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getChangelogList, deleteChangelog } from '@/api/changelog.js'
import ChangelogFormDialog from './components/ChangelogFormDialog.vue'
import { eventBus, EVENTS } from '@/utils/eventBus.js'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchKeyword = ref('')
const changelogList = ref([])
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const currentChangelog = ref(null)
const deleteTarget = ref(null)

// 加载发布日志列表
const loadChangelogList = async (autoRedirect = false) => {
  try {
    loading.value = true
    const res = await getChangelogList()
    if (res.success) {
      changelogList.value = res.data || []
      // 按发布日期降序排序
      changelogList.value.sort((a, b) => {
        return new Date(b.publishDate || b.createTime) - new Date(a.publishDate || a.createTime)
      })

      // 如果需要自动跳转且有日志，且当前URL没有id参数，跳转到最新的一个
      if (autoRedirect && changelogList.value.length > 0 && !route.query.id) {
        const latestChangelog = changelogList.value[0]
        const basePath = route.path.startsWith('/admin') ? '/admin/changelog' : '/changelog'
        router.push({
          path: basePath,
          query: { id: latestChangelog.id }
        })
      }
    } else {
      MessagePlugin.error(res.message || '获取发布日志列表失败')
    }
  } catch (error) {
    console.error('获取发布日志列表失败:', error)
    MessagePlugin.error('获取发布日志列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选后的列表
const filteredChangelogList = computed(() => {
  let list = changelogList.value

  // 如果URL中有id参数，只显示对应的日志
  if (route.query.id) {
    list = list.filter(changelog => String(changelog.id) === String(route.query.id))
  }

  // 如果有搜索关键词，进一步过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(changelog => {
      return (
        changelog.version?.toLowerCase().includes(keyword) ||
        changelog.title?.toLowerCase().includes(keyword) ||
        changelog.content?.toLowerCase().includes(keyword)
      )
    })
  }

  return list
})

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    0: '新功能',
    1: '修复',
    2: '改进'
  }
  return labels[type] || '未知'
}

// 获取类型CSS类名
const getTypeClass = (type) => {
  const classes = {
    0: 'feature',
    1: 'bugfix',
    2: 'improvement'
  }
  return classes[type] || ''
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取内容摘要
const getContentSummary = (content) => {
  if (!content) return '暂无描述'

  try {
    // 尝试解析 JSON 格式的 content
    const contentData = typeof content === 'string' ? JSON.parse(content) : content
    const allItems = [
      ...(contentData.features || []),
      ...(contentData.improvements || []),
      ...(contentData.bugfixes || [])
    ]
    if (allItems.length > 0) {
      const summary = allItems.slice(0, 2).join('; ')
      return allItems.length > 2 ? summary + '...' : summary
    }
  } catch (error) {
    // 如果不是 JSON，直接截取文本
    const text = String(content).substring(0, 100)
    return text.length < content.length ? text + '...' : text
  }

  return '暂无描述'
}

// 查看详情
const viewDetail = (id) => {
  const basePath = route.path.startsWith('/admin') ? '/admin/changelog' : '/changelog'
  router.push({
    path: basePath,
    query: { id }
  })
}

// 处理新增
const handleCreate = () => {
  currentChangelog.value = null
  showFormDialog.value = true
}

// 处理编辑
const handleEdit = (changelog) => {
  currentChangelog.value = { ...changelog }
  showFormDialog.value = true
}

// 处理删除
const handleDelete = (changelog) => {
  deleteTarget.value = changelog
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!deleteTarget.value) return

  try {
    const res = await deleteChangelog(deleteTarget.value.id)
    if (res.success) {
      MessagePlugin.success('删除成功')
      showDeleteDialog.value = false
      deleteTarget.value = null
      // 刷新列表
      await loadChangelogList()
      // 触发事件，通知侧边栏更新
      eventBus.emit(EVENTS.CHANGELOG_DELETED)
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除发布日志失败:', error)
    MessagePlugin.error('删除失败')
  }
}

// 取消删除
const cancelDelete = () => {
  showDeleteDialog.value = false
  deleteTarget.value = null
}

// 表单提交成功
const handleFormSuccess = async (result) => {
  showFormDialog.value = false
  const isEdit = !!currentChangelog.value
  currentChangelog.value = null

  // 刷新列表
  await loadChangelogList()

  // 触发事件，通知侧边栏更新
  if (isEdit) {
    eventBus.emit(EVENTS.CHANGELOG_UPDATED)
  } else {
    eventBus.emit(EVENTS.CHANGELOG_CREATED)
  }

  // 如果是新增操作，可以跳转到新创建的日志详情
  if (!isEdit && result?.data?.id) {
    const basePath = route.path.startsWith('/admin') ? '/admin/changelog' : '/changelog'
    router.push({
      path: basePath,
      query: { id: result.data.id }
    })
  }
}

onMounted(() => {
  // 启用自动跳转，如果有日志会自动跳转到最新的一个
  loadChangelogList(true)
})
</script>

<style scoped lang="scss">
.changelog-page {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  margin: 0;

  .changelog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e7e7e7;
    flex-shrink: 0;

    .header-left {
      flex: 1;

      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 8px 0;

        .t-icon {
          color: #0052d9;
        }
      }

      .page-description {
        font-size: 14px;
        color: #646a73;
        margin: 0;
      }
    }

    .header-right {
      margin-left: 24px;
    }
  }

  .loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
  }

  .changelog-list {
    flex: 1;
    overflow-y: auto;
    padding: 0;

    .changelog-card {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .version-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .version-badge {
            padding: 4px 12px;
            background: var(--tencent-blue-gradient);
            color: #fff;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
          }

          .type-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;

            &.feature {
              background: #e8f4ff;
              color: #0052d9;
            }

            &.bugfix {
              background: #ffe8e8;
              color: #d54941;
            }

            &.improvement {
              background: #fff4e8;
              color: #e37318;
            }
          }
        }

        .date-info {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #8a8e99;

          .t-icon {
            color: #8a8e99;
          }
        }
      }

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 12px 0;
        line-height: 1.4;
      }

      .card-summary {
        font-size: 14px;
        color: #646a73;
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;

        .publisher-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #646a73;

          .t-icon {
            color: #646a73;
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      background: #fff;
      border-radius: 8px;

      .t-icon {
        color: #c5cad4;
        margin-bottom: 24px;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 12px 0;
      }

      .empty-description {
        font-size: 14px;
        color: #646a73;
        margin: 0 0 32px 0;
        max-width: 400px;
        text-align: center;
        line-height: 1.6;
      }
    }
  }
}
</style>
