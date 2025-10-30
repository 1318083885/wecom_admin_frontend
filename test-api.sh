#!/bin/bash

echo "🧪 测试企业微信管理系统API"
echo ""

# 设置API基础URL
API_BASE="https://wecomdev.ujs1902.com/api/v1"

# 1. 测试登录
echo "1️⃣  测试登录 API..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "$LOGIN_RESPONSE" | jq '.'

# 提取token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // .access_token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo ""
echo "✅ 登录成功，Token: ${TOKEN:0:20}..."
echo ""

# 2. 测试业务线列表
echo "2️⃣  测试业务线列表 API..."
curl -s -X GET "${API_BASE}/admin/business-lines/" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 3. 测试群组列表
echo "3️⃣  测试群组列表 API..."
curl -s -X GET "${API_BASE}/groups/?page=1&page_size=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. 测试群组统计
echo "4️⃣  测试群组统计 API..."
curl -s -X GET "${API_BASE}/groups/stats/overview" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ API测试完成！"
