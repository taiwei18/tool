<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useDevice } from '@/composables/useDevice'

interface Props {
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'wide' | 'full' | 'responsive'
  padding?: 'none' | 'small' | 'medium' | 'large' | 'responsive'
  centerContent?: boolean
  fullHeight?: boolean
  safeArea?: boolean
  background?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'responsive',
  padding: 'responsive',
  centerContent: false,
  fullHeight: false,
  safeArea: true,
  background: 'transparent'
})

const { mobile, tablet, desktop } = useDisplay()
const { deviceInfo, isMobile, isTablet, isDesktop, isTouch } = useDevice()

const containerClass = computed(() => {
  const classes = ['responsive-layout']

  // 最大宽度设置 - H5 优先
  switch (props.maxWidth) {
    case 'mobile':
      classes.push('container-mobile')
      break
    case 'tablet':
      classes.push('container-tablet')
      break
    case 'desktop':
      classes.push('container-desktop')
      break
    case 'wide':
      classes.push('container-wide')
      break
    case 'full':
      classes.push('w-full')
      break
    case 'responsive':
    default:
      classes.push('container-responsive')
  }

  // 内边距设置 - H5 优化
  switch (props.padding) {
    case 'none':
      break
    case 'small':
      classes.push('p-3', 'sm:p-4')
      break
    case 'medium':
      classes.push('p-4', 'sm:p-6', 'md:p-8')
      break
    case 'large':
      classes.push('p-6', 'sm:p-8', 'md:p-12')
      break
    case 'responsive':
    default:
      classes.push(props.safeArea ? 'safe-area-all' : 'p-responsive')
  }

  // 内容居中
  if (props.centerContent) {
    classes.push('flex-center')
  }

  // 全高度
  if (props.fullHeight) {
    classes.push('min-h-screen')
  }

  // 触摸设备优化
  if (isTouch.value) {
    classes.push('touch-optimized')
  }

  return classes.join(' ')
})

const containerStyle = computed(() => ({
  background: props.background,
  '--device-width': `${deviceInfo.value.screenWidth}px`,
  '--device-height': `${deviceInfo.value.screenHeight}px`,
  '--device-ratio': deviceInfo.value.devicePixelRatio,
}))

const deviceContext = computed(() => ({
  isMobile: isMobile.value,
  isTablet: isTablet.value,
  isDesktop: isDesktop.value,
  isTouch: isTouch.value,
  orientation: deviceInfo.value.orientation,
  screenWidth: deviceInfo.value.screenWidth,
  screenHeight: deviceInfo.value.screenHeight,
  devicePixelRatio: deviceInfo.value.devicePixelRatio,
  breakpoint: isMobile.value ? 'mobile' : isTablet.value ? 'tablet' : 'desktop'
}))
</script>

<template>
  <div
    :class="containerClass"
    :style="containerStyle"
  >
    <slot :device="deviceContext" />
  </div>
</template>

<style scoped>
.responsive-layout {
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
}

/* H5 优化 - 移动端优先 */
.responsive-layout {
  /* 防止水平滚动 */
  overflow-x: hidden;
  /* H5 优化的字体渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 触摸优化 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* 移动端特定样式 */
@media screen and (max-width: 767px) {
  .responsive-layout {
    /* 移动端安全区域 */
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }

  .responsive-layout.touch-optimized {
    /* 触摸友好的间距 */
    --touch-target-size: 44px;
  }

  /* 横屏优化 */
  .responsive-layout[data-orientation="landscape"] {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 平板端优化 */
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .responsive-layout {
    /* 平板端的中等间距 */
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }
}

/* 桌面端优化 */
@media screen and (min-width: 1024px) {
  .responsive-layout {
    /* 桌面端标准间距 */
    padding-left: max(2rem, env(safe-area-inset-left));
    padding-right: max(2rem, env(safe-area-inset-right));
  }

  /* 鼠标悬停效果 */
  .responsive-layout:not(.touch-optimized) {
    --touch-target-size: 40px;
  }
}

/* 高密度屏幕优化 */
@media screen and (-webkit-min-device-pixel-ratio: 2),
       screen and (min-resolution: 192dpi) {
  .responsive-layout {
    /* 高DPI屏幕的字体优化 */
    font-feature-settings: 'liga' 1, 'kern' 1;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .responsive-layout {
    color-scheme: dark;
  }
}

/* 减少动画的用户偏好 */
@media (prefers-reduced-motion: reduce) {
  .responsive-layout {
    transition: none;
  }
}

/* 容器查询支持（如果浏览器支持） */
@container (max-width: 767px) {
  .responsive-layout {
    container-type: inline-size;
  }
}
</style>
