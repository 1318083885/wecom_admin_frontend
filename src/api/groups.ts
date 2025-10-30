import request from './request'
import type { Group, GroupMember } from '@/types/business'
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 群组管理API
 */
export const groupsAPI = {
  /**
   * 获取群组列表
   */
  async getList(
    params: PaginationParams & {
      business_line_id?: number
      status?: string
      search?: string
    }
  ): Promise<ApiResponse<PaginationResponse<Group>>> {
    // 转换分页参数：page/page_size -> skip/limit
    const { page = 1, page_size = 10, ...otherParams } = params
    const requestParams = {
      skip: (page - 1) * page_size,
      limit: page_size,
      ...otherParams,
    }

    const response: any = await request.get('/groups', { params: requestParams })
    return response
  },

  /**
   * 获取群组详情
   */
  async getDetail(chatId: string): Promise<ApiResponse<Group>> {
    const response: any = await request.get(`/groups/${chatId}`)
    return response
  },

  /**
   * 同步群组信息
   */
  async sync(chatId: string): Promise<ApiResponse> {
    const response: any = await request.post(`/groups/${chatId}/sync`)
    return response
  },

  /**
   * 更新群组
   */
  async update(
    chatId: string, 
    data: { 
      business_line_id?: number | null
      status?: 'active' | 'inactive' | 'archived'
      remark?: string
    }
  ): Promise<ApiResponse<Group>> {
    const response: any = await request.put(`/groups/${chatId}`, data)
    return response
  },

  /**
   * 获取群组成员
   */
  async getMembers(
    chatId: string,
    params: PaginationParams & {
      member_type?: number
      referrer?: string
      search?: string
    }
  ): Promise<ApiResponse<PaginationResponse<GroupMember>>> {
    // 转换分页参数：page/page_size -> skip/limit
    const { page = 1, page_size = 10, ...otherParams } = params
    const requestParams = {
      skip: (page - 1) * page_size,
      limit: page_size,
      ...otherParams,
    }

    const response: any = await request.get(`/groups/${chatId}/members`, { params: requestParams })
    return response
  },

  /**
   * 群组统计概览
   */
  async getOverview(params?: { business_line_id?: number }): Promise<
    ApiResponse<{
      total_groups: number
      total_members: number
      avg_members_per_group: number
      full_groups: number
      near_full_groups: number
      available_groups: number
      utilization_rate: number
    }>
  > {
    const response: any = await request.get('/groups/stats/overview', { params })
    return response
  },
}

