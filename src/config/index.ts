// 应用配置

export interface AppConfig {
  app: {
    title: string
    description: string
    version: string
  }
  api: {
    baseURL: string
    timeout: number
  }
  features: {
    analytics: boolean
    errorReporting: boolean
    performanceMonitoring: boolean
  }
  services: {
    sentryDSN?: string
    googleAnalyticsId?: string
    baiduAnalyticsId?: string
  }
  dev: {
    devTools: boolean
    mockData: boolean
  }
}

// 获取环境变量的工具函数
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`)
  }
  return value || defaultValue || ''
}

const getBooleanEnvVar = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

const getNumberEnvVar = (key: string, defaultValue = 0): number => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

// 应用配置
export const config: AppConfig = {
  app: {
    title: getEnvVar('VITE_APP_TITLE', 'Vue3 响应式项目模板'),
    description: getEnvVar('VITE_APP_DESCRIPTION', '一个主要适配 H5，同时在 PC 端也有良好体验的 Vue3 项目模板'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0')
  },
  api: {
    baseURL: getEnvVar('VITE_API_BASE_URL', 'https://tool-ruddy.vercel.app/api'),
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000)
  },
  features: {
    analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS'),
    errorReporting: getBooleanEnvVar('VITE_ENABLE_ERROR_REPORTING'),
    performanceMonitoring: getBooleanEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING')
  },
  services: {
    sentryDSN: getEnvVar('VITE_SENTRY_DSN'),
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    baiduAnalyticsId: getEnvVar('VITE_BAIDU_ANALYTICS_ID')
  },
  dev: {
    devTools: getBooleanEnvVar('VITE_DEV_TOOLS', import.meta.env.DEV),
    mockData: getBooleanEnvVar('VITE_MOCK_DATA')
  }
}

// 导出常用配置
export const { app, api, features, services, dev } = config

// 环境判断
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const isTest = import.meta.env.MODE === 'test'

// 打印配置信息（仅在开发环境）
if (isDev) {
  console.group('🔧 App Configuration')
  console.log('Environment:', import.meta.env.MODE)
  console.log('Config:', config)
  console.groupEnd()
}
