# 企业微信群管理系统 - 前端管理后台

[![Vue 3](https://img.shields.io/badge/Vue-3.3.11-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.5.1-409EFF.svg)](https://element-plus.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.10-646CFF.svg)](https://vitejs.dev/)

企业微信群组管理系统的管理后台前端，基于 Vue 3 + TypeScript + Element Plus 构建。

## 📋 功能特性

### 🔐 用户管理
- **管理员登录**：支持多角色登录（超级管理员、业务管理员、运营人员、数据分析师）
- **分销员登录**：分销员专属界面，查看个人数据和推广链接
- **权限控制**：基于角色的路由和功能权限控制

### 📊 核心功能
- **仪表盘**：数据总览、关键指标展示、图表可视化
- **群组管理**：群聊列表、详情查看、状态管理、成员管理
- **规则管理**：加群规则配置、策略设置、群池分配
- **业务线管理**：业务线配置、群池分配
- **分销员管理**：分销员配置、数据统计、账号绑定
- **短链接管理**：推广链接生成、统计追踪
- **数据分析**：分销员排行榜、转化数据、趋势分析
- **数据同步**：企微数据同步、全量/增量更新

### 🎨 UI/UX 特性
- **响应式设计**：完美适配 PC、平板、移动端
- **现代化界面**：基于 Element Plus 的美观 UI
- **数据可视化**：ECharts 图表展示
- **暗色主题**：支持深色模式（可选）

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | 3.3.11 | 渐进式 JavaScript 框架 |
| TypeScript | 5.3.3 | JavaScript 的超集 |
| Vite | 5.0.10 | 下一代前端构建工具 |
| Element Plus | 2.5.1 | Vue 3 组件库 |
| Pinia | 2.1.7 | Vue 3 状态管理 |
| Vue Router | 4.2.5 | Vue 官方路由管理器 |
| Axios | 1.6.5 | HTTP 客户端 |
| ECharts | 5.4.3 | 数据可视化库 |
| Sass | 1.69.7 | CSS 预处理器 |

## 📦 快速开始

### 前置要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 生产环境打包
```bash
npm run build
```

打包后的文件在 `dist/` 目录

### 预览生产构建
```bash
npm run preview
```

## 🔧 配置

### 环境变量

**开发环境** (`.env.development`):
```bash
VITE_API_BASE_URL=https://wecomdev.ujs1902.com/api/v1
```

**生产环境** (`.env.production`):
```bash
VITE_API_BASE_URL=https://wecom.ujs1902.com/api/v1
```

### API 配置

所有 API 配置在 `src/config/index.ts`：
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
```

## 📁 项目结构

```
wecom_admin_frontend/
├── public/                  # 静态资源
├── src/
│   ├── api/                # API 接口封装
│   ├── assets/             # 资源文件
│   ├── components/         # 通用组件
│   ├── composables/        # 组合式函数
│   ├── config/             # 配置文件
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目说明
```

## 🚀 部署

### Nginx 配置

Vue Router 使用 HTML5 History 模式，需要配置服务器重定向：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 部署步骤

1. **打包项目**
   ```bash
   npm run build
   ```

2. **上传 dist 目录到服务器**
   ```bash
   scp -r dist/* user@server:/path/to/web/root/
   ```

3. **配置 Nginx 并重启**
   ```bash
   nginx -s reload
   ```

## 👥 角色说明

| 角色 | 权限 | 说明 |
|------|------|------|
| super_admin | 所有权限 | 超级管理员 |
| business_admin | 业务管理 | 业务线管理员 |
| analyst | 数据查看 | 数据分析师 |
| operator | 基础操作 | 运营人员 |
| referrer | 个人数据 | 分销员 |

## 📝 开发规范

- **代码风格**：使用 ESLint + Prettier
- **提交规范**：遵循 Conventional Commits
- **类型检查**：严格的 TypeScript 类型定义

### 代码检查
```bash
npm run lint
```

### 代码格式化
```bash
npm run format
```

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**企业微信群管理系统** - 高效的企业微信群组管理解决方案 🚀

