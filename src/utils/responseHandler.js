/**
 * API响应处理工具
 * 统一处理各种API响应格式，确保数据解析的一致性
 */

/**
 * 检查响应是否成功
 * @param {object} response API响应对象
 * @returns {boolean} 是否成功
 */
export function isResponseSuccess(response) {
  if (!response || typeof response !== 'object') {
    return false
  }

  // 支持多种成功状态判断
  const successConditions = [
    response.code === 0,
    response.code === 200,
    response.success === true,
    response.status === 'success',
    response.status === 200
  ]

  return successConditions.some(condition => condition === true)
}

/**
 * 提取响应数据
 * @param {object} response API响应对象
 * @param {string} dataKey 数据字段名，默认为'data'
 * @returns {any} 提取的数据
 */
export function extractResponseData(response, dataKey = 'data') {
  if (!isResponseSuccess(response)) {
    return null
  }

  // 尝试多种数据提取方式
  const dataExtractors = [
    () => response[dataKey],
    () => response.result,
    () => response.payload,
    () => response.content,
    () => response // 如果响应本身就是数据
  ]

  for (const extractor of dataExtractors) {
    const data = extractor()
    if (data !== undefined && data !== null) {
      return data
    }
  }

  return null
}

/**
 * 获取响应错误信息
 * @param {object} response API响应对象
 * @returns {string} 错误信息
 */
export function getResponseError(response) {
  if (!response || typeof response !== 'object') {
    return '响应格式错误'
  }

  // 尝试多种错误信息提取方式
  const errorExtractors = [
    () => response.message,
    () => response.error,
    () => response.msg,
    () => response.errorMessage,
    () => response.description
  ]

  for (const extractor of errorExtractors) {
    const error = extractor()
    if (error && typeof error === 'string' && error.trim()) {
      return error.trim()
    }
  }

  return '未知错误'
}

/**
 * 安全的响应处理器
 * @param {object} response API响应对象
 * @param {object} options 处理选项
 * @returns {object} 处理结果
 */
export function handleResponse(response, options = {}) {
  const {
    dataKey = 'data',
    defaultData = null,
    throwOnError = false,
    logErrors = true
  } = options

  try {
    // 检查响应是否成功
    if (isResponseSuccess(response)) {
      const data = extractResponseData(response, dataKey)
      return {
        success: true,
        data: data !== null ? data : defaultData,
        error: null,
        response
      }
    } else {
      // 处理错误响应
      const errorMessage = getResponseError(response)
      
      if (logErrors) {
        console.warn('API响应错误:', {
          error: errorMessage,
          response
        })
      }

      if (throwOnError) {
        throw new Error(errorMessage)
      }

      return {
        success: false,
        data: defaultData,
        error: errorMessage,
        response
      }
    }
  } catch (error) {
    const errorMessage = error.message || '响应处理异常'
    
    if (logErrors) {
      console.error('响应处理异常:', error)
    }

    if (throwOnError) {
      throw error
    }

    return {
      success: false,
      data: defaultData,
      error: errorMessage,
      response
    }
  }
}

/**
 * 批量处理响应
 * @param {array} responses 响应数组
 * @param {object} options 处理选项
 * @returns {array} 处理结果数组
 */
export function handleMultipleResponses(responses, options = {}) {
  if (!Array.isArray(responses)) {
    return []
  }

  return responses.map(response => handleResponse(response, options))
}

/**
 * 创建响应处理中间件
 * @param {object} defaultOptions 默认选项
 * @returns {function} 中间件函数
 */
export function createResponseHandler(defaultOptions = {}) {
  return function(response, options = {}) {
    const mergedOptions = { ...defaultOptions, ...options }
    return handleResponse(response, mergedOptions)
  }
}

/**
 * 常用的响应处理器预设
 */
export const responseHandlers = {
  // 静默处理，不抛出错误，不记录日志
  silent: createResponseHandler({
    throwOnError: false,
    logErrors: false
  }),

  // 严格处理，抛出错误
  strict: createResponseHandler({
    throwOnError: true,
    logErrors: true
  }),

  // 默认处理
  default: createResponseHandler({
    throwOnError: false,
    logErrors: true
  })
}

/**
 * 响应数据验证器
 * @param {any} data 要验证的数据
 * @param {object} schema 验证模式
 * @returns {boolean} 是否通过验证
 */
export function validateResponseData(data, schema = {}) {
  if (!data || typeof data !== 'object') {
    return false
  }

  const { required = [], types = {} } = schema

  // 检查必需字段
  for (const field of required) {
    if (!(field in data)) {
      console.warn(`缺少必需字段: ${field}`)
      return false
    }
  }

  // 检查字段类型
  for (const [field, expectedType] of Object.entries(types)) {
    if (field in data && typeof data[field] !== expectedType) {
      console.warn(`字段类型错误: ${field} 应为 ${expectedType}，实际为 ${typeof data[field]}`)
      return false
    }
  }

  return true
}