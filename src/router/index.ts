import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { 
          title: '仪表盘', 
          icon: 'DataBoard',
          roles: ['super_admin', 'business_admin', 'analyst', 'operator']  // 🔐 分销员不显示
        },
      },
      {
        path: 'business-lines',
        name: 'BusinessLines',
        component: () => import('@/views/BusinessLines/List.vue'),
        meta: { 
          title: '业务线管理', 
          icon: 'OfficeBuilding', 
          permission: 'business_lines:view',
          roles: ['super_admin', 'business_admin', 'operator']  // 🔐 分销员不可访问
        },
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/Groups/List.vue'),
        meta: { 
          title: '群组管理', 
          icon: 'ChatDotSquare', 
          permission: 'groups:view',
          roles: ['super_admin', 'business_admin', 'analyst', 'operator']  // 🔐 分销员不可访问
        },
      },
      {
        path: 'groups/:chatId',
        name: 'GroupDetail',
        component: () => import('@/views/Groups/Detail.vue'),
        meta: { title: '群组详情', hidden: true, permission: 'groups:view' },
      },
      {
        path: 'join-rules',
        name: 'JoinRules',
        component: () => import('@/views/JoinRules/List.vue'),
        meta: { 
          title: '加群规则', 
          icon: 'Setting', 
          permission: 'rules:view',
          roles: ['super_admin', 'business_admin', 'operator']  // 🔐 分销员不可访问
        },
      },
      {
        path: 'join-rules/create',
        name: 'CreateJoinRule',
        component: () => import('@/views/JoinRules/CreateEdit.vue'),
        meta: { title: '创建规则', hidden: true, permission: 'rules:create' },
      },
      {
        path: 'join-rules/:id',
        name: 'JoinRuleDetail',
        component: () => import('@/views/JoinRules/Detail.vue'),
        meta: { title: '规则详情', hidden: true, permission: 'rules:view' },
      },
      {
        path: 'join-rules/:id/edit',
        name: 'EditJoinRule',
        component: () => import('@/views/JoinRules/CreateEdit.vue'),
        meta: { title: '编辑规则', hidden: true, permission: 'rules:update' },
      },
      {
        path: 'referrers',
        name: 'Referrers',
        component: () => import('@/views/Referrers/List.vue'),
        meta: { 
          title: '分销员管理', 
          icon: 'User', 
          permission: 'referrers:view',
          roles: ['super_admin', 'business_admin', 'analyst', 'operator']  // 🔐 分销员不可访问
        },
      },
      {
        path: 'referrers/:id',
        name: 'ReferrerDetail',
        component: () => import('@/views/Referrers/Detail.vue'),
        meta: { title: '分销员详情', hidden: true, permission: 'referrers:view' },
      },
      {
        path: 'referrers/:id/edit',
        name: 'EditReferrer',
        component: () => import('@/views/Referrers/List.vue'),
        meta: { title: '编辑分销员', hidden: true, permission: 'referrers:update' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/Analytics/ReferrerList.vue'),
        meta: { 
          title: '数据分析', 
          icon: 'DataAnalysis', 
          permission: 'analytics:view',
          roles: ['super_admin', 'business_admin', 'analyst', 'operator']  // 🔐 分销员不可访问
        },
      },
      {
        path: 'short-urls',
        name: 'ShortUrls',
        component: () => import('@/views/ShortUrls/List.vue'),
        meta: { 
          title: '短链接管理', 
          icon: 'Link', 
          permission: 'short_urls:view',
          roles: ['super_admin', 'business_admin', 'analyst', 'operator']  // 🔐 分销员不可访问
        },
      },
      {
        path: 'sync',
        name: 'DataSync',
        component: () => import('@/views/Sync/index.vue'),
        meta: { 
          title: '数据同步', 
          icon: 'Refresh',
          roles: ['super_admin', 'business_admin', 'operator']  // 🔐 仅管理员可访问
        },
      },
      // 🆕 管理员管理（仅超管可见）
      {
        path: 'admin-users',
        name: 'AdminUsers',
        component: () => import('@/views/Admin/UserList.vue'),
        meta: { 
          title: '管理员管理', 
          icon: 'UserFilled', 
          roles: ['super_admin']  // 🔐 仅超管可访问
        },
      },
      // 🆕 分销员自助页面（仅分销员可见）
      {
        path: 'my-info',
        name: 'MyInfo',
        component: () => import('@/views/Referrer/MyInfo.vue'),
        meta: { 
          title: '我的信息', 
          icon: 'User', 
          roles: ['referrer']  // 🔐 仅分销员可访问
        },
      },
      {
        path: 'my-analytics',
        name: 'MyAnalytics',
        component: () => import('@/views/Referrer/MyAnalytics.vue'),
        meta: { 
          title: '我的数据', 
          icon: 'DataLine', 
          roles: ['referrer'],
          hidden: true  // 先隐藏，从"我的信息"进入
        },
      },
      {
        path: 'my-links',
        name: 'MyLinks',
        component: () => import('@/views/Referrer/MyLinks.vue'),
        meta: { 
          title: '我的链接', 
          icon: 'Link', 
          roles: ['referrer']
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Error/403.vue'),
    meta: { public: true, title: '权限不足' },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: { public: true, title: '页面不存在' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 设置路由守卫
setupRouterGuards(router)

export default router

