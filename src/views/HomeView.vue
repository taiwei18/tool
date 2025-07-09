<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ResponsiveLayout from '@/components/ResponsiveLayout.vue'
import { xiaohongshuApi, xhsUtils } from '@/api/xiaohongshu'
import type {
  XiaoHongShuData,
  XiaoHongShuRecord,
  XhsSearchParams,
  XhsStats
} from '@/api/xiaohongshu'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const extractLoading = ref(false)
const records = ref<XiaoHongShuRecord[]>([])
const stats = ref<XhsStats | null>(null)
const selectedRecord = ref<XiaoHongShuRecord | null>(null)
const detailDialog = ref(false)
const extractedData = ref<XiaoHongShuData | null>(null)
const searchDialog = ref(false)
const imageCarouselModel = ref(0)
const detailImageCarouselModel = ref(0)

// 长按相关状态
let touchTimer: NodeJS.Timeout | null = null
const LONG_PRESS_DURATION = 800

// 表单数据
const extractForm = reactive({
  input: ''
})

const searchForm = reactive({
  page: 1,
  limit: 12,
  search: '',
  status: 'active' as 'active' | 'archived' | 'deleted',
  dateFrom: undefined as string | undefined,
  dateTo: undefined as string | undefined
})

// 分页信息
const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0
})

// 计算属性
const hasRecords = computed(() => records.value.length > 0)
const isValidInput = computed(() => {
  const input = extractForm.input.trim()
  return input.length > 0 && (
    xhsUtils.isValidXhsUrl(input) ||
    xhsUtils.extractShortLinks(input).length > 0
  )
})

// 智能提取小红书数据
const handleExtract = async () => {
  if (!isValidInput.value) return

  try {
    extractLoading.value = true
    const response = await xiaohongshuApi.extractData({
      input: extractForm.input.trim()
    })

    extractedData.value = response.data

    // 提取成功后刷新记录列表
    await loadRecords()

    // 清空输入框
    extractForm.input = ''

    console.log('提取成功:', extractedData.value)
  } catch (error) {
    console.error('提取失败:', error)
  } finally {
    extractLoading.value = false
  }
}

// 加载记录列表
const loadRecords = async () => {
  try {
    loading.value = true
    const response = await xiaohongshuApi.getRecords(searchForm)

    const data = response.data
    records.value = data.records || []
    pagination.value = data.pagination || {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0
    }
    console.log('记录列表:', data)
  } catch (error) {
    console.error('加载记录失败:', error)
    // 确保在错误时也有默认值
    records.value = []
    pagination.value = {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0
    }
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStats = async () => {
  try {
    const response = await xiaohongshuApi.getStats()
    stats.value = response.data
    console.log('统计信息:', response.data)
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 查看记录详情
const viewRecordDetail = async (record: XiaoHongShuRecord) => {
  try {
    const response = await xiaohongshuApi.getRecordById(record._id)
    selectedRecord.value = response.data
    detailDialog.value = true
  } catch (error) {
    console.error('获取记录详情失败:', error)
  }
}

// 删除记录
const deleteRecord = async (record: XiaoHongShuRecord) => {
  try {
    await xiaohongshuApi.deleteRecord(record._id)
    await loadRecords()
    await loadStats()
    console.log('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 搜索记录
const searchRecords = async () => {
  searchForm.page = 1
  await loadRecords()
}

// 重置搜索
const resetSearch = () => {
  searchForm.search = ''
  searchForm.status = 'active'
  searchForm.dateFrom = null
  searchForm.dateTo = null
  searchForm.page = 1
  loadRecords()
}

// 翻页
const changePage = (page: number) => {
  searchForm.page = page
  loadRecords()
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 获取媒体数量文本
const getMediaCount = (record: XiaoHongShuRecord) => {
  const imageCount = record.images?.length || 0
  const videoCount = record.videos?.length || 0

  if (videoCount > 0) {
    return `${videoCount} 个视频`
  } else if (imageCount > 0) {
    return `${imageCount} 张图片`
  }
  return '无媒体'
}

// 图片右键菜单处理
const handleImageContextMenu = (event: MouseEvent, imageUrl: string) => {
  event.preventDefault()
  showImageContextMenu(event, imageUrl)
}

// 图片长按开始
const handleImageTouchStart = (event: TouchEvent, imageUrl: string) => {
  touchTimer = setTimeout(() => {
    showImageContextMenu(event, imageUrl)
  }, LONG_PRESS_DURATION)
}

// 图片长按结束
const handleImageTouchEnd = () => {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

// 显示图片上下文菜单
const showImageContextMenu = (event: MouseEvent | TouchEvent, imageUrl: string) => {
  // 创建临时菜单
  const menu = document.createElement('div')
  menu.className = 'image-context-menu'
  menu.innerHTML = `
    <div class="menu-item" data-action="download">保存图片</div>
    <div class="menu-item" data-action="copy">复制链接</div>
    <div class="menu-item" data-action="open">新窗口打开</div>
  `

  // 设置菜单位置
  const x = 'clientX' in event ? event.clientX : event.touches[0].clientX
  const y = 'clientY' in event ? event.clientY : event.touches[0].clientY

  menu.style.position = 'fixed'
  menu.style.left = `${x}px`
  menu.style.top = `${y}px`
  menu.style.zIndex = '9999'

  document.body.appendChild(menu)

  // 添加点击事件
  menu.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const action = target.getAttribute('data-action')

    switch (action) {
      case 'download':
        downloadImage(imageUrl, 0)
        break
      case 'copy':
        copyToClipboard(imageUrl)
        break
      case 'open':
        openImageInNewTab(imageUrl)
        break
    }

    document.body.removeChild(menu)
  })

  // 点击其他地方关闭菜单
  setTimeout(() => {
    const closeMenu = () => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu)
      }
      document.removeEventListener('click', closeMenu)
    }
    document.addEventListener('click', closeMenu)
  }, 100)
}

// 下载图片
const downloadImage = async (imageUrl: string, index: number) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `xiaohongshu_image_${index + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
    console.log('图片下载成功')
  } catch (error) {
    console.error('图片下载失败:', error)
  }
}

// 在新标签页打开图片
const openImageInNewTab = (imageUrl: string) => {
  window.open(imageUrl, '_blank')
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 视频右键菜单处理
const handleVideoContextMenu = (event: MouseEvent, videoUrl: string) => {
  event.preventDefault()
  // 可以添加视频相关的上下文菜单
}

// 组件挂载时执行
onMounted(async () => {
  await Promise.all([
    loadRecords(),
    loadStats()
  ])
})
</script>

<template>
  <div class="xiaohongshu-home">
    <ResponsiveLayout max-width="responsive" padding="responsive" full-height>
      <template #default="{ device }">
        <!-- 页面标题 -->
        <div class="text-center">
          <h1 class="text-responsive-title font-weight-bold text-primary mb-2">
            <!-- <v-icon size="40" class="mr-2">mdi-heart</v-icon> -->
            <!-- 小红书数据提取工具 -->
          </h1>
          <p class="text-responsive-body text-grey-600">
            <!-- 智能解析小红书分享链接，提取图片、视频和详细信息 -->
          </p>
        </div>

        <!-- 统计信息 -->
<!--        <div v-if="stats" class="stats-container mb-4">-->
<!--          <div-->
<!--            v-for="(item, index) in [-->
<!--              { label: '总记录', value: stats.total, icon: 'mdi-database' },-->
<!--              { label: '活跃', value: stats.active, icon: 'mdi-check-circle' },-->
<!--              { label: '最近提取', value: stats.recentlyExtracted, icon: 'mdi-clock' },-->
<!--              { label: '标签', value: stats.topTags?.length || 0, icon: 'mdi-tag' }-->
<!--            ]"-->
<!--            :key="index"-->
<!--            class="stats-item-inline"-->
<!--          >-->
<!--            <v-icon size="16" class="stats-icon">{{ item.icon }}</v-icon>-->
<!--            <span class="stats-value">{{ item.value }}</span>-->
<!--            <span class="stats-label">{{ item.label }}</span>-->
<!--          </div>-->
<!--        </div>-->

        <!-- 数据提取区域 -->
        <div class="extract-section mb-6 pa-4 rounded elevation-3 bg-white">
          <div class="section-title d-flex align-center mb-4">
            <v-icon class="mr-2">mdi-download</v-icon>
            <h3 class="text-h6 font-weight-bold">数据提取</h3>
          </div>

          <v-form @submit.prevent="handleExtract">
            <v-textarea
              v-model="extractForm.input"
              label="输入小红书分享内容"
              placeholder="粘贴小红书分享的文本，包含链接或短链接..."
              rows="3"
              variant="outlined"
              class="mb-4"
              :rules="[
                v => !!v || '请输入内容',
                v => isValidInput || '请输入有效的小红书链接或分享文本'
              ]"
            />

            <div class="d-flex justify-space-between align-center">
              <div class="text-caption text-grey-600">
                支持完整链接、短链接或包含链接的分享文本
              </div>
              <v-btn
                type="submit"
                color="primary"
                :loading="extractLoading"
                :disabled="!isValidInput"
                size="large"
              >
                <v-icon left>mdi-magic-staff</v-icon>
                智能提取
              </v-btn>
            </div>
          </v-form>

          <!-- 提取结果预览 -->
          <v-expand-transition>
            <div v-if="extractedData" class="mt-4 pa-4 rounded extract-result">
              <div class="d-flex align-center mb-3 text-success">
                <v-icon class="mr-2 text-success">mdi-check-circle</v-icon>
                <h4 class="text-h6 font-weight-bold text-success">提取成功</h4>
              </div>
              <div class="extract-result-content">
                <div v-if="extractedData.title" class="mb-2">
                  <strong>标题：</strong>{{ extractedData.title }}
                </div>
                <div v-if="extractedData.description" class="mb-2">
                  <strong>描述：</strong>{{ extractedData.description }}
                </div>

                <!-- 图片展示 -->
                <div v-if="extractedData.images && extractedData.images.length > 0" class="mb-3">
                  <div class="d-flex align-center mb-2">
                    <strong>图片：</strong>
                    <span class="ml-2 text-caption text-grey-600">{{ extractedData.images.length }} 张</span>
                  </div>
                  <div class="image-carousel-container">
                    <v-carousel
                      hide-delimiters
                      v-model="imageCarouselModel"
                      height="200"
                      hide-delimiter-background
                      show-arrows="hover"
                      class="rounded"
                    >
                      <v-carousel-item
                        v-for="(image, index) in extractedData.images"
                        :key="index"
                        class="image-carousel-item"
                      >
                        <v-img
                          :src="image"
                          height="200"
                          cover
                          class="image-preview"
                          @contextmenu="handleImageContextMenu($event, image)"
                          @touchstart="handleImageTouchStart($event, image)"
                          @touchend="handleImageTouchEnd"
                        >
                          <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                              <v-progress-circular indeterminate color="primary" />
                            </div>
                          </template>

                          <!-- 图片操作按钮 -->
                          <div class="image-actions">
                            <v-btn
                              icon="mdi-download"
                              size="small"
                              variant="tonal"
                              class="image-action-btn"
                              @click="downloadImage(image, index)"
                            />
                            <v-btn
                              icon="mdi-open-in-new"
                              size="small"
                              variant="tonal"
                              class="image-action-btn"
                              @click="openImageInNewTab(image)"
                            />
                          </div>
                        </v-img>
                      </v-carousel-item>
                    </v-carousel>
                  </div>
                </div>

                <!-- 视频展示 -->
                <div v-if="extractedData.videos && extractedData.videos.length > 0" class="mb-3">
                  <div class="d-flex align-center mb-2">
                    <strong>视频：</strong>
                    <span class="ml-2 text-caption text-grey-600">{{ extractedData.videos.length }} 个</span>
                  </div>
                  <div class="video-container">
                    <video
                      v-for="(video, index) in extractedData.videos"
                      :key="index"
                      :src="video"
                      controls
                      preload="metadata"
                      class="video-preview rounded"
                      @contextmenu="handleVideoContextMenu($event, video)"
                    />
                  </div>
                </div>

                <div class="d-flex gap-4 text-sm">
                  <span v-if="extractedData.like" class="d-flex align-center">
                    <v-icon size="16" class="mr-1">mdi-thumb-up</v-icon>
                    {{ xhsUtils.formatNumber(extractedData.like) }}
                  </span>
                  <span v-if="extractedData.collect" class="d-flex align-center">
                    <v-icon size="16" class="mr-1">mdi-bookmark</v-icon>
                    {{ xhsUtils.formatNumber(extractedData.collect) }}
                  </span>
                  <span v-if="extractedData.comment" class="d-flex align-center">
                    <v-icon size="16" class="mr-1">mdi-comment</v-icon>
                    {{ xhsUtils.formatNumber(extractedData.comment) }}
                  </span>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </div>



        <!-- 记录列表 -->
        <div class="records-section pa-4 rounded elevation-2 bg-transparent">
          <div class="section-title d-flex justify-space-between align-center mb-4">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-view-list</v-icon>
              <h3 class="text-h6 font-weight-bold">记录列表</h3>
              <v-chip class="ml-2" size="small" color="primary">
                {{ pagination?.total || 0 }} 条
              </v-chip>
            </div>
            <div class="d-flex align-center gap-2">
              <v-btn
                @click="searchDialog = true"
                icon="mdi-magnify"
                size="small"
                :color="searchForm.dateFrom? '' : 'primary'"
              >

              </v-btn>
              <v-btn
                @click="loadRecords"
                :loading="loading"
                size="small"
                icon="mdi-refresh"
              />
            </div>
          </div>

          <div class="records-content">
            <!-- 调试信息 -->
            <div v-if="false" class="mb-4 pa-2 bg-grey-100 rounded text-caption">
              <div>Records length: {{ records.length }}</div>
              <div>Has records: {{ hasRecords }}</div>
              <div>Loading: {{ loading }}</div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="50" />
              <p class="mt-4 text-grey-600">加载中...</p>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!hasRecords" class="text-center py-8">
              <v-icon size="60" color="grey-400" class="mb-4">mdi-inbox</v-icon>
              <h3 class="text-h6 text-grey-600 mb-2">暂无记录</h3>
              <p class="text-grey-500">开始提取你的第一条小红书数据吧！</p>
              <p class="text-caption text-grey-400 mt-2">记录数量: {{ records.length }}</p>
            </div>

            <!-- 记录网格 -->
            <v-row v-else class="records-grid">
              <v-col
                v-for="record in records"
                :key="record._id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <div
                  class="record-item pa-0 rounded elevation-2 bg-white cursor-pointer"
                  @click="viewRecordDetail(record)"
                >
                  <!-- 封面图片 -->
                  <div class="record-cover">
                    <v-img
                      :src="xhsUtils.getCoverImage(record)"
                      :alt="record.title"
                      aspect-ratio="1"
                      cover
                      class="cursor-pointer rounded-t"
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon size="40" color="grey-400">
                            {{ xhsUtils.isVideo(record) ? 'mdi-video' : 'mdi-image' }}
                          </v-icon>
                        </div>
                      </template>

                      <!-- 视频标识 -->
                      <v-chip
                        v-if="xhsUtils.isVideo(record)"
                        class="video-badge"
                        color="red"
                        size="small"
                      >
                        <v-icon left size="16">mdi-play</v-icon>
                        {{ xhsUtils.formatTime(record.videotime) }}
                      </v-chip>

                      <!-- 媒体数量 -->
                      <v-chip
                        class="media-count"
                        color="black"
                        variant="flat"
                        size="small"
                      >
                        {{ getMediaCount(record) }}
                      </v-chip>
                    </v-img>
                  </div>

                  <!-- 内容信息 -->
                  <div class="record-content pa-3">
                    <h4 class="text-subtitle-1 font-weight-bold text-truncate mb-1">
                      {{ record.title || '无标题' }}
                    </h4>
                    <p class="text-caption text-grey-600 text-truncate-2 mb-2">
                      {{ record.description || '无描述' }}
                    </p>

                    <!-- 数据统计 -->
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="d-flex gap-2 text-caption">
                        <span>👍 {{ xhsUtils.formatNumber(record.like) }}</span>
                        <span>💾 {{ xhsUtils.formatNumber(record.collect) }}</span>
                        <span>💬 {{ xhsUtils.formatNumber(record.comment) }}</span>
                      </div>
                    </div>

                    <!-- 标签 -->
                    <div v-if="record.tags && record.tags.length > 0" class="mb-2">
                      <v-chip
                        v-for="(tag, index) in record.tags.slice(0, 2)"
                        :key="tag"
                        size="x-small"
                        :color="xhsUtils.getTagColor(index)"
                        variant="outlined"
                        class="mr-1"
                      >
                        {{ tag }}
                      </v-chip>
                      <v-chip
                        v-if="record.tags.length > 2"
                        size="x-small"
                        variant="text"
                        class="mr-1"
                      >
                        +{{ record.tags.length - 2 }}
                      </v-chip>
                    </div>

                    <!-- 底部信息 -->
                    <div class="d-flex justify-space-between align-center">
                      <span class="text-caption text-grey-500">
                        {{ formatDate(record.createdAt) }}
                      </span>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-dots-vertical"
                            size="small"
                            variant="text"
                            @click.stop
                          />
                        </template>
                        <v-list>
                          <v-list-item @click="viewRecordDetail(record)">
                            <template #prepend>
                              <v-icon>mdi-eye</v-icon>
                            </template>
                            <v-list-item-title>查看详情</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteRecord(record)" class="text-error">
                            <template #prepend>
                              <v-icon>mdi-delete</v-icon>
                            </template>
                            <v-list-item-title>删除</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- 分页 -->
            <div v-if="hasRecords && (pagination?.totalPages || 0) > 1" class="d-flex justify-center mt-6">
              <v-pagination
                v-model="pagination.page"
                :length="pagination?.totalPages || 0"
                :total-visible="device.isMobile ? 5 : 7"
                @update:model-value="changePage"
              />
            </div>
          </div>
        </div>

        <!-- 记录详情弹窗 -->
        <v-dialog v-model="detailDialog" max-width="800" scrollable>
          <div v-if="selectedRecord" class="dialog-content bg-white rounded elevation-8">
            <div class="dialog-header d-flex justify-space-between align-center pa-4 border-b">
              <h3 class="text-h6 font-weight-bold">记录详情</h3>
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                @click="detailDialog = false"
              />
            </div>

            <div class="dialog-body pa-0">
              <v-container>
                <!-- 基本信息 -->
                <div class="mb-4">
                  <h3 class="text-h6 font-weight-bold mb-2">{{ selectedRecord.title }}</h3>
                  <p class="text-body-2 text-grey-700 mb-3">{{ selectedRecord.description }}</p>

                  <!-- 统计数据 -->
                  <v-row class="mb-3">
                    <v-col cols="4">
                      <div class="text-center">
                        <div class="text-h6 font-weight-bold">{{ xhsUtils.formatNumber(selectedRecord.like) }}</div>
                        <div class="text-caption text-grey-600">点赞</div>
                      </div>
                    </v-col>
                    <v-col cols="4">
                      <div class="text-center">
                        <div class="text-h6 font-weight-bold">{{ xhsUtils.formatNumber(selectedRecord.collect) }}</div>
                        <div class="text-caption text-grey-600">收藏</div>
                      </div>
                    </v-col>
                    <v-col cols="4">
                      <div class="text-center">
                        <div class="text-h6 font-weight-bold">{{ xhsUtils.formatNumber(selectedRecord.comment) }}</div>
                        <div class="text-caption text-grey-600">评论</div>
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <!-- 标签 -->
                <div v-if="selectedRecord.tags && selectedRecord.tags.length > 0" class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">标签</h4>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="(tag, index) in selectedRecord.tags"
                      :key="tag"
                      size="small"
                      :color="xhsUtils.getTagColor(index)"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </div>

                <!-- 图片展示 -->
                <div v-if="selectedRecord.images && selectedRecord.images.length > 0" class="mb-4">
                  <div class="d-flex align-center mb-2">
                    <h4 class="text-subtitle-1 font-weight-bold">图片</h4>
                    <span class="ml-2 text-caption text-grey-600">{{ selectedRecord.images.length }} 张</span>
                  </div>
                  <div class="image-carousel-container">
                    <v-carousel
                      v-model="detailImageCarouselModel"
                      height="300"
                      hide-delimiter-background
                      show-arrows="hover"
                      class="rounded"
                    >
                      <v-carousel-item
                        v-for="(image, index) in selectedRecord.images"
                        :key="index"
                        class="image-carousel-item"
                      >
                        <v-img
                          :src="image"
                          height="300"
                          cover
                          class="image-preview"
                          @contextmenu="handleImageContextMenu($event, image)"
                          @touchstart="handleImageTouchStart($event, image)"
                          @touchend="handleImageTouchEnd"
                        >
                          <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                              <v-progress-circular indeterminate color="primary" />
                            </div>
                          </template>

                          <!-- 图片操作按钮 -->
                          <div class="image-actions">
                            <v-btn
                              icon="mdi-download"
                              size="small"
                              variant="tonal"
                              class="image-action-btn"
                              @click="downloadImage(image, index)"
                            />
                            <v-btn
                              icon="mdi-open-in-new"
                              size="small"
                              variant="tonal"
                              class="image-action-btn"
                              @click="openImageInNewTab(image)"
                            />
                          </div>
                        </v-img>
                      </v-carousel-item>
                    </v-carousel>
                  </div>
                </div>

                <!-- 视频展示 -->
                <div v-if="selectedRecord.videos && selectedRecord.videos.length > 0" class="mb-4">
                  <div class="d-flex align-center mb-2">
                    <h4 class="text-subtitle-1 font-weight-bold">视频</h4>
                    <span class="ml-2 text-caption text-grey-600">{{ selectedRecord.videos.length }} 个</span>
                  </div>
                  <div class="video-container">
                    <video
                      v-for="(video, index) in selectedRecord.videos"
                      :key="index"
                      :src="video"
                      controls
                      preload="metadata"
                      class="video-preview rounded"
                      @contextmenu="handleVideoContextMenu($event, video)"
                    />
                  </div>
                </div>

                <!-- 详细信息 -->
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel>
                    <v-expansion-panel-title>详细信息</v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-list>
                        <v-list-item>
                          <v-list-item-title>笔记ID</v-list-item-title>
                          <v-list-item-subtitle>{{ selectedRecord.noteId }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>原始输入</v-list-item-title>
                          <v-list-item-subtitle>{{ selectedRecord.originalInput }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>链接</v-list-item-title>
                          <v-list-item-subtitle>
                            <a :href="selectedRecord.url" target="_blank" class="text-primary">
                              {{ selectedRecord.url }}
                            </a>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>提取时间</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDate(selectedRecord.extractedAt) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>状态</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip :color="selectedRecord.status === 'active' ? 'success' : 'warning'" size="small">
                              {{ selectedRecord.status === 'active' ? '活跃' : selectedRecord.status === 'archived' ? '归档' : '已删除' }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-container>
            </div>

            <div class="dialog-footer d-flex justify-end pa-4 border-t">
              <v-btn @click="detailDialog = false" color="primary">关闭</v-btn>
            </div>
          </div>
        </v-dialog>

        <!-- 搜索底部弹出框 -->
        <v-bottom-sheet v-model="searchDialog" inset>
          <div class="search-bottom-sheet bg-white">
            <div class="d-flex align-center justify-space-between pa-4 border-b">
              <h3 class="text-h6 font-weight-bold">搜索和筛选</h3>
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                @click="searchDialog = false"
              />
            </div>

            <div class="pa-4">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="searchForm.search"
                    label="搜索标题或描述"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    clearable
                    @keyup.enter="searchRecords"
                  />
                </v-col>
                <v-col cols="6" md="4">
                  <v-select
                    v-model="searchForm.status"
                    label="状态"
                    :items="[
                      { title: '活跃', value: 'active' },
                      { title: '归档', value: 'archived' },
                      { title: '已删除', value: 'deleted' }
                    ]"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="6" md="4">
                  <v-text-field
                    v-model="searchForm.dateFrom"
                    label="开始日期"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="6" md="4">
                  <v-text-field
                    v-model="searchForm.dateTo"
                    label="结束日期"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>

              <div class="d-flex justify-end gap-2 mt-4">
                <v-btn @click="resetSearch" variant="text">
                  重置
                </v-btn>
                <v-btn @click="searchRecords; searchDialog = false" color="primary">
                  搜索
                </v-btn>
              </div>
            </div>
          </div>
        </v-bottom-sheet>
      </template>
    </ResponsiveLayout>
  </div>
</template>

<style scoped>
.xiaohongshu-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-top: 1rem;
  padding-bottom: 2rem;
}

@media screen and (min-width: 768px) {
  .xiaohongshu-home {
    padding-top: 2rem;
    padding-bottom: 3rem;
  }
}

/* 统计信息样式 */
.stats-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px 24px;
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  position: relative;
  overflow: hidden;
}

.stats-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.stats-item-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  cursor: default;
}

.stats-item-inline:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.stats-icon {
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.stats-value {
  font-size: 18px;
  font-weight: 700;
  color: white;
  min-width: 24px;
  text-align: center;
}

.stats-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-container {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
  }

  .stats-item-inline {
    flex: 1;
    min-width: calc(50% - 4px);
    justify-content: center;
    padding: 6px 8px;
  }

  .stats-value {
    font-size: 16px;
  }

  .stats-label {
    font-size: 12px;
  }
}

/* 区域样式 */
.extract-section,
.search-section,
.records-section {
  background: white;
}

.section-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

/* 提取结果样式 */
.extract-result {
  background: #f0f9ff;
  border: 2px solid #22c55e;
  border-left: 4px solid #22c55e;
}

.extract-result-content {
  color: #374151;
}

/* 记录网格样式 */
.records-grid {
  min-height: 200px;
}

/* 圆形操作按钮样式 */
.action-btn-round {
  transition: all 0.2s ease-in-out !important;
  background-color: rgba(0, 0, 0, 0.04) !important;
  color: #666 !important;
  position: relative;
}

.action-btn-round:hover {
  background-color: rgba(25, 118, 210, 0.1) !important;
  color: #1976d2 !important;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.action-btn-round.search-active {
  background-color: rgba(25, 118, 210, 0.12) !important;
  color: #1976d2 !important;
}

.action-btn-round .v-icon {
  font-size: 18px !important;
}

/* 底部弹出搜索样式 */
.search-bottom-sheet {
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.search-bottom-sheet .border-b {
  border-bottom: 1px solid #f0f0f0;
}

/* 图片轮播样式 */
.image-carousel-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-carousel-item {
  position: relative;
}

.image-preview {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.image-carousel-item:hover .image-actions {
  opacity: 1;
}

.image-action-btn {
  background: rgba(0, 0, 0, 0.6) !important;
  color: white !important;
  backdrop-filter: blur(4px);
}

.image-action-btn:hover {
  background: rgba(0, 0, 0, 0.8) !important;
}

/* 视频样式 */
.video-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-preview {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

/* 上下文菜单样式 */
.image-context-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  min-width: 120px;
}

.image-context-menu .menu-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  font-size: 14px;
  color: #333;
}

.image-context-menu .menu-item:hover {
  background-color: #f5f5f5;
}

.image-context-menu .menu-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

/* 间距调整 */
.gap-2 {
  gap: 8px;
}

/* 记录项样式 */
.record-item {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  overflow: hidden;
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15) !important;
}

.record-content {
  border-top: 1px solid #f0f0f0;
}

/* 弹窗样式 */
.dialog-content {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex-shrink: 0;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
}

.dialog-footer {
  flex-shrink: 0;
}

.record-cover {
  position: relative;
}

.video-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

.media-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 1;
  opacity: 0.8;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cursor-pointer {
  cursor: pointer;
}

.w-100 {
  width: 100%;
}

.rounded {
  border-radius: 8px;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-1 {
  gap: 0.25rem;
}
</style>
