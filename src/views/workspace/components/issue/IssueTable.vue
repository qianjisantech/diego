<template>
  <t-table
    :data="data"
    :columns="columns"
    :loading="loading"
    row-key="id"
    :selected-row-keys="selectedRowKeys"
    hover
    class="task-table"
    @select-change="handleSelectChange"
  >
    <!-- 概要列 -->
    <template #summary="{ row }">
      <div class="task-summary" :class="{ 'is-editing': editingIssueId === row.id }">
        <!-- 编辑状态：显示输入框 -->
        <t-input
          v-if="editingIssueId === row.id"
          :value="editingSummary"
          @input="emit('update:editingSummary', $event)"
          class="summary-input"
          autofocus
          @blur="emit('cancel-edit')"
          @keyup.enter="emit('save-summary', row)"
          @keyup.esc="emit('cancel-edit')"
          @click.stop
        />
        <!-- 非编辑状态：显示文字 -->
        <template v-else>
          <div class="summary-content">
            <span class="summary-text" @click.stop="emit('summary-click', row)">{{ row.summary }}</span>
            <span v-permission="'workspace:issue:edit'" class="edit-icon-wrapper" @click.stop="emit('edit-issue', row)">
              <t-icon name="edit" size="16px" class="edit-icon-hover" />
            </span>
          </div>
        </template>
      </div>
    </template>

    <!-- 事项编号列 -->
    <template #issueNo="{ row }">
      <div class="task-number-cell">
        <span class="task-number-text">{{ row.issueNo || '-' }}</span>
        <span class="copy-icon-wrapper" @click.stop="emit('copy-task-number', row)">
          <t-icon name="file-copy" size="16px" class="copy-icon" />
        </span>
      </div>
    </template>

    <!-- 事项类型列 -->
    <template #issueType="{ row }">
      <div class="task-type-cell">
        <t-icon :name="getIssueTypeIcon(row.issueType)" size="14px" />
        <span>{{ getIssueTypeLabel(row.issueType) }}</span>
      </div>
    </template>

    <!-- 状态列 -->
    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.status)" variant="light">
        {{ getStatusLabel(row.status) }}
      </t-tag>
    </template>

    <!-- 优先级列 -->
    <template #priority="{ row }">
      <t-dropdown
        :min-column-width="120"
        trigger="hover"
        @click.stop="() => {}"
      >
        <t-tag
          :theme="getPriorityTheme(row.priority)"
          size="small"
          class="priority-tag-clickable"
        >
          {{ getPriorityLabel(row.priority) }}
        </t-tag>
        <t-dropdown-menu v-permission="'workspace:issue:edit'">
          <t-dropdown-item
            v-for="priority in priorityOptions"
            :key="priority.value"
            @click="emit('quick-change-priority', row, priority.value)"
          >
            {{ priority.label }}
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </template>

    <!-- 负责人列 -->
    <template #assignee="{ row }">
      <t-dropdown
        :min-column-width="120"
        trigger="hover"
        @click.stop="() => {}"
      >
        <span class="assignee-text-clickable">{{ getAssigneeName(row) }}</span>
        <t-dropdown-menu v-permission="'workspace:issue:assign'">
          <t-dropdown-item
            v-for="assignee in assigneeOptions"
            :key="assignee.value"
            @click="emit('quick-change-assignee', row, assignee.value)"
          >
            {{ assignee.label }}
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </template>

    <!-- 操作列表头 -->
    <template #operation-header>
      <div class="operation-header">
        <span>操作</span>
        <t-icon
          name="setting"
          size="16px"
          class="column-config-icon"
          @click="emit('show-column-config')"
        />
      </div>
    </template>

    <!-- 操作列内容 -->
    <template #operation="{ row }">
      <div class="operation-buttons">
        <t-dropdown
          :min-column-width="100"
          trigger="click"
          @click.stop
        >
          <t-icon
            name="ellipsis"
            size="20px"
            class="operation-more-icon"
          />
          <t-dropdown-menu>
            <t-dropdown-item v-permission="'workspace:issue:edit'" @click="emit('edit', row)">
              编辑
            </t-dropdown-item>
            <t-dropdown-item v-permission="'workspace:issue:delete'" @click="emit('delete', row)">
              删除
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
    </template>
  </t-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedRowKeys: {
    type: Array,
    default: () => []
  },
  editingIssueId: {
    type: Number,
    default: null
  },
  editingSummary: {
    type: String,
    default: ''
  },
  priorityOptions: {
    type: Array,
    default: () => []
  },
  assigneeOptions: {
    type: Array,
    default: () => []
  },
  getIssueTypeLabel: {
    type: Function,
    required: true
  },
  getIssueTypeIcon: {
    type: Function,
    required: true
  },
  getStatusLabel: {
    type: Function,
    required: true
  },
  getStatusTheme: {
    type: Function,
    required: true
  },
  getPriorityLabel: {
    type: Function,
    required: true
  },
  getPriorityTheme: {
    type: Function,
    required: true
  },
  getAssigneeName: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'select-change',
  'summary-click',
  'edit-issue',
  'save-summary',
  'cancel-edit',
  'copy-task-number',
  'quick-change-priority',
  'quick-change-assignee',
  'show-column-config',
  'edit',
  'delete',
  'update:editingSummary'
])

const handleSelectChange = (value) => {
  emit('select-change', value)
}
</script>

<style scoped lang="scss">
.task-table {
  .task-number-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;

    .task-number-text {
      font-size: 14px;
      color: #1f2329;
    }

    .copy-icon-wrapper {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s;
      flex-shrink: 0;

      .copy-icon {
        color: #646a73;
        transition: all 0.2s;
      }

      &:hover .copy-icon {
        color: #667eea;
        transform: scale(1.1);
      }
    }

    &:hover {
      .copy-icon-wrapper {
        opacity: 1;
      }
    }
  }

  .task-type-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #1f2329;
    font-size: 14px;

    .t-icon {
      color: #667eea;
      flex-shrink: 0;
    }
  }

  .task-summary {
    display: flex;
    align-items: center;
    position: relative;

    .summary-content {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      position: relative;

      .edit-icon-wrapper {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
        flex-shrink: 0;

        .edit-icon-hover {
          color: #646a73;
          transition: all 0.2s;
        }

        &:hover .edit-icon-hover {
          color: #667eea;
          transform: scale(1.1);
        }
      }

      .summary-text {
        font-size: 14px;
        color: #1f2329;
        cursor: pointer;
        transition: color 0.2s;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover {
          color: #667eea;
        }
      }
    }

    .summary-input {
      flex: 1;

      :deep(.t-input__inner) {
        font-size: 14px;
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }
    }

    &:hover:not(.is-editing) {
      .edit-icon-wrapper {
        opacity: 1;
      }
    }

    &.is-editing {
      background: #f5f7fa;
      padding: 4px 8px;
      margin: -4px -8px;
      border-radius: 4px;
    }
  }

  .operation-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .operation-more-icon {
      color: #646a73;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }

  .operation-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .column-config-icon {
      color: #646a73;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #667eea;
        transform: scale(1.15);
      }
    }
  }

  :deep(.t-table) {
    border: 1px solid #e7e7e7;
    border-radius: 6px;
  }

  :deep(.t-table__header) {
    background: #f5f5f5 !important;

    th {
      background: #f5f5f5 !important;
      font-weight: 600;
      color: #1f2329;
      border-bottom: 1px solid #e7e7e7;
      /* 更紧凑的表头高度与内边距 */
      padding: 8px 12px !important;
    }
  }

  :deep(.t-table__body) {
    tr {
      background: #ffffff;
      transition: all 0.3s;

      &:hover {
        background: #ffffff;
      }

      td {
        color: #646a73;
        border-bottom: 1px solid #e7e7e7;
        /* 紧凑表格行：减少内边距与行高 */
        padding: 8px 12px !important;
        line-height: 1.2 !important;
        vertical-align: middle !important;
      }
    }
  }
  /* 总体压缩表格字体与图标大小以配合紧凑行高 */
  font-size: 13px;
  :deep(.t-icon) {
    font-size: 14px;
  }
}

.priority-tag-clickable {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.assignee-text-clickable {
  cursor: pointer;
  font-size: 14px;
  color: #1f2329;
  transition: all 0.2s;

  &:hover {
    color: #667eea;
    font-weight: 500;
  }
}
</style>
