# 管理员与分销员API快速参考

> **快速查找**: Ctrl+F 搜索接口路径或功能

---

## 🚀 核心流程

```
创建分销员账号完整流程：

1. POST /api/v1/referrers
   创建分销员业务配置
   → 返回 referrer_code = "R000001"

2. GET /api/v1/referrers/unbound/list
   查看未绑定账号的分销员
   → 获取可创建账号的分销员列表

3. POST /api/v1/admin/users
   为分销员创建登录账号
   { role: "referrer", referrer_code: "R000001" }
   
4. 分销员登录
   POST /api/v1/auth/login
   → 返回 access_token
   
5. 分销员访问自己的数据
   GET /api/v1/me/referrer/*
```

---

## 📋 API接口速查表

### **管理员管理** (`/api/v1/admin/users`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| POST | `/admin/users` | 创建管理员/分销员账号 | super_admin |
| GET | `/admin/users` | 获取用户列表 | super_admin |
| GET | `/admin/users/{id}` | 获取用户详情 | super_admin |
| PUT | `/admin/users/{id}` | 更新用户信息 | super_admin |
| DELETE | `/admin/users/{id}` | 禁用用户 | super_admin |
| POST | `/admin/users/{id}/reset-password` | 重置密码 | super_admin |
| POST | `/admin/users/{id}/change-password` | 修改密码 | 自己或super_admin |

---

### **分销员管理** (`/api/v1/referrers`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| POST | `/referrers` | 创建分销员配置 | referrers:create |
| GET | `/referrers` | 获取分销员列表 | referrers:view |
| **GET** | **`/referrers/unbound/list`** | **🆕 获取未绑定账号的分销员** | referrers:view |
| GET | `/referrers/{id}` | 获取分销员详情 | referrers:view |
| PUT | `/referrers/{id}` | 更新分销员配置 | referrers:update |
| DELETE | `/referrers/{id}` | 删除分销员配置 | referrers:delete |

---

### **分销员自助** (`/api/v1/me/referrer`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | `/me/referrer` | 查看我的信息 | referrer |
| GET | `/me/referrer/analytics` | 查看我的数据分析 | referrer |
| GET | `/me/referrer/short-urls` | 查看我的短链接 | referrer |
| GET | `/me/referrer/short-urls/stats` | 查看我的链接统计 | referrer |

---

### **短链接管理** (`/api/v1/short-urls`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| POST | `/short-urls` | 创建短链接（可指定referrer） | short_urls:create |
| GET | `/short-urls` | 获取短链接列表 | short_urls:view |
| GET | `/short-urls/{code}` | 获取短链接详情 | short_urls:view |
| PUT | `/short-urls/{code}` | 更新短链接 | short_urls:update |
| DELETE | `/short-urls/{code}` | 删除短链接 | short_urls:delete |

---

### **数据分析** (`/api/v1/analytics`)

| 方法 | 路径 | 功能 | 权限 |
|------|------|------|------|
| GET | `/analytics/referrers/leaderboard` | 分销员排行榜 | analytics:view |
| GET | `/analytics/referrers/{referrer}/overview` | 分销员数据概览 | analytics:view |

---

## 📊 请求/响应示例

### **1. 创建分销员账号（两步法）**

#### **Step 1: 创建分销员配置**

```http
POST /api/v1/referrers
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "display_name": "张三",
  "business_line_id": 1
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "referrer": "R000001",  ← 重要：用于Step 2
    "display_name": "张三"
  }
}
```

#### **Step 2: 创建登录账号**

```http
POST /api/v1/admin/users
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "username": "referrer_zhangsan",
  "password": "initial_password",
  "role": "referrer",
  "referrer_code": "R000001"  ← 使用Step 1的返回值
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 4,
    "username": "referrer_zhangsan",
    "role": "referrer",
    "referrer_code": "R000001"
  }
}
```

---

### **2. 查询未绑定账号的分销员** 🆕

```http
GET /api/v1/referrers/unbound/list?limit=50&is_active=true
Authorization: Bearer {admin_token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "referrer": "R000002",
        "display_name": "李四",
        "business_line_id": 1,
        "total_scans": 36,
        "account_status": "未绑定账号",
        "can_create_account": true
      }
    ],
    "total": 11,
    "total_bound": 1,
    "total_unbound": 11
  },
  "message": "共 11 个分销员未绑定账号，已有 1 个分销员已绑定"
}
```

---

### **3. 分销员登录并查看数据**

#### **登录**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "referrer_zhangsan",
  "password": "initial_password"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "user": {
      "username": "referrer_zhangsan",
      "role": "referrer",
      "referrer_code": "R000001",
      "permissions": [
        "referrers:view_self",
        "analytics:view_self",
        "short_urls:view_self"
      ]
    }
  }
}
```

#### **查看我的信息**

```http
GET /api/v1/me/referrer
Authorization: Bearer {referrer_token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "referrer": "R000001",
    "display_name": "张三",
    "total_scans": 120,
    "total_conversions": 80,
    "conversion_rate": 66.67
  }
}
```

---

## ⚠️ 重要约束

### **角色互斥规则**

```javascript
// ✅ 正确
{
  role: "super_admin",
  referrer_code: null  // 内部管理员不能有referrer_code
}

{
  role: "referrer",
  referrer_code: "R000001"  // 分销员必须有referrer_code
}

// ❌ 错误
{
  role: "super_admin",
  referrer_code: "R000001"  // 禁止：管理员不能是分销员
}

{
  role: "referrer",
  referrer_code: null  // 禁止：分销员必须绑定编号
}
```

### **数据隔离**

| 接口 | 管理员 | 分销员 |
|------|--------|--------|
| `/api/v1/referrers` | ✅ 查看所有 | ❌ 403 |
| `/api/v1/admin/users` | ✅ 管理所有 | ❌ 403 |
| `/api/v1/me/referrer` | ❌ 403 | ✅ 只看自己 |

---

## 🔑 权限矩阵

| 角色 | referrer_code | 创建账号 | 查看所有分销员 | 查看自己数据 |
|------|---------------|----------|----------------|--------------|
| super_admin | NULL | ✅ | ✅ | ❌ |
| business_admin | NULL | ❌ | ✅ | ❌ |
| analyst | NULL | ❌ | ✅ | ❌ |
| operator | NULL | ❌ | ✅ | ❌ |
| **referrer** | **必填** | ❌ | ❌ | ✅ |

---

## 🎯 常见场景

### **场景1：批量创建分销员账号**

```javascript
// 1. 获取未绑定列表
const unboundReferrers = await api.get('/api/v1/referrers/unbound/list');

// 2. 批量创建
for (const referrer of unboundReferrers.data.items) {
  await api.post('/api/v1/admin/users', {
    username: `ref_${referrer.referrer}`,
    password: 'default123',
    role: 'referrer',
    referrer_code: referrer.referrer
  });
}
```

### **场景2：创建分销员专属短链接**

```javascript
// 管理员为分销员创建推广链接
await api.post('/api/v1/short-urls', {
  original_url: 'https://...',
  referrer: 'R000001',       // 指定分销员
  business_line_id: 1,
  join_rule_id: 14,
  description: '张三的推广链接'
});
```

### **场景3：分销员查看自己的业绩**

```javascript
// 分销员登录后
const myInfo = await api.get('/api/v1/me/referrer');
const myAnalytics = await api.get('/api/v1/me/referrer/analytics?days=30');
const myLinks = await api.get('/api/v1/me/referrer/short-urls');
```

---

## 📞 联系方式

如有问题，请联系后端团队。

**文档版本**: v1.0  
**最后更新**: 2025-10-29

