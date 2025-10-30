import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'
import type { LoginRequest, UserInfo } from '@/types/auth'
import { storage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>(storage.get('access_token') || '')
  const user = ref<UserInfo | null>(storage.get('user'))
  const permissions = ref<string[]>(storage.get('permissions') || [])

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)
  const username = computed(() => user.value?.username)
  const referrerCode = computed(() => user.value?.referrer_code)  // 🆕 分销员编号
  const isReferrer = computed(() => user.value?.role === 'referrer')  // 🆕 是否为分销员
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')  // 🆕 是否为超管

  // Actions
  /**
   * 登录
   */
  async function login(loginData: LoginRequest): Promise<boolean> {
    try {
      console.log('🔐 调用登录API...')
      const response: any = await authAPI.login(loginData)
      console.log('📥 登录API原始响应:', response)

      // 后端返回格式: {success: true, data: {token, user: {permissions}}}
      if (!response || !response.success || !response.data) {
        console.error('❌ 响应格式错误或登录失败:', response)
        return false
      }

      const loginResult = response.data
      console.log('📦 提取登录数据:', loginResult)

      // ✅ OAuth2 标准：使用 access_token 字段
      token.value = loginResult.access_token
      user.value = loginResult.user
      permissions.value = loginResult.user.permissions

      console.log('💾 保存到本地存储:')
      console.log('  - Token:', loginResult.access_token.substring(0, 20) + '...')
      console.log('  - Token Type:', loginResult.token_type)
      console.log('  - Expires In:', loginResult.expires_in, 'seconds')
      console.log('  - User:', loginResult.user)
      console.log('  - Permissions:', loginResult.user.permissions)

      // 保存到本地存储
      storage.set('access_token', loginResult.access_token)
      storage.set('user', loginResult.user)
      storage.set('permissions', loginResult.user.permissions)

      console.log('✅ 登录成功，状态已保存')
      console.log('✅ isLoggedIn:', !!token.value)
      
      return true
    } catch (error) {
      console.error('❌ 登录失败（异常）:', error)
      return false
    }
  }

  /**
   * 登出
   */
  function logout() {
    token.value = ''
    user.value = null
    permissions.value = []

    storage.remove('access_token')
    storage.remove('user')
    storage.remove('permissions')
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo(): Promise<boolean> {
    if (!token.value) return false

    try {
      const userInfo = await authAPI.getUserInfo()
      user.value = userInfo
      storage.set('user', userInfo)
      return true
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
      return false
    }
  }

  /**
   * 检查权限
   */
  function hasPermission(permission: string): boolean {
    // 超级管理员拥有所有权限
    if (permissions.value.includes('*')) {
      return true
    }
    return permissions.value.includes(permission)
  }

  /**
   * 检查多个权限（满足其一即可）
   */
  function hasAnyPermission(permissionList: string[]): boolean {
    if (permissions.value.includes('*')) {
      return true
    }
    return permissionList.some((p) => permissions.value.includes(p))
  }

  /**
   * 恢复登录状态
   */
  function restoreAuth() {
    const savedToken = storage.get<string>('access_token')
    const savedUser = storage.get<UserInfo>('user')
    const savedPermissions = storage.get<string[]>('permissions')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = savedUser
      permissions.value = savedPermissions || []
    }
  }

  return {
    // State
    token,
    user,
    permissions,
    // Getters
    isLoggedIn,
    userRole,
    username,
    referrerCode,  // 🆕 分销员编号
    isReferrer,     // 🆕 是否为分销员
    isSuperAdmin,   // 🆕 是否为超管
    // Actions
    login,
    logout,
    getUserInfo,
    hasPermission,
    hasAnyPermission,
    restoreAuth,
  }
})

