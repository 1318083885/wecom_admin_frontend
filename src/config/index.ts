/**
 * 系统配置
 * 需要切换后端环境？修改根目录的 .env.development 或 .env.production 文件
 */

// 🔧 后端API地址配置（从环境变量读取）
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 其他配置
export const config = {
  // API配置
  apiTimeout: 30000,
  
  // 分页配置
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
  
  // Token存储key
  tokenKey: 'wecom_admin_access_token',
}

