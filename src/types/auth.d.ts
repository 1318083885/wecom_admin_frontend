// 认证相关类型定义

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string // OAuth2 标准字段名
  token_type: string // OAuth2 标准：通常是 "bearer"
  expires_in: number // OAuth2 标准：过期时间（秒）
  user: UserInfo
}

export interface UserInfo {
  id: number
  username: string
  role: string
  referrer_code: string | null  // 🆕 分销员编号（仅role=referrer时有值）
  business_line_id: number | null
  email: string | null
  permissions: string[]
  is_active?: boolean
  created_at?: string
}

export type UserRole = 'super_admin' | 'business_admin' | 'analyst' | 'operator' | 'referrer'

