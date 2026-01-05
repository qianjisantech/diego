<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </div>
      <t-button theme="primary" size="large" @click="goHome">
        返回首页
      </t-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  router.push('/workspace')
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}

.error-content {
  text-align: center;

  .error-code {
    font-size: 120px;
    font-weight: 700;
    color: #667eea;
    line-height: 1;
    margin-bottom: 24px;
  }

  .error-title {
    font-size: 32px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .error-description {
    font-size: 16px;
    color: #999;
    margin-bottom: 32px;
  }
}
</style>
