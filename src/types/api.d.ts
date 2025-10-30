// API 通用类型定义

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

export interface PaginationParams {
  page?: number
  page_size?: number
}

export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface ApiError {
  detail: string
  status_code?: number
}

