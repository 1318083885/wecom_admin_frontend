import request from './request'
import type { BusinessLine } from '@/types/business'
import type { ApiResponse } from '@/types/api'

/**
 * 业务线管理API
 */
export const businessLinesAPI = {
  /**
   * 获取业务线列表
   */
  async getList(): Promise<ApiResponse<BusinessLine[]>> {
    const response: any = await request.get('/business-lines')
    return response
  },

  /**
   * 获取业务线详情
   */
  async getDetail(id: number): Promise<ApiResponse<BusinessLine>> {
    const response: any = await request.get(`/business-lines/${id}`)
    return response
  },

  /**
   * 创建业务线
   */
  async create(data: Partial<BusinessLine>): Promise<ApiResponse<BusinessLine>> {
    const response: any = await request.post('/business-lines', data)
    return response
  },

  /**
   * 更新业务线
   */
  async update(id: number, data: Partial<BusinessLine>): Promise<ApiResponse<BusinessLine>> {
    const response: any = await request.put(`/business-lines/${id}`, data)
    return response
  },

  /**
   * 删除业务线
   */
  async delete(id: number): Promise<ApiResponse> {
    const response: any = await request.delete(`/business-lines/${id}`)
    return response
  },

  /**
   * 获取业务线下的群聊
   */
  async getGroups(id: number): Promise<ApiResponse<any>> {
    const response: any = await request.get(`/business-lines/${id}/groups`)
    return response
  },

  /**
   * 更新业务线群聊关联 🆕
   */
  async updateGroups(id: number, groupIds: string[]): Promise<ApiResponse<any>> {
    const response: any = await request.put(`/business-lines/${id}/groups`, { group_ids: groupIds })
    return response
  },
}

