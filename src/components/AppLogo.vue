<template>
  <div class="app-logo" :class="{ clickable: clickable, 'enterprise-mode': isEnterprise }" @click="handleClick">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="logoTitle">
      <title id="logoTitle">Cooperise</title>
      <!-- Redesigned rounded mark -->
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0052D9"/>
          <stop offset="50%" stop-color="#2F78E6"/>
          <stop offset="100%" stop-color="#60A8FF"/>
        </linearGradient>
        <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FF9CCF"/>
          <stop offset="100%" stop-color="#60A8FF"/>
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0b254a" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Background rounded square -->
      <rect width="48" height="48" rx="10" fill="url(#logo-gradient)"/>

      <!-- Stylized "C" mark: a thick arc with rounded ends -->
      <g transform="translate(24,24)" filter="url(#softShadow)">
        <path d="M14 0 A14 14 0 1 1 -14 0" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.98"/>
        <!-- inner accent dot to give identity -->
        <circle cx="6" cy="-6" r="3.2" fill="url(#accent-grad)"/>
      </g>
    </svg>
    <!-- Artistic text logo -->
    <svg class="logo-text-svg" width="140" height="28" viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logoTextGrad" x1="0" x2="1">
          <stop offset="0%" stop-color="#0052D9"/>
          <stop offset="60%" stop-color="#2F78E6"/>
          <stop offset="100%" stop-color="#60A8FF"/>
        </linearGradient>
        <filter id="logoTextShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1f2d4a" flood-opacity="0.12"/>
        </filter>
      </defs>
      <text x="50%" y="20" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="18" fill="url(#logoTextGrad)" filter="url(#logoTextShadow)">
        Cooperise
      </text>
    </svg>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  clickable: {
    type: Boolean,
    default: false
  },
  to: {
    type: String,
    default: '/workspace'
  }
})

const router = useRouter()
const route = useRoute()
const isEnterprise = computed(() => {
  return route.path && route.path.startsWith('/self/enterprise')
})

const handleClick = () => {
  if (props.clickable) {
    router.push(props.to)
  }
}
</script>

<style scoped lang="scss">
.app-logo {
  display: flex;
  align-items: center;
  gap: 12px;

  &.clickable {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);

      svg {
        filter: drop-shadow(0 4px 8px rgba(0, 82, 217, 0.3));
      }

      .logo-text {
        color: #0052D9;
      }
    }
  }

  svg {
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .logo-text {
    display: none;
  }
  .logo-text-svg {
    display: inline-block;
    vertical-align: middle;
  }
  /* Styles when displayed on /self/enterprise route */
  &.enterprise-mode {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;

    > svg:first-child {
      width: 80px !important;
      height: 80px !important;
    }

    .logo-text-svg {
      width: auto;
      height: 80px !important;
      display: inline-block;
      vertical-align: middle;
      margin-left: 8px;
    }
  }
}
</style>
