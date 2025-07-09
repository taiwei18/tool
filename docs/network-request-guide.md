# 网络请求封装使用指南

## 概述

这是一个基于 Fetch API 的完整网络请求封装方案，为 Vue 3 项目提供了强大而灵活的 HTTP 客户端功能。

## 主要特性

- ✅ **统一的响应格式处理** - 自动标准化 API 响应数据
- ✅ **请求/响应拦截器** - 支持全局请求和响应处理
- ✅ **错误处理集成** - 集成全局错误处理系统
- ✅ **请求缓存** - 支持 GET 请求结果缓存
- ✅ **重试机制** - 网络错误时自动重试
- ✅ **上传进度** - 文件上传进度监控
- ✅ **请求去重** - 自动取消重复请求
- ✅ **TypeScript 支持** - 完整的类型定义

## 基本使用

### 1. 直接使用 HTTP 客户端

```typescript
import { http } from '@/composables/useRequest'

// GET 请求
const response = await http.get('/api/users')
console.log(response.data)

// POST 请求
const response = await http.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
})

// 带参数的 GET 请求
const response = await http.get('/api/users', {
  params: { page: 1, size: 10 }
})

// 上传文件
const file = new File(['content'], 'test.txt')
const response = await http.upload('/api/upload', file)
```

### 2. 使用 useRequest Hook

```typescript
import { useRequest } from '@/composables/useRequest'

// 在 Vue 组件中使用
const {
  data,
  loading,
  error,
  execute,
  refresh,
  cancel
} = useRequest<User>('/api/user/profile')

// 手动执行请求
await execute()

// 刷新数据
await refresh()

// 取消请求
cancel()
```

### 3. 使用 API 服务层

```typescript
import { userApi } from '@/api'

// 登录
const loginResponse = await userApi.login({
  username: 'admin',
  password: '123456'
})

// 获取用户列表
const usersResponse = await userApi.getUserList({
  page: 1,
  pageSize: 10
})

// 上传头像
const file = new File(['...'], 'avatar.jpg')
const uploadResponse = await userApi.uploadAvatar(file)
```

## 高级功能

### 拦截器

```typescript
import { http } from '@/composables/useRequest'

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 添加认证头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 处理业务逻辑
    if (response.code !== 200) {
      throw new Error(response.message)
    }
    return response
  },
  (error) => {
    // 处理错误
    if (error.status === 401) {
      // 跳转登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 缓存配置

```typescript
// 启用缓存，缓存 5 分钟
const response = await http.get('/api/config', {
  cache: true,
  cacheTime: 5 * 60 * 1000
})

// 清除所有缓存
http.clearCache()
```

### 重试机制

```typescript
// 失败时重试 3 次，每次间隔 2 秒
const response = await http.get('/api/data', {
  retry: 3,
  retryDelay: 2000
})
```

### 文件上传

```typescript
// 单文件上传
const file = document.querySelector('input[type="file"]').files[0]
const response = await http.upload('/api/upload', file, {
  onUploadProgress: (progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
    console.log(`上传进度: ${progress}%`)
  }
})

// 多文件上传
const formData = new FormData()
files.forEach(file => formData.append('files', file))
const response = await http.upload('/api/upload-multiple', formData)
```

### 批量请求

```typescript
// 并行执行多个请求
const requests = [
  http.get('/api/users'),
  http.get('/api/articles'),
  http.get('/api/config')
]

const [usersResponse, articlesResponse, configResponse] = await http.all(requests)
```

## 配置项

### RequestConfig 配置选项

```typescript
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  params?: Record<string, any>           // URL 查询参数
  data?: any                             // 请求体数据
  timeout?: number                       // 超时时间（毫秒）
  baseURL?: string                       // 基础 URL
  withCredentials?: boolean              // 是否携带凭证
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  retry?: number                         // 重试次数
  retryDelay?: number                    // 重试间隔（毫秒）
  cache?: boolean                        // 是否启用缓存
  cacheTime?: number                     // 缓存时间（毫秒）
  validateStatus?: (status: number) => boolean
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
}
```

### 响应格式

```typescript
interface ApiResponse<T = any> {
  code: number        // 状态码
  message: string     // 消息
  data: T            // 数据
  timestamp?: number  // 时间戳
  traceId?: string   // 追踪 ID
}
```

## 错误处理

```typescript
try {
  const response = await http.get('/api/data')
  console.log(response.data)
} catch (error) {
  console.error('请求失败:', error.message)
  
  // 错误详情
  if (error.status) {
    console.log('HTTP 状态码:', error.status)
  }
  
  if (error.response) {
    console.log('响应数据:', error.response)
  }
}
```

## 最佳实践

### 1. 创建 API 服务层

```typescript
// src/api/user.ts
export const userApi = {
  login: (data: LoginParams) => http.post<LoginResponse>('/auth/login', data),
  logout: () => http.post('/auth/logout'),
  getProfile: () => http.get<User>('/user/profile', { cache: true }),
  updateProfile: (data: Partial<User>) => http.put<User>('/user/profile', data)
}
```

### 2. 在组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRequest } from '@/composables/useRequest'
import { userApi } from '@/api'

// 使用 useRequest Hook
const { data: user, loading, error, refresh } = useRequest('/user/profile')

// 或者直接调用 API
const handleLogin = async () => {
  try {
    const response = await userApi.login(loginForm)
    // 处理登录成功
  } catch (error) {
    // 处理登录失败
  }
}
</script>
```

### 3. 全局配置

```typescript
// main.ts
import { http } from '@/composables/useRequest'

// 设置全局拦截器
http.interceptors.request.use((config) => {
  // 全局请求处理
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 全局错误处理
    return Promise.reject(error)
  }
)
```

## 环境配置

在 `.env` 文件中配置 API 基础信息：

```env
# API 配置
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_ANALYTICS=true
```

## 开发调试

在开发环境中，请求详情会自动打印到控制台，包括：

- 请求配置
- 响应数据
- 错误信息
- 性能统计

## 故障排除

### 常见问题

1. **CORS 错误**
   - 确保服务端正确配置 CORS
   - 检查请求头设置

2. **Token 过期**
   - 响应拦截器会自动处理 401 错误
   - 自动清除过期 token 并跳转登录

3. **网络超时**
   - 调整 timeout 配置
   - 启用重试机制

4. **缓存问题**
   - 使用 `http.clearCache()` 清除缓存
   - 检查缓存时间设置

### 调试技巧

```typescript
// 启用详细日志
localStorage.setItem('debug', 'http')

// 查看请求历史
console.log(http.getRequestHistory())

// 监控网络状态
window.addEventListener('online', () => {
  console.log('网络已连接')
})

window.addEventListener('offline', () => {
  console.log('网络已断开')
})
```

## 更新日志

### v2.0.0
- 重构网络请求封装
- 添加拦截器支持
- 增加缓存功能
- 完善错误处理
- 添加重试机制
- 支持文件上传进度

### v1.0.0
- 基础网络请求功能
- Vue 3 Composition API 支持
- TypeScript 类型定义 