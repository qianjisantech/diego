<template>
  <div class="space-project-page">
    <t-card :bordered="false" class="space-project-card">
      <div class="space-project-body">
        <div class="section-header">
          <h3>项目管理</h3>
          <span class="section-subtitle">示例数据：后续可接入真实项目接口</span>
        </div>

        <t-table
          :data="projectList"
          :columns="columns"
          row-key="id"
          stripe
          hover
          class="project-table"
        >
          <template #status="{ row }">
            <t-tag :theme="getStatusTheme(row.status)">{{ row.status }}</t-tag>
          </template>
        </t-table>
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 写死的项目列配置
const columns = [
  { colKey: 'name', title: '项目名称', width: 220, align: 'left' },
  { colKey: 'key', title: '项目标识', width: 140, align: 'center' },
  { colKey: 'owner', title: '负责人', width: 120, align: 'center' },
  { colKey: 'status', title: '状态', width: 120, align: 'center' },
  { colKey: 'startTime', title: '开始时间', width: 160, align: 'center' },
  { colKey: 'endTime', title: '结束时间', width: 160, align: 'center' }
]

// 写死的项目列表数据
const projectList = ref([
  {
    id: 1,
    name: '示例项目 A',
    key: 'DEMO-A',
    owner: '张三',
    status: '进行中',
    startTime: '2024-01-01',
    endTime: '2024-06-30'
  },
  {
    id: 2,
    name: '示例项目 B',
    key: 'DEMO-B',
    owner: '李四',
    status: '未开始',
    startTime: '2024-07-01',
    endTime: '2024-12-31'
  },
  {
    id: 3,
    name: '示例项目 C',
    key: 'DEMO-C',
    owner: '王五',
    status: '已归档',
    startTime: '2023-01-01',
    endTime: '2023-12-31'
  }
])

const getStatusTheme = status => {
  const map = {
    '进行中': 'success',
    '未开始': 'default',
    '已归档': 'warning'
  }
  return map[status] || 'default'
}
</script>

<style scoped lang="scss">
.space-project-page {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;

  .space-project-card {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.t-card__body) {
      padding: 16px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  .space-project-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      margin: 0;
    }

    .section-subtitle {
      font-size: 12px;
      color: #8a8e99;
    }
  }

  .project-table {
    flex: 1;
  }
}
</style>

























