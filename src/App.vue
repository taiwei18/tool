<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from 'vuetify'

const theme = useTheme()
</script>

<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style>
/* 全局样式重置，H5 优先，PC 端适配 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

#app {
  height: 100%;
}

/* 响应式字体大小 - H5 优先 */
html {
  font-size: 14px; /* H5 基础字体 */
}

@media screen and (min-width: 375px) {
  html {
    font-size: 15px; /* 大屏手机 */
  }
}

@media screen and (min-width: 768px) {
  html {
    font-size: 16px; /* 平板和桌面 */
  }
}

@media screen and (min-width: 1024px) {
  html {
    font-size: 16px; /* 桌面保持标准大小 */
  }
}

/* 防止移动端页面缩放 */
@media screen and (max-width: 768px) {
  @viewport {
    width: device-width;
    initial-scale: 1.0;
    maximum-scale: 1.0;
    user-scalable: no;
  }
}

/* 响应式滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

@media screen and (min-width: 1024px) {
  ::-webkit-scrollbar {
    width: 8px;
  }
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #1F2937;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #374151;
}

/* 响应式容器最大宽度 */
.v-application {
  max-width: 100%;
}

@media screen and (min-width: 1200px) {
  .v-application {
    max-width: 1200px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}

/* 移动端触摸优化 */
@media screen and (max-width: 768px) {
  .v-card {
    border-radius: 12px; /* 移动端更圆润的卡片 */
  }
}

/* 桌面端悬停效果 */
@media screen and (min-width: 1024px) {
  .v-card:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
}
</style>
