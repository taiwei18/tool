import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    // 主色调相关的快捷类
    ['btn-primary', 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors'],
    ['text-primary', 'text-[#1F2937]'],
    ['bg-primary', 'bg-[#1F2937]'],
    ['border-primary', 'border-[#1F2937]'],

    // 通用布局
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['flex-column-center', 'flex flex-col items-center justify-center'],
    ['full-screen', 'w-full h-screen'],

    // H5 优先的响应式容器
    ['container-responsive', 'w-full mx-auto px-4 sm:px-6 md:max-w-3xl md:px-8 lg:max-w-5xl xl:max-w-6xl'],
    ['container-mobile', 'w-full max-w-sm mx-auto px-4'],
    ['container-tablet', 'w-full max-w-2xl mx-auto px-6'],
    ['container-desktop', 'w-full max-w-4xl mx-auto px-8'],
    ['container-wide', 'w-full max-w-7xl mx-auto px-8'],

    // H5 优化的安全区域（考虑刘海屏等）
    ['safe-area-mobile', 'px-4 py-safe-top pb-safe-bottom'],
    ['safe-area-all', 'px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4'],
    ['safe-padding-x', 'px-4 sm:px-6 md:px-8'],
    ['safe-padding-y', 'py-2 sm:py-3 md:py-4'],

    // 响应式间距 - H5 优先
    ['gap-responsive', 'gap-3 sm:gap-4 md:gap-6 lg:gap-8'],
    ['gap-small', 'gap-2 sm:gap-3 md:gap-4'],
    ['p-responsive', 'p-3 sm:p-4 md:p-6 lg:p-8'],
    ['m-responsive', 'm-3 sm:m-4 md:m-6 lg:m-8'],
    ['space-responsive', 'space-y-3 sm:space-y-4 md:space-y-6'],

    // H5 优化的文字大小
    ['text-responsive-title', 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'],
    ['text-responsive-subtitle', 'text-lg sm:text-xl md:text-2xl lg:text-3xl'],
    ['text-responsive-body', 'text-sm sm:text-base md:text-lg'],
    ['text-responsive-caption', 'text-xs sm:text-sm'],

    // H5 触摸友好的交互元素
    ['touch-target', 'min-h-11 min-w-11 sm:min-h-10 sm:min-w-10'], // H5 推荐44px，桌面40px
    ['button-responsive', 'px-4 py-3 sm:px-6 sm:py-2  transition-all duration-200'],
    ['card-responsive', 'rounded-xl  p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow'],

    // H5 优化的网格系统
    ['grid-responsive-2', 'grid grid-cols-2 gap-3 sm:gap-4 md:gap-6'],
    ['grid-responsive-3', 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6'],
    ['grid-responsive-4', 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6'],

    // 响应式显示/隐藏
    ['show-mobile', 'block sm:hidden'],
    ['show-tablet', 'hidden sm:block md:hidden'],
    ['show-desktop', 'hidden md:block'],
    ['hide-mobile', 'hidden sm:block'],
  ],

  theme: {
    colors: {
      primary: {
        DEFAULT: '#1F2937',
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
    // 与 Vuetify 保持一致的断点系统
    breakpoints: {
      'xs': '0px',      // 超小屏（小于375px）
      'sm': '375px',    // 手机（375px及以上）
      'md': '768px',    // 平板（768px及以上）
      'lg': '1024px',   // 桌面（1024px及以上）
      'xl': '1280px',   // 大桌面（1280px及以上）
      '2xl': '1536px',  // 超大桌面（1536px及以上）
    },
    spacing: {
      'safe-top': 'env(safe-area-inset-top)',
      'safe-bottom': 'env(safe-area-inset-bottom)',
      'safe-left': 'env(safe-area-inset-left)',
      'safe-right': 'env(safe-area-inset-right)',
    },
  },

  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],

  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],

  safelist: [
    'text-primary',
    'bg-primary',
    'border-primary',
    'btn-primary',
    'container-responsive',
    'safe-area-all',
    'gap-responsive',
    'text-responsive-title',
    'text-responsive-body',
  ],
})
