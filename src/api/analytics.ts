import request from './request'
import type { ReferrerStats } from '@/types/business'
import type { ApiResponse } from '@/types/api'

/**
 * 数据分析API
 * 注意：所有路径都需要 /analytics 前缀
 */
export const analyticsAPI = {
  /**
   * 获取分销员概览数据
   */
  async getReferrerOverview(
    referrer: string,
    params?: { days?: number }
  ): Promise<
    ApiResponse<{
      referrer: string
      total_invites: number
      total_joins: number
      conversion_rate: number
      daily_stats: Array<{
        date: string
        invites: number
        joins: number
      }>
      top_groups: Array<{
        group_name: string
        member_count: number
      }>
    }>
  > {
    const response: any = await request.get(`/analytics/referrers/${referrer}/overview`, { params })
    return response
  },

  /**
   * 分销员对比分析
   */
  async compareReferrers(params: {
    referrers: string[]
    days?: number
  }): Promise<
    ApiResponse<
      Array<{
        referrer: string
        total_invites: number
        total_joins: number
        conversion_rate: number
      }>
    >
  > {
    const response: any = await request.get('/analytics/referrers/comparison', {
      params: {
        referrers: params.referrers.join(','),
        days: params.days,
      },
    })
    return response
  },

  /**
   * 分销员排行榜
   */
  async getLeaderboard(params?: {
    period_type?: 'today' | 'yesterday' | 'recent'
    days?: number
    start_date?: string
    end_date?: string
    limit?: number
  }): Promise<
    ApiResponse<{
      top_referrers: ReferrerStats[]
      period: {
        days?: number
        start_date: string
        end_date: string
      }
    }>
  > {
    const response: any = await request.get('/analytics/referrers/leaderboard', { params })
    return response
  },
}

