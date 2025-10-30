/**
 * 分销员管理相关类型定义
 */

/**
 * 配置策略类型
 */
export type ConfigStrategy = 'SHARED' | 'INDEPENDENT'

/**
 * 分销员配置
 */
export interface ReferrerConfig {
  id: number // 配置ID
  referrer: string // 分销员编号（如 R000001，唯一，不可变）
  display_name: string // 显示名称（如"张三"，可修改）
  business_line_id: number // 业务线ID
  config_strategy: ConfigStrategy // 配置策略
  shared_qr_config_id: number | null // 共享二维码配置ID
  independent_qr_config_id: number | null // 独立二维码配置ID
  target_groups: string | null // 目标群组
  priority: number // 优先级（数字越小优先级越高）
  is_active: boolean // 是否启用
  total_scans: number // 总扫码次数
  total_conversions: number // 总转化次数
  conversion_rate: number // 转化率
  last_scan_at: string | null // 最后扫码时间
  config_options: any | null // 配置选项
  remark: string | null // 备注说明
  join_rule_id: number | null // 加群规则ID
  created_at: string // 创建时间
  updated_at: string // 更新时间
}

/**
 * 创建分销员请求
 */
export interface CreateReferrerRequest {
  display_name: string // 显示名称（必填）
  business_line_id: number // 业务线ID（必填）
  config_strategy?: ConfigStrategy // 配置策略（可选，默认 shared）
  priority?: number // 优先级（可选，默认 100）
  remark?: string // 备注说明（可选）
}

/**
 * 更新分销员请求
 */
export interface UpdateReferrerRequest {
  display_name?: string // 显示名称
  priority?: number // 优先级
  is_active?: boolean // 是否启用
  remark?: string // 备注说明
}

/**
 * 批量创建分销员请求
 */
export interface BatchCreateReferrerRequest {
  display_names: string[] // 显示名称列表
  business_line_id: number // 业务线ID
  config_strategy?: ConfigStrategy // 配置策略
}

/**
 * 批量创建分销员响应
 */
export interface BatchCreateReferrerResponse {
  total: number // 总数
  success_count: number // 成功数量
  failed_count: number // 失败数量
  details: {
    success: Array<{
      referrer: string // 分销员编号
      display_name: string // 显示名称
      config_id: number // 配置ID
    }>
    failed: Array<{
      display_name: string
      error: string
    }>
  }
}

