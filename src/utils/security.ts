// 安全工具函数

/**
 * XSS 防护 - HTML 转义
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 清理 URL 参数
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '/'
    }
    return parsed.toString()
  } catch {
    return '/'
  }
}

/**
 * 验证输入长度
 */
export function validateLength(input: string, max: number): boolean {
  return input.length <= max
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && validateLength(email, 254)
}

/**
 * 验证手机号格式（中国大陆）
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 生成 CSP nonce
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * 内容安全策略配置
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // 开发环境需要，生产环境应使用 nonce
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:'
  ],
  'connect-src': [
    "'self'",
    'https://api.example.com' // 替换为实际的 API 域名
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}

/**
 * 生成 CSP 字符串
 */
export function generateCSPString(config = CSP_CONFIG): string {
  return Object.entries(config)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive
      }
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

/**
 * 设置安全头部
 */
export function setSecurityHeaders(): void {
  // 只在支持的浏览器中设置
  if (typeof document !== 'undefined') {
    // 设置 CSP meta 标签
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (!existingCSP) {
      const metaCSP = document.createElement('meta')
      metaCSP.httpEquiv = 'Content-Security-Policy'
      metaCSP.content = generateCSPString()
      document.head.appendChild(metaCSP)
    }

    // 设置其他安全 meta 标签
    const securityMetas = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' }
    ]

    securityMetas.forEach(meta => {
      const existing = document.querySelector(
        meta.name
          ? `meta[name="${meta.name}"]`
          : `meta[http-equiv="${meta.httpEquiv}"]`
      )
      if (!existing) {
        const metaEl = document.createElement('meta')
        if (meta.name) metaEl.name = meta.name
        if (meta.httpEquiv) metaEl.httpEquiv = meta.httpEquiv
        metaEl.content = meta.content
        document.head.appendChild(metaEl)
      }
    })
  }
}

/**
 * 敏感信息脱敏
 */
export const maskSensitiveData = {
  phone: (phone: string): string => {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },

  email: (email: string): string => {
    const [local, domain] = email.split('@')
    if (!local || !domain) return email
    const maskedLocal = local.length > 2
      ? local.substring(0, 2) + '*'.repeat(local.length - 2)
      : local
    return `${maskedLocal}@${domain}`
  },

  idCard: (idCard: string): string => {
    return idCard.replace(/(\d{6})\d*(\d{4})/, '$1**********$2')
  },

  bankCard: (cardNumber: string): string => {
    return cardNumber.replace(/(\d{4})\d*(\d{4})/, '$1************$2')
  }
}

/**
 * 防抖动提交（防止重复提交）
 */
export function createSubmitGuard(delay = 1000) {
  let isSubmitting = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function guard<T extends (...args: any[]) => Promise<any>>(
    submitFn: T
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
    return async (...args: Parameters<T>) => {
      if (isSubmitting) {
        console.warn('Submit is in progress, please wait')
        return null
      }

      isSubmitting = true

      try {
        const result = await submitFn(...args)
        return result
      } finally {
        // 延迟重置状态，防止快速连击
        timeoutId = setTimeout(() => {
          isSubmitting = false
        }, delay)
      }
    }
  }
}
