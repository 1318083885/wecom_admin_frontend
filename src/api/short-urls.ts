import request from './request'
import type { ShortUrl } from '@/types/business'
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 短链接管理API
 */
export const shortUrlsAPI = {
  /**
   * 创建短链接
   */
  create(data: {
    original_url?: string
    referrer: string
    business_line_id?: number
    join_rule_id?: number
    custom_code?: string
    expires_days?: number
    description?: string
  }): Promise<
    ApiResponse<{
      short_code: string
      short_url: string
      original_url: string
      created_at: string
      expires_at?: string
    }>
  > {
    return request.post('/short-urls', data)
  },

  /**
   * 更新短链接
   */
  update(
    shortCode: string,
    data: {
      referrer?: string
      business_line_id?: number
      join_rule_id?: number
      description?: string
      is_active?: boolean
      expires_at?: string
    }
  ): Promise<ApiResponse<ShortUrl>> {
    return request.put(`/short-urls/${shortCode}`, data)
  },

  /**
   * 批量创建短链接
   */
  batchCreate(data: {
    referrer: string
    business_line_id: number
    join_rule_ids: number[]
    expires_days?: number
    description_template?: string
  }): Promise<
    ApiResponse<{
      created: Array<{
        short_code: string
        short_url: string
        rule_id: number
      }>
      errors: any[]
      total_requested: number
      total_created: number
      total_errors: number
    }>
  > {
    return request.post('/short-urls/batch', data)
  },

  /**
   * 获取短链接列表
   */
  getList(
    params: PaginationParams & {
      referrer?: string
      business_line_id?: number
      join_rule_id?: number
      is_active?: boolean
    }
  ): Promise<ApiResponse<PaginationResponse<ShortUrl>>> {
    // 后端使用 skip/limit，需要从 page/page_size 转换
    const { page = 1, page_size = 20, ...otherParams } = params
    const queryParams = {
      ...otherParams,
      skip: (page - 1) * page_size,
      limit: page_size,
    }
    console.log('📊 短链接列表请求参数:', queryParams)
    return request.get('/short-urls', { params: queryParams })
  },

  /**
   * 获取短链接详情
   */
  getDetail(shortCode: string): Promise<
    ApiResponse<
      ShortUrl & {
        stats: {
          total_clicks: number
          unique_visitors: number
          today_clicks: number
        }
      }
    >
  > {
    return request.get(`/short-urls/${shortCode}`)
  },

  /**
   * 获取短链接统计
   */
  getStats(
    shortCode: string,
    params?: { days?: number }
  ): Promise<
    ApiResponse<{
      total_clicks: number
      unique_visitors: number
      click_by_date: Record<string, number>
      click_by_hour: Record<string, number>
      top_referrers: string[]
    }>
  > {
    return request.get(`/short-urls/${shortCode}/stats`, { params })
  },


  /**
   * 删除短链接
   */
  delete(shortCode: string): Promise<ApiResponse> {
    return request.delete(`/short-urls/${shortCode}`)
  },
}

