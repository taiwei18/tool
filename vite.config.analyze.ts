import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Vue3 响应式项目模板',
        short_name: 'Vue3Template',
        description: '一个主要适配 H5，同时在 PC 端也有良好体验的 Vue3 项目模板',
        theme_color: '#1F2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库分割为单独的 chunk
          vue: ['vue', 'vue-router', 'pinia'],
          // 将 Vuetify 分割为单独的 chunk
          vuetify: ['vuetify'],
          // 将工具库分割为单独的 chunk
          utils: ['@mdi/font']
        }
      }
    },
    // 生成详细的构建报告
    reportCompressedSize: true,
    // 生成 source map 用于分析
    sourcemap: true,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  }
})
