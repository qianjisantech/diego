<template>
  <div class="log-management-container">
    <t-card class="log-card">
      <t-tabs v-model="activeTab" class="log-tabs">
        <t-tab-panel value="operation">
          <template #label>
            <t-icon name="file-text" size="16px" style="margin-right: 6px;" />
            <span>操作记录</span>
          </template>
          <OperationLog />
        </t-tab-panel>

        <t-tab-panel value="tracking">
          <template #label>
            <t-icon name="chart-bar" size="16px" style="margin-right: 6px;" />
            <span>埋点记录</span>
          </template>
          <TrackingLog />
        </t-tab-panel>

        <t-tab-panel value="report">
          <template #label>
            <t-icon name="chart-pie" size="16px" style="margin-right: 6px;" />
            <span>埋点报表</span>
          </template>
          <TrackingReport />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OperationLog from '../records/components/OperationLogTab.vue'
import TrackingLog from '../records/components/TrackingLogTab.vue'
import TrackingReport from '../records/components/TrackingReportTab.vue'

const activeTab = ref('operation')
</script>

<style scoped lang="scss">
.log-management-container {
  .log-card {
    :deep(.t-card__body) {
      padding: 24px;
    }

    .log-tabs {
      :deep(.t-tabs__nav) {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
