<script setup lang="ts">
import { ref, computed } from 'vue'
import ResponsiveLayout from '@/components/ResponsiveLayout.vue'
import { useDevice } from '@/composables/useDevice'

const { deviceInfo, isMobile, isTablet, isDesktop, orientation } = useDevice()

const selectedLayout = ref('responsive')
const selectedPadding = ref('responsive')

const layoutOptions = [
  { value: 'responsive', title: '响应式容器', desc: 'H5优先，自适应各设备' },
  { value: 'mobile', title: '移动端容器', desc: '最大宽度适合手机' },
  { value: 'tablet', title: '平板容器', desc: '最大宽度适合平板' },
  { value: 'desktop', title: '桌面容器', desc: '最大宽度适合桌面' },
  { value: 'full', title: '全宽容器', desc: '占满整个屏幕宽度' }
]

const paddingOptions = [
  { value: 'responsive', title: '响应式边距', desc: 'H5优化的自适应边距' },
  { value: 'small', title: '小边距', desc: '紧凑布局' },
  { value: 'medium', title: '中等边距', desc: '标准布局' },
  { value: 'large', title: '大边距', desc: '宽松布局' },
  { value: 'none', title: '无边距', desc: '满边距布局' }
]

const demoData = [
  { icon: 'mdi-cellphone', title: 'H5 优化', desc: '专为移动端优化的触摸体验', color: 'primary' },
  { icon: 'mdi-tablet', title: '平板适配', desc: '中等屏幕的完美体验', color: 'secondary' },
  { icon: 'mdi-monitor', title: 'PC 兼容', desc: '桌面端的良好显示效果', color: 'success' },
  { icon: 'mdi-responsive', title: '自动适配', desc: '智能识别设备类型', color: 'info' }
]

const deviceStatus = computed(() => ({
  type: isMobile.value ? '移动设备' : isTablet.value ? '平板设备' : '桌面设备',
  width: deviceInfo.value.screenWidth,
  height: deviceInfo.value.screenHeight,
  orientation: orientation.value === 'portrait' ? '竖屏' : '横屏',
  pixelRatio: deviceInfo.value.devicePixelRatio,
  isTouch: deviceInfo.value.isTouch ? '支持触摸' : '不支持触摸'
}))

const gridCols = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 4
})

// 响应式样式类
const cardResponsive = computed(() => ({
  'elevation-2': !isMobile.value,
  'elevation-1': isMobile.value
}))

const gapResponsive = computed(() => ({
  'gap-2': isMobile.value,
  'gap-4': !isMobile.value
}))
</script>

<template>
  <div class="demo-page">
    <!-- 页面标题 -->
    <ResponsiveLayout max-width="responsive" padding="responsive">
      <div class="text-center mb-6">
        <h1 class="text-responsive-title font-weight-bold text-primary mb-2">
          响应式设计演示
        </h1>
        <p class="text-responsive-body text-grey-600">
          H5 优先，PC 端适配的响应式布局系统
        </p>
      </div>
    </ResponsiveLayout>

    <!-- 设备信息卡片 -->
    <ResponsiveLayout max-width="responsive" padding="responsive">
      <v-card class="mb-6" :class="cardResponsive">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-information-outline</v-icon>
          当前设备信息
        </v-card-title>
        <v-card-text>
          <div class="grid-responsive-2">
            <div>
              <v-chip color="primary" class="mb-2">{{ deviceStatus.type }}</v-chip>
              <br>
              <span class="text-caption">设备类型</span>
            </div>
            <div>
              <v-chip color="secondary" class="mb-2">{{ deviceStatus.width }} × {{ deviceStatus.height }}</v-chip>
              <br>
              <span class="text-caption">屏幕尺寸</span>
            </div>
            <div>
              <v-chip color="success" class="mb-2">{{ deviceStatus.orientation }}</v-chip>
              <br>
              <span class="text-caption">屏幕方向</span>
            </div>
            <div>
              <v-chip color="info" class="mb-2">{{ deviceStatus.isTouch }}</v-chip>
              <br>
              <span class="text-caption">触摸支持</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </ResponsiveLayout>

    <!-- 布局控制面板 -->
    <ResponsiveLayout max-width="responsive" padding="responsive">
      <v-card class="mb-6" :class="cardResponsive">
        <v-card-title>布局控制面板</v-card-title>
        <v-card-text>
          <v-row :class="gapResponsive">
            <v-col cols="12" sm="6">
              <v-select
                v-model="selectedLayout"
                :items="layoutOptions"
                item-title="title"
                item-value="value"
                label="容器类型"
                :density="isMobile ? 'comfortable' : 'default'"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.desc }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="selectedPadding"
                :items="paddingOptions"
                item-title="title"
                item-value="value"
                label="边距设置"
                :density="isMobile ? 'comfortable' : 'default'"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.desc }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </ResponsiveLayout>

    <!-- 响应式演示区域 -->
    <ResponsiveLayout
      :max-width="selectedLayout as any"
      :padding="selectedPadding as any"
      background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      class="demo-container mb-6"
    >
      <template #default="{ device }">
        <div class="text-center text-white p-4">
          <v-icon size="48" class="mb-3">mdi-layout-grid</v-icon>
          <h3 class="text-responsive-subtitle mb-2">演示容器</h3>
          <p class="text-responsive-body mb-4">
            当前断点: {{ device.breakpoint }} | 方向: {{ device.orientation }}
          </p>
          <div class="d-flex flex-wrap justify-center gap-2">
            <v-chip color="white" text-color="primary" size="small">
              宽度: {{ device.screenWidth }}px
            </v-chip>
            <v-chip color="white" text-color="primary" size="small">
              高度: {{ device.screenHeight }}px
            </v-chip>
            <v-chip color="white" text-color="primary" size="small">
              像素比: {{ device.devicePixelRatio }}
            </v-chip>
          </div>
        </div>
      </template>
    </ResponsiveLayout>

    <!-- 特性展示网格 -->
    <ResponsiveLayout max-width="responsive" padding="responsive">
      <h2 class="text-responsive-subtitle font-weight-bold text-center mb-6">
        响应式特性展示
      </h2>
      <v-row :class="gapResponsive">
        <v-col
          v-for="item in demoData"
          :key="item.title"
          :cols="12 / gridCols"
        >
          <v-card
            :class="['text-center', 'h-100', cardResponsive]"
            :color="item.color"
            variant="tonal"
            hover
          >
            <v-card-text class="d-flex flex-column align-center justify-center h-100">
              <v-icon
                :icon="item.icon"
                :size="isMobile ? 32 : 48"
                :color="item.color"
                class="mb-3"
              />
              <h4 class="text-subtitle-1 font-weight-bold mb-2">
                {{ item.title }}
              </h4>
              <p class="text-caption text-grey-700">
                {{ item.desc }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </ResponsiveLayout>

    <!-- 交互元素演示 -->
    <ResponsiveLayout max-width="responsive" padding="responsive">
      <v-card :class="cardResponsive">
        <v-card-title>交互元素演示</v-card-title>
        <v-card-text>
          <div class="space-responsive">
            <!-- 按钮组 -->
            <div>
              <h4 class="text-subtitle-1 mb-3">响应式按钮</h4>
              <div class="d-flex flex-wrap gap-small">
                <v-btn
                  color="primary"
                  :size="isMobile ? 'large' : 'default'"
                  class="touch-target"
                >
                  主要按钮
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="outlined"
                  :size="isMobile ? 'large' : 'default'"
                  class="touch-target"
                >
                  次要按钮
                </v-btn>
                <v-btn
                  color="success"
                  variant="tonal"
                  :size="isMobile ? 'large' : 'default'"
                  class="touch-target"
                >
                  <v-icon left>mdi-check</v-icon>
                  图标按钮
                </v-btn>
              </div>
            </div>

            <!-- 输入框组 -->
            <div>
              <h4 class="text-subtitle-1 mb-3">响应式表单</h4>
              <v-row :class="gap-small">
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="用户名"
                    placeholder="请输入用户名"
                    :density="isMobile ? 'comfortable' : 'default'"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    label="选择设备"
                    :items="['手机', '平板', '桌面']"
                    :density="isMobile ? 'comfortable' : 'default'"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- 开关组 -->
            <div>
              <h4 class="text-subtitle-1 mb-3">响应式开关</h4>
              <div class="d-flex flex-column gap-small">
                <v-switch
                  label="启用 H5 优化"
                  color="primary"
                  :density="isMobile ? 'comfortable' : 'default'"
                />
                <v-checkbox
                  label="同意用户协议"
                  color="primary"
                  :density="isMobile ? 'comfortable' : 'default'"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </ResponsiveLayout>
  </div>
</template>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem 0;
}

@media screen and (min-width: 768px) {
  .demo-page {
    padding: 2rem 0;
  }
}

.demo-container {
  border-radius: 16px;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式网格优化 */
.v-row {
  margin: 0;
}

.v-col {
  padding: 0.5rem;
}

@media screen and (min-width: 768px) {
  .v-col {
    padding: 0.75rem;
  }
}

@media screen and (min-width: 1024px) {
  .v-col {
    padding: 1rem;
  }
}

/* 触摸优化 */
@media screen and (max-width: 767px) {
  .v-card {
    margin-bottom: 1rem;
  }

  .v-btn {
    margin: 0.25rem;
  }
}
</style>
