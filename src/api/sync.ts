import request from './request'
import type { ApiResponse } from '@/types/api'

/**
 * 同步管理API
 */
export const syncAPI = {
  /**
   * 全量同步（从企微完全同步）
   */
  async fullSync(): Promise<ApiResponse<any>> {
    const response: any = await request.post('/admin/sync/full-sync-from-wecom')
    return response
  },

  /**
   * 手动同步数据
   */
  async manualSync(): Promise<ApiResponse<any>> {
    const response: any = await request.post('/admin/sync/data')
    return response
  },

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<ApiResponse<any>> {
    const response: any = await request.get('/admin/sync/status')
    return response
  },

  /**
   * 同步单个群的信息
   */
  async syncGroupInfo(chatId: string): Promise<ApiResponse<any>> {
    const response: any = await request.post(`/groups/${chatId}/sync`)
    return response
  },

  /**
   * 同步单个群的成员
   */
  async syncGroupMembers(chatId: string): Promise<ApiResponse<any>> {
    const response: any = await request.post(`/groups/${chatId}/members/sync`)
    return response
  },

  /**
   * 批量同步所有群的信息
   */
  async syncAllGroups(): Promise<ApiResponse<any>> {
    // 先获取所有群列表，然后批量同步
    const groupsResponse: any = await request.get('/groups', {
      params: { skip: 0, limit: 1000 }
    })
    
    if (!groupsResponse.success || !groupsResponse.data?.items) {
      throw new Error('获取群列表失败')
    }

    const groups = groupsResponse.data.items
    const results = {
      total: groups.length,
      success: 0,
      failed: 0,
      errors: [] as any[]
    }

    // 批量同步（并发限制）
    for (const group of groups) {
      try {
        await this.syncGroupInfo(group.chat_id)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({ chat_id: group.chat_id, error })
      }
    }

    return {
      success: true,
      data: results,
      message: `同步完成：成功 ${results.success}，失败 ${results.failed}`
    }
  },

  /**
   * 批量同步所有群的成员
   */
  async syncAllMembers(): Promise<ApiResponse<any>> {
    // 先获取所有群列表，然后批量同步成员
    const groupsResponse: any = await request.get('/groups', {
      params: { skip: 0, limit: 1000 }
    })
    
    if (!groupsResponse.success || !groupsResponse.data?.items) {
      throw new Error('获取群列表失败')
    }

    const groups = groupsResponse.data.items
    const results = {
      total: groups.length,
      success: 0,
      failed: 0,
      errors: [] as any[]
    }

    // 批量同步（并发限制）
    for (const group of groups) {
      try {
        await this.syncGroupMembers(group.chat_id)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push({ chat_id: group.chat_id, error })
      }
    }

    return {
      success: true,
      data: results,
      message: `同步完成：成功 ${results.success}，失败 ${results.failed}`
    }
  },
}

