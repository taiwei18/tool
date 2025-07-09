import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  devicePixelRatio: number
  isTouch: boolean
}

/**
 * 设备检测组合式函数 - H5 优先，PC 端适配
 */
export function useDevice() {
  const screenWidth = ref(0)
  const screenHeight = ref(0)
  const orientation = ref<'portrait' | 'landscape'>('portrait')
  const devicePixelRatio = ref(1)

  const updateDeviceInfo = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    devicePixelRatio.value = window.devicePixelRatio || 1
  }

  // 响应式计算属性
  const deviceInfo = computed<DeviceInfo>(() => {
    const width = screenWidth.value
    const userAgent = navigator.userAgent.toLowerCase()

    // 优化的设备检测逻辑 - H5 优先
    const isIOS = /ipad|iphone|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // 基于屏幕尺寸的设备判断（更准确）
    const isMobile = width < 768 || (isMobileUA && width < 1024)
    const isTablet = !isMobile && (width >= 768 && width < 1024) || (isMobileUA && width >= 768)
    const isDesktop = width >= 1024 && !isMobileUA

    return {
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      screenWidth: width,
      screenHeight: screenHeight.value,
      orientation: orientation.value,
      devicePixelRatio: devicePixelRatio.value,
      isTouch
    }
  })

  const handleResize = () => {
    updateDeviceInfo()
  }

  const handleOrientationChange = () => {
    // 延迟更新以确保获取正确的尺寸
    setTimeout(updateDeviceInfo, 100)
  }

  onMounted(() => {
    updateDeviceInfo()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // 监听触摸事件变化
    window.addEventListener('touchstart', handleResize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
    window.removeEventListener('touchstart', handleResize)
  })

  return {
    deviceInfo,
    // 单独暴露常用属性
    isMobile: computed(() => deviceInfo.value.isMobile),
    isTablet: computed(() => deviceInfo.value.isTablet),
    isDesktop: computed(() => deviceInfo.value.isDesktop),
    isTouch: computed(() => deviceInfo.value.isTouch),
    orientation: computed(() => deviceInfo.value.orientation)
  }
}
