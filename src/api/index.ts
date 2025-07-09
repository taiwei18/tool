import { http } from '@/composables/useRequest'
import type { ApiResponse } from '@/composables/useRequest'

// 用户相关接口
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 分页查询参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户 API
export const userApi = {
  // 登录
  login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return http.post('/auth/login', params)
  },

  // 注册
  register(params: RegisterParams): Promise<ApiResponse<User>> {
    return http.post('/auth/register', params)
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<ApiResponse<User>> {
    return http.get('/user/profile', {
      cache: true,
      cacheTime: 5 * 60 * 1000 // 缓存 5 分钟
    })
  },

  // 更新用户信息
  updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return http.put('/user/profile', data)
  },

  // 上传头像
  uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    return http.upload('/user/avatar', file, {
      onUploadProgress: (progress) => {
        console.log('Upload progress:', Math.round((progress.loaded * 100) / progress.total) + '%')
      }
    })
  },

  // 获取用户列表
  getUserList(params: PaginationParams): Promise<ApiResponse<PaginationResponse<User>>> {
    return http.get('/users', { params })
  },

  // 删除用户
  deleteUser(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/users/${id}`)
  }
}

// 文章相关接口
export interface Article {
  id: number
  title: string
  content: string
  summary: string
  cover?: string
  author: User
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface CreateArticleParams {
  title: string
  content: string
  summary?: string
  cover?: string
  tags?: string[]
  status?: 'draft' | 'published'
}

// 文章 API
export const articleApi = {
  // 获取文章列表
  getArticleList(params: PaginationParams & {
    status?: string
    tag?: string
  }): Promise<ApiResponse<PaginationResponse<Article>>> {
    return http.get('/articles', {
      params,
      cache: true,
      cacheTime: 2 * 60 * 1000 // 缓存 2 分钟
    })
  },

  // 获取文章详情
  getArticleDetail(id: number): Promise<ApiResponse<Article>> {
    return http.get(`/articles/${id}`, {
      cache: true,
      cacheTime: 5 * 60 * 1000
    })
  },

  // 创建文章
  createArticle(data: CreateArticleParams): Promise<ApiResponse<Article>> {
    return http.post('/articles', data)
  },

  // 更新文章
  updateArticle(id: number, data: Partial<CreateArticleParams>): Promise<ApiResponse<Article>> {
    return http.put(`/articles/${id}`, data)
  },

  // 删除文章
  deleteArticle(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/articles/${id}`)
  },

  // 批量删除文章
  batchDeleteArticles(ids: number[]): Promise<ApiResponse<void>> {
    return http.post('/articles/batch-delete', { ids })
  }
}

// 文件上传 API
export const uploadApi = {
  // 上传单个文件
  uploadFile(file: File, folder = 'common'): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    return http.upload('/upload/file', formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Upload progress: ${progress}%`)
      }
    })
  },

  // 上传多个文件
  uploadMultipleFiles(files: File[], folder = 'common'): Promise<ApiResponse<Array<{ url: string; filename: string }>>> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('folder', folder)

    return http.upload('/upload/multiple', formData)
  },

  // 删除文件
  deleteFile(filename: string): Promise<ApiResponse<void>> {
    return http.delete('/upload/file', { params: { filename } })
  }
}

// 系统配置 API
export const systemApi = {
  // 获取系统配置
  getSystemConfig(): Promise<ApiResponse<Record<string, any>>> {
    return http.get('/system/config', {
      cache: true,
      cacheTime: 10 * 60 * 1000 // 缓存 10 分钟
    })
  },

  // 更新系统配置
  updateSystemConfig(config: Record<string, any>): Promise<ApiResponse<void>> {
    return http.put('/system/config', config)
  },

  // 获取系统状态
  getSystemStatus(): Promise<ApiResponse<{
    cpu: number
    memory: number
    disk: number
    network: number
  }>> {
    return http.get('/system/status')
  }
}

// 统计数据 API
export const statisticsApi = {
  // 获取用户统计
  getUserStatistics(dateRange?: { start: string; end: string }): Promise<ApiResponse<{
    totalUsers: number
    activeUsers: number
    newUsers: number
    userGrowth: Array<{ date: string; count: number }>
  }>> {
    return http.get('/statistics/users', { params: dateRange })
  },

  // 获取文章统计
  getArticleStatistics(): Promise<ApiResponse<{
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    articleViews: number
  }>> {
    return http.get('/statistics/articles', {
      cache: true,
      cacheTime: 30 * 60 * 1000 // 缓存 30 分钟
    })
  },

  // 导出数据
  exportData(type: 'users' | 'articles', format: 'xlsx' | 'csv' = 'xlsx'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return http.post('/statistics/export', { type, format }, {
      timeout: 60000, // 导出可能需要更长时间
      retry: 2 // 重试 2 次
    })
  }
}

// 通用 API 方法
export const commonApi = {
  // 健康检查
  healthCheck(): Promise<ApiResponse<{ status: 'ok' | 'error'; timestamp: number }>> {
    return http.get('/health', {
      timeout: 5000
    })
  },

  // 获取验证码
  getCaptcha(): Promise<ApiResponse<{ code: string; image: string }>> {
    return http.get('/captcha')
  },

  // 发送邮件验证码
  sendEmailCode(email: string): Promise<ApiResponse<void>> {
    return http.post('/auth/send-email-code', { email })
  },

  // 发送短信验证码
  sendSmsCode(phone: string): Promise<ApiResponse<void>> {
    return http.post('/auth/send-sms-code', { phone })
  }
}

// 批量请求示例
export const batchApi = {
  // 批量获取数据
  async getBatchData() {
    const requests = [
      userApi.getCurrentUser(),
      systemApi.getSystemConfig(),
      statisticsApi.getArticleStatistics()
    ]

    try {
      const [userResponse, configResponse, statsResponse] = await http.all(requests)

      return {
        user: userResponse.data,
        config: configResponse.data,
        statistics: statsResponse.data
      }
    } catch (error) {
      console.error('Batch request failed:', error)
      throw error
    }
  }
}

// 导出小红书 API
export { xiaohongshuApi, databaseApi, xhsUtils } from './xiaohongshu'
export type {
  XiaoHongShuData,
  XiaoHongShuRecord,
  XhsPaginationResponse,
  XhsStats,
  XhsSearchParams,
  ExtractParams,
  ParseResult
} from './xiaohongshu'

// 导出所有 API
export default {
  user: userApi,
  article: articleApi,
  upload: uploadApi,
  system: systemApi,
  statistics: statisticsApi,
  common: commonApi,
  batch: batchApi
}

// 导出类型（避免重复导出）
export type {
  User,
  LoginParams,
  LoginResponse,
  RegisterParams,
  Article,
  CreateArticleParams,
  PaginationParams,
  PaginationResponse
}
