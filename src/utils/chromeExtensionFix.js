/**
 * Chrome扩展错误修复工具
 * 解决 "Unchecked runtime.lastError: The message port closed before a response was received" 错误
 */

/**
 * 初始化Chrome扩展错误修复
 */
export function initChromeExtensionFix() {
  // 只在浏览器环境中执行
  if (typeof window === 'undefined') {
    return
  }

  // 监听并过滤Chrome扩展相关的错误
  const originalConsoleError = console.error
  console.error = function(...args) {
    const message = args.join(' ')
    
    // 只过滤确认的Chrome扩展相关错误消息
    if (isExtensionError(message)) {
      // 在开发环境下可以选择性输出扩展错误用于调试
      if (process.env.NODE_ENV === 'development') {
        originalConsoleError.apply(console, ['[Chrome Extension Error]', ...args])
      }
      return // 静默处理扩展错误
    }
    
    // 其他错误正常输出
    originalConsoleError.apply(console, args)
  }

  // 监听未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(String(event.reason))) {
      event.preventDefault() // 阻止错误冒泡
      return
    }
  })

  // 监听全局错误
  window.addEventListener('error', (event) => {
    if (isExtensionError(event.message)) {
      event.preventDefault() // 阻止错误冒泡
      return
    }
  })
}

/**
 * 检查是否是Chrome扩展相关的错误
 * @param {string} message 错误消息
 * @returns {boolean} 是否是扩展错误
 */
function isExtensionError(message) {
  // 更精确的Chrome扩展错误模式匹配
  const extensionErrorPatterns = [
    /chrome-extension:\/\//i,
    /moz-extension:\/\//i,
    /safari-extension:\/\//i,
    /Extension context invalidated/i,
    /Unchecked runtime\.lastError.*message port closed/i,
    /The message port closed before a response was received/i,
    /Could not establish connection.*Receiving end does not exist/i,
    /Unchecked runtime\.lastError.*Could not establish connection/i,
    /Receiving end does not exist/i,
    /chrome\.runtime\.lastError/i
  ]

  // 排除应用程序业务逻辑错误
  const appErrorPatterns = [
    /Cannot read propert(y|ies) of (null|undefined)/i,
    /TypeError.*null/i,
    /ReferenceError/i,
    /SyntaxError/i
  ]

  // 如果是应用程序错误，不过滤
  if (appErrorPatterns.some(pattern => pattern.test(message))) {
    return false
  }

  // 检查是否匹配扩展错误模式
  return extensionErrorPatterns.some(pattern => pattern.test(message))
}

/**
 * 安全的Promise包装器，自动处理扩展相关错误
 * @param {Promise} promise 要包装的Promise
 * @returns {Promise} 包装后的Promise
 */
export function safePromise(promise) {
  return promise.catch(error => {
    if (isExtensionError(String(error))) {
      // 静默处理扩展错误
      return Promise.resolve(null)
    }
    // 重新抛出其他错误
    throw error
  })
}

/**
 * 安全的异步函数包装器
 * @param {Function} asyncFn 异步函数
 * @returns {Function} 包装后的函数
 */
export function safeAsync(asyncFn) {
  return async function(...args) {
    try {
      return await asyncFn.apply(this, args)
    } catch (error) {
      if (isExtensionError(String(error))) {
        console.warn('Chrome扩展错误已被静默处理:', error.message)
        return null
      }
      throw error
    }
  }
}

/**
 * 检查当前环境是否有Chrome扩展
 * @returns {boolean} 是否检测到扩展
 */
export function hasExtensions() {
  if (typeof window === 'undefined') {
    return false
  }

  // 检查常见的扩展API
  return !!(window.chrome?.runtime || window.browser?.runtime)
}

/**
 * 获取扩展信息（如果可用）
 * @returns {object|null} 扩展信息
 */
export function getExtensionInfo() {
  if (!hasExtensions()) {
    return null
  }

  try {
    const runtime = window.chrome?.runtime || window.browser?.runtime
    return {
      id: runtime?.id,
      version: runtime?.getManifest?.()?.version,
      name: runtime?.getManifest?.()?.name
    }
  } catch (error) {
    return null
  }
}

// 自动初始化（可选）
if (typeof window !== 'undefined') {
  // 延迟初始化，确保页面加载完成
  setTimeout(() => {
    initChromeExtensionFix()
  }, 100)
}