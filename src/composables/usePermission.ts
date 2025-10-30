import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * 权限检查组合式函数
 */
export function usePermission() {
  const authStore = useAuthStore()

  /**
   * 检查是否拥有指定权限
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (authStore.permissions.includes('*')) {
      return true
    }

    if (Array.isArray(permission)) {
      return permission.some((p) => authStore.permissions.includes(p))
    }

    return authStore.permissions.includes(permission)
  }

  /**
   * 检查是否拥有所有指定权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (authStore.permissions.includes('*')) {
      return true
    }

    return permissions.every((p) => authStore.permissions.includes(p))
  }

  /**
   * 获取当前用户角色
   */
  const userRole = computed(() => authStore.userRole)

  /**
   * 检查是否是超级管理员
   */
  const isSuperAdmin = computed(() => authStore.userRole === 'super_admin')

  return {
    hasPermission,
    hasAllPermissions,
    userRole,
    isSuperAdmin,
  }
}

