// 全局错误处理系统

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  code?: string | number
  message: string
  originalError?: Error
  context?: Record<string, any>
  timestamp: number
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: AppError[] = []
  private maxQueueSize = 100
  private listeners: ((error: AppError) => void)[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * 处理错误
   */
  handleError(error: Error | AppError | string, context?: Record<string, any>): void {
    const appError = this.normalizeError(error, context)
    this.addToQueue(appError)
    this.notifyListeners(appError)
    this.logError(appError)
  }

  /**
   * 标准化错误
   */
  private normalizeError(error: Error | AppError | string, context?: Record<string, any>): AppError {
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        context,
        timestamp: Date.now()
      }
    }

    if ('type' in error && 'message' in error) {
      // 已经是 AppError
      return { ...error, context: { ...error.context, ...context } }
    }

    // 处理原生 Error
    let type = ErrorType.UNKNOWN
    let code: string | number | undefined

    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      type = ErrorType.SYSTEM
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      type = ErrorType.NETWORK
    }

    return {
      type,
      code,
      message: error.message || String(error),
      originalError: error,
      context,
      timestamp: Date.now()
    }
  }

  /**
   * 添加到错误队列
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error)
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (err) {
        console.error('Error in error listener:', err)
      }
    })
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError): void {
    const logData = {
      timestamp: new Date(error.timestamp).toISOString(),
      type: error.type,
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.originalError?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    if (import.meta.env.DEV) {
      console.group(`🚨 ${error.type} Error`)
      console.error('Message:', error.message)
      console.log('Details:', logData)
      if (error.originalError) {
        console.error('Original Error:', error.originalError)
      }
      console.groupEnd()
    } else {
      // 生产环境可以发送到日志服务
      this.sendToLogService(logData)
    }
  }

  /**
   * 发送到日志服务
   */
  private async sendToLogService(logData: any): Promise<void> {
    try {
      // 这里可以替换为实际的日志服务
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      })
    } catch (err) {
      console.error('Failed to send log to service:', err)
    }
  }

  /**
   * 添加错误监听器
   */
  onError(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): AppError[] {
    return [...this.errorQueue]
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.errorQueue = []
  }
}

// 创建全局错误处理器实例
export const errorHandler = ErrorHandler.getInstance()

// 捕获全局未处理的错误
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandledPromiseRejection' }
    )
  })
}

// 便捷的错误创建函数
export const createError = {
  network: (message: string, context?: Record<string, any>): AppError => ({
    type: ErrorType.NETWORK,
    message,
    context,
    timestamp: Date.now()
  }),

  validation: (message: string, field?: string, context?: Record<string, any>): AppError => ({
    type: ErrorType.VALIDATION,
    message,
    context: { field, ...context },
    timestamp: Date.now()
  }),

  permission: (message: string, context?: Record<string, any>): AppError => ({
    type: ErrorType.PERMISSION,
    message,
    context,
    timestamp: Date.now()
  }),

  business: (message: string, code?: string | number, context?: Record<string, any>): AppError => ({
    type: ErrorType.BUSINESS,
    code,
    message,
    context,
    timestamp: Date.now()
  }),

  system: (message: string, context?: Record<string, any>): AppError => ({
    type: ErrorType.SYSTEM,
    message,
    context,
    timestamp: Date.now()
  })
}
