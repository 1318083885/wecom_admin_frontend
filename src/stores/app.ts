import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref<boolean>(storage.get('sidebar_collapsed') || false)
  const theme = ref<'light' | 'dark'>(storage.get('theme') || 'light')

  // Actions
  /**
   * 切换侧边栏展开/收起
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    storage.set('sidebar_collapsed', sidebarCollapsed.value)
  }

  /**
   * 设置侧边栏状态
   */
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    storage.set('sidebar_collapsed', collapsed)
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    storage.set('theme', theme.value)
    applyTheme()
  }

  /**
   * 应用主题
   */
  function applyTheme() {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    // State
    sidebarCollapsed,
    theme,
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    applyTheme,
  }
})

