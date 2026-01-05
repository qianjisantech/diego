<template>
  <t-drawer
    :visible="visible"
    @update:visible="(val) => $emit('update:visible', val)"
    header="表格列管理"
    size="420px"
    :footer="false"
    placement="right"
    :close-btn="true"
    :destroy-on-close="false"
  >
    <div class="column-config-content">
      <!-- 搜索框 -->
      <div class="search-box">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索表头"
          clearable
          size="medium"
        >
          <template #suffix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
      </div>

      <!-- 已显示字段 -->
      <t-collapse :default-value="['shown']" expand-icon-placement="left">
        <t-collapse-panel value="shown" :header="`已显示字段 (${filteredShownColumns.length})`">
          <div class="column-list shown-list" ref="shownListRef">
            <div
              v-for="item in filteredShownColumns"
              :key="item.value"
              class="column-item"
              :class="{ 'is-fixed': item.fixed }"
              :data-id="item.value"
            >
              <div class="drag-handle" v-if="!item.fixed">
                <span class="drag-dots">⋮⋮</span>
              </div>
              <div class="drag-handle disabled" v-else>
                <t-icon name="lock" />
              </div>
              <t-checkbox
                :checked="true"
                :disabled="item.fixed"
                @change="toggleColumn(item, false)"
              >
                {{ item.label }}
              </t-checkbox>
            </div>
            <div v-if="filteredShownColumns.length === 0" class="empty-placeholder">
              暂无匹配的字段
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>

      <!-- 未显示字段 -->
      <t-collapse :default-value="['hidden']" expand-icon-placement="left" style="margin-top: 16px">
        <t-collapse-panel value="hidden" :header="`未显示字段 (${filteredHiddenColumns.length})`">
          <div class="column-list hidden-list">
            <div
              v-for="item in filteredHiddenColumns"
              :key="item.value"
              class="column-item"
            >
              <t-checkbox
                :checked="false"
                @change="toggleColumn(item, true)"
              >
                {{ item.label }}
              </t-checkbox>
            </div>
            <div v-if="filteredHiddenColumns.length === 0" class="empty-placeholder">
              暂无匹配的字段
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>

      <div class="config-footer">
        <t-button
          theme="default"
          variant="outline"
          size="medium"
          @click="handleReset"
          block
        >
          恢复默认
        </t-button>
        <t-button
          theme="primary"
          size="medium"
          @click="handleSave"
          block
          style="margin-top: 8px"
        >
          保存
        </t-button>
      </div>
    </div>
  </t-drawer>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import Sortable from 'sortablejs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedColumnKeys: {
    type: Array,
    default: () => []
  },
  transferData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:selectedColumnKeys', 'save', 'reset'])

const visible = ref(props.modelValue)
const shownColumns = ref([])
const hiddenColumns = ref([])
const searchKeyword = ref('')
const shownListRef = ref(null)
let sortableInstance = null

// 初始化列数据
const initColumns = () => {
  const allColumns = props.transferData.map(item => ({
    ...item,
    // 将 fixed 属性标准化为布尔值（TDesign Table 的 fixed 可能是 'left'/'right'/true/false）
    fixed: !!item.fixed
  }))
  shownColumns.value = allColumns.filter(item =>
    props.selectedColumnKeys.includes(item.value)
  )

  // 分离固定字段和非固定字段
  const fixedCols = shownColumns.value.filter(item => item.fixed)
  const nonFixedCols = shownColumns.value.filter(item => !item.fixed)

  // 固定字段按照原始顺序（summary）排在前面
  const fixedOrder = ['summary']
  fixedCols.sort((a, b) => {
    const indexA = fixedOrder.indexOf(a.value)
    const indexB = fixedOrder.indexOf(b.value)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })

  // 重新组合：固定字段在前，其他字段保持原顺序
  shownColumns.value = [...fixedCols, ...nonFixedCols]

  hiddenColumns.value = allColumns.filter(item =>
    !props.selectedColumnKeys.includes(item.value)
  )


}

// 过滤后的已展示列
const filteredShownColumns = computed(() => {
  if (!searchKeyword.value) return shownColumns.value
  return shownColumns.value.filter(item =>
    item.label.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 过滤后的未展示列
const filteredHiddenColumns = computed(() => {
  if (!searchKeyword.value) return hiddenColumns.value
  return hiddenColumns.value.filter(item =>
    item.label.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 初始化拖拽
const initSortable = () => {
  if (!shownListRef.value) return

  sortableInstance = new Sortable(shownListRef.value, {
    animation: 150,
    draggable: '.column-item:not(.is-fixed)',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.t-checkbox__input',
    preventOnFilter: false,
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt

      // 如果移动到固定项位置，则阻止
      if (newIndex === 0 && shownColumns.value[0]?.fixed) {
        return
      }

      // 调整索引（考虑固定项）
      const hasFixed = shownColumns.value[0]?.fixed
      const adjustedOldIndex = hasFixed ? oldIndex : oldIndex
      const adjustedNewIndex = hasFixed ? newIndex : newIndex

      if (adjustedOldIndex !== adjustedNewIndex) {
        const movedItem = shownColumns.value.splice(adjustedOldIndex, 1)[0]
        shownColumns.value.splice(adjustedNewIndex, 0, movedItem)
      }
    }
  })
}

// 销毁拖拽实例
const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

// 切换列显示/隐藏
const toggleColumn = (item, isAdd) => {
  if (item.fixed && !isAdd) {
    MessagePlugin.warning('该字段为固定字段，不能移除')
    return
  }

  if (isAdd) {
    // 添加列
    const index = hiddenColumns.value.findIndex(col => col.value === item.value)
    if (index !== -1) {
      hiddenColumns.value.splice(index, 1)
      shownColumns.value.push(item)
    }
  } else {
    // 移除列
    const index = shownColumns.value.findIndex(col => col.value === item.value)
    if (index !== -1) {
      shownColumns.value.splice(index, 1)
      hiddenColumns.value.push(item)
    }
  }
}

// 恢复默认
const handleReset = () => {
  initColumns()
  emit('reset')
  MessagePlugin.success('已恢复默认列配置')
}

// 保存
const handleSave = () => {
  if (shownColumns.value.length === 0) {
    MessagePlugin.warning('至少需要显示一列')
    return
  }

  const selectedKeys = shownColumns.value.map(item => item.value)
  emit('update:selectedColumnKeys', selectedKeys)
  emit('save', selectedKeys)
  visible.value = false
  MessagePlugin.success('列配置已保存')
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    initColumns()
    nextTick(() => {
      destroySortable()
      initSortable()
    })
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    destroySortable()
  }
})

onMounted(() => {
  initColumns()
})
</script>

<style scoped lang="scss">
.column-config-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 4px;
  background-color: #fff;

  .search-box {
    margin-bottom: 16px;
  }

  .column-list {
    padding: 8px 0;
    background-color: #fff;

    .column-item {
      display: flex;
      align-items: center;
      padding: 10px 8px;
      margin-bottom: 2px;
      cursor: move;
      transition: background-color 0.2s;
      background-color: #fff;

      &:hover {
        background-color: #f5f7fa;
      }

      &.is-fixed {
        cursor: default;

        .drag-handle {
          cursor: not-allowed;
        }
      }

      .drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-right: 8px;
        cursor: move;
        color: #bbb;
        font-size: 14px;

        &.disabled {
          cursor: not-allowed;
          color: #ccc;
        }

        .drag-dots {
          font-size: 16px;
          font-weight: bold;
          line-height: 1;
          letter-spacing: -2px;
        }
      }

      :deep(.t-checkbox) {
        flex: 1;
        pointer-events: none;

        .t-checkbox__input {
          pointer-events: auto;
        }
      }
    }

    .empty-placeholder {
      text-align: center;
      padding: 40px 0;
      color: #bbb;
      font-size: 14px;
    }
  }

  .config-footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #e7e7e7;
    background-color: #fff;
  }
}

// 折叠面板样式调整
:deep(.t-collapse) {
  border: none;
  background-color: #fff;

  .t-collapse-panel {
    border: 1px solid #e7e7e7;
    border-radius: 6px;
    margin-bottom: 0;
    background-color: #fff;

    .t-collapse-panel__header {
      padding: 12px 16px;
      background-color: #fff;
      font-weight: 600;
      font-size: 14px;
      color: #1f2329;
      border-radius: 6px;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .t-collapse-panel__body {
      padding: 0;
      border-top: 1px solid #e7e7e7;
      background-color: #fff;
    }

    .t-collapse-panel__content {
      padding: 0;
      background-color: #fff;
    }
  }
}

// 拖拽时的样式
.sortable-ghost {
  opacity: 0.4;
  background-color: #e3f2fd;
}

.sortable-chosen {
  background-color: #f0f0f0;
}

.sortable-drag {
  opacity: 0.8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  cursor: move !important;
}
</style>
