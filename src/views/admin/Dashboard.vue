<template>
  <div class="admin-dashboard">
    <t-card :bordered="false" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <h3 class="page-title">仪表盘</h3>
        </div>
      </template>
      <div class="dashboard-content">
        <p>欢迎使用管理员后台</p>
      </div>
    </t-card>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.admin-dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 0;
  border: none;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.t-card__header) {
    padding: 24px 32px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
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

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2329;
    margin: 0;
  }
}

.dashboard-content {
  p {
    font-size: 14px;
    color: #86909c;
  }
}
</style>



















