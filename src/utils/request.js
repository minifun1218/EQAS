// HTTP请求拦截器配置
import { API_CONFIG, STORAGE_CONFIG } from '@/config/index'
import { showToast, showLoading, hideLoading } from '@/utils/index'
import { handleApiError, handleBusinessError } from '@/utils/errorHandler'
import { buildFullPath, isFullUrl } from '@/utils/pathUtils'
import { isResponseSuccess, getResponseError } from '@/utils/responseHandler'

// 基础配置
const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://api.example.com'
const TIMEOUT = 10000

// 请求拦截器
function requestInterceptor(options) {
  // 使用路径处理工具构建完整URL
  if (!isFullUrl(options.url)) {
    options.url = buildFullPath(options.url, { baseUrl: BASE_URL })
  }
  
  // 设置超时时间
  options.timeout = options.timeout || TIMEOUT
  
  // 添加请求头
  options.header = {
    'Content-Type': 'application/json',
    ...options.header
  }
  
  // 添加认证token
  const token = uni.getStorageSync('token')
  if (token) {
    options.header.Authorization = `Bearer ${token}`
  }
  
  // 添加设备信息
  const systemInfo = uni.getSystemInfoSync()
  options.header['X-Device-Type'] = systemInfo.platform
  options.header['X-App-Version'] = '1.0.0'
  
  console.log('请求拦截器 - 发送请求:', {
    url: options.url,
    method: options.method,
    data: options.data,
    header: options.header
  })
  
  return options
}

// 响应拦截器
function responseInterceptor(response, options) {
  console.log('响应拦截器 - 收到响应:', {
    url: options.url,
    statusCode: response.statusCode,
    data: response.data
  })
  
  // 处理HTTP状态码
  if (response.statusCode >= 200 && response.statusCode < 300) {
    // 成功响应
    const data = response.data
    
    // 处理业务状态码
    if (data && typeof data === 'object') {
      // 使用统一的响应成功判断
      if (isResponseSuccess(data)) {
        return Promise.resolve(data)
      } else if (data.code === 401 || data.code === 403) {
        // 认证失败，清除token并跳转登录
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        const authErrorMessage = getResponseError(data) || '登录已过期，请重新登录'
        uni.showToast({
          title: authErrorMessage,
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/auth/login'
          })
        }, 1500)
        return Promise.reject(new Error(authErrorMessage))
      } else {
        // 其他业务错误 - 使用统一的错误信息提取
        const errorMessage = getResponseError(data)
        
        // 避免显示误导性的成功消息作为错误
        if (errorMessage && !['success', 'ok', '成功'].includes(errorMessage.toLowerCase())) {
          uni.showToast({
            title: errorMessage,
            icon: 'none'
          })
        }
        
        return Promise.reject(new Error(errorMessage))
      }
    }
    
    return Promise.resolve(response.data)
  } else {
    // HTTP错误
    let errorMessage = '网络请求失败'
    
    switch (response.statusCode) {
      case 400:
        errorMessage = '请求参数错误'
        break
      case 401:
        errorMessage = '未授权，请重新登录'
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/auth/login'
          })
        }, 1500)
        break
      case 403:
        errorMessage = '拒绝访问'
        break
      case 404:
        errorMessage = '请求地址不存在'
        break
      case 500:
        errorMessage = '服务器内部错误'
        break
      case 502:
        errorMessage = '网关错误'
        break
      case 503:
        errorMessage = '服务不可用'
        break
      case 504:
        errorMessage = '网关超时'
        break
      default:
        errorMessage = `网络错误 ${response.statusCode}`
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none'
    })
    
    return Promise.reject(new Error(errorMessage))
  }
}

// 错误处理拦截器
function errorInterceptor(error, options) {
  console.error('请求错误:', {
    url: options.url,
    error: error
  })
  
  // 使用统一错误处理
  handleApiError(error, { showMessage: true, logError: true })
  
  // 确保错误被正确包装，避免未捕获的Promise拒绝
  const wrappedError = error instanceof Error ? error : new Error(String(error))
  return Promise.reject(wrappedError)
}

// 封装的请求方法
class Request {
  // GET请求
  static get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }
  
  // POST请求
  static post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }
  
  // PUT请求
  static put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }
  
  // DELETE请求
  static delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
  
  // 上传文件
  static upload(url, filePath, formData = {}, options = {}) {
    const uploadOptions = requestInterceptor({
      url,
      filePath,
      name: 'file',
      formData,
      ...options
    })
    
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        ...uploadOptions,
        success: (response) => {
          try {
            response.data = JSON.parse(response.data)
            responseInterceptor(response, uploadOptions)
              .then(resolve)
              .catch(reject)
          } catch (error) {
            reject(new Error('响应数据解析失败'))
          }
        },
        fail: (error) => {
          errorInterceptor(error, uploadOptions)
            .catch(reject)
        }
      })
    })
  }
  
  // 下载文件
  static download(url, options = {}) {
    const downloadOptions = requestInterceptor({
      url,
      ...options
    })
    
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        ...downloadOptions,
        success: resolve,
        fail: (error) => {
          errorInterceptor(error, downloadOptions)
            .catch(reject)
        }
      })
    })
  }
  
  // 基础请求方法
  static request(options) {
    // 应用请求拦截器
    const requestOptions = requestInterceptor(options)
    
    return new Promise((resolve, reject) => {
      uni.request({
        ...requestOptions,
        success: (response) => {
          responseInterceptor(response, requestOptions)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          errorInterceptor(error, requestOptions)
            .catch(reject)
        }
      })
    })
  }
}

// 导出请求实例
export default Request

// 导出各种请求方法
export const { get, post, put, delete: del, upload, download, request } = Request