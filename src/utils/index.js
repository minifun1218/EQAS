// 全局工具函数
import { REGEX_CONFIG, STORAGE_CONFIG } from '@/config/index'

/**
 * 格式化时间
 * @param {Date|string|number} date 时间
 * @param {string} format 格式 YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的时间
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间
 * @param {Date|string|number} date 时间
 * @returns {string} 相对时间
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化文件大小
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(size) {
  if (!size || size === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  
  return `${size.toFixed(2)} ${units[index]}`
}

/**
 * 格式化时长
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的时长
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 生成唯一ID
 * @param {string} prefix 前缀
 * @returns {string} 唯一ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  return REGEX_CONFIG.PHONE.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  return REGEX_CONFIG.EMAIL.test(email)
}

/**
 * 验证密码
 * @param {string} password 密码
 * @returns {boolean} 是否有效
 */
export function validatePassword(password) {
  return REGEX_CONFIG.PASSWORD.test(password)
}

/**
 * 验证用户名
 * @param {string} username 用户名
 * @returns {boolean} 是否有效
 */
export function validateUsername(username) {
  return REGEX_CONFIG.USERNAME.test(username)
}

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @param {string} url URL地址
 * @returns {string|null} 参数值
 */
export function getUrlParam(name, url = window.location.href) {
  const regex = new RegExp(`[?&]${name}=([^&#]*)`, 'i')
  const match = regex.exec(url)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * 构建URL参数
 * @param {object} params 参数对象
 * @returns {string} URL参数字符串
 */
export function buildUrlParams(params) {
  if (!params || typeof params !== 'object') return ''
  
  return Object.entries(params)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

/**
 * 安全的JSON解析
 * @param {string} str JSON字符串
 * @param {any} defaultValue 默认值
 * @returns {any} 解析结果
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('JSON解析失败:', error)
    return defaultValue
  }
}

/**
 * 安全的JSON字符串化
 * @param {any} obj 要字符串化的对象
 * @param {string} defaultValue 默认值
 * @returns {string} JSON字符串
 */
export function safeJsonStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON字符串化失败:', error)
    return defaultValue
  }
}

/**
 * 存储数据到本地
 * @param {string} key 存储键
 * @param {any} value 存储值
 * @param {number} expire 过期时间（毫秒）
 */
export function setStorage(key, value, expire = null) {
  try {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    uni.setStorageSync(key, safeJsonStringify(data))
  } catch (error) {
    console.error('存储数据失败:', error)
  }
}

/**
 * 从本地获取数据
 * @param {string} key 存储键
 * @param {any} defaultValue 默认值
 * @returns {any} 存储值
 */
export function getStorage(key, defaultValue = null) {
  try {
    const str = uni.getStorageSync(key)
    if (!str) return defaultValue
    
    const data = safeJsonParse(str)
    if (!data) return defaultValue
    
    // 检查是否过期
    if (data.expire && Date.now() > data.expire) {
      uni.removeStorageSync(key)
      return defaultValue
    }
    
    return data.value
  } catch (error) {
    console.error('获取存储数据失败:', error)
    return defaultValue
  }
}

/**
 * 删除本地存储数据
 * @param {string} key 存储键
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.error('删除存储数据失败:', error)
  }
}

/**
 * 清空本地存储
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
  } catch (error) {
    console.error('清空存储失败:', error)
  }
}

/**
 * 显示Toast提示
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 显示时长
 */
export function showToast(title, icon = 'none', duration = 2000) {
  uni.showToast({
    title,
    icon,
    duration
  })
}

/**
 * 显示加载提示
 * @param {string} title 提示内容
 */
export function showLoading(title = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  uni.hideLoading()
}

/**
 * 显示确认对话框
 * @param {string} content 内容
 * @param {string} title 标题
 * @returns {Promise<boolean>} 是否确认
 */
export function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 获取系统信息
 * @returns {object} 系统信息
 */
export function getSystemInfo() {
  try {
    return uni.getSystemInfoSync()
  } catch (error) {
    console.error('获取系统信息失败:', error)
    return {}
  }
}

/**
 * 获取网络状态
 * @returns {Promise<object>} 网络状态
 */
export function getNetworkType() {
  return new Promise((resolve, reject) => {
    uni.getNetworkType({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 复制到剪贴板
 * @param {string} data 要复制的内容
 * @returns {Promise<boolean>} 是否成功
 */
export function setClipboardData(data) {
  return new Promise((resolve) => {
    uni.setClipboardData({
      data,
      success: () => {
        showToast('复制成功')
        resolve(true)
      },
      fail: () => {
        showToast('复制失败')
        resolve(false)
      }
    })
  })
}

// 导出所有工具函数
export default {
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatDuration,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validateEmail,
  validatePassword,
  validateUsername,
  getUrlParam,
  buildUrlParams,
  safeJsonParse,
  safeJsonStringify,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  getSystemInfo,
  getNetworkType,
  setClipboardData
}