# 事项筛选器组件使用说明

## 组件介绍

事项筛选器包含两个组件：
1. **IssueFilter.vue** - 筛选器核心组件（可独立使用或嵌入其他容器）
2. **IssueFilterDrawer.vue** - 基于 Drawer 的筛选器容器组件（推荐使用）

## 基本使用

### 1. IssueFilterDrawer（推荐）

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <t-button @click="showFilterDrawer = true">
      <template #icon>
        <t-icon name="filter" />
      </template>
      筛选
    </t-button>

    <!-- 筛选器抽屉 -->
    <IssueFilterDrawer
      v-model="showFilterDrawer"
      :filter-conditions="filterConditions"
      :filtered-count="filteredCount"
      :user-list="userList"
      :space-list="spaceList"
      @update:filter-conditions="handleFilterChange"
      @confirm="handleFilterConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IssueFilterDrawer from './components/issue/IssueFilterDrawer.vue'

const showFilterDrawer = ref(false)
const filterConditions = ref([])
const filteredCount = ref(0)
const userList = ref([])
const spaceList = ref([])

const handleFilterChange = (conditions) => {
  filterConditions.value = conditions
}

const handleFilterConfirm = (conditions) => {
  '筛选条件已确认:', conditions)
  // 执行筛选逻辑
}
</script>
```

### 2. IssueFilter（独立使用）

```vue
<template>
  <IssueFilter
    :filter-conditions="filterConditions"
    :filtered-count="filteredCount"
    :user-list="userList"
    :space-list="spaceList"
    @update:filter-conditions="handleFilterChange"
    @apply="handleApply"
  />
</template>
```

## Props 说明

### IssueFilterDrawer Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | Boolean | false | 控制抽屉显示/隐藏 |
| filterConditions | Array | [] | 筛选条件数组 |
| filteredCount | Number | null | 筛选结果数量 |
| userList | Array | [] | 用户列表（用于经办人筛选） |
| spaceList | Array | [] | 组织列表（用于组织筛选） |

### IssueFilter Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| filterConditions | Array | [] | 筛选条件数组 |
| filteredCount | Number | null | 筛选结果数量 |
| userList | Array | [] | 用户列表 |
| spaceList | Array | [] | 组织列表 |

## Events 说明

### IssueFilterDrawer Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: Boolean) | 抽屉显示状态变化 |
| update:filterConditions | (conditions: Array) | 筛选条件变化 |
| confirm | (conditions: Array) | 点击确定按钮时触发 |

### IssueFilter Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:filterConditions | (conditions: Array) | 筛选条件变化 |
| apply | (conditions: Array) | 点击应用按钮时触发 |

## 筛选条件数据结构

```javascript
filterConditions = [
  {
    id: 0,           // 唯一标识
    field: 'keyword', // 字段名
    value: ''        // 筛选值
  },
  // ...
]
```

### 支持的字段类型

| 字段值 | 说明 | 值类型 |
|--------|------|--------|
| keyword | 关键词搜索 | String |
| issueType | 事项类型 | Integer (1-4) |
| status | 状态 | Integer (0-3) |
| priority | 优先级 | Integer (1-3) |
| assigneeId | 经办人 | Integer (用户ID) |
| spaceId | 组织 | Integer (组织ID) |
| dateRange | 日期范围 | Array [startDate, endDate] |

## 样式特点

1. **渐变背景标题栏** - 视觉层次清晰
2. **激活状态高亮** - 有值的筛选条件会高亮显示
3. **图标化选项** - 各类选项都配有对应图标
4. **流畅动画** - hover 和 transition 效果
5. **自定义滚动条** - 优化长列表体验
6. **响应式设计** - 自适应不同屏幕尺寸

## 完整示例

查看 `Issue.vue` 中的完整使用示例。
