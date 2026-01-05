<template>
  <EnterpriseAdminLayout>
    <router-view :key="route.fullPath" />
  </EnterpriseAdminLayout>
</template>

<script setup>
import { useRoute } from 'vue-router'
import EnterpriseAdminLayout from './components/EnterpriseAdminLayout.vue'

const route = useRoute()
</script>

<style scoped lang="scss">
// 主容器样式
</style>























