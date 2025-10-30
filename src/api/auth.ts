import request from './request'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

/**
 * 认证相关API
 * 注意：所有响应都是 {success: true, data: {...}} 格式
 */
export const authAPI = {
  /**
   * 管理员登录
   */
  async login(data: LoginRequest): Promise<any> {
    const response: any = await request.post('/auth/login', data)
    return response
  },

  /**
   * 获取当前用户信息
   */
  async getUserInfo(): Promise<any> {
    const response: any = await request.get('/auth/me')
    return response
  },

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<any> {
    const response: any = await request.post('/auth/refresh')
    return response
  },

  /**
   * 登出
   */
  async logout(): Promise<any> {
    const response: any = await request.post('/auth/logout')
    return response
  },
}

