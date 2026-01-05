<template>
  <ProfileLayout>
    <router-view :key="route.fullPath" />
  </ProfileLayout>
</template>

<script setup>
import { useRoute } from 'vue-router'
import ProfileLayout from './components/ProfileLayout.vue'

const route = useRoute()
</script>

<style scoped lang="scss">
// 主容器样式
</style>



















