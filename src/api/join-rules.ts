import request from './request'
import type { JoinRule } from '@/types/business'
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 加群规则API
 */
export const joinRulesAPI = {
  /**
   * 获取规则列表
   */
  async getList(
    params: PaginationParams & {
      business_line_id?: number
      is_active?: boolean
    }
  ): Promise<ApiResponse<PaginationResponse<JoinRule>>> {
    const response: any = await request.get('/join-rules', { params })
    return response
  },

  /**
   * 获取规则详情
   */
  async getDetail(id: number): Promise<ApiResponse<JoinRule>> {
    const response: any = await request.get(`/join-rules/${id}`)
    return response
  },

  /**
   * 创建规则
   */
  async create(data: Partial<JoinRule>): Promise<ApiResponse<JoinRule>> {
    const response: any = await request.post('/join-rules', data)
    return response
  },

  /**
   * 更新规则
   */
  async update(id: number, data: Partial<JoinRule>): Promise<ApiResponse<JoinRule>> {
    const response: any = await request.put(`/join-rules/${id}`, data)
    return response
  },

  /**
   * 删除规则
   */
  async delete(id: number): Promise<ApiResponse> {
    const response: any = await request.delete(`/join-rules/${id}`)
    return response
  },

  /**
   * 获取群池统计
   */
  async getPoolStats(id: number): Promise<
    ApiResponse<{
      total_groups: number
      active_groups: number
      full_groups: number
      average_capacity: number
      health_score: number
    }>
  > {
    const response: any = await request.get(`/join-rules/${id}/pool-stats`)
    return response
  },
}

