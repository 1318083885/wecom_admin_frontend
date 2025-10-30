# 前端对接迁移指南 🚀

> 📅 生效时间：2025-10-29  
> ⏱️ 预计工作量：30分钟  
> 🎯 影响范围：2处必改 + 3处可选

---

## ⚠️ 必须修改的地方（2处）

### 1. 登录Token字段名 ⚠️ **必改**

```javascript
// ❌ 旧代码
const loginResponse = await api.post('/api/v1/auth/login', credentials)
const token = loginResponse.data.token  // ← 字段名变了！

// ✅ 新代码
const loginResponse = await api.post('/api/v1/auth/login', credentials)
const token = loginResponse.data.access_token  // ← 改为 access_token
```

**影响文件**：
- `src/store/auth.js` 或 `src/store/user.ts`
- 所有处理登录响应的地方

**新响应格式**：
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",    // ← 新字段名
    "token_type": "bearer",      // ← 新增
    "expires_in": 1800,          // ← 新增（秒）
    "user": {...}
  }
}
```

---

### 2. 业务线接口路径 ⚠️ **必改**

```javascript
// ❌ 旧路径
const response = await api.get('/api/v1/admin/business-lines/')

// ✅ 新路径
const response = await api.get('/api/v1/business-lines/')
```

**需要替换的路径**：
```javascript
// 查找替换：
/api/v1/admin/business-lines/           → /api/v1/business-lines/
/api/v1/admin/business-lines/{id}       → /api/v1/business-lines/{id}
/api/v1/admin/business-lines/{id}/groups → /api/v1/business-lines/{id}/groups
```

**影响文件**：
- 业务线管理相关的所有组件
- API 请求配置文件

---

## ✨ 可选的新功能（3处）

### 3. 群聊更新功能 🆕 **可选**

```javascript
// 新增功能：更新群聊配置
const updateGroup = async (chatId, updates) => {
  return await api.put(`/api/v1/groups/${chatId}`, updates)
}

// 使用示例
await updateGroup('wrkvAABBCC', {
  business_line_id: 2,      // 更改业务线
  status: 'active',         // 更新状态
  remark: '重要客户群'      // 添加备注
})
```

**用途**：
- 调整群聊的业务线归属
- 修改群聊状态（启用/禁用/归档）
- 添加备注信息

---

### 4. 短链接更新增强 🆕 **可选**

```javascript
// 增强功能：现在可以更新更多字段
const updateShortUrl = async (shortCode, updates) => {
  return await api.put(`/api/v1/short-urls/${shortCode}`, updates)
}

// 使用示例
await updateShortUrl('abc123', {
  referrer: 'B0002',           // 🆕 更改分销员
  business_line_id: 2,          // 🆕 更改业务线
  join_rule_id: 15,             // 🆕 更改规则
  description: '更新描述',
  is_active: true
})
```

**新增可更新字段**：
- `referrer` - 分销员标识
- `business_line_id` - 业务线ID
- `join_rule_id` - 加群规则ID

---

### 5. 分销员实时统计 ✨ **可选优化**

```javascript
// 之前：需要额外请求统计数据
const referrers = await api.get('/api/v1/referrers/')
const stats = await api.get('/api/v1/analytics/referrers/overview')  // ← 不再需要！

// 现在：列表接口直接包含实时统计
const response = await api.get('/api/v1/referrers/')
const referrers = response.data.items

// 直接使用统计数据：
referrers.forEach(r => {
  console.log(`${r.display_name}: ${r.total_scans}次点击`)  // ← 实时数据！
})
```

**响应数据示例**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "referrer": "B0001",
        "display_name": "张三",
        "total_scans": 115,           // ✨ 实时统计
        "total_conversions": 115,      // ✨ 实时统计
        "conversion_rate": 1.0,        // ✨ 实时统计
        "last_scan_at": "2025-10-29"  // ✨ 实时统计
      }
    ]
  }
}
```

**性能提升**：
- ✅ 减少1次API请求
- ✅ 数据实时准确
- ✅ 减少前端计算

---

## 🔍 快速检查清单

前端开发完成后，请检查以下内容：

### ✅ 认证相关
- [ ] 登录后获取的是 `response.data.access_token`
- [ ] 请求头使用 `Authorization: Bearer {access_token}`
- [ ] Token 过期处理正常（401 → 跳转登录）

### ✅ 业务线相关
- [ ] 列表接口改为 `/api/v1/business-lines/`
- [ ] 详情接口改为 `/api/v1/business-lines/{id}`
- [ ] 群聊关联接口改为 `/api/v1/business-lines/{id}/groups`

### ✅ 可选新功能
- [ ] 群聊更新功能是否需要集成
- [ ] 短链接更新是否需要增强字段
- [ ] 分销员统计是否使用实时数据

---

## 📚 参考文档

### 必看文档：
1. **API快速参考** - `docs/API_QUICK_REFERENCE.md`
   - 所有接口的简洁清单
   - 请求参数和响应格式
   - 前端开发注意事项

2. **最终测试报告** - `docs/API_REFACTORING_FINAL_REPORT.md`
   - 完整的变更说明
   - 测试验证结果
   - 详细的对照表

### 详细文档：
3. **API完整参考** - `docs/API_COMPLETE_REFERENCE.md`
   - 所有接口的详细文档
   - 权限说明
   - 完整示例

4. **在线文档** - https://wecomdev.ujs1902.com/docs
   - Swagger UI 交互式文档
   - 可以直接测试接口

---

## 💡 开发建议

### 推荐开发顺序：

1. **先改必改项** (30分钟)
   - ✅ 修改登录Token字段名
   - ✅ 修改业务线接口路径
   - ✅ 测试登录和业务线功能

2. **再集成新功能** (按需)
   - ✅ 群聊更新功能
   - ✅ 短链接增强更新
   - ✅ 分销员实时统计

3. **最后优化体验** (可选)
   - ✅ 优化 Token 过期提示
   - ✅ 统一错误处理
   - ✅ 添加加载状态

---

## 🆘 遇到问题？

### 常见问题：

**Q1: 修改后登录失败？**
```javascript
// 检查是否正确获取 access_token
console.log('Login response:', response.data)
// 应该看到: { access_token: "eyJ...", token_type: "bearer", ... }
```

**Q2: 业务线接口404？**
```javascript
// 确认路径是否正确
// ❌ 错误：/api/v1/admin/business-lines/
// ✅ 正确：/api/v1/business-lines/
```

**Q3: 其他接口都正常？**
```javascript
// 是的！只有业务线路径变了，其他接口完全不变
// ✅ /api/v1/groups/
// ✅ /api/v1/join-rules/
// ✅ /api/v1/short-urls/
// ✅ /api/v1/referrers/
```

---

## 📞 联系方式

- 📖 技术文档：`docs/` 目录
- 🌐 在线文档：https://wecomdev.ujs1902.com/docs
- 💬 技术支持：后端开发团队

---

**迁移很简单，只需要改2个地方！加油！** 💪

