# API快速参考 - 前端对接清单

> 📅 更新时间：2025-10-29  
> 🎯 基础URL：`https://wecomdev.ujs1902.com`  
> 🔒 需要Token的接口请在请求头添加：`Authorization: Bearer {access_token}`

---

## 🔐 认证
```
POST   /api/v1/auth/login          登录（公开）
GET    /api/v1/auth/me             获取当前用户
POST   /api/v1/auth/refresh        刷新Token
```

---

## 📊 业务线
```
POST   /api/v1/business-lines/              创建业务线
GET    /api/v1/business-lines/              获取业务线列表
GET    /api/v1/business-lines/{id}          获取业务线详情
PUT    /api/v1/business-lines/{id}          更新业务线
GET    /api/v1/business-lines/{id}/groups   获取业务线下的群聊
PUT    /api/v1/business-lines/{id}/groups   更新业务线群聊关联
```

---

## 👥 群聊管理
```
GET    /api/v1/groups/                       获取群列表
GET    /api/v1/groups/{chat_id}              获取群详情
PUT    /api/v1/groups/{chat_id}              更新群配置 🆕
POST   /api/v1/groups/{chat_id}/sync         同步群信息
GET    /api/v1/groups/{chat_id}/members      获取群成员
GET    /api/v1/groups/{chat_id}/members/statistics  成员统计
GET    /api/v1/groups/members/{member_id}    获取成员详情
POST   /api/v1/groups/{chat_id}/members/sync 同步群成员
GET    /api/v1/groups/stats/overview         群概览统计
GET    /api/v1/groups/stats/business-line    群业务线统计
```

---

## 🤖 群聊自动化
```
POST   /api/v1/group-automation/select                 智能选择群聊
POST   /api/v1/group-automation/evaluate               评估群聊质量
POST   /api/v1/group-automation/health/check           健康检查
POST   /api/v1/group-automation/health/batch-check     批量健康检查
GET    /api/v1/group-automation/health/statistics      健康统计
GET    /api/v1/group-automation/health/near-limit      接近上限的群
GET    /api/v1/group-automation/health/full-groups     已满的群
POST   /api/v1/group-automation/maintenance/auto       自动维护
POST   /api/v1/group-automation/maintenance/switch     手动切换群聊
GET    /api/v1/group-automation/dashboard              仪表板
```

---

## 📋 加群规则
```
POST   /api/v1/join-rules/                  创建规则
GET    /api/v1/join-rules/                  获取规则列表
GET    /api/v1/join-rules/{rule_id}         获取规则详情
PUT    /api/v1/join-rules/{rule_id}         更新规则
DELETE /api/v1/join-rules/{rule_id}         删除规则
GET    /api/v1/join-rules/pool/stats        群池统计
GET    /api/v1/join-rules/{rule_id}/status  规则状态
```

---

## ⚙️ 企微配置
```
POST   /api/v1/join-rule-configs/rule/{rule_id}          创建配置
GET    /api/v1/join-rule-configs/rule/{rule_id}          获取配置
POST   /api/v1/join-rule-configs/rule/{rule_id}/update   更新配置
GET    /api/v1/join-rule-configs/rule/{rule_id}/history  配置历史
POST   /api/v1/join-rule-configs/health-check            健康检查
GET    /api/v1/join-rule-configs/quota/usage             配额使用情况
POST   /api/v1/join-rule-configs/cleanup-orphans         清理孤立配置
```

---

## 🔗 短链接
```
POST   /api/v1/short-urls/                  创建短链接
GET    /api/v1/short-urls/                  获取短链接列表
GET    /api/v1/short-urls/{code}            获取短链接详情
PUT    /api/v1/short-urls/{code}            更新短链接 🆕 支持更新所有字段
DELETE /api/v1/short-urls/{code}            删除短链接
POST   /api/v1/short-urls/batch             批量创建
GET    /api/v1/short-urls/{code}/stats      短链接统计
GET    /s/{code}                             短链接重定向（公开）
```

**短链接更新字段（PUT）**：
- `original_url` - 原始URL
- `referrer` - 分销员标识 🆕
- `business_line_id` - 业务线ID 🆕
- `join_rule_id` - 加群规则ID 🆕
- `is_active` - 是否启用
- `expires_days` - 有效期天数
- `description` - 备注描述

---

## 👤 分销员
```
POST   /api/v1/referrers/           创建分销员（自动生成编号）
GET    /api/v1/referrers/           获取分销员列表（实时统计）✨
GET    /api/v1/referrers/{id}       获取分销员详情（实时统计）✨
PUT    /api/v1/referrers/{id}       更新分销员（仅display_name可改）
DELETE /api/v1/referrers/{id}       删除分销员
POST   /api/v1/referrers/batch      批量创建
```

**分销员响应数据**：
- `referrer` - 唯一编号（不可修改，如 R000001）
- `display_name` - 显示名称（可修改，如 张三）
- `total_scans` - 总点击次数（实时计算）✨
- `total_conversions` - 总转化次数（实时计算）✨
- `conversion_rate` - 转化率（实时计算）✨
- `last_scan_at` - 最后访问时间（实时计算）✨

---

## 📈 数据分析
```
GET    /api/v1/analytics/referrers/overview      分销员概览
GET    /api/v1/analytics/referrers/leaderboard   分销员排行榜
GET    /api/v1/analytics/referrers/comparison    分销员对比
```

**排行榜参数**：
- `period_type` - 时间类型（today/yesterday/recent/custom）
- `days` - 统计天数（period_type=recent时有效）
- `start_date` - 开始日期（period_type=custom时必填）
- `end_date` - 结束日期（period_type=custom时必填）
- `limit` - 返回数量

---

## 🎓 学生认证
```
POST   /api/v1/student/auth              学生认证（统一认证服务专用）
GET    /api/v1/student/profile/{unionid} 获取学生档案
POST   /api/v1/student/profile/batch     批量获取档案
POST   /api/v1/student/tags/sync         同步标签
```

---

## 🔄 统一加群（公开）
```
GET    /api/v1/unified/process              加群流程处理
GET    /api/v1/unified/oauth/callback/*     OAuth回调
GET    /api/v1/unified/status               状态查询
```

---

## 🛠️ 系统管理
```
POST   /api/v1/admin/sync/data                      手动同步
GET    /api/v1/admin/sync/status                    同步状态
POST   /api/v1/admin/sync/full-sync-from-wecom      完全同步
GET    /api/v1/admin/export/external-groups         导出外部群
GET    /api/v1/admin/export/group-members/{chat_id} 导出群成员
```

---

## 🏥 健康检查（公开）
```
GET    /api/v1/health                    健康检查
```

---

## 📱 企业微信（公开回调）
```
GET    /api/v1/wecom/callback            企微回调验证
POST   /api/v1/wecom/callback            企微事件处理
GET    /api/v1/wecom/qr-code/{state}     生成二维码
```

---

## 🎯 前端开发注意事项

### 1. 统一响应格式
```javascript
// 成功响应
{
  success: true,
  data: {...} 或 {items: [...], total: 100},
  message: "操作成功"
}

// 失败响应
{
  detail: "错误信息"
}
```

### 2. 列表数据结构
```javascript
{
  success: true,
  data: {
    items: [...],      // 数据列表
    total: 100,        // 总数
    page: 1,           // 当前页
    page_size: 20      // 每页大小
  }
}
```

### 3. 权限控制
- 所有需要鉴权的接口都需要在请求头添加 Token
- 根据用户角色显示/隐藏功能按钮
- 接口返回 401 时跳转到登录页

### 4. 错误处理
```javascript
// 统一错误处理
if (response.status === 401) {
  // 跳转登录
} else if (response.status === 403) {
  // 权限不足提示
} else if (!response.data.success) {
  // 显示错误信息
  message.error(response.data.message || response.data.detail)
}
```

### 5. 分销员实时统计
- 列表和详情接口返回的统计数据都是**实时计算**的
- 不需要额外调用统计接口
- 数据包括：total_scans（点击数）、total_conversions（转化数）、conversion_rate（转化率）、last_scan_at（最后访问时间）

---

## 🔥 最新变更（2025-10-29）

### 新增功能
- ✅ 群聊更新接口：`PUT /api/v1/groups/{chat_id}`
- ✅ 短链接支持更新 referrer、business_line_id、join_rule_id
- ✅ 分销员列表/详情返回实时统计数据
- ✅ 业务线独立路由：`/api/v1/business-lines/`（从 /admin 移出）

### 路由优化
- ✅ 统一为 RESTful 资源导向设计
- ✅ 修复 unified_join 重复注册问题
- ✅ 业务线接口独立为 /business-lines（不再在 /admin 下）

### 数据优化
- ✅ 清理了 21 个无用的短链接
- ✅ 分销员统计数据改为实时计算

---

## 📞 技术支持

- 📖 完整文档：[API_COMPLETE_REFERENCE.md](./API_COMPLETE_REFERENCE.md)
- 📝 响应标准：[API_RESPONSE_STANDARDS.md](./API_RESPONSE_STANDARDS.md)
- 📋 变更日志：[API_CHANGELOG.md](./API_CHANGELOG.md)
- 🔗 在线文档：https://wecomdev.ujs1902.com/docs

**遇到问题请联系后端开发团队！** 🚀

