import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    console.log('%c=== 路由守卫 ===', 'color: #E6A23C; font-weight: bold')
    console.log('从:', from.path, '→ 到:', to.path)
    
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 企业微信群管理系统` : '企业微信群管理系统'

    const authStore = useAuthStore()

    // 公开页面直接访问
    if (to.meta.public) {
      console.log('✅ 公开页面，允许访问')
      next()
      return
    }

    // 检查登录状态
    console.log('检查登录状态:', authStore.isLoggedIn)
    console.log('Token:', authStore.token ? authStore.token.substring(0, 20) + '...' : '无')
    
    if (!authStore.isLoggedIn) {
      console.log('❌ 未登录，跳转到登录页')
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // 🆕 分销员访问根路径或仪表盘时，重定向到"我的信息"
    if (authStore.isReferrer && (to.path === '/' || to.path === '/dashboard')) {
      console.log('🔄 分销员访问Dashboard，重定向到"我的信息"')
      next({ path: '/my-info', replace: true })
      return
    }

    // 🆕 检查角色权限
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const roles = to.meta.roles as string[]
      const userRole = authStore.userRole
      
      console.log('需要角色:', roles)
      console.log('用户角色:', userRole)
      
      if (!userRole || !roles.includes(userRole)) {
        console.log('❌ 角色权限不足')
        ElMessage.error('您的角色无权访问该页面')
        next({ name: 'Forbidden' })
        return
      }
      console.log('✅ 角色验证通过')
    }

    // 检查功能权限
    if (to.meta.permission) {
      const permission = to.meta.permission as string
      console.log('需要权限:', permission)
      console.log('用户权限:', authStore.permissions)
      
      if (!authStore.hasPermission(permission)) {
        console.log('❌ 权限不足')
        ElMessage.error('权限不足，无法访问该页面')
        next({ name: 'Forbidden' })
        return
      }
      console.log('✅ 权限验证通过')
    }

    console.log('✅ 允许访问:', to.path)
    next()
  })

  router.afterEach((to) => {
    console.log('%c✅ 路由跳转完成:', 'color: #67C23A', to.path)
  })
}

