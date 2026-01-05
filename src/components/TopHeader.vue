<template>
  <div class="top-header">
    <div class="header-content">
      <AppLogo :clickable="true" :to="logoRoute" />

      <div v-if="showActions" class="header-actions">
        <slot name="actions"></slot>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from './AppLogo.vue'

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

// Logo 点击跳转路由
const logoRoute = computed(() => {
  return props.isLoggedIn ? '/workspace' : '/'
})

// 返回首页
const goToHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.top-header {
  height: 64px;
  background: #fff;
  position: relative;
  z-index: 100;

  // 使用渐变阴影替代实线边框，实现模糊融合效果
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(231, 231, 231, 0.3) 20%,
      rgba(231, 231, 231, 0.5) 50%,
      rgba(231, 231, 231, 0.3) 80%,
      transparent 100%
    );
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }

  .header-content {
    width: 100%;
    height: 100%;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .home-button {
      font-size: 14px;
      font-weight: 500;
      height: 40px;
      padding: 0 20px;
      border-radius: 20px;
      transition: all 0.3s ease;
      background: rgba(0, 82, 217, 0.08);

      &:hover {
        background: rgba(0, 82, 217, 0.15);
        transform: translateY(-1px);
      }

      :deep(.t-icon) {
        font-size: 16px;
      }
    }
  }
}
</style>
