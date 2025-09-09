// 全局错误处理
import { showToast, showConfirm } from './index'
import { ERROR_CODE } from '@/config/index'

/**
 * 错误处理类
 */
class ErrorHandler {
  constructor() {
    this.errorQueue = []
    this.isProcessing = false
  }

  /**
   * 处理API错误
   * @param {object} error 错误对象
   * @param {object} options 选项
   */
  handleApiError(error, options = {}) {
    const {
      showMessage = true,
      logError = true,
      customHandler = null
    } = options

    // 记录错误日志
    if (logError) {
      this.logError('API_ERROR', error)
    }

    // 自定义错误处理
    if (customHandler && typeof customHandler === 'function') {
      return customHandler(error)
    }

    // 网络错误
    if (!error.response) {
      if (showMessage) {
        showToast('网络连接失败，请检查网络设置', 'none')
      }
      return
    }

    const { status, data } = error.response
    const errorCode = data?.code || status
    const errorMessage = data?.message || this.getErrorMessage(errorCode)

    // 根据错误码处理
    switch (status) {
      case 401:
        this.handleUnauthorized()
        break
      case 403:
        if (showMessage) {
          showToast('没有权限访问该资源', 'none')
        }
        break
      case 404:
        if (showMessage) {
          showToast('请求的资源不存在', 'none')
        }
        break
      case 422:
        this.handleValidationError(data)
        break
      case 429:
        if (showMessage) {
          showToast('请求过于频繁，请稍后再试', 'none')
        }
        break
      case 500:
        if (showMessage) {
          showToast('服务器内部错误，请稍后再试', 'none')
        }
        break
      case 502:
      case 503:
      case 504:
        if (showMessage) {
          showToast('服务暂时不可用，请稍后再试', 'none')
        }
        break
      default:
        if (showMessage && errorMessage) {
          showToast(errorMessage, 'none')
        }
    }
  }

  /**
   * 处理未授权错误
   */
  async handleUnauthorized() {
    // 避免重复处理
    if (this.isProcessing) return
    this.isProcessing = true

    try {
      const confirmed = await showConfirm('登录已过期，请重新登录', '提示')
      if (confirmed) {
        // 清除用户信息
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/auth/login/login'
        })
      }
    } catch (error) {
      console.error('处理未授权错误失败:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 处理验证错误
   * @param {object} data 错误数据
   */
  handleValidationError(data) {
    if (data?.errors && typeof data.errors === 'object') {
      // 显示第一个验证错误
      const firstError = Object.values(data.errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        showToast(firstError[0], 'none')
      }
    } else if (data?.message) {
      showToast(data.message, 'none')
    } else {
      showToast('请求参数有误', 'none')
    }
  }

  /**
   * 处理业务错误
   * @param {object} response 响应对象
   * @param {object} options 选项
   */
  handleBusinessError(response, options = {}) {
    const {
      showMessage = true,
      logError = true
    } = options

    const { code, message } = response

    if (logError) {
      this.logError('BUSINESS_ERROR', { code, message })
    }

    if (showMessage && message) {
      showToast(message, 'none')
    }
  }

  /**
   * 处理JS错误
   * @param {Error} error 错误对象
   * @param {object} options 选项
   */
  handleJsError(error, options = {}) {
    const {
      showMessage = false,
      logError = true
    } = options

    if (logError) {
      this.logError('JS_ERROR', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }

    if (showMessage) {
      showToast('程序运行出错，请稍后再试', 'none')
    }
  }

  /**
   * 处理Promise拒绝
   * @param {object} event 事件对象
   */
  handleUnhandledRejection(event) {
    this.logError('UNHANDLED_REJECTION', {
      reason: event.reason,
      promise: event.promise
    })

    // 阻止默认的控制台错误输出
    event.preventDefault()
  }

  /**
   * 获取错误消息
   * @param {number|string} code 错误码
   * @returns {string} 错误消息
   */
  getErrorMessage(code) {
    return ERROR_CODE[code] || '未知错误'
  }

  /**
   * 记录错误日志
   * @param {string} type 错误类型
   * @param {object} error 错误对象
   */
  logError(type, error) {
    const errorInfo = {
      type,
      error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location?.href || '',
      userId: uni.getStorageSync('userInfo')?.id || null
    }

    // 开发环境直接输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type}]`, errorInfo)
      return
    }

    // 生产环境可以发送到错误监控服务
    this.sendErrorToMonitor(errorInfo)
  }

  /**
   * 发送错误到监控服务
   * @param {object} errorInfo 错误信息
   */
  sendErrorToMonitor(errorInfo) {
    // 添加到错误队列
    this.errorQueue.push(errorInfo)

    // 批量发送错误（避免频繁请求）
    if (this.errorQueue.length >= 10) {
      this.flushErrorQueue()
    }
  }

  /**
   * 刷新错误队列
   */
  async flushErrorQueue() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      // 这里可以调用错误监控API
      // await api.post('/errors', { errors })
      console.log('发送错误日志到监控服务:', errors)
    } catch (error) {
      // 发送失败，重新加入队列
      this.errorQueue.unshift(...errors)
      console.error('发送错误日志失败:', error)
    }
  }

  /**
   * 初始化全局错误处理
   */
  init() {
    // 监听未捕获的Promise拒绝
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnhandledRejection(event)
      })

      // 监听JS错误
      window.addEventListener('error', (event) => {
        this.handleJsError(event.error || new Error(event.message))
      })
    }

    // 定时刷新错误队列
    setInterval(() => {
      this.flushErrorQueue()
    }, 30000) // 30秒
  }
}

// 创建全局错误处理实例
const errorHandler = new ErrorHandler()

// 导出错误处理方法
export const {
  handleApiError,
  handleBusinessError,
  handleJsError,
  handleUnhandledRejection,
  logError
} = errorHandler

// 导出错误处理实例
export default errorHandler