import { http } from '@/composables/useRequest'
import type { ApiResponse } from '@/composables/useRequest'

// 小红书数据结构
export interface XiaoHongShuData {
  title?: string | null
  description?: string | null
  keywords?: string | null
  like?: string | null
  collect?: string | null
  comment?: string | null
  videotime?: string | null
  images: string[]
  videos: string[]
  cover_img: string[]
}

// 小红书记录结构
export interface XiaoHongShuRecord {
  _id: string
  noteId: string
  url: string
  originalInput: string
  title: string
  description: string
  keywords: string
  like: string
  collect: string
  comment: string
  videotime: string
  images: string[]
  videos: string[]
  cover_img: string[]
  tags: string[]
  status: 'active' | 'archived' | 'deleted'
  extractedAt: string
  createdAt: string
  updatedAt: string
}

// 分页响应
export interface XhsPaginationResponse<T> {
  records: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// 统计信息
export interface XhsStats {
  total: number
  active: number
  archived: number
  deleted: number
  recentlyExtracted: number
  topTags: Array<{
    tag: string
    count: number
  }>
}

// 搜索参数
export interface XhsSearchParams {
  page?: number
  limit?: number
  search?: string
  userId?: string
  status?: 'active' | 'archived' | 'deleted'
  dateFrom?: string
  dateTo?: string
}

// 提取请求参数
export interface ExtractParams {
  input: string
}

// 解析结果
export interface ParseResult {
  originalInput: string
  parsedUrl: string
  shortLinks: string[]
  noteId: string
  isValidXhsContent: boolean
}

// 小红书 API 服务
export const xiaohongshuApi = {
  // 智能提取小红书数据
  extractData(params: ExtractParams): Promise<ApiResponse<XiaoHongShuData>> {
    return http.post('/xiaohongshu/extract', params, {
      timeout: 30000 // 提取可能需要更长时间
    })
  },

  // 解析小红书短链接或文本
  parseInput(params: ExtractParams): Promise<ApiResponse<ParseResult>> {
    return http.post('/xiaohongshu/parse', params)
  },

  // 通过 GET 方法解析
  parseInputByGet(input: string): Promise<ApiResponse<ParseResult>> {
    return http.get('/xiaohongshu/parse', {
      params: { input }
    })
  },

  // 获取小红书记录列表
  getRecords(params?: XhsSearchParams): Promise<ApiResponse<XhsPaginationResponse<XiaoHongShuRecord>>> {
    return http.get('/xiaohongshu/records', {
      params,
      cache: true,
      cacheTime: 2 * 60 * 1000 // 缓存 2 分钟
    })
  },

  // 根据ID获取小红书记录详情
  getRecordById(id: string): Promise<ApiResponse<XiaoHongShuRecord>> {
    return http.get(`/xiaohongshu/records/${id}`, {
      cache: true,
      cacheTime: 5 * 60 * 1000 // 缓存 5 分钟
    })
  },

  // 删除小红书记录（软删除）
  deleteRecord(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return http.delete(`/xiaohongshu/records/${id}`)
  },

  // 获取小红书统计信息
  getStats(): Promise<ApiResponse<XhsStats>> {
    return http.get('/xiaohongshu/stats', {
      cache: true,
      cacheTime: 5 * 60 * 1000 // 缓存 5 分钟
    })
  },

  // 获取小红书API信息
  getApiInfo(): Promise<ApiResponse<{
    name: string
    description: string
    version: string
    endpoints: string[]
    usage: Array<{
      method: string
      endpoint: string
      description: string
      example: any
    }>
  }>> {
    return http.get('/xiaohongshu/info')
  }
}

// 数据库管理 API
export const databaseApi = {
  // 检查数据库连接状态
  checkStatus(): Promise<ApiResponse<{
    status: 'healthy' | 'unhealthy' | 'disconnected'
    dbName: string
    connected: boolean
  }>> {
    return http.get('/database/status')
  },

  // 获取数据库集合列表
  getCollections(): Promise<ApiResponse<{
    collections: string[]
  }>> {
    return http.get('/database/collections')
  },

  // 测试数据库写入操作
  testWrite(message: string): Promise<ApiResponse<{
    insertedId: string
    message: string
  }>> {
    return http.post('/database/test', { message })
  },

  // 检查数据库索引状态
  checkIndexes(): Promise<ApiResponse<{
    users: any[]
    xiaohongshu: any[]
  }>> {
    return http.get('/database/indexes')
  },

  // 初始化数据库索引
  initIndexes(): Promise<ApiResponse<{ success: boolean }>> {
    return http.post('/database/init')
  },

  // 重建数据库索引
  rebuildIndexes(): Promise<ApiResponse<{ success: boolean }>> {
    return http.post('/database/rebuild-indexes')
  }
}

// 工具函数
export const xhsUtils = {
  // 检查是否为有效的小红书链接
  isValidXhsUrl(url: string): boolean {
    return /xiaohongshu\.com|xhslink\.com/i.test(url)
  },

  // 提取短链接
  extractShortLinks(text: string): string[] {
    const shortLinkRegex = /https?:\/\/(?:www\.)?xhslink\.com\/[a-zA-Z0-9]+/g
    return text.match(shortLinkRegex) || []
  },

  // 格式化数字（点赞数、收藏数等）
  formatNumber(num: string | null): string {
    if (!num || num === 'null') return '0'
    return num
  },

  // 格式化时间
  formatTime(timeStr: string | null): string {
    if (!timeStr || timeStr === 'null') return '--'
    return timeStr
  },

  // 获取封面图片
  getCoverImage(record: XiaoHongShuRecord): string {
    if (record.cover_img && record.cover_img.length > 0) {
      return record.cover_img[0]
    }
    if (record.images && record.images.length > 0) {
      return record.images[0]
    }
    return ''
  },

  // 判断是否为视频内容
  isVideo(record: XiaoHongShuRecord): boolean {
    return record.videos && record.videos.length > 0
  },

  // 生成标签颜色
  getTagColor(index: number): string {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
    return colors[index % colors.length]
  }
}

// 导出类型（避免重复导出）
export type {
  XiaoHongShuData,
  XiaoHongShuRecord,
  XhsPaginationResponse,
  XhsStats,
  XhsSearchParams,
  ExtractParams,
  ParseResult
}

// 默认导出
export default {
  xiaohongshu: xiaohongshuApi,
  database: databaseApi,
  utils: xhsUtils
}
