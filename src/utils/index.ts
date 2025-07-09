// 工具函数集合

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间(ms)
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间(ms)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 生成随机字符串
 * @param length 长度
 * @param charset 字符集
 */
export function randomString(
  length = 8,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否为 iOS 设备
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * 检查是否为 Android 设备
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent
  const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor)
  const isSafari = /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor)
  const isFirefox = /Firefox/.test(ua)
  const isEdge = /Edg/.test(ua)

  return {
    isChrome,
    isSafari,
    isFirefox,
    isEdge,
    userAgent: ua
  }
}

/**
 * 数字千分位格式化
 * @param num 数字
 * @param separator 分隔符
 */
export function formatNumber(num: number | string, separator = ','): string {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

/**
 * URL 参数解析
 * @param url URL 字符串
 */
export function parseURLParams(url = window.location.href): Record<string, string> {
  const params: Record<string, string> = {}
  const urlObj = new URL(url)

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}

/**
 * 构建 URL 参数
 * @param params 参数对象
 */
export function buildURLParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}
