# 后端API完整参考文档

> **最后更新**: 2025-10-27  
> **API基础URL**: `https://wecomdev.ujs1902.com/api/v1` (开发环境)  
> **认证方式**: JWT Bearer Token (管理员接口) / 独立Token (统一认证服务)

---

## 📑 目录

1. [认证与授权](#1-认证与授权)
2. [业务线管理](#2-业务线管理)
3. [群聊管理](#3-群聊管理)
4. [加群规则管理](#4-加群规则管理)
5. [企微配置管理](#5-企微配置管理)
6. [数据分析](#6-数据分析)
7. [短链接管理](#7-短链接管理)
8. [学生认证](#8-学生认证)
9. [群聊自动化](#9-群聊自动化)
10. [健康检查](#10-健康检查)

---

## 🔐 认证说明

### 管理员接口认证
大部分管理接口使用 **JWT Bearer Token** 认证：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 统一认证服务接口
学生认证接口使用**独立Token** (`STUDENT_AUTH_API_TOKEN`)：

```http
Authorization: Bearer {STUDENT_AUTH_API_TOKEN}
```

### 权限列表

| 权限 | 说明 |
|------|-----|
| `*` | 所有权限（super_admin） |
| `business_lines:view` | 查看业务线 |
| `business_lines:create` | 创建业务线 |
| `business_lines:update` | 更新业务线 |
| `groups:view` | 查看群聊 |
| `groups:update` | 更新群聊 |
| `rules:view` | 查看规则 |
| `rules:create` | 创建规则 |
| `rules:update` | 更新规则 |
| `rules:delete` | 删除规则 |
| `analytics:view` | 查看分析数据 |
| `short_urls:view` | 查看短链 |
| `short_urls:create` | 创建短链 |
| `short_urls:update` | 更新短链 |
| `short_urls:delete` | 删除短链 |

---

## 1. 认证与授权

### 1.1 管理员登录

**接口**: `POST /auth/login`  
**权限**: 🔓 公开  
**说明**: 管理员登录，获取JWT Token

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_at": "2025-10-27T12:00:00Z",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "super_admin",
    "is_active": true
  },
  "permissions": ["*"]
}
```

### 1.2 获取当前用户信息

**接口**: `GET /auth/me`  
**权限**: 🔒 需要登录  
**Headers**: `Authorization: Bearer {token}`

**响应**:
```json
{
  "id": 1,
  "username": "admin",
  "role": "super_admin",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "permissions": ["*"]
}
```

### 1.3 刷新Token

**接口**: `POST /auth/refresh`  
**权限**: 🔒 需要登录  
**Headers**: `Authorization: Bearer {old_token}`

**响应**:
```json
{
  "access_token": "new_token_here",
  "token_type": "bearer",
  "expires_at": "2025-10-27T13:00:00Z"
}
```

---

## 2. 业务线管理

### 2.1 获取业务线列表

**接口**: `GET /admin/business-lines/`  
**权限**: 🔒 需要登录  
**Headers**: `Authorization: Bearer {token}`

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "业务线A",
      "description": "描述",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### 2.2 创建业务线

**接口**: `POST /admin/business-lines/`  
**权限**: 🔒 `business_lines:create`

**请求体**:
```json
{
  "name": "新业务线",
  "description": "业务线描述"
}
```

### 2.3 更新业务线

**接口**: `PUT /admin/business-lines/{id}`  
**权限**: 🔒 `business_lines:update`

**请求体**:
```json
{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "is_active": true
}
```

---

## 3. 群聊管理

### 3.1 获取群列表

**接口**: `GET /groups/`  
**权限**: 🔒 `groups:view`

**查询参数**:
- `page`: 页码（默认1）
- `page_size`: 每页数量（默认20）
- `business_line_id`: 业务线ID过滤
- `status`: 状态过滤
- `search`: 搜索关键词

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "chat_id": "wrkSFfCgAAXXXX",
        "name": "测试群1",
        "member_count": 150,
        "status": "active",
        "business_line_id": 1,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "pages": 5
  }
}
```

### 3.2 获取群详情

**接口**: `GET /groups/{chat_id}`  
**权限**: 🔒 `groups:view`

**响应**:
```json
{
  "success": true,
  "data": {
    "chat_id": "wrkSFfCgAAXXXX",
    "name": "测试群1",
    "member_count": 150,
    "max_members": 200,
    "status": "active",
    "business_line": {
      "id": 1,
      "name": "业务线A"
    },
    "owner": "张三",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 3.3 同步群信息

**接口**: `POST /groups/{chat_id}/sync`  
**权限**: 🔒 `groups:update`

**响应**:
```json
{
  "success": true,
  "message": "群信息同步成功",
  "data": {
    "updated_fields": ["name", "member_count"]
  }
}
```

### 3.4 获取群成员列表

**接口**: `GET /groups/{chat_id}/members`  
**权限**: 🔒 `groups:view`

**查询参数**:
- `page`: 页码
- `page_size`: 每页数量
- `member_type`: 成员类型（1:内部,2:外部）
- `referrer`: 分销员过滤
- `search`: 搜索关键词

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "张三",
        "userid": "zhangsan",
        "type": 2,
        "join_time": "2025-01-01T00:00:00Z",
        "referrer": "ref001"
      }
    ],
    "total": 150,
    "page": 1,
    "page_size": 50
  }
}
```

### 3.5 群统计概览

**接口**: `GET /groups/stats/overview`  
**权限**: 🔒 `groups:view`

**查询参数**:
- `business_line_id`: 业务线ID过滤

**响应**:
```json
{
  "success": true,
  "data": {
    "total_groups": 100,
    "total_members": 15000,
    "avg_members_per_group": 150,
    "full_groups": 20,
    "near_full_groups": 15,
    "available_groups": 65,
    "utilization_rate": 75.5
  }
}
```

---

## 4. 加群规则管理

### 4.1 创建加群规则

**接口**: `POST /join-rules`  
**权限**: 🔒 `rules:create`

**请求体**:
```json
{
  "name": "规则名称",
  "business_line_id": 1,
  "selection_strategy": "round_robin",
  "groups_per_assignment": 3,
  "target_group_ids": ["chat_id_1", "chat_id_2"],
  "is_active": true
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "规则名称",
    "business_line_id": 1,
    "selection_strategy": "round_robin",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 4.2 获取规则列表

**接口**: `GET /join-rules`  
**权限**: 🔒 `rules:view`

**查询参数**:
- `business_line_id`: 业务线ID
- `is_active`: 是否激活
- `page`: 页码
- `page_size`: 每页数量

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "规则1",
        "business_line_id": 1,
        "selection_strategy": "round_robin",
        "groups_per_assignment": 3,
        "is_active": true,
        "success_rate": 95.5,
        "total_assignments": 1000
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 20
  }
}
```

### 4.3 获取规则详情

**接口**: `GET /join-rules/{rule_id}`  
**权限**: 🔒 `rules:view`

### 4.4 更新规则

**接口**: `PUT /join-rules/{rule_id}`  
**权限**: 🔒 `rules:update`

### 4.5 删除规则

**接口**: `DELETE /join-rules/{rule_id}`  
**权限**: 🔒 `rules:delete`

### 4.6 获取群池统计

**接口**: `GET /join-rules/{rule_id}/pool-stats`  
**权限**: 🔒 `rules:view`

**响应**:
```json
{
  "success": true,
  "data": {
    "total_groups": 10,
    "active_groups": 8,
    "full_groups": 2,
    "average_capacity": 75.5,
    "health_score": 85.0
  }
}
```

---

## 5. 企微配置管理

### 5.1 创建企微配置

**接口**: `POST /join-rule-configs/rule/{rule_id}/create`  
**权限**: 🔒 `rules:create`

**请求体**:
```json
{
  "chat_ids": ["chat_id_1", "chat_id_2"]  // 可选，不提供则自动选择
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "config_id": "xxx",
    "join_url": "https://work.weixin.qq.com/...",
    "qr_code": "https://...",
    "groups": ["chat_id_1", "chat_id_2", "chat_id_3"],
    "quota_used": 1,
    "quota_limit": 500
  }
}
```

### 5.2 获取配置详情

**接口**: `GET /join-rule-configs/{config_id}`  
**权限**: 🔒 `rules:view`

### 5.3 更新配置

**接口**: `POST /join-rule-configs/rule/{rule_id}/update`  
**权限**: 🔒 `rules:update`

### 5.4 配额使用情况

**接口**: `GET /join-rule-configs/quota/usage`  
**权限**: 🔒 需要登录

**查询参数**:
- `business_line_id`: 业务线ID（可选）

**响应**:
```json
{
  "success": true,
  "data": {
    "total_quota": 500,
    "used_quota": 50,
    "remaining_quota": 450,
    "usage_rate": 10.0,
    "configs": [
      {
        "config_id": "xxx",
        "rule_name": "规则1",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 5.5 健康检查

**接口**: `GET /join-rule-configs/{config_id}/health`  
**权限**: 🔒 需要登录

**响应**:
```json
{
  "success": true,
  "data": {
    "is_healthy": true,
    "status": "active",
    "groups_status": [
      {
        "chat_id": "xxx",
        "is_available": true,
        "member_count": 150,
        "capacity_rate": 75.0
      }
    ]
  }
}
```

---

## 6. 数据分析

### 6.1 分销员数据概览

**接口**: `GET /referrers/{referrer}/overview`  
**权限**: 🔒 `analytics:view`

**查询参数**:
- `days`: 统计天数（默认30）

**响应**:
```json
{
  "success": true,
  "data": {
    "referrer": "ref001",
    "total_invites": 500,
    "total_joins": 450,
    "conversion_rate": 90.0,
    "daily_stats": [
      {
        "date": "2025-01-01",
        "invites": 10,
        "joins": 9
      }
    ],
    "top_groups": [
      {
        "group_name": "群1",
        "member_count": 50
      }
    ]
  }
}
```

### 6.2 分销员对比

**接口**: `GET /referrers/comparison`  
**权限**: 🔒 `analytics:view`

**查询参数**:
- `referrers`: 分销员列表，逗号分隔（如：`ref001,ref002,ref003`）
- `days`: 统计天数

### 6.3 分销员排行榜

**接口**: `GET /referrers/leaderboard`  
**权限**: 🔒 `analytics:view`

**查询参数**:
- `days`: 统计天数
- `limit`: 返回数量（默认20）

**响应**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "referrer": "ref001",
        "total_joins": 500,
        "conversion_rate": 95.0
      }
    ],
    "period": {
      "days": 30,
      "start_date": "2024-12-27",
      "end_date": "2025-01-26"
    }
  }
}
```

---

## 7. 短链接管理

### 7.1 创建短链接

**接口**: `POST /short-urls`  
**权限**: 🔒 `short_urls:create`

**请求体**:
```json
{
  "original_url": "https://example.com/page",
  "referrer": "ref001",
  "business_line_id": 1,
  "join_rule_id": 1,
  "custom_code": "custom123",  // 可选
  "expires_days": 30,  // 可选
  "description": "描述信息"  // 可选
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "short_code": "abc123",
    "short_url": "http://yourdomain.com/s/abc123",
    "original_url": "https://example.com/page",
    "created_at": "2025-01-01T00:00:00Z",
    "expires_at": "2025-01-31T00:00:00Z"
  },
  "message": "短链接创建成功"
}
```

### 7.2 批量创建短链接

**接口**: `POST /short-urls/batch`  
**权限**: 🔒 `short_urls:create`

**请求体**:
```json
{
  "referrer": "ref001",
  "business_line_id": 1,
  "join_rule_ids": [1, 2, 3],
  "expires_days": 30,
  "description_template": "分销员{referrer}的推广链接（规则{rule_id}）"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "short_code": "abc123",
        "short_url": "http://yourdomain.com/s/abc123",
        "rule_id": 1
      }
    ],
    "errors": [],
    "total_requested": 3,
    "total_created": 3,
    "total_errors": 0
  }
}
```

### 7.3 获取短链列表

**接口**: `GET /short-urls`  
**权限**: 🔒 `short_urls:view`

**查询参数**:
- `referrer`: 分销员标识
- `business_line_id`: 业务线ID
- `join_rule_id`: 规则ID
- `is_active`: 是否激活
- `skip`: 跳过数量
- `limit`: 返回数量

### 7.4 获取短链详情

**接口**: `GET /short-urls/{short_code}`  
**权限**: 🔒 `short_urls:view`

**响应**:
```json
{
  "success": true,
  "data": {
    "short_code": "abc123",
    "original_url": "https://example.com",
    "referrer": "ref001",
    "click_count": 100,
    "is_active": true,
    "stats": {
      "total_clicks": 100,
      "unique_visitors": 80,
      "today_clicks": 10
    }
  }
}
```

### 7.5 短链统计

**接口**: `GET /short-urls/{short_code}/stats`  
**权限**: 🔒 `short_urls:view`

**查询参数**:
- `days`: 统计天数（默认30）

**响应**:
```json
{
  "success": true,
  "data": {
    "total_clicks": 100,
    "unique_visitors": 80,
    "click_by_date": {
      "2025-01-01": 10,
      "2025-01-02": 15
    },
    "click_by_hour": {
      "09": 5,
      "10": 8
    },
    "top_referrers": ["ref001", "ref002"]
  }
}
```

### 7.6 短链跳转（公开）

**接口**: `GET /s/{short_code}`  
**权限**: 🔓 公开  
**说明**: 短链跳转，自动重定向到原始URL

---

## 8. 学生认证

### 8.1 学生认证接口（统一认证服务专用）

**接口**: `POST /student/auth`  
**权限**: 🔐 独立Token验证  
**Headers**: `Authorization: Bearer {STUDENT_AUTH_API_TOKEN}`

⚠️ **重要**: 此接口由统一认证服务调用，使用独立Token，不是管理员JWT！

**请求体**:
```json
{
  "unionid": "o8q2_6lFLJuYOXl9wOOtNMpAy_68",
  "student_id": "2104010101",
  "student_name": "张三",
  "student_type": "本科生",
  "grade": "2021级",
  "college": "计算机科学与通信工程学院",
  "class_name": "计科2101",
  "major": "计算机科学与技术"
}
```

**响应**:
```json
{
  "success": true,
  "message": "学生认证成功",
  "remark_updated": true,
  "tags_updated": true,
  "student_profile": {
    "student_id": "2104010101",
    "student_name": "张三",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 8.2 查询学生档案（管理员接口）

**接口**: `GET /student/profile/{student_id}`  
**权限**: 🔒 需要登录

**响应**:
```json
{
  "student_id": "2104010101",
  "student_name": "张三",
  "student_type": "本科生",
  "grade": "2021级",
  "college": "计算机科学与通信工程学院",
  "class_name": "计科2101",
  "major": "计算机科学与技术",
  "status": "在读",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### 8.3 批量查询学生档案

**接口**: `POST /student/profile/batch`  
**权限**: 🔒 需要登录

**请求体**:
```json
["2104010101", "2104010102", "2104010103"]
```

### 8.4 获取标签列表

**接口**: `GET /student/tags/list`  
**权限**: 🔒 需要登录

### 8.5 同步标签

**接口**: `POST /student/tags/sync`  
**权限**: 🔒 `rules:update`

---

## 9. 群聊自动化

### 9.1 智能选择群聊

**接口**: `POST /group-automation/select`  
**权限**: 🔒 `groups:update`

**请求体**:
```json
{
  "join_rule_id": 1,
  "count": 3,
  "exclude_group_ids": ["chat_id_1"]  // 可选
}
```

**响应**:
```json
{
  "success": true,
  "selected_groups": [
    {
      "chat_id": "xxx",
      "name": "群1",
      "score": 95.5,
      "member_count": 150
    }
  ],
  "selection_strategy": "round_robin",
  "total_available": 10
}
```

### 9.2 评估群聊质量

**接口**: `POST /group-automation/evaluate`  
**权限**: 🔒 `groups:view`

**查询参数**:
- `group_chat_id`: 群聊ID
- `join_rule_id`: 规则ID

### 9.3 群聊健康检查

**接口**: `POST /group-automation/health/check`  
**权限**: 🔒 需要登录

**请求体**:
```json
{
  "group_chat_id": "xxx",
  "join_rule_id": 1
}
```

### 9.4 获取健康统计

**接口**: `GET /group-automation/health/statistics`  
**权限**: 🔒 需要登录

**查询参数**:
- `join_rule_id`: 规则ID（可选）
- `days`: 统计天数（默认7）

**响应**:
```json
{
  "success": true,
  "data": {
    "total_groups": 10,
    "healthy_groups": 8,
    "warning_groups": 2,
    "critical_groups": 0,
    "average_health_score": 85.5
  }
}
```

### 9.5 获取接近上限的群聊

**接口**: `GET /group-automation/health/near-limit`  
**权限**: 🔒 需要登录

**查询参数**:
- `business_line_id`: 业务线ID
- `threshold`: 容量阈值（默认0.95）

### 9.6 自动维护所有群聊

**接口**: `POST /group-automation/maintenance/auto`  
**权限**: 🔒 `groups:update`

**响应**:
```json
{
  "success": true,
  "status": "accepted",
  "message": "自动维护任务已启动"
}
```

### 9.7 手动切换群聊

**接口**: `POST /group-automation/maintenance/switch`  
**权限**: 🔒 `groups:update`

**请求体**:
```json
{
  "join_rule_id": 1,
  "target_group_id": "chat_id_2",  // 可选
  "reason": "manual_switch"
}
```

### 9.8 自动化仪表板

**接口**: `GET /group-automation/dashboard`  
**权限**: 🔒 需要登录

**查询参数**:
- `join_rule_id`: 规则ID
- `business_line_id`: 业务线ID

**响应**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_rules": 10,
      "active_rules": 8,
      "total_groups": 50,
      "near_limit_groups": 5
    },
    "health_statistics": {},
    "rules_overview": []
  }
}
```

---

## 10. 健康检查

### 10.1 系统健康检查

**接口**: `GET /health`  
**权限**: 🔓 公开

**响应**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 📝 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "detail": "错误描述信息"
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|-----|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 🔧 前端开发建议

### 1. Axios配置示例

```typescript
// src/api/request.ts
import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 自动添加Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，跳转登录页
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // 权限不足
      console.error('权限不足');
    }
    return Promise.reject(error);
  }
);

export default request;
```

### 2. API调用示例

```typescript
// src/api/auth.ts
import request from './request';

export const authAPI = {
  // 登录
  login(username: string, password: string) {
    return request.post('/auth/login', { username, password });
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/auth/me');
  },
  
  // 刷新Token
  refreshToken() {
    return request.post('/auth/refresh');
  },
};

// src/api/groups.ts
export const groupsAPI = {
  // 获取群列表
  getGroups(params: {
    page?: number;
    page_size?: number;
    business_line_id?: number;
    search?: string;
  }) {
    return request.get('/groups/', { params });
  },
  
  // 获取群详情
  getGroupDetail(chatId: string) {
    return request.get(`/groups/${chatId}`);
  },
  
  // 同步群信息
  syncGroup(chatId: string) {
    return request.post(`/groups/${chatId}/sync`);
  },
};
```

### 3. TypeScript类型定义

```typescript
// src/types/auth.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: {
    id: number;
    username: string;
    role: string;
    is_active: boolean;
  };
  permissions: string[];
}

// src/types/group.ts
export interface Group {
  id: number;
  chat_id: string;
  name: string;
  member_count: number;
  status: string;
  business_line_id: number;
  created_at: string;
}

export interface GroupListResponse {
  success: boolean;
  data: {
    items: Group[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
  };
}
```

---

## 📚 附录

### A. 角色权限对照表

| 角色 | 权限 |
|------|------|
| super_admin | 所有权限 (*) |
| business_admin | 业务线、群聊、规则管理 |
| analyst | 查看权限 + 分析权限 |
| operator | 查看 + 规则更新 + 短链管理 |

### B. 环境变量

```bash
# 后端服务地址
VITE_API_BASE_URL=http://localhost:18023/api/v1

# 生产环境
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

---

**文档版本**: v1.0.0  
**最后更新**: 2025-10-27  
**维护者**: 开发团队

