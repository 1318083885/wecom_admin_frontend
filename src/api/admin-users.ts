import request from './request'
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 管理员用户数据类型
 */
export interface AdminUser {
  id: number
  uuid: string
  username: string
  role: 'super_admin' | 'business_admin' | 'analyst' | 'operator' | 'referrer'
  referrer_code: string | null
  business_line_id: number | null
  email: string | null
  phone: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/**
 * 创建用户请求
 */
export interface CreateAdminUserRequest {
  username: string
  password: string
  role: 'super_admin' | 'business_admin' | 'analyst' | 'operator' | 'referrer'
  referrer_code?: string | null  // role=referrer时必填
  business_line_id?: number | null
  email?: string
  phone?: string
}

/**
 * 更新用户请求
 */
export interface UpdateAdminUserRequest {
  username?: string
  role?: 'super_admin' | 'business_admin' | 'analyst' | 'operator' | 'referrer'
  referrer_code?: string | null
  business_line_id?: number | null
  email?: string
  phone?: string
  is_active?: boolean
}

/**
 * 管理员管理API
 */
export const adminUsersAPI = {
  /**
   * 创建管理员/分销员账号
   */
  async create(data: CreateAdminUserRequest): Promise<ApiResponse<AdminUser>> {
    const response: any = await request.post('/admin/users', data)
    return response
  },

  /**
   * 获取用户列表
   */
  async getList(params?: {
    role?: string
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<ApiResponse<PaginationResponse<AdminUser>>> {
    const response: any = await request.get('/admin/users', { params })
    return response
  },

  /**
   * 获取用户详情
   */
  async getDetail(userId: number): Promise<ApiResponse<AdminUser>> {
    const response: any = await request.get(`/admin/users/${userId}`)
    return response
  },

  /**
   * 更新用户信息
   */
  async update(userId: number, data: UpdateAdminUserRequest): Promise<ApiResponse<AdminUser>> {
    const response: any = await request.put(`/admin/users/${userId}`, data)
    return response
  },

  /**
   * 删除/禁用用户
   */
  async delete(userId: number): Promise<ApiResponse> {
    const response: any = await request.delete(`/admin/users/${userId}`)
    return response
  },

  /**
   * 重置用户密码
   */
  async resetPassword(userId: number, newPassword: string): Promise<ApiResponse> {
    const response: any = await request.post(`/admin/users/${userId}/reset-password`, {
      new_password: newPassword
    })
    return response
  },

  /**
   * 修改密码（自己或超管）- 旧接口（已废弃）
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const response: any = await request.post(`/admin/users/${userId}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    })
    return response
  },

  /**
   * 修改自己的密码（所有用户可用）✅
   */
  async changeMyPassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const response: any = await request.post('/admin/users/me/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    })
    return response
  },
}

