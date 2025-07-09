import { ref, reactive, type Ref } from 'vue'
import { config } from '@/config'
import { errorHandler, ErrorType } from '@/utils/errorHandler'

// 响应数据类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  traceId?: string
}

// 请求配置类型
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  baseURL?: string
  withCredentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  retry?: number
  retryDelay?: number
  cache?: boolean
  cacheTime?: number
  validateStatus?: (status: number) => boolean
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
}

// 请求状态类型
export interface RequestState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  progress: Ref<number>
}

// 拦截器类型
export interface Interceptors {
  request: {
    use: (onFulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>,
          onRejected?: (error: any) => any) => number
    eject: (id: number) => void
  }
  response: {
    use: (onFulfilled: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>,
          onRejected?: (error: any) => any) => number
    eject: (id: number) => void
  }
}

// 缓存管理
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; maxAge: number }>()

  set(key: string, data: any, maxAge = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)),
      timestamp: Date.now(),
      maxAge
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.maxAge) {
      this.cache.delete(key)
      return null
    }

    return JSON.parse(JSON.stringify(item.data))
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private generateKey(url: string, config: RequestConfig): string {
    const { method = 'GET', params, data } = config
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`
  }

  getCacheKey(url: string, config: RequestConfig): string {
    return this.generateKey(url, config)
  }
}

// HTTP 客户端类
class HttpClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>
  private requestInterceptors: Array<{
    id: number
    onFulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
    onRejected?: (error: any) => any
  }> = []
  private responseInterceptors: Array<{
    id: number
    onFulfilled: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
    onRejected?: (error: any) => any
  }> = []
  private interceptorId = 0
  private pendingRequests = new Map<string, AbortController>()
  private cache = new RequestCache()

  constructor() {
    this.baseURL = config.api.baseURL
    this.timeout = config.api.timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  // 拦截器
  get interceptors(): Interceptors {
    return {
      request: {
        use: (onFulfilled, onRejected) => {
          const id = ++this.interceptorId
          this.requestInterceptors.push({ id, onFulfilled, onRejected })
          return id
        },
        eject: (id) => {
          const index = this.requestInterceptors.findIndex(item => item.id === id)
          if (index > -1) {
            this.requestInterceptors.splice(index, 1)
          }
        }
      },
      response: {
        use: (onFulfilled, onRejected) => {
          const id = ++this.interceptorId
          this.responseInterceptors.push({ id, onFulfilled, onRejected })
          return id
        },
        eject: (id) => {
          const index = this.responseInterceptors.findIndex(item => item.id === id)
          if (index > -1) {
            this.responseInterceptors.splice(index, 1)
          }
        }
      }
    }
  }

  // 处理请求配置
  private async processRequestConfig(url: string, config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = {
      ...config,
      baseURL: config.baseURL || this.baseURL || '',
      timeout: config.timeout || this.timeout,
      headers: { ...this.defaultHeaders, ...config.headers }
    }

    // 应用请求拦截器
    for (const interceptor of this.requestInterceptors) {
      try {
        processedConfig = await interceptor.onFulfilled(processedConfig)
      } catch (error) {
        if (interceptor.onRejected) {
          interceptor.onRejected(error)
        }
        throw error
      }
    }

    return processedConfig
  }

  // 处理响应数据
  private async processResponse(response: ApiResponse): Promise<ApiResponse> {
    let processedResponse = response

    // 应用响应拦截器
    for (const interceptor of this.responseInterceptors) {
      try {
        processedResponse = await interceptor.onFulfilled(processedResponse)
      } catch (error) {
        if (interceptor.onRejected) {
          interceptor.onRejected(error)
        }
        throw error
      }
    }

    return processedResponse
  }

  // 构建完整 URL
  private buildURL(url: string, baseURL: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const separator = fullURL.includes('?') ? '&' : '?'
      return `${fullURL}${separator}${searchParams.toString()}`
    }

    return fullURL
  }

  // 取消重复请求
  private cancelDuplicateRequest(requestKey: string): void {
    const existingController = this.pendingRequests.get(requestKey)
    if (existingController) {
      existingController.abort()
    }
  }

  // 重试机制
  private async retryRequest<T>(
    url: string,
    config: RequestConfig,
    retryCount: number
  ): Promise<ApiResponse<T>> {
    try {
      return await this.executeRequest<T>(url, config)
    } catch (error) {
      if (retryCount > 0 && this.shouldRetry(error)) {
        const delay = config.retryDelay || 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.retryRequest<T>(url, { ...config, retry: retryCount - 1 }, retryCount - 1)
      }
      throw error
    }
  }

  // 判断是否应该重试
  private shouldRetry(error: any): boolean {
    // 网络错误或 5xx 错误才重试
    return error.name === 'TypeError' ||
           (error.status && error.status >= 500) ||
           error.code === 'NETWORK_ERROR'
  }

  // 执行请求
  private async executeRequest<T>(url: string, config: RequestConfig): Promise<ApiResponse<T>> {
    const processedConfig = await this.processRequestConfig(url, config)
    const { method = 'GET', headers, data, timeout, baseURL, params } = processedConfig

    const fullURL = this.buildURL(url, baseURL!, params)
    const requestKey = `${method}:${fullURL}:${JSON.stringify(data || {})}`

    // 检查缓存
    if (config.cache && method === 'GET') {
      const cachedData = this.cache.get(this.cache.getCacheKey(url, config))
      if (cachedData) {
        return cachedData
      }
    }

    // 取消重复请求
    this.cancelDuplicateRequest(requestKey)

    const controller = new AbortController()
    this.pendingRequests.set(requestKey, controller)

    try {
      const requestOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal
      }

      if (data && method !== 'GET') {
        if (data instanceof FormData) {
          requestOptions.body = data
          // FormData 时移除 Content-Type，让浏览器自动设置
          delete (requestOptions.headers as any)['Content-Type']
        } else if (typeof data === 'string') {
          requestOptions.body = data
        } else {
          requestOptions.body = JSON.stringify(data)
        }
      }

      const timeoutId = setTimeout(() => controller.abort(), timeout!)
      const response = await fetch(fullURL, requestOptions)
      clearTimeout(timeoutId)

      let responseData: any
      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else if (config.responseType === 'blob') {
        responseData = await response.blob()
      } else if (config.responseType === 'arrayBuffer') {
        responseData = await response.arrayBuffer()
      } else {
        responseData = await response.text()
      }

      if (!response.ok) {
        const error = new Error(responseData.message || `HTTP ${response.status}`)
        ;(error as any).status = response.status
        ;(error as any).response = responseData
        throw error
      }

      // 标准化响应格式
      let standardResponse: ApiResponse<T>
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        standardResponse = responseData
      } else {
        standardResponse = {
          code: 200,
          message: 'success',
          data: responseData,
          timestamp: Date.now()
        }
      }

      // 处理响应
      const processedResponse = await this.processResponse(standardResponse)

      // 缓存响应
      if (config.cache && method === 'GET') {
        this.cache.set(
          this.cache.getCacheKey(url, config),
          processedResponse.data,
          config.cacheTime
        )
      }

      return processedResponse.data

    } catch (error: any) {
      errorHandler.handleError(error, {
        url: fullURL,
        method,
        data,
        timestamp: Date.now()
      })
      throw error
    } finally {
      this.pendingRequests.delete(requestKey)
    }
  }

  // 主要请求方法
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const retryCount = config.retry || 0

    if (retryCount > 0) {
      return this.retryRequest<T>(url, config, retryCount)
    }

    return this.executeRequest<T>(url, config)
  }

  // 便捷方法
  async get<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', data })
  }

  async put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', data })
  }

  async delete<T = any>(url: string, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  async patch<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', data })
  }

  // 文件上传
  async upload<T = any>(
    url: string,
    file: File | FormData,
    config?: Omit<RequestConfig, 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }

    return this.post<T>(url, formData, {
      ...config,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
        ...config?.headers
      }
    })
  }

  // 批量请求
  async all<T extends readonly unknown[] | []>(
    requests: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
    return Promise.all(requests) as any
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear()
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.pendingRequests.forEach(controller => controller.abort())
    this.pendingRequests.clear()
  }
}

// 创建默认实例
export const http = new HttpClient()

// Vue 组合式函数
export function useRequest<T = any>(
  url: string,
  config: RequestConfig = {}
): RequestState<T> & {
  execute: () => Promise<T>
  refresh: () => Promise<T>
  cancel: () => void
} {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const progress = ref(0)

  let currentController: AbortController | null = null

  const execute = async (): Promise<T> => {
    loading.value = true
    error.value = null
    progress.value = 0

    // 取消之前的请求
    if (currentController) {
      currentController.abort()
    }

    currentController = new AbortController()

    try {
      const response = await http.request<T>(url, {
        ...config,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
          config.onUploadProgress?.(progressEvent)
        },
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
          config.onDownloadProgress?.(progressEvent)
        }
      })

      data.value = response.data
      progress.value = 100
      return response.data
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      throw errorObj
    } finally {
      loading.value = false
      currentController = null
    }
  }

  const refresh = () => execute()

  const cancel = () => {
    if (currentController) {
      currentController.abort()
      currentController = null
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    progress,
    execute,
    refresh,
    cancel
  }
}

// 设置默认拦截器
http.interceptors.request.use((config) => {
  // 添加认证 token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }

  // 添加请求时间戳
  config.headers = {
    ...config.headers,
    'X-Request-Time': Date.now().toString()
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    // 统一处理业务错误码
    if (response.code !== 200 && response.code !== 0) {
      const error = new Error(response.message || '请求失败')
      ;(error as any).code = response.code
      ;(error as any).response = response
      throw error
    }
    return response
  },
  (error) => {
    // 统一处理 HTTP 错误
    if (error.status === 401) {
      // 未授权，清除 token 并跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.status === 403) {
      // 权限不足
      errorHandler.handleError(error, { type: ErrorType.PERMISSION })
    } else if (error.status >= 500) {
      // 服务器错误
      errorHandler.handleError(error, { type: ErrorType.SYSTEM })
    } else {
      // 其他错误
      errorHandler.handleError(error, { type: ErrorType.NETWORK })
    }

    throw error
  }
)

// 导出类型（避免重复导出）
export type { RequestConfig, RequestState, ApiResponse, Interceptors }

// 默认导出
export default http
