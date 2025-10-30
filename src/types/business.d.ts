// 业务相关类型定义

// 从 referrer.d.ts 导出分销员类型
export type { ReferrerConfig, CreateReferrerRequest, UpdateReferrerRequest } from './referrer'

// 业务线
export interface BusinessLine {
  id: number
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// 群组
export interface Group {
  id: number
  chat_id: string
  name: string
  member_count: number
  max_members: number
  status: 'active' | 'full' | 'inactive'
  business_line_id: number
  business_line?: BusinessLine
  owner?: string
  created_at: string
  updated_at?: string
}

// 群成员
export interface GroupMember {
  id: number
  name: string
  userid: string
  type: number // 1:内部成员 2:外部联系人
  join_time: string
  referrer?: string
  unionid?: string
}

// 加群规则
export interface JoinRule {
  id: number
  name: string
  business_line_id: number
  target_group_ids: string[]
  selection_strategy: 'round_robin' | 'random' | 'load_balance'
  groups_per_assignment: number
  is_active: boolean
  success_rate?: number
  total_assignments?: number
  created_at: string
  updated_at?: string
}

// 短链接
export interface ShortUrl {
  short_code: string
  short_url: string
  original_url: string
  referrer?: string
  business_line_id?: number
  join_rule_id?: number
  click_count: number
  is_active: boolean
  created_at: string
  expires_at?: string
  description?: string
}

// 分销员统计
export interface ReferrerStats {
  referrer: string
  total_clicks: number
  total_links: number
  active_links: number
  avg_ctr: number
  rank?: number
}

