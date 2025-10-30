<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 应用启动时恢复登录状态
  authStore.restoreAuth()
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}
</style>

