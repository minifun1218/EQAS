// 路径处理工具函数
import { API_CONFIG } from '@/config/index'

/**
 * 将后端传来的非完整路径拼接成完整的后端路径
 * @param {string} path - 后端传来的路径，可能是相对路径或不完整路径
 * @param {object} options - 配置选项
 * @param {string} options.baseUrl - 自定义基础URL，默认使用配置中的BASE_URL
 * @param {boolean} options.forceHttps - 是否强制使用HTTPS，默认false
 * @param {boolean} options.removeApiPrefix - 是否移除路径中的/api前缀，默认false
 * @returns {string} 完整的后端路径
 */
export function buildFullPath(path, options = {}) {
  if (!path || typeof path !== 'string') {
    console.warn('buildFullPath: 路径参数无效', path)
    return ''
  }

  const {
    baseUrl = API_CONFIG.BASE_URL,
    forceHttps = false,
    removeApiPrefix = false
  } = options

  let fullPath = path.trim()

  // 如果已经是完整的URL，直接返回
  if (fullPath.startsWith('http://') || fullPath.startsWith('https://')) {
    return forceHttps ? fullPath.replace('http://', 'https://') : fullPath
  }

  // 确保路径以/开头
  if (!fullPath.startsWith('/')) {
    fullPath = '/' + fullPath
  }

  // 移除/api前缀（如果需要）
  if (removeApiPrefix && fullPath.startsWith('/api')) {
    fullPath = fullPath.substring(4)
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath
    }
  }

  // 获取基础URL
  let finalBaseUrl = baseUrl
  
  // 强制使用HTTPS
  if (forceHttps && finalBaseUrl.startsWith('http://')) {
    finalBaseUrl = finalBaseUrl.replace('http://', 'https://')
  }

  // 确保基础URL不以/结尾
  if (finalBaseUrl.endsWith('/')) {
    finalBaseUrl = finalBaseUrl.slice(0, -1)
  }

  // 拼接完整路径
  const result = finalBaseUrl + fullPath
  
  console.log('buildFullPath:', {
    input: path,
    options,
    output: result
  })
  
  return result
}

/**
 * 批量处理路径数组
 * @param {string[]} paths - 路径数组
 * @param {object} options - 配置选项
 * @returns {string[]} 完整路径数组
 */
export function buildFullPaths(paths, options = {}) {
  if (!Array.isArray(paths)) {
    console.warn('buildFullPaths: paths参数必须是数组', paths)
    return []
  }

  return paths.map(path => buildFullPath(path, options))
}

/**
 * 从完整URL中提取路径部分
 * @param {string} fullUrl - 完整的URL
 * @returns {string} 路径部分
 */
export function extractPath(fullUrl) {
  if (!fullUrl || typeof fullUrl !== 'string') {
    return ''
  }

  try {
    const url = new URL(fullUrl)
    return url.pathname + url.search + url.hash
  } catch (error) {
    // 如果不是有效的URL，可能只是路径
    return fullUrl.startsWith('/') ? fullUrl : '/' + fullUrl
  }
}

/**
 * 检查路径是否为完整URL
 * @param {string} path - 要检查的路径
 * @returns {boolean} 是否为完整URL
 */
export function isFullUrl(path) {
  if (!path || typeof path !== 'string') {
    return false
  }
  return path.startsWith('http://') || path.startsWith('https://')
}

/**
 * 规范化路径格式
 * @param {string} path - 原始路径
 * @returns {string} 规范化后的路径
 */
export function normalizePath(path) {
  if (!path || typeof path !== 'string') {
    return '/'
  }

  let normalized = path.trim()
  
  // 确保以/开头
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  
  // 移除重复的斜杠
  normalized = normalized.replace(/\/+/g, '/')
  
  // 移除末尾的斜杠（除非是根路径）
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  
  return normalized
}

/**
 * 构建API路径（自动添加/api前缀）
 * @param {string} path - API路径
 * @param {object} options - 配置选项
 * @returns {string} 完整的API路径
 */
export function buildApiPath(path, options = {}) {
  let apiPath = normalizePath(path)
  
  // 如果路径不以/api开头，则添加
  if (!apiPath.startsWith('/api')) {
    apiPath = '/api' + apiPath
  }
  
  return buildFullPath(apiPath, options)
}

/**
 * 构建静态资源路径
 * @param {string} path - 资源路径
 * @param {object} options - 配置选项
 * @param {string} options.staticBaseUrl - 静态资源基础URL
 * @returns {string} 完整的静态资源路径
 */
export function buildStaticPath(path, options = {}) {
  const { staticBaseUrl } = options
  
  // 如果指定了静态资源基础URL，使用它
  if (staticBaseUrl) {
    return buildFullPath(path, { ...options, baseUrl: staticBaseUrl })
  }
  
  // 否则使用默认的API基础URL
  return buildFullPath(path, options)
}

// 默认导出主要函数
export default {
  buildFullPath,
  buildFullPaths,
  extractPath,
  isFullUrl,
  normalizePath,
  buildApiPath,
  buildStaticPath
}