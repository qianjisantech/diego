<template>
  <div class="admin-projects-page">
    <t-card :bordered="false" class="page-card">
      <template #header>
        <div class="card-header">
          <h3 class="page-title">项目管理</h3>
        </div>
      </template>
      <div class="page-content">
        <t-empty description="项目管理页面" />
      </div>
    </t-card>
  </div>
</template>

<script setup>
// import { ref } from 'vue'
</script>

<style scoped lang="scss">
.admin-projects-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.t-card__body) {
    padding: 32px;
    flex: 1;
    overflow-y: auto;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2329;
    margin: 0;
  }
}

.page-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #646a73;
}
</style>



















