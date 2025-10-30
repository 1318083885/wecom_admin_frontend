# 前端开发快速入门指南

> 本指南帮助您快速开始前端项目开发

---

## 🚀 快速开始

### 1. 创建前端项目

```bash
# 进入工作目录
cd /Users/chenfeng/dev/yunshangjiangjiang

# 使用 Vite 创建 Vue 3 + TypeScript 项目
npm create vite@latest wecom_admin_frontend -- --template vue-ts

# 进入项目目录
cd wecom_admin_frontend

# 安装依赖
npm install
```

### 2. 安装必要依赖

```bash
# UI组件库
npm install element-plus

# 路由
npm install vue-router@4

# 状态管理
npm install pinia

# HTTP请求
npm install axios

# 工具库
npm install dayjs
npm install lodash-es

# 开发依赖
npm install -D @types/lodash-es
npm install -D unplugin-auto-import unplugin-vue-components
```

---

## 📁 推荐项目结构

```
wecom_admin_frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API接口封装
│   │   ├── request.ts         # Axios配置
│   │   ├── auth.ts            # 认证相关API
│   │   ├── groups.ts          # 群聊相关API
│   │   ├── rules.ts           # 规则相关API
│   │   ├── analytics.ts       # 分析相关API
│   │   └── shortUrl.ts        # 短链相关API
│   ├── assets/                 # 静态资源
│   │   └── logo.png
│   ├── components/             # 公共组件
│   │   ├── Layout/
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Breadcrumb.vue
│   │   ├── Charts/
│   │   └── Common/
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   └── useTable.ts
│   ├── router/                 # 路由配置
│   │   ├── index.ts
│   │   └── routes.ts
│   ├── stores/                 # Pinia状态管理
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── app.ts
│   ├── styles/                 # 样式文件
│   │   ├── index.scss
│   │   ├── variables.scss
│   │   └── element-ui.scss
│   ├── types/                  # TypeScript类型定义
│   │   ├── api.d.ts
│   │   ├── auth.d.ts
│   │   ├── group.d.ts
│   │   └── common.d.ts
│   ├── utils/                  # 工具函数
│   │   ├── storage.ts
│   │   ├── date.ts
│   │   └── validator.ts
│   ├── views/                  # 页面组件
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── Groups/
│   │   │   ├── GroupList.vue
│   │   │   └── GroupDetail.vue
│   │   ├── Rules/
│   │   │   ├── RuleList.vue
│   │   │   └── RuleForm.vue
│   │   ├── Analytics/
│   │   │   └── ReferrerAnalytics.vue
│   │   └── ShortUrl/
│   │       └── ShortUrlManage.vue
│   ├── App.vue
│   └── main.ts
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ 核心配置文件

### 1. Vite配置 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 自动导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:18023',
        changeOrigin: true,
      },
    },
  },
});
```

### 2. 环境变量 (`.env.development`)

```bash
# API基础地址
VITE_API_BASE_URL=http://localhost:18023/api/v1

# 应用标题
VITE_APP_TITLE=企微群管理系统

# 是否开启Mock
VITE_USE_MOCK=false
```

### 3. 路由配置 (`src/router/index.ts`)

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/components/Layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表板', icon: 'Dashboard' },
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/Groups/GroupList.vue'),
        meta: { 
          title: '群聊管理', 
          icon: 'Group',
          permission: 'groups:view'
        },
      },
      {
        path: 'rules',
        name: 'Rules',
        component: () => import('@/views/Rules/RuleList.vue'),
        meta: { 
          title: '规则管理', 
          icon: 'Setting',
          permission: 'rules:view'
        },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/Analytics/ReferrerAnalytics.vue'),
        meta: { 
          title: '数据分析', 
          icon: 'DataAnalysis',
          permission: 'analytics:view'
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 公开页面直接访问
  if (to.meta.public) {
    next();
    return;
  }
  
  // 检查登录状态
  if (!authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 检查权限
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
    ElMessage.error('权限不足');
    next({ name: 'Dashboard' });
    return;
  }
  
  next();
});

export default router;
```

### 4. Axios配置 (`src/api/request.ts`)

```typescript
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          const authStore = useAuthStore();
          authStore.logout();
          router.push('/login');
          break;
        case 403:
          ElMessage.error('权限不足');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(response.data?.detail || '请求失败');
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default request;
```

### 5. 认证Store (`src/stores/auth.ts`)

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/api/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('access_token') || '');
  const user = ref<any>(null);
  const permissions = ref<string[]>([]);

  const isLoggedIn = computed(() => !!token.value);

  // 登录
  async function login(loginForm: LoginRequest) {
    try {
      const response: LoginResponse = await authAPI.login(
        loginForm.username,
        loginForm.password
      );
      
      token.value = response.access_token;
      user.value = response.user;
      permissions.value = response.permissions;
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // 登出
  function logout() {
    token.value = '';
    user.value = null;
    permissions.value = [];
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  // 检查权限
  function hasPermission(permission: string): boolean {
    if (permissions.value.includes('*')) {
      return true;
    }
    return permissions.value.includes(permission);
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const data = await authAPI.getUserInfo();
      user.value = data;
      permissions.value = data.permissions;
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    token,
    user,
    permissions,
    isLoggedIn,
    login,
    logout,
    hasPermission,
    getUserInfo,
  };
});
```

### 6. API封装示例 (`src/api/groups.ts`)

```typescript
import request from './request';
import type { Group, GroupListResponse } from '@/types/group';

export const groupsAPI = {
  // 获取群列表
  getGroups(params: {
    page?: number;
    page_size?: number;
    business_line_id?: number;
    status?: string;
    search?: string;
  }): Promise<GroupListResponse> {
    return request.get('/groups/', { params });
  },

  // 获取群详情
  getGroupDetail(chatId: string): Promise<{ success: boolean; data: Group }> {
    return request.get(`/groups/${chatId}`);
  },

  // 同步群信息
  syncGroup(chatId: string): Promise<{ success: boolean; message: string }> {
    return request.post(`/groups/${chatId}/sync`);
  },

  // 获取群成员
  getGroupMembers(chatId: string, params: {
    page?: number;
    page_size?: number;
    member_type?: number;
    search?: string;
  }) {
    return request.get(`/groups/${chatId}/members`, { params });
  },

  // 群统计概览
  getGroupsOverview(params?: { business_line_id?: number }) {
    return request.get('/groups/stats/overview', { params });
  },
};
```

---

## 🎨 UI组件使用示例

### 登录页面 (`src/views/Login.vue`)

```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>企微群管理系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref();
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleLogin = async () => {
  await formRef.value.validate();
  
  loading.value = true;
  try {
    const success = await authStore.login(loginForm);
    if (success) {
      ElMessage.success('登录成功');
      router.push('/dashboard');
    } else {
      ElMessage.error('用户名或密码错误');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}
</style>
```

### 群列表页面 (`src/views/Groups/GroupList.vue`)

```vue
<template>
  <div class="group-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>群聊列表</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="业务线">
          <el-select v-model="searchForm.business_line_id" clearable>
            <el-option label="全部" :value="null" />
            <!-- 动态加载业务线选项 -->
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable>
            <el-option label="全部" :value="null" />
            <el-option label="活跃" value="active" />
            <el-option label="已满" value="full" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="群名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="群名称" />
        <el-table-column prop="member_count" label="成员数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" @click="handleSync(row)">同步</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { groupsAPI } from '@/api/groups';

const router = useRouter();
const loading = ref(false);
const tableData = ref([]);

const searchForm = reactive({
  business_line_id: null,
  status: null,
  search: '',
});

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await groupsAPI.getGroups({
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm,
    });
    tableData.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const handleRefresh = () => {
  fetchData();
};

const handlePageChange = () => {
  fetchData();
};

const handleSizeChange = () => {
  pagination.page = 1;
  fetchData();
};

const handleView = (row: any) => {
  router.push(`/groups/${row.chat_id}`);
};

const handleSync = async (row: any) => {
  try {
    await groupsAPI.syncGroup(row.chat_id);
    ElMessage.success('同步成功');
    fetchData();
  } catch (error) {
    ElMessage.error('同步失败');
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

---

## 🔧 常用工具函数

### 本地存储 (`src/utils/storage.ts`)

```typescript
export const storage = {
  get(key: string) {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },
  
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  remove(key: string) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  },
};
```

### 权限检查 (`src/composables/usePermission.ts`)

```typescript
import { useAuthStore } from '@/stores/auth';

export function usePermission() {
  const authStore = useAuthStore();

  const hasPermission = (permission: string | string[]) => {
    if (authStore.permissions.includes('*')) {
      return true;
    }
    
    if (Array.isArray(permission)) {
      return permission.some(p => authStore.permissions.includes(p));
    }
    
    return authStore.permissions.includes(permission);
  };

  return {
    hasPermission,
  };
}
```

---

## 📚 更多资源

- [后端API完整文档](./API_REFERENCE.md)
- [Element Plus 文档](https://element-plus.org/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

---

**祝开发顺利！** 🎉

