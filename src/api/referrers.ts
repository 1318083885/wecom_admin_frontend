import request from './request'
import type {
  ReferrerConfig,
  CreateReferrerRequest,
  UpdateReferrerRequest,
  BatchCreateReferrerRequest,
  BatchCreateReferrerResponse,
} from '@/types/referrer'
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 未绑定账号的分销员
 */
export interface UnboundReferrer extends ReferrerConfig {
  account_status: string
  can_create_account: boolean
}

/**
 * 分销员管理API
 */
export const referrersAPI = {
  /**
   * 获取未绑定账号的分销员列表 🆕
   */
  getUnboundList(
    params?: {
      business_line_id?: number
      is_active?: boolean
      skip?: number
      limit?: number
    }
  ): Promise<ApiResponse<{
    items: UnboundReferrer[]
    total: number
    total_bound: number
    total_unbound: number
    page: number
    page_size: number
  }>> {
    console.log('📊 获取未绑定分销员列表:', params)
    return request.get('/referrers/unbound/list', { params })
  },

  /**
   * 获取分销员列表
   */
  getList(
    params: PaginationParams & {
      business_line_id?: number
      referrer?: string
      config_strategy?: string
      is_active?: boolean
      order_by?: string
      order_direction?: string
    }
  ): Promise<ApiResponse<PaginationResponse<ReferrerConfig>>> {
    // 后端使用 skip/limit，需要从 page/page_size 转换
    const { page = 1, page_size = 20, ...otherParams } = params
    const queryParams = {
      ...otherParams,
      skip: (page - 1) * page_size,
      limit: page_size,
    }
    console.log('📊 分销员列表请求参数（包含排序）:', queryParams)
    console.log('  - order_by:', queryParams.order_by)
    console.log('  - order_direction:', queryParams.order_direction)
    return request.get('/referrers', { params: queryParams })
  },

  /**
   * 获取分销员详情
   */
  getDetail(id: number): Promise<ApiResponse<ReferrerConfig>> {
    console.log('📊 获取分销员详情:', id)
    return request.get(`/referrers/${id}`)
  },

  /**
   * 创建分销员
   */
  create(data: CreateReferrerRequest): Promise<ApiResponse<ReferrerConfig>> {
    console.log('📊 创建分销员:', data)
    return request.post('/referrers', data)
  },

  /**
   * 更新分销员
   */
  update(id: number, data: UpdateReferrerRequest): Promise<ApiResponse<ReferrerConfig>> {
    console.log('📊 更新分销员:', id, data)
    return request.put(`/referrers/${id}`, data)
  },

  /**
   * 删除分销员（软删除）
   */
  delete(id: number): Promise<ApiResponse<{ id: number }>> {
    console.log('📊 删除分销员:', id)
    return request.delete(`/referrers/${id}`)
  },

  /**
   * 批量创建分销员
   */
  batchCreate(
    data: BatchCreateReferrerRequest
  ): Promise<ApiResponse<BatchCreateReferrerResponse>> {
    console.log('📊 批量创建分销员:', data)
    return request.post('/referrers/batch', data)
  },
}

