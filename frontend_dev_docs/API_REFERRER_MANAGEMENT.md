# 分销员管理 API 文档

## 📋 目录
- [概述](#概述)
- [认证](#认证)
- [基础接口](#基础接口)
  - [获取分销员列表](#1-获取分销员列表)
  - [获取分销员详情](#2-获取分销员详情)
  - [创建分销员](#3-创建分销员)
  - [更新分销员](#4-更新分销员)
  - [删除分销员](#5-删除分销员)
  - [批量创建分销员](#6-批量创建分销员)
- [统计分析接口](#统计分析接口)
- [数据模型](#数据模型)
- [错误码](#错误码)

---

## 概述

### 核心概念
- **分销员（Referrer）**：外部推广人员的标识
- **编号（referrer）**：系统自动生成的唯一标识符（如 R000001），**永不可变**
- **显示名称（display_name）**：可读的名称（如"张三"），**可修改**

### 业务流程
```
1. 创建分销员
   → 后端自动生成唯一编号（R000001）
   → 前端只需提供显示名称

2. 生成推广链接
   → POST /api/v1/short-urls
   → 指定 referrer 参数

3. 追踪统计
   → GET /api/v1/analytics/referrers/{referrer}/overview
```

### Base URL
```
开发环境: https://wecomdev.ujs1902.com/api/v1
生产环境: https://wecom.ujs1902.com/api/v1
```

---

## 认证

所有接口都需要 JWT Token 认证：

```http
Authorization: Bearer {token}
```

### 获取 Token
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

---

## 基础接口

### 1. 获取分销员列表

**接口**: `GET /referrers`

**权限**: `referrers:view`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| business_line_id | integer | 否 | 业务线ID筛选 | 1 |
| referrer | string | 否 | 分销员编号搜索（模糊匹配） | R000001 |
| config_strategy | string | 否 | 配置策略（shared/independent） | shared |
| is_active | boolean | 否 | 启用状态 | true |
| skip | integer | 否 | 跳过记录数（分页） | 0 |
| limit | integer | 否 | 返回记录数（分页，最大100） | 20 |

**请求示例**：
```bash
GET /referrers?business_line_id=1&skip=0&limit=20
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "referrer": "R000001",
        "display_name": "张三",
        "business_line_id": 1,
        "config_strategy": "SHARED",
        "priority": 100,
        "is_active": true,
        "total_scans": 150,
        "total_conversions": 45,
        "conversion_rate": 0.3,
        "last_scan_at": "2025-10-29T12:00:00",
        "created_at": "2025-10-01T10:00:00",
        "updated_at": "2025-10-29T12:00:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 20
  },
  "message": "获取分销员列表成功"
}
```

---

### 2. 获取分销员详情

**接口**: `GET /referrers/{id}`

**权限**: `referrers:view`

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 分销员配置ID |

**请求示例**：
```bash
GET /referrers/1
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "referrer": "R000001",
    "display_name": "张三",
    "business_line_id": 1,
    "config_strategy": "SHARED",
    "shared_qr_config_id": null,
    "independent_qr_config_id": null,
    "target_groups": null,
    "priority": 100,
    "is_active": true,
    "total_scans": 150,
    "total_conversions": 45,
    "conversion_rate": 0.3,
    "last_scan_at": "2025-10-29T12:00:00",
    "config_options": null,
    "remark": "重点分销员",
    "join_rule_id": null,
    "created_at": "2025-10-01T10:00:00",
    "updated_at": "2025-10-29T12:00:00"
  },
  "message": "获取分销员详情成功"
}
```

---

### 3. 创建分销员

**接口**: `POST /referrers`

**权限**: `referrers:create`

**重要说明**：
- ✅ 分销员编号（referrer）由**后端自动生成**（格式：R000001）
- ✅ 前端**只需提供**显示名称（display_name）
- ✅ 编号全局唯一，永不可变

**请求体**：

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| display_name | string | 是 | 分销员显示名称 | - |
| business_line_id | integer | 是 | 业务线ID | - |
| config_strategy | string | 否 | 配置策略（shared/independent） | shared |
| priority | integer | 否 | 优先级（数字越小优先级越高） | 100 |
| remark | string | 否 | 备注说明 | - |

**请求示例**：
```bash
POST /referrers
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_name": "张三",
  "business_line_id": 1,
  "priority": 100,
  "remark": "重点分销员"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "referrer": "R000001",
    "display_name": "张三",
    "business_line_id": 1,
    "config_strategy": "SHARED",
    "target_groups": null,
    "priority": 100,
    "is_active": true,
    "created_at": "2025-10-29T12:00:00"
  },
  "message": "分销员 张三（R000001）创建成功"
}
```

---

### 4. 更新分销员

**接口**: `PUT /referrers/{id}`

**权限**: `referrers:update`

**重要说明**：
- ✅ 可以修改：display_name、priority、is_active、remark 等
- ❌ **不能修改**：referrer 编号（系统会忽略此字段）

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 分销员配置ID |

**请求体**（所有字段都是可选的）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| display_name | string | 否 | 分销员显示名称 |
| priority | integer | 否 | 优先级 |
| is_active | boolean | 否 | 是否启用 |
| remark | string | 否 | 备注说明 |

**请求示例**：
```bash
PUT /referrers/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_name": "李四",
  "priority": 50,
  "remark": "已更新备注"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "referrer": "R000001",
    "display_name": "李四",
    "business_line_id": 1,
    "config_strategy": "SHARED",
    "target_groups": null,
    "priority": 50,
    "is_active": true,
    "join_rule_id": null,
    "updated_at": "2025-10-29T12:30:00"
  },
  "message": "分销员配置更新成功"
}
```

---

### 5. 删除分销员

**接口**: `DELETE /referrers/{id}`

**权限**: `referrers:delete`

**重要说明**：
- 这是**软删除**（设置 is_active=false）
- 历史数据不受影响
- 可以通过更新接口重新启用

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 分销员配置ID |

**请求示例**：
```bash
DELETE /referrers/1
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "message": "分销员配置删除成功"
}
```

---

### 6. 批量创建分销员

**接口**: `POST /referrers/batch`

**权限**: `referrers:create`

**重要说明**：
- 系统为每个分销员自动生成唯一编号
- 提供显示名称列表即可

**请求体**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| display_names | array[string] | 是 | 分销员显示名称列表 |
| business_line_id | integer | 是 | 业务线ID |
| config_strategy | string | 否 | 配置策略 |

**请求示例**：
```bash
POST /referrers/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "display_names": ["王五", "赵六", "孙七"],
  "business_line_id": 1,
  "config_strategy": "shared"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "total": 3,
    "success_count": 3,
    "failed_count": 0,
    "details": {
      "success": [
        {
          "referrer": "R000002",
          "display_name": "王五",
          "config_id": 2
        },
        {
          "referrer": "R000003",
          "display_name": "赵六",
          "config_id": 3
        },
        {
          "referrer": "R000004",
          "display_name": "孙七",
          "config_id": 4
        }
      ],
      "failed": []
    }
  },
  "message": "批量创建完成：成功 3 个，失败 0 个"
}
```

---

## 统计分析接口

### 获取分销员概览

**接口**: `GET /analytics/referrers/{referrer}/overview`

**权限**: `analytics:view`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| days | integer | 否 | 统计天数 | 30 |

**请求示例**：
```bash
GET /analytics/referrers/R000001/overview?days=30
Authorization: Bearer {token}
```

### 获取分销员排行榜

**接口**: `GET /analytics/referrers/leaderboard`

**权限**: `analytics:view`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| period_type | string | 否 | 时间类型（today/yesterday/recent/custom） | recent |
| days | integer | 否 | 统计天数（recent时有效） | 30 |
| start_date | string | 否 | 开始日期（custom时必填，格式：YYYY-MM-DD） | - |
| end_date | string | 否 | 结束日期（custom时必填，格式：YYYY-MM-DD） | - |
| limit | integer | 否 | 返回数量 | 20 |

**请求示例**：
```bash
# 今天的排行榜
GET /analytics/referrers/leaderboard?period_type=today&limit=10

# 自定义时间范围
GET /analytics/referrers/leaderboard?period_type=custom&start_date=2025-10-01&end_date=2025-10-31
```

---

## 数据模型

### ReferrerConfig（分销员配置）

```typescript
interface ReferrerConfig {
  id: number;                    // 配置ID
  referrer: string;              // 分销员编号（如 R000001，唯一，不可变）
  display_name: string;          // 显示名称（如"张三"，可修改）
  business_line_id: number;      // 业务线ID
  config_strategy: "SHARED" | "INDEPENDENT";  // 配置策略
  priority: number;              // 优先级（数字越小优先级越高）
  is_active: boolean;            // 是否启用
  total_scans: number;           // 总扫码次数
  total_conversions: number;     // 总转化次数
  conversion_rate: number;       // 转化率
  last_scan_at: string | null;  // 最后扫码时间
  remark: string | null;         // 备注说明
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```

---

## 错误码

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（如分销员已存在） |
| 500 | 服务器错误 |

### 统一响应格式

**成功响应**：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**：
```json
{
  "detail": "错误详细信息"
}
```

---

## 前端集成示例

### Vue 3 + TypeScript

```typescript
import axios from 'axios';

const API_BASE = 'https://wecomdev.ujs1902.com/api/v1';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器（自动携带 token）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 接口类型定义
interface ReferrerConfig {
  id: number;
  referrer: string;
  display_name: string;
  business_line_id: number;
  priority: number;
  is_active: boolean;
  total_scans: number;
  total_conversions: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

interface ReferrerListResponse {
  success: boolean;
  data: {
    items: ReferrerConfig[];
    total: number;
    page: number;
    page_size: number;
  };
  message: string;
}

// API 方法
class ReferrerAPI {
  // 获取分销员列表
  static async getList(params: {
    business_line_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<ReferrerListResponse> {
    const { data } = await api.get('/referrers', { params });
    return data;
  }

  // 创建分销员
  static async create(data: {
    display_name: string;
    business_line_id: number;
    priority?: number;
    remark?: string;
  }) {
    const response = await api.post('/referrers', data);
    return response.data;
  }

  // 更新分销员
  static async update(id: number, data: {
    display_name?: string;
    priority?: number;
    is_active?: boolean;
    remark?: string;
  }) {
    const response = await api.put(`/referrers/${id}`, data);
    return response.data;
  }

  // 删除分销员
  static async delete(id: number) {
    const response = await api.delete(`/referrers/${id}`);
    return response.data;
  }

  // 批量创建
  static async batchCreate(data: {
    display_names: string[];
    business_line_id: number;
  }) {
    const response = await api.post('/referrers/batch', data);
    return response.data;
  }
}

// 使用示例
async function example() {
  try {
    // 获取列表
    const list = await ReferrerAPI.getList({
      business_line_id: 1,
      skip: 0,
      limit: 20
    });
    console.log('分销员列表:', list.data.items);

    // 创建分销员
    const newReferrer = await ReferrerAPI.create({
      display_name: '张三',
      business_line_id: 1,
      priority: 100,
      remark: '重点分销员'
    });
    console.log('创建成功:', newReferrer.data.referrer);

    // 更新分销员
    await ReferrerAPI.update(1, {
      display_name: '李四'
    });

  } catch (error) {
    console.error('API调用失败:', error);
  }
}
```

---

## 注意事项

### 1. 编号不可变性
- ✅ `referrer` 编号由后端自动生成，**永不可变**
- ✅ 修改 `display_name` 不影响历史数据
- ✅ 短链接和统计都基于 `referrer` 编号

### 2. 权限控制
不同角色的权限：

| 角色 | 查看 | 创建 | 更新 | 删除 |
|------|------|------|------|------|
| super_admin | ✅ | ✅ | ✅ | ✅ |
| business_admin | ✅ | ✅ | ✅ | ✅ |
| analyst | ✅ | ❌ | ❌ | ❌ |
| operator | ✅ | ✅ | ❌ | ❌ |

### 3. 数据完整性
- 删除是软删除，历史数据保留
- 编号全局唯一（数据库约束）
- 统计数据实时更新

### 4. 推荐流程
```
1. 创建分销员
   → 记录返回的 referrer 编号（如 R000001）

2. 生成推广短链
   → POST /api/v1/short-urls
   → 参数中指定 referrer: "R000001"

3. 查看统计
   → GET /api/v1/analytics/referrers/R000001/overview
```

---

## 更新日志

### v1.0.0 (2025-10-29)
- ✅ 实现分销员 CRUD 接口
- ✅ 编号自动生成功能
- ✅ 数据库唯一约束
- ✅ display_name 可修改
- ✅ referrer 编号不可变

---

## 联系支持

如有问题请联系后端开发团队。

