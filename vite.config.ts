import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '小红书工具',
        short_name: 'XHS工具',
        description: '小红书数据提取和管理工具',
        theme_color: '#1F2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        skipWaiting: true,
        clientsClaim: true
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
  },
  build: {
    // 构建优化
    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks: {
          // 将 Vue 相关库分割为单独的 chunk
          vue: ['vue', 'vue-router', 'pinia'],
          // 将 Vuetify 分割为单独的 chunk
          vuetify: ['vuetify']
        },
        // 文件命名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/img/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          return `assets/[ext]/[name]-[hash].${ext}`
        }
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除无用代码
        pure_funcs: ['console.log'],
        // 移除无用的代码
        dead_code: true,
        // 简化条件表达式
        conditionals: true,
        // 移除无法访问的代码
        unused: true
      }
    },
    // 生成source map用于调试
    sourcemap: false,
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 构建目标
    target: 'esnext',
    // 清空输出目录
    emptyOutDir: true
  },
  // 优化依赖
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'vuetify'],
  },
  // CSS 预处理器选项
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },
  // 性能优化
  esbuild: {
    // 生产环境移除所有的console和debugger
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
