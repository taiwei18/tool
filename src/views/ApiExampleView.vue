<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRequest } from '@/composables/useRequest'
import { userApi, articleApi, uploadApi, commonApi } from '@/api'
import type { User, Article, PaginationParams } from '@/api'

// 响应式数据
const loading = ref(false)
const users = ref<User[]>([])
const articles = ref<Article[]>([])
const currentUser = ref<User | null>(null)
const uploadProgress = ref(0)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

const searchForm = reactive({
  keyword: '',
  page: 1,
  pageSize: 10
})

// 使用 useRequest Hook 示例
const {
  data: userData,
  loading: userLoading,
  error: userError,
  execute: fetchUser,
  refresh: refreshUser,
  cancel: cancelUserRequest
} = useRequest<User>('/user/profile')

const {
  data: articlesData,
  loading: articlesLoading,
  execute: fetchArticles
} = useRequest<Article[]>('/articles')

// 登录功能
const handleLogin = async () => {
  try {
    loading.value = true
    const response = await userApi.login(loginForm)

    // 保存 token
    localStorage.setItem('token', response.data.token)
    currentUser.value = response.data.user

    console.log('登录成功:', response.data)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    const response = await userApi.getUserList(searchForm)
    users.value = response.data.list
    console.log('用户列表:', response.data)
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取文章列表（带缓存）
const getArticleList = async () => {
  try {
    const response = await articleApi.getArticleList({
      ...searchForm,
      status: 'published'
    })
    articles.value = response.data.list
    console.log('文章列表:', response.data)
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 文件上传示例
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    uploadProgress.value = 0

    const response = await uploadApi.uploadFile(file, 'images')

    console.log('文件上传成功:', response.data)
    uploadProgress.value = 100
  } catch (error) {
    console.error('文件上传失败:', error)
    uploadProgress.value = 0
  }
}

// 批量操作示例
const handleBatchDelete = async (ids: number[]) => {
  try {
    await articleApi.batchDeleteArticles(ids)
    console.log('批量删除成功')
    // 刷新列表
    await getArticleList()
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

// 健康检查
const checkHealth = async () => {
  try {
    const response = await commonApi.healthCheck()
    console.log('系统状态:', response.data)
  } catch (error) {
    console.error('健康检查失败:', error)
  }
}

// 使用拦截器示例
const setupInterceptors = () => {
  // 添加请求拦截器
  const requestInterceptorId = userApi.login({} as any).constructor.prototype.interceptors?.request.use(
    (config) => {
      console.log('请求拦截器:', config)
      return config
    },
    (error) => {
      console.error('请求拦截器错误:', error)
      return Promise.reject(error)
    }
  )

  // 移除拦截器
  // interceptors.request.eject(requestInterceptorId)
}

// 组件挂载时执行
onMounted(async () => {
  await checkHealth()
  await fetchUser()
  await fetchArticles()
})
</script>

<template>
  <div class="api-example-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-6">网络请求封装示例</h1>
        </v-col>
      </v-row>

      <!-- 用户信息展示 -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>当前用户信息</v-card-title>
            <v-card-text>
              <div v-if="userLoading" class="text-center">
                <v-progress-circular indeterminate />
                <p class="mt-2">加载中...</p>
              </div>

              <div v-else-if="userError" class="text-error">
                <v-icon class="mr-2">mdi-alert-circle</v-icon>
                {{ userError.message }}
                <v-btn @click="refreshUser" size="small" class="ml-2">重试</v-btn>
              </div>

              <div v-else-if="userData">
                <p><strong>用户名:</strong> {{ userData.username }}</p>
                <p><strong>邮箱:</strong> {{ userData.email }}</p>
                <p><strong>注册时间:</strong> {{ new Date(userData.createdAt).toLocaleString() }}</p>
              </div>

              <div v-else>
                <p class="text-grey">暂无用户信息</p>
              </div>

              <div class="mt-4">
                <v-btn @click="refreshUser" :loading="userLoading" class="mr-2">刷新</v-btn>
                <v-btn @click="cancelUserRequest" variant="outlined">取消请求</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 登录表单 -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>用户登录</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginForm.username"
                  label="用户名"
                  prepend-icon="mdi-account"
                  required
                  class="mb-2"
                />
                <v-text-field
                  v-model="loginForm.password"
                  label="密码"
                  type="password"
                  prepend-icon="mdi-lock"
                  required
                  class="mb-4"
                />
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                  block
                >
                  登录
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 搜索和列表 -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card>
            <v-card-title>数据列表</v-card-title>
            <v-card-text>
              <!-- 搜索表单 -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchForm.keyword"
                    label="搜索关键词"
                    prepend-icon="mdi-magnify"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                  <v-btn @click="getUserList" color="primary" class="mr-2">
                    获取用户列表
                  </v-btn>
                  <v-btn @click="getArticleList" color="secondary">
                    获取文章列表
                  </v-btn>
                </v-col>
              </v-row>

              <!-- 用户列表 -->
              <div v-if="users.length > 0" class="mb-4">
                <h3 class="text-h6 mb-2">用户列表</h3>
                <v-chip
                  v-for="user in users"
                  :key="user.id"
                  class="ma-1"
                  color="primary"
                  variant="outlined"
                >
                  {{ user.username }}
                </v-chip>
              </div>

              <!-- 文章列表 -->
              <div v-if="articles.length > 0">
                <h3 class="text-h6 mb-2">文章列表</h3>
                <v-list>
                  <v-list-item
                    v-for="article in articles.slice(0, 5)"
                    :key="article.id"
                  >
                    <v-list-item-title>{{ article.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ article.summary }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>

              <!-- 使用 useRequest Hook 的文章列表 -->
              <div v-if="articlesLoading" class="text-center my-4">
                <v-progress-circular indeterminate />
                <p class="mt-2">加载文章中...</p>
              </div>

              <div v-if="articlesData && articlesData.length > 0" class="mt-4">
                <h3 class="text-h6 mb-2">Hook 获取的文章</h3>
                <v-chip
                  v-for="article in articlesData.slice(0, 3)"
                  :key="article.id"
                  class="ma-1"
                  color="info"
                  variant="outlined"
                >
                  {{ article.title }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 文件上传 -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>文件上传</v-card-title>
            <v-card-text>
              <v-file-input
                label="选择文件"
                prepend-icon="mdi-upload"
                @change="handleFileUpload"
                accept="image/*"
                class="mb-4"
              />

              <v-progress-linear
                v-if="uploadProgress > 0"
                :model-value="uploadProgress"
                color="primary"
                height="6"
                class="mb-2"
              />

              <p v-if="uploadProgress > 0" class="text-caption">
                上传进度: {{ uploadProgress }}%
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 系统状态 -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>系统功能</v-card-title>
            <v-card-text>
              <div class="d-flex flex-column gap-2">
                <v-btn @click="checkHealth" color="success" variant="outlined">
                  <v-icon left>mdi-heart-pulse</v-icon>
                  健康检查
                </v-btn>

                <v-btn @click="setupInterceptors" color="info" variant="outlined">
                  <v-icon left>mdi-filter</v-icon>
                  设置拦截器
                </v-btn>

                <v-btn @click="handleBatchDelete([1, 2, 3])" color="error" variant="outlined">
                  <v-icon left>mdi-delete</v-icon>
                  批量删除示例
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 功能说明 -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>功能特性</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <v-list-item-title>✅ 统一的响应格式处理</v-list-item-title>
                  <v-list-item-subtitle>自动标准化 API 响应数据</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ 请求/响应拦截器</v-list-item-title>
                  <v-list-item-subtitle>支持全局请求和响应处理</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ 错误处理集成</v-list-item-title>
                  <v-list-item-subtitle>集成全局错误处理系统</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ 请求缓存</v-list-item-title>
                  <v-list-item-subtitle>支持 GET 请求结果缓存</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ 重试机制</v-list-item-title>
                  <v-list-item-subtitle>网络错误时自动重试</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ 上传进度</v-list-item-title>
                  <v-list-item-subtitle>文件上传进度监控</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ 请求去重</v-list-item-title>
                  <v-list-item-subtitle>自动取消重复请求</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <v-list-item-title>✅ TypeScript 支持</v-list-item-title>
                  <v-list-item-subtitle>完整的类型定义</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.api-example-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
