<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showDetails = ref(false)

const techStack = [
  {
    name: 'Vue 3',
    version: '^3.5.17',
    description: '渐进式 JavaScript 框架',
    color: 'success'
  },
  {
    name: 'Vuetify',
    version: '^3.8.12',
    description: 'Vue.js Material Design 组件框架',
    color: 'primary'
  },
  {
    name: 'UnoCSS',
    version: '^66.3.3',
    description: '即时原子化 CSS 引擎',
    color: 'info'
  },
  {
    name: 'TypeScript',
    version: '^5.8.3',
    description: 'JavaScript 的超集',
    color: 'warning'
  },
  {
    name: 'Vite',
    version: '^7.0.3',
    description: '下一代前端构建工具',
    color: 'error'
  }
]

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="about-page">
    <div class="container-responsive safe-area-all">
      <!-- 头部 -->
      <div class="d-flex align-center mb-6 lg:mb-8">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          @click="goBack"
          class="mr-2"
          :size="$vuetify.display.mobile ? 'default' : 'large'"
        />
        <h1 class="text-responsive-subtitle font-weight-bold text-primary">
          关于项目
        </h1>
      </div>

      <!-- 项目信息卡片 -->
      <v-card class="mb-6 lg:mb-8" elevation="2" rounded="lg">
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-information</v-icon>
          项目信息
        </v-card-title>
        <v-card-text class="p-responsive">
          <v-row class="gap-responsive">
            <v-col cols="12" md="6">
              <div class="mb-3 lg:mb-4">
                <strong class="text-primary text-responsive-body">项目名称：</strong>
                <span class="text-responsive-body">Vue3 响应式项目模板</span>
              </div>
              <div class="mb-3 lg:mb-4">
                <strong class="text-primary text-responsive-body">主色调：</strong>
                <v-chip
                  color="primary"
                  :size="$vuetify.display.mobile ? 'small' : 'default'"
                  class="ml-2"
                >
                  #1F2937
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-3 lg:mb-4">
                <strong class="text-primary text-responsive-body">适用场景：</strong>
                <span class="text-responsive-body">H5 优先，PC 端适配</span>
              </div>
              <div class="mb-3 lg:mb-4">
                <strong class="text-primary text-responsive-body">构建工具：</strong>
                <span class="text-responsive-body">Vite + pnpm</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 技术栈 -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="d-flex align-center justify-between">
          <div>
            <v-icon class="mr-2">mdi-code-tags</v-icon>
            技术栈
          </div>
          <v-btn
            :icon="showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            variant="text"
            size="small"
            @click="showDetails = !showDetails"
          />
        </v-card-title>
        <v-expand-transition>
          <div v-show="showDetails">
            <v-card-text>
              <v-row>
                <v-col
                  v-for="tech in techStack"
                  :key="tech.name"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    variant="outlined"
                    class="h-100"
                  >
                    <v-card-text class="text-center">
                      <v-chip
                        :color="tech.color"
                        class="mb-2"
                        size="small"
                      >
                        {{ tech.name }}
                      </v-chip>
                      <div class="text-caption text-grey-600 mb-1">
                        {{ tech.version }}
                      </div>
                      <div class="text-body-2">
                        {{ tech.description }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>

      <!-- 特性说明 -->
      <v-card elevation="2">
        <v-card-title>
          <v-icon class="mr-2">mdi-star</v-icon>
          项目特性
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>响应式设计，完美适配移动端</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>TypeScript 支持，提供类型安全</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>UnoCSS 原子化 CSS，高效样式开发</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>Vuetify Material Design 组件</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>Vite 快速构建和热更新</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-top: 1rem;
  padding-bottom: 2rem;
}

@media screen and (min-width: 768px) {
  .about-page {
    padding-top: 2rem;
    padding-bottom: 3rem;
  }
}

@media screen and (min-width: 1024px) {
  .about-page {
    padding-top: 2rem;
    padding-bottom: 4rem;
  }
}

/* 卡片悬停效果 - 仅桌面端 */
@media screen and (min-width: 1024px) {
  .v-card:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
}

/* 移动端卡片圆角优化 */
@media screen and (max-width: 767px) {
  .v-card {
    border-radius: 16px !important;
  }
}
</style>
