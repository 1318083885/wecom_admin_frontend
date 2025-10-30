<template>
  <el-container class="main-layout">
    <!-- 移动端遮罩 -->
    <div
      v-if="isMobile && !sidebarCollapsed"
      class="mobile-overlay"
      @click="appStore.toggleSidebar"
    />
    
    <el-aside :width="sidebarWidth" :class="['sidebar-container', { 'mobile-sidebar': isMobile }]">
      <Sidebar />
    </el-aside>
    <el-container>
      <el-header class="header-container">
        <Header />
      </el-header>
      <el-main class="main-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const appStore = useAppStore()
const isMobile = ref(false)

const sidebarWidth = computed(() => (appStore.sidebarCollapsed ? '64px' : '200px'))
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

// 检测屏幕尺寸
function checkScreenSize() {
  isMobile.value = window.innerWidth < 768
  
  // 移动端默认收起侧边栏
  if (isMobile.value && !appStore.sidebarCollapsed) {
    appStore.setSidebarCollapsed(true)
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style lang="scss" scoped>
.main-layout {
  width: 100%;
  height: 100vh;
  position: relative;
}

.sidebar-container {
  transition: width 0.3s, transform 0.3s;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  
  // 移动端样式
  &.mobile-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
    
    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.header-container {
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 50px !important;
}

.main-container {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 10px;
  }
}

// 页面切换动画
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

