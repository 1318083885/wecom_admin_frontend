# 管理员与分销员管理API文档

> **版本**: v1.0  
> **更新日期**: 2025-10-29  
> **适用于**: 前端开发

---

## 📋 目录

1. [核心概念](#核心概念)
2. [业务流程](#业务流程)
3. [管理员管理API](#管理员管理api)
4. [分销员管理API](#分销员管理api)
5. [分销员自助API](#分销员自助api)
6. [与其他模块结合](#与其他模块结合)
7. [权限说明](#权限说明)
8. [错误处理](#错误处理)

---

## 🎯 核心概念

### **1. 用户角色体系**

| 角色 | 类型 | 说明 | referrer_code |
|------|------|------|---------------|
| **super_admin** | 内部管理员 | 超级管理员，全部权限 | ❌ NULL |
| **business_admin** | 内部管理员 | 业务线管理员 | ❌ NULL |
| **analyst** | 内部管理员 | 数据分析师 | ❌ NULL |
| **operator** | 内部管理员 | 运营人员 | ❌ NULL |
| **referrer** | 外部分销员 | 推广人员，只能看自己的数据 | ✅ 必填 |

### **2. 角色互斥规则**

```
内部管理员 ⊕ 外部分销员（二选一）

✅ 允许：
- 内部管理员 + referrer_code = NULL
- 外部分销员 + referrer_code = "R000001"

❌ 禁止：
- 内部管理员 + referrer_code = "R000001"  （角色混淆）
- 外部分销员 + referrer_code = NULL        （缺少关联）
```

### **3. 数据隔离**

```
管理员：
├─ 可以查看所有数据
├─ 可以管理所有分销员
└─ 接口：/api/v1/referrers, /api/v1/admin/users, etc.

分销员：
├─ 只能查看自己的数据
├─ 不能访问管理接口
└─ 接口：/api/v1/me/referrer/*
```

---

## 📖 业务流程

### **完整流程图**

```
1. 【超管】创建分销员业务配置
   ↓
   POST /api/v1/referrers
   {
     "display_name": "张三",
     "business_line_id": 1
   }
   ↓
   返回: referrer_code = "R000001"
   
2. 【超管】为分销员创建登录账号
   ↓
   POST /api/v1/admin/users
   {
     "username": "referrer_zhangsan",
     "password": "initial_password",
     "role": "referrer",
     "referrer_code": "R000001"  ← 关键：绑定分销员编号
   }
   
3. 【分销员】登录系统
   ↓
   POST /api/v1/auth/login
   {
     "username": "referrer_zhangsan",
     "password": "initial_password"
   }
   ↓
   返回: access_token, role="referrer", referrer_code="R000001"
   
4. 【分销员】查看自己的数据
   ↓
   GET /api/v1/me/referrer                    （我的信息）
   GET /api/v1/me/referrer/analytics          （我的数据分析）
   GET /api/v1/me/referrer/short-urls         （我的短链接）
```

---

## 🔐 管理员管理API

> **基础路径**: `/api/v1/admin/users`  
> **权限要求**: super_admin（仅超级管理员）

### **1. 创建管理员/分销员账号**

**接口**: `POST /api/v1/admin/users`

**请求头**:
```http
Authorization: Bearer {super_admin_token}
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "referrer_zhangsan",
  "password": "initial_password",
  "role": "referrer",                    // super_admin, business_admin, analyst, operator, referrer
  "referrer_code": "R000001",            // ⚠️ 仅当 role=referrer 时必填
  "business_line_id": null,              // 可选，业务线管理员需要
  "email": "zhangsan@example.com",
  "phone": "13800138000"
}
```

**角色验证规则**:
```javascript
if (role === "referrer") {
  // 外部分销员：referrer_code 必填
  if (!referrer_code) {
    return error("分销员角色必须指定 referrer_code");
  }
  
  // 验证 referrer_code 是否存在
  // 验证 referrer_code 是否已被其他账号绑定
  
} else {
  // 内部管理员：referrer_code 必须为空
  if (referrer_code) {
    return error("内部管理员不能设置分销员编号");
  }
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 4,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "username": "referrer_zhangsan",
    "role": "referrer",
    "referrer_code": "R000001",
    "business_line_id": null,
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "is_active": true,
    "created_at": "2025-10-29T12:00:00",
    "updated_at": "2025-10-29T12:00:00"
  },
  "message": "管理员 'referrer_zhangsan' 创建成功"
}
```

**错误响应**:
```json
// 400: referrer_code 不存在
{
  "detail": "❌ 分销员编号不存在: R000001"
}

// 400: referrer_code 已被绑定
{
  "detail": "❌ 分销员编号已被账号 'referrer_lisi' 绑定"
}

// 400: 内部管理员设置了 referrer_code
{
  "detail": [
    {
      "type": "value_error",
      "msg": "Value error, 内部管理员（operator）不能设置分销员编号"
    }
  ]
}
```

---

### **2. 获取用户列表**

**接口**: `GET /api/v1/admin/users`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | string | 否 | 角色筛选（super_admin, referrer 等） |
| is_active | boolean | 否 | 是否启用 |
| skip | int | 否 | 跳过条数（默认 0） |
| limit | int | 否 | 返回条数（默认 20） |

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "uuid": "...",
        "username": "admin",
        "role": "super_admin",
        "referrer_code": null,
        "is_active": true
      },
      {
        "id": 4,
        "uuid": "...",
        "username": "referrer_zhangsan",
        "role": "referrer",
        "referrer_code": "R000001",
        "is_active": true
      }
    ],
    "total": 2
  }
}
```

---

### **3. 更新用户信息**

**接口**: `PUT /api/v1/admin/users/{user_id}`

**请求体**:
```json
{
  "username": "new_username",
  "role": "referrer",
  "referrer_code": "R000002",    // ⚠️ 修改 referrer_code 时需注意角色匹配
  "is_active": true,
  "email": "new_email@example.com"
}
```

---

### **4. 重置用户密码**

**接口**: `POST /api/v1/admin/users/{user_id}/reset-password`

**请求体**:
```json
{
  "new_password": "reset_password123"
}
```

---

### **5. 删除/禁用用户**

**接口**: `DELETE /api/v1/admin/users/{user_id}`

**说明**: 软删除（设置 is_active = false）

---

## 📊 分销员管理API

> **基础路径**: `/api/v1/referrers`  
> **权限要求**: referrers:view / referrers:create / referrers:update

### **1. 创建分销员配置**

**接口**: `POST /api/v1/referrers`

**说明**: 
- 创建分销员业务配置（第一步）
- 系统自动生成唯一的 `referrer` 编号（如 R000001）
- 此时**还没有登录账号**

**请求头**:
```http
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求体**:
```json
{
  "display_name": "张三",
  "business_line_id": 1,
  "config_strategy": "SHARED",     // SHARED 或 INDEPENDENT
  "priority": 100,
  "is_active": true,
  "remark": "分销员备注"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 36,
    "referrer": "R000001",           // ⚠️ 重要：用于创建账号
    "display_name": "张三",
    "business_line_id": 1,
    "config_strategy": "SHARED",
    "is_active": true,
    "total_scans": 0,
    "total_conversions": 0,
    "created_at": "2025-10-29T12:00:00"
  },
  "message": "分销员 张三（R000001）创建成功"
}
```

---

### **2. 获取未绑定账号的分销员列表** 🆕

**接口**: `GET /api/v1/referrers/unbound/list`

**用途**: 
- ✅ 超管创建分销员账号时，快速查看哪些分销员还没有登录账号
- ✅ 避免重复绑定
- ✅ 方便批量创建账号

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| business_line_id | int | 否 | 业务线筛选 |
| is_active | boolean | 否 | 是否只显示启用的（默认 true） |
| skip | int | 否 | 跳过条数 |
| limit | int | 否 | 返回条数（默认 50） |

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 32,
        "referrer": "R000002",           // ⚠️ 用于创建账号
        "display_name": "李四",
        "business_line_id": 1,
        "is_active": true,
        "total_scans": 36,
        "total_conversions": 36,
        "last_scan_at": "2025-10-29T12:00:00",
        "created_at": "2025-10-29T10:00:00",
        "account_status": "未绑定账号",
        "can_create_account": true
      }
    ],
    "total": 11,                     // 未绑定总数
    "total_bound": 1,                // 已绑定总数
    "total_unbound": 11,
    "page": 1,
    "page_size": 50
  },
  "message": "共 11 个分销员未绑定账号，已有 1 个分销员已绑定"
}
```

**前端使用示例**:
```javascript
// 1. 获取未绑定账号的分销员
const response = await api.get('/api/v1/referrers/unbound/list');

// 2. 显示列表，提供"创建账号"按钮
response.data.items.forEach(referrer => {
  console.log(`${referrer.display_name} (${referrer.referrer}) - 未绑定账号`);
  
  // 点击"创建账号"按钮时
  createAccount({
    username: `referrer_${referrer.display_name}`,
    role: "referrer",
    referrer_code: referrer.referrer,  // ← 直接使用
    password: "initial_password"
  });
});
```

---

### **3. 获取分销员列表**

**接口**: `GET /api/v1/referrers`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| business_line_id | int | 否 | 业务线筛选 |
| referrer | string | 否 | 分销员编号搜索 |
| is_active | boolean | 否 | 是否启用 |
| skip | int | 否 | 跳过条数 |
| limit | int | 否 | 返回条数 |

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 36,
        "referrer": "R000001",
        "display_name": "张三",
        "business_line_id": 1,
        "is_active": true,
        "total_scans": 36,
        "total_conversions": 36,
        "last_scan_at": "2025-10-29T12:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

---

### **4. 更新分销员配置**

**接口**: `PUT /api/v1/referrers/{referrer_id}`

**说明**: ⚠️ **referrer 编号不可修改**（数据一致性）

**请求体**:
```json
{
  "display_name": "张三（更新后）",
  "is_active": false,
  "priority": 50,
  "remark": "新备注"
}
```

---

### **5. 删除分销员配置**

**接口**: `DELETE /api/v1/referrers/{referrer_id}`

**说明**: 软删除（设置 is_active = false）

---

## 👤 分销员自助API

> **基础路径**: `/api/v1/me/referrer`  
> **权限要求**: referrer 角色  
> **数据隔离**: 只能看自己的数据

### **1. 查看我的信息**

**接口**: `GET /api/v1/me/referrer`

**请求头**:
```http
Authorization: Bearer {referrer_token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 36,
    "referrer": "R000001",
    "display_name": "张三",
    "business_line_id": 1,
    "config_strategy": "SHARED",
    "is_active": true,
    "total_scans": 36,
    "total_conversions": 36,
    "conversion_rate": 100.0,
    "last_scan_at": "2025-10-29T12:00:00",
    "created_at": "2025-10-29T10:00:00"
  },
  "message": "获取我的信息成功"
}
```

---

### **2. 查看我的数据分析**

**接口**: `GET /api/v1/me/referrer/analytics`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| days | int | 否 | 统计天数（默认 30，最大 365） |

**响应**:
```json
{
  "success": true,
  "data": {
    "referrer_code": "R000001",
    "period_days": 30,
    "start_date": "2025-09-29T12:00:00",
    "end_date": "2025-10-29T12:00:00",
    "total_links": 5,              // 我的短链接总数
    "active_links": 3,             // 启用中的链接数
    "total_scans": 120,            // 总点击量
    "total_conversions": 80,       // 总转化量
    "conversion_rate": 66.67       // 转化率
  },
  "message": "获取数据分析成功"
}
```

---

### **3. 查看我的短链接**

**接口**: `GET /api/v1/me/referrer/short-urls`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| is_active | boolean | 否 | 是否启用筛选 |
| skip | int | 否 | 跳过条数 |
| limit | int | 否 | 返回条数（默认 20） |

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "short_code": "abc123",
        "original_url": "https://wecomdev.ujs1902.com/api/v1/unified/...",
        "short_url": "https://wecomdev.ujs1902.com/s/abc123",
        "referrer": "R000001",
        "business_line_id": 1,
        "is_active": true,
        "access_count": 36,
        "description": "我的推广链接1",
        "created_at": "2025-10-29T10:00:00",
        "expires_at": "2025-11-29T10:00:00"
      }
    ],
    "total": 5,
    "skip": 0,
    "limit": 20
  },
  "message": "获取短链接列表成功"
}
```

---

### **4. 查看我的链接统计**

**接口**: `GET /api/v1/me/referrer/short-urls/stats`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| days | int | 否 | 统计天数（默认 7，最大 90） |

**响应**:
```json
{
  "success": true,
  "data": {
    "referrer_code": "R000001",
    "period_days": 7,
    "start_date": "2025-10-22T12:00:00",
    "end_date": "2025-10-29T12:00:00",
    "total_links": 5,
    "links": [
      {
        "short_code": "abc123",
        "short_url": "https://wecomdev.ujs1902.com/s/abc123",
        "description": "我的推广链接1",
        "is_active": true,
        "scans": 36,
        "conversions": 30,
        "conversion_rate": 83.33,
        "created_at": "2025-10-29T10:00:00"
      }
    ]
  },
  "message": "获取链接统计成功"
}
```

---

## 🔗 与其他模块结合

### **1. 创建分销员专属短链接**

**流程**:
```
1. 分销员登录后获取 referrer_code
   ↓
2. 前端调用创建短链接接口（可由管理员或分销员自己创建）
   ↓
   POST /api/v1/short-urls
   {
     "original_url": "https://...",
     "referrer": "R000001",        ← 指定分销员
     "business_line_id": 1,
     "join_rule_id": 14,
     "description": "张三的推广链接"
   }
   ↓
3. 返回短链接，分销员分享给用户
```

**接口**: `POST /api/v1/short-urls`

**请求体**:
```json
{
  "original_url": "https://wecomdev.ujs1902.com/api/v1/unified/...",
  "referrer": "R000001",           // ⚠️ 关联分销员
  "business_line_id": 1,
  "join_rule_id": 14,
  "expires_days": 30,
  "description": "张三的推广链接"
}
```

---

### **2. 查看分销员业绩排行榜**

**接口**: `GET /api/v1/analytics/referrers/leaderboard`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period_type | string | 否 | today, yesterday, recent, custom |
| days | int | 否 | 天数（period_type=recent） |
| start_date | string | 否 | 开始日期（period_type=custom） |
| end_date | string | 否 | 结束日期（period_type=custom） |
| limit | int | 否 | 返回条数（默认 20） |

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "referrer": "R000001",
        "display_name": "张三",
        "total_clicks": 120,
        "total_links": 5,
        "active_links": 3,
        "avg_ctr": 24.0,
        "last_activity": "2025-10-29T12:00:00"
      }
    ],
    "total": 10,
    "period_type": "recent",
    "days": 30
  }
}
```

---

### **3. 查看分销员详细数据**

**接口**: `GET /api/v1/analytics/referrers/{referrer}/overview`

**响应**:
```json
{
  "success": true,
  "data": {
    "referrer": "R000001",
    "display_name": "张三",
    "total_clicks": 120,
    "total_links": 5,
    "active_links": 3,
    "inactive_links": 2,
    "avg_clicks_per_link": 24.0,
    "top_link": {
      "short_code": "abc123",
      "clicks": 50,
      "description": "最受欢迎的链接"
    },
    "recent_activity": [...]
  }
}
```

---

## 🔐 权限说明

### **角色权限矩阵**

| 接口 | super_admin | business_admin | analyst | operator | referrer |
|------|-------------|----------------|---------|----------|----------|
| **管理员管理** |
| 创建管理员/分销员 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 查看所有用户 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 重置密码 | ✅ | ❌ | ❌ | ❌ | ❌ |
| **分销员管理** |
| 创建分销员配置 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 查看所有分销员 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 更新分销员配置 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 查看未绑定列表 | ✅ | ✅ | ❌ | ✅ | ❌ |
| **分销员自助** |
| 查看我的信息 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 查看我的数据 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 查看我的短链接 | ❌ | ❌ | ❌ | ❌ | ✅ |
| **短链接管理** |
| 创建短链接 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 查看所有短链接 | ✅ | ✅ | ✅ | ✅ | ❌ |
| **数据分析** |
| 查看排行榜 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 查看分销员数据 | ✅ | ✅ | ✅ | ❌ | ❌ |

### **前端路由示例**

```javascript
// 根据角色显示不同菜单
const getMenuByRole = (role) => {
  switch (role) {
    case 'super_admin':
      return [
        '管理员管理',
        '分销员管理',
        '业务线管理',
        '群聊管理',
        '规则配置',
        '短链接管理',
        '数据分析'
      ];
    
    case 'business_admin':
    case 'operator':
      return [
        '分销员管理',
        '业务线管理',
        '群聊管理',
        '规则配置',
        '短链接管理'
      ];
    
    case 'analyst':
      return [
        '数据分析',
        '分销员排行榜',
        '业务报表'
      ];
    
    case 'referrer':
      return [
        '我的信息',
        '我的链接',
        '我的数据',
        '收益统计'
      ];
    
    default:
      return [];
  }
};
```

---

## ⚠️ 错误处理

### **常见错误码**

| HTTP状态码 | 错误类型 | 说明 |
|-----------|---------|------|
| 400 | Bad Request | 参数错误、验证失败 |
| 401 | Unauthorized | Token无效或过期 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 数据验证错误 |
| 500 | Internal Server Error | 服务器错误 |

### **错误响应格式**

```json
{
  "detail": "错误描述信息"
}

// 或（数据验证错误）
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "referrer_code"],
      "msg": "Value error, 分销员角色必须指定 referrer_code",
      "input": null
    }
  ]
}
```

### **前端错误处理示例**

```javascript
async function createReferrerAccount(data) {
  try {
    const response = await api.post('/api/v1/admin/users', data);
    
    if (response.data.success) {
      showSuccess('账号创建成功');
      return response.data.data;
    }
    
  } catch (error) {
    // 400: 业务错误
    if (error.response?.status === 400) {
      const detail = error.response.data.detail;
      
      if (typeof detail === 'string') {
        showError(detail);  // "❌ 分销员编号不存在: R000001"
      } else if (Array.isArray(detail)) {
        showError(detail[0].msg);  // 数据验证错误
      }
    }
    
    // 403: 权限不足
    else if (error.response?.status === 403) {
      showError('您没有权限执行此操作');
      router.push('/403');
    }
    
    // 401: Token过期
    else if (error.response?.status === 401) {
      showError('登录已过期，请重新登录');
      logout();
    }
    
    // 其他错误
    else {
      showError('操作失败，请稍后重试');
    }
  }
}
```

---

## 📝 完整示例

### **管理员创建分销员账号（完整流程）**

```javascript
// ============================================
// 前端：管理员创建分销员账号完整流程
// ============================================

// Step 1: 获取未绑定账号的分销员列表
async function getUnboundReferrers() {
  const response = await api.get('/api/v1/referrers/unbound/list', {
    params: { limit: 50, is_active: true }
  });
  
  console.log(`共 ${response.data.data.total_unbound} 个分销员未绑定账号`);
  return response.data.data.items;
}

// Step 2: 选择分销员并创建账号
async function createAccountForReferrer(referrer) {
  const accountData = {
    username: `referrer_${referrer.display_name}`,
    password: "initial_password_123",
    role: "referrer",
    referrer_code: referrer.referrer,  // ← 关键：使用分销员编号
    email: `${referrer.referrer}@example.com`
  };
  
  const response = await api.post('/api/v1/admin/users', accountData);
  
  if (response.data.success) {
    console.log(`✅ 为 ${referrer.display_name} 创建账号成功`);
    console.log(`账号: ${accountData.username}`);
    console.log(`初始密码: ${accountData.password}`);
    return response.data.data;
  }
}

// Step 3: 批量创建账号
async function batchCreateAccounts() {
  const unboundReferrers = await getUnboundReferrers();
  
  for (const referrer of unboundReferrers) {
    try {
      await createAccountForReferrer(referrer);
    } catch (error) {
      console.error(`创建账号失败: ${referrer.display_name}`, error);
    }
  }
}

// 执行
batchCreateAccounts();
```

### **分销员查看自己的数据（完整流程）**

```javascript
// ============================================
// 前端：分销员查看自己的数据完整流程
// ============================================

// Step 1: 分销员登录
async function referrerLogin(username, password) {
  const response = await api.post('/api/v1/auth/login', {
    username,
    password
  });
  
  if (response.data.success) {
    const { access_token, user } = response.data.data;
    
    // 存储 token
    localStorage.setItem('access_token', access_token);
    
    // 存储用户信息
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('referrer_code', user.referrer_code);
    
    console.log(`✅ 分销员 ${user.username} 登录成功`);
    console.log(`分销员编号: ${user.referrer_code}`);
    
    return user;
  }
}

// Step 2: 查看我的信息
async function getMyInfo() {
  const response = await api.get('/api/v1/me/referrer');
  
  if (response.data.success) {
    const info = response.data.data;
    console.log(`我的编号: ${info.referrer}`);
    console.log(`我的名称: ${info.display_name}`);
    console.log(`总点击量: ${info.total_scans}`);
    console.log(`总转化量: ${info.total_conversions}`);
    return info;
  }
}

// Step 3: 查看我的数据分析
async function getMyAnalytics(days = 30) {
  const response = await api.get('/api/v1/me/referrer/analytics', {
    params: { days }
  });
  
  if (response.data.success) {
    const analytics = response.data.data;
    console.log(`近 ${days} 天数据：`);
    console.log(`- 我的链接数: ${analytics.total_links}`);
    console.log(`- 总点击量: ${analytics.total_scans}`);
    console.log(`- 转化率: ${analytics.conversion_rate}%`);
    return analytics;
  }
}

// Step 4: 查看我的短链接
async function getMyShortUrls() {
  const response = await api.get('/api/v1/me/referrer/short-urls', {
    params: { limit: 20, is_active: true }
  });
  
  if (response.data.success) {
    const { items, total } = response.data.data;
    console.log(`我共有 ${total} 个短链接`);
    
    items.forEach(url => {
      console.log(`- ${url.description}: ${url.short_url} (点击: ${url.access_count})`);
    });
    
    return items;
  }
}

// 执行完整流程
async function referrerDashboard() {
  // 登录
  await referrerLogin('referrer_zhangsan', 'zhangsan123');
  
  // 获取数据
  const info = await getMyInfo();
  const analytics = await getMyAnalytics(30);
  const shortUrls = await getMyShortUrls();
  
  // 显示在前端界面
  return { info, analytics, shortUrls };
}
```

---

## 📚 附录

### **数据库表结构**

#### **admin_users 表**
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,  -- super_admin, business_admin, analyst, operator, referrer
  business_line_id INT,
  referrer_code VARCHAR(255) REFERENCES referrer_configs(referrer),  -- 🆕
  email VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 角色互斥约束
  CONSTRAINT check_referrer_role_mutual_exclusive CHECK (
    (role IN ('super_admin', 'business_admin', 'analyst', 'operator') AND referrer_code IS NULL)
    OR
    (role = 'referrer' AND referrer_code IS NOT NULL)
  )
);
```

#### **referrer_configs 表**
```sql
CREATE TABLE referrer_configs (
  id SERIAL PRIMARY KEY,
  business_line_id INT NOT NULL,
  referrer VARCHAR(255) UNIQUE NOT NULL,  -- 分销员唯一编号
  display_name VARCHAR(255) NOT NULL,     -- 分销员显示名称
  config_strategy configstrategy NOT NULL DEFAULT 'SHARED',
  target_groups JSON,
  priority INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  total_scans INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  conversion_rate FLOAT DEFAULT 0.0,
  last_scan_at TIMESTAMP,
  config_options JSON,
  remark TEXT,
  join_rule_id INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 相关文档

- [API完整参考文档](./API_COMPLETE_REFERENCE.md)
- [统一认证服务集成](./STUDENT_AUTH_INTEGRATION.md)
- [前端快速开始](./FRONTEND_QUICKSTART.md)
- [权限管理详解](./RBAC_GUIDE.md)

---

**文档版本**: v1.0  
**最后更新**: 2025-10-29  
**维护者**: Backend Team

