// 本地存储工具

const STORAGE_PREFIX = 'wecom_admin_'

export const storage = {
  get<T = any>(key: string): T | null {
    const value = localStorage.getItem(STORAGE_PREFIX + key)
    if (!value) return null
    
    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  },

  set(key: string, value: any): void {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(STORAGE_PREFIX + key, stringValue)
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key)
  },

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },
}

