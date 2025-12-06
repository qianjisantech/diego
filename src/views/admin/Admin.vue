<template>
  <AdminLayout>
    <router-view :key="route.fullPath" />
  </AdminLayout>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AdminLayout from './components/AdminLayout.vue'

const route = useRoute()
</script>

<style scoped lang="scss">
// 主容器样式
</style>

