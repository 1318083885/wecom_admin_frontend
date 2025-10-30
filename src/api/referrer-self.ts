import request from './request'
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types/api'

/**
 * 分销员自助数据类型
 */
export interface ReferrerSelfInfo {
  id: number
  referrer: string
  display_name: string
  business_line_id: number
  config_strategy: string
  is_active: boolean
  total_scans: number
  total_conversions: number
  conversion_rate: number
  last_scan_at: string | null
  created_at: string
}

export interface ReferrerAnalytics {
  referrer_code: string
  period_days: number
  start_date: string
  end_date: string
  total_links: number
  active_links: number
  total_scans: number
  total_conversions: number
  conversion_rate: number
}

export interface ReferrerShortUrl {
  short_code: string
  original_url: string
  short_url: string
  referrer: string
  business_line_id: number
  is_active: boolean
  access_count: number
  description: string
  created_at: string
  expires_at: string | null
}

export interface ReferrerUrlStats {
  referrer_code: string
  period_days: number
  start_date: string
  end_date: string
  total_links: number
  links: Array<{
    short_code: string
    short_url: string
    description: string
    is_active: boolean
    scans: number
    conversions: number
    conversion_rate: number
    created_at: string
  }>
}

/**
 * 分销员自助API
 * 权限要求：referrer 角色
 * 数据隔离：只能看自己的数据
 */
export const referrerSelfAPI = {
  /**
   * 查看我的信息
   */
  async getMyInfo(): Promise<ApiResponse<ReferrerSelfInfo>> {
    const response: any = await request.get('/me/referrer')
    return response
  },

  /**
   * 查看我的数据分析
   */
  async getMyAnalytics(days: number = 30): Promise<ApiResponse<ReferrerAnalytics>> {
    const response: any = await request.get('/me/referrer/analytics', {
      params: { days }
    })
    return response
  },

  /**
   * 查看我的短链接
   */
  async getMyShortUrls(params?: {
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<ApiResponse<PaginationResponse<ReferrerShortUrl>>> {
    const response: any = await request.get('/me/referrer/short-urls', { params })
    return response
  },

  /**
   * 查看我的链接统计
   */
  async getMyUrlStats(days: number = 7): Promise<ApiResponse<ReferrerUrlStats>> {
    const response: any = await request.get('/me/referrer/short-urls/stats', {
      params: { days }
    })
    return response
  },
}

