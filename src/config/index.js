// 全局配置文件

// 环境配置
export const ENV = {
  development: 'development',
  production: 'production',
  test: 'test'
}

// 当前环境
export const NODE_ENV = process.env.NODE_ENV || ENV.development

// API配置
export const API_CONFIG = {
  // 基础URL
  BASE_URL: NODE_ENV === ENV.development 
    ? 'http://localhost:8080' 
    : 'https://api.icao4.com',
  
  // 超时时间
  TIMEOUT: 10000,
  
  // 重试次数
  RETRY_COUNT: 3,
  
  // 重试延迟
  RETRY_DELAY: 1000
}

// 存储配置
export const STORAGE_CONFIG = {
  // 存储键名
  KEYS: {
    TOKEN: 'token',
    USER_INFO: 'userInfo',
    IS_LOGGED_IN: 'isLoggedIn',
    LOGIN_TIME: 'loginTime',
    SAVED_PASSWORD: 'savedPassword',
    STUDY_STATS: 'studyStats',
    SETTINGS: 'settings',
    THEME: 'theme',
    LANGUAGE: 'language'
  },
  
  // 过期时间（毫秒）
  EXPIRE_TIME: {
    TOKEN: 7 * 24 * 60 * 60 * 1000, // 7天
    USER_INFO: 7 * 24 * 60 * 60 * 1000, // 7天
    CACHE: 30 * 60 * 1000 // 30分钟
  }
}

// 应用配置
export const APP_CONFIG = {
  // 应用信息
  NAME: 'ICAO4',
  VERSION: '1.0.0',
  DESCRIPTION: '航空英语考试系统',
  
  // 页面配置
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // 文件上传配置
  UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'audio/mp3', 'audio/wav'],
    CHUNK_SIZE: 1024 * 1024 // 1MB
  },
  
  // 音频配置
  AUDIO: {
    MAX_DURATION: 300, // 5分钟
    SAMPLE_RATE: 16000,
    BIT_RATE: 128
  }
}

// 路由配置
export const ROUTE_CONFIG = {
  // 白名单路由（不需要登录）
  WHITE_LIST: [
    '/pages/index/index',
    '/pages/auth/login',
    '/pages/auth/register',
    '/pages/NotFound/NotFound'
  ],
  
  // 默认路由
  DEFAULT_ROUTE: '/pages/index/index',
  
  // 登录页面
  LOGIN_ROUTE: '/pages/auth/login'
}

// 主题配置
export const THEME_CONFIG = {
  // 主色调
  PRIMARY_COLOR: '#667eea',
  SECONDARY_COLOR: '#764ba2',
  
  // 功能色
  SUCCESS_COLOR: '#52c41a',
  WARNING_COLOR: '#faad14',
  ERROR_COLOR: '#f5222d',
  INFO_COLOR: '#1890ff',
  
  // 中性色
  TEXT_COLOR: '#333333',
  TEXT_COLOR_SECONDARY: '#666666',
  TEXT_COLOR_DISABLED: '#999999',
  BORDER_COLOR: '#e8e8e8',
  BACKGROUND_COLOR: '#f5f5f5'
}

// 错误码配置
export const ERROR_CODE = {
  // 成功
  SUCCESS: 0,
  
  // 客户端错误
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  
  // 服务器错误
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  
  // 业务错误
  BUSINESS_ERROR: 1000,
  VALIDATION_ERROR: 1001,
  AUTHENTICATION_ERROR: 1002,
  AUTHORIZATION_ERROR: 1003,
  RESOURCE_NOT_FOUND: 1004,
  RESOURCE_CONFLICT: 1005
}

// 正则表达式配置
export const REGEX_CONFIG = {
  // 手机号
  PHONE: /^1[3-9]\d{9}$/,
  
  // 邮箱
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // 密码（8-20位，包含字母和数字）
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/,
  
  // 用户名（4-20位，字母数字下划线）
  USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
  
  // 中文姓名
  CHINESE_NAME: /^[\u4e00-\u9fa5]{2,10}$/,
  
  // 身份证号
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
}

// 导出默认配置
export default {
  ENV,
  NODE_ENV,
  API_CONFIG,
  STORAGE_CONFIG,
  APP_CONFIG,
  ROUTE_CONFIG,
  THEME_CONFIG,
  ERROR_CODE,
  REGEX_CONFIG
}