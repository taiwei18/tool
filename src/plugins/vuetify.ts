import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetify = createVuetify({
  components,
  directives,

  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1F2937',
          secondary: '#374151',
          accent: '#6B7280',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
          success: '#10B981',
          surface: '#FFFFFF',
          background: '#F9FAFB',
        },
      },
      dark: {
        colors: {
          primary: '#1F2937',
          secondary: '#4B5563',
          accent: '#9CA3AF',
          error: '#F87171',
          warning: '#FBBF24',
          info: '#60A5FA',
          success: '#34D399',
          surface: '#374151',
          background: '#111827',
        },
      },
    },
  },

  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },

  // 与 UnoCSS 保持一致的断点系统
  display: {
    mobileBreakpoint: 'md', // 768px 以下为移动端
    thresholds: {
      xs: 0,      // 超小屏（0-374px）
      sm: 375,    // 手机（375-767px）
      md: 768,    // 平板（768-1023px）
      lg: 1024,   // 桌面（1024-1279px）
      xl: 1280,   // 大桌面（1280-1535px）
      xxl: 1536,  // 超大桌面（1536px+）
    },
  },

  // H5 优化的默认配置
  defaults: {

    VCard: {
      elevation: 2,
      rounded: 'xl',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
    VAvatar: {
      rounded: 'lg',
    },
    // H5 友好的对话框
    VDialog: {
      rounded: 'xl',
    },
    VSheet: {
      rounded: 'lg',
    },
    // H5 优化的列表
    VList: {
      rounded: 'lg',
    },
    VListItem: {
      rounded: 'lg',
    },
    // 表单组件 H5 优化
    VTextarea: {
      variant: 'outlined',
      rounded: 'lg',
    },
    VCheckbox: {
      density: 'comfortable',
    },
    VRadio: {
      density: 'comfortable',
    },
    VSwitch: {
      density: 'comfortable',
    },
  },
})

export default vuetify
