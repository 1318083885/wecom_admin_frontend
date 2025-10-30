/**
 * 表单验证规则
 */

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  return reg.test(email)
}

/**
 * 验证URL
 */
export function validateUrl(url: string): boolean {
  const reg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  return reg.test(url)
}

/**
 * 验证用户名（字母开头，允许字母数字下划线）
 */
export function validateUsername(username: string): boolean {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/
  return reg.test(username)
}

