import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { API_BASE_URL, config } from '@/config'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 打印当前使用的API地址
console.log('%c=== API配置信息 ===', 'color: #409EFF; font-weight: bold')
console.log('API Base URL:', API_BASE_URL)
console.log('需要切换后端环境？修改 src/config/index.ts 的 API_BASE_URL 即可')

// 请求拦截器
request.interceptors.request.use(
  (config: any) => {
    const authStore = useAuthStore()
    const token = authStore.token

    // 添加 Authorization header
    if (token) {
      if (!config.headers) {
        config.headers = {} as any
      }
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    
    // 直接返回完整的响应数据，让各个API自己处理
    return response.data
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error('权限不足，无法访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(response.data?.detail || response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request

