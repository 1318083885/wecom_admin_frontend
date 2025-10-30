<template>
  <div class="sidebar">
    <div class="logo-container">
      <img v-if="!collapsed" src="/vite.svg" alt="Logo" class="logo" />
      <h1 v-if="!collapsed" class="title">企微群管理</h1>
      <img v-else src="/vite.svg" alt="Logo" class="logo-mini" />
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :unique-opened="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <el-menu-item
          v-if="!route.meta?.hidden && hasPermission(route)"
          :index="`/${route.path}`"
          @click="handleMenuClick(route)"
        >
          <el-icon>
            <component :is="route.meta?.icon || 'Menu'" />
          </el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

// 获取菜单路由（只显示第一级）
const menuRoutes = computed(() => {
  const routes = router.getRoutes().find((r) => r.path === '/')?.children || []
  return routes.filter((r) => !r.meta?.hidden)
})

// 检查权限
function hasPermission(route: RouteRecordRaw): boolean {
  // 🆕 优先检查角色权限
  if (route.meta?.roles && Array.isArray(route.meta.roles)) {
    const userRole = authStore.userRole
    if (!userRole || !route.meta.roles.includes(userRole)) {
      return false
    }
  }
  
  // 检查功能权限
  if (!route.meta?.permission) return true
  return authStore.hasPermission(route.meta.permission as string)
}

function handleMenuClick(route: RouteRecordRaw) {
  const fullPath = `/${route.path}`
  if (fullPath !== activeMenu.value) {
    router.push(fullPath)
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  background-color: #304156;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
    background-color: #2b3a4b;

    .logo {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }

    .logo-mini {
      width: 32px;
      height: 32px;
    }

    .title {
      font-size: 16px;
      color: #fff;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      
      // 移动端适配
      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
  }

  :deep(.el-menu) {
    border-right: none;
    flex: 1;
    overflow-y: auto;
  }

  :deep(.el-menu-item) {
    &:hover {
      background-color: #263445 !important;
    }

    &.is-active {
      background-color: #263445 !important;
    }
  }
}
</style>

