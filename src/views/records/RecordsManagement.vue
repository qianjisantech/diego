<template>
  <div class="log-management-container">
    <t-card class="log-card">
      <t-tabs v-model="activeTab" class="log-tabs">
        <t-tab-panel value="operation" label="操作记录">
          <OperationLog />
        </t-tab-panel>

        <t-tab-panel value="tracking" label="埋点记录">
          <TrackingLog />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OperationLog from '../logs/components/OperationLogTab.vue'
import TrackingLog from '../logs/components/TrackingLogTab.vue'

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
