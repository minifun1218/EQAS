// 全局权限管理
import { getStorage } from './index'
import { ROUTE_CONFIG } from '@/config/index'

/**
 * 权限管理类
 */
class PermissionManager {
  constructor() {
    this.whiteList = ROUTE_CONFIG.WHITE_LIST || []
    this.loginPath = ROUTE_CONFIG.LOGIN_PATH || '/pages/auth/login/login'
    this.homePath = ROUTE_CONFIG.HOME_PATH || '/pages/index/index'
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const token = getStorage('token')
    const userInfo = getStorage('userInfo')
    return !!(token && userInfo)
  }

  /**
   * 获取用户信息
   * @returns {object|null} 用户信息
   */
  getUserInfo() {
    return getStorage('userInfo')
  }

  /**
   * 获取用户角色
   * @returns {string|null} 用户角色
   */
  getUserRole() {
    const userInfo = this.getUserInfo()
    return userInfo?.role || null
  }

  /**
   * 获取用户权限列表
   * @returns {array} 权限列表
   */
  getUserPermissions() {
    const userInfo = this.getUserInfo()
    return userInfo?.permissions || []
  }

  /**
   * 检查是否有指定权限
   * @param {string|array} permission 权限码或权限码数组
   * @returns {boolean} 是否有权限
   */
  hasPermission(permission) {
    if (!this.isLoggedIn()) {
      return false
    }

    const userPermissions = this.getUserPermissions()
    
    if (Array.isArray(permission)) {
      // 检查是否有任一权限
      return permission.some(p => userPermissions.includes(p))
    } else {
      // 检查单个权限
      return userPermissions.includes(permission)
    }
  }

  /**
   * 检查是否有指定角色
   * @param {string|array} role 角色或角色数组
   * @returns {boolean} 是否有角色
   */
  hasRole(role) {
    if (!this.isLoggedIn()) {
      return false
    }

    const userRole = this.getUserRole()
    
    if (Array.isArray(role)) {
      return role.includes(userRole)
    } else {
      return userRole === role
    }
  }

  /**
   * 检查路径是否在白名单中
   * @param {string} path 路径
   * @returns {boolean} 是否在白名单
   */
  isInWhiteList(path) {
    return this.whiteList.some(whitePath => {
      if (whitePath.endsWith('*')) {
        // 支持通配符匹配
        const prefix = whitePath.slice(0, -1)
        return path.startsWith(prefix)
      }
      return path === whitePath
    })
  }

  /**
   * 检查是否可以访问指定路径
   * @param {string} path 路径
   * @param {object} options 选项
   * @returns {boolean} 是否可以访问
   */
  canAccess(path, options = {}) {
    const {
      requireAuth = true,
      requiredPermissions = [],
      requiredRoles = []
    } = options

    // 检查白名单
    if (this.isInWhiteList(path)) {
      return true
    }

    // 检查是否需要登录
    if (requireAuth && !this.isLoggedIn()) {
      return false
    }

    // 检查权限
    if (requiredPermissions.length > 0 && !this.hasPermission(requiredPermissions)) {
      return false
    }

    // 检查角色
    if (requiredRoles.length > 0 && !this.hasRole(requiredRoles)) {
      return false
    }

    return true
  }

  /**
   * 路由守卫
   * @param {string} path 目标路径
   * @param {object} options 路由选项
   * @returns {Promise<boolean>} 是否允许导航
   */
  async routeGuard(path, options = {}) {
    const {
      requireAuth = true,
      requiredPermissions = [],
      requiredRoles = [],
      redirectToLogin = true
    } = options

    // 检查是否可以访问
    if (this.canAccess(path, { requireAuth, requiredPermissions, requiredRoles })) {
      return true
    }

    // 未登录且需要登录
    if (requireAuth && !this.isLoggedIn()) {
      if (redirectToLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: this.loginPath
          })
        }, 1500)
      }
      return false
    }

    // 权限不足
    if (requiredPermissions.length > 0 && !this.hasPermission(requiredPermissions)) {
      uni.showToast({
        title: '权限不足',
        icon: 'none'
      })
      return false
    }

    // 角色不符
    if (requiredRoles.length > 0 && !this.hasRole(requiredRoles)) {
      uni.showToast({
        title: '角色权限不足',
        icon: 'none'
      })
      return false
    }

    return false
  }

  /**
   * 登录成功后的处理
   * @param {object} userInfo 用户信息
   * @param {string} token 令牌
   * @param {string} redirectPath 重定向路径
   */
  async handleLoginSuccess(userInfo, token, redirectPath = null) {
    // 存储用户信息和令牌
    uni.setStorageSync('userInfo', userInfo)
    uni.setStorageSync('token', token)

    // 重定向到指定页面或首页
    const targetPath = redirectPath || this.homePath
    
    uni.reLaunch({
      url: targetPath
    })
  }

  /**
   * 登出处理
   * @param {boolean} redirectToLogin 是否重定向到登录页
   */
  async handleLogout(redirectToLogin = true) {
    // 清除用户信息
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
    
    // 清除其他相关缓存
    uni.removeStorageSync('menuList')
    uni.removeStorageSync('permissions')

    if (redirectToLogin) {
      uni.reLaunch({
        url: this.loginPath
      })
    }
  }

  /**
   * 检查令牌是否过期
   * @returns {boolean} 是否过期
   */
  isTokenExpired() {
    const userInfo = this.getUserInfo()
    if (!userInfo || !userInfo.tokenExpire) {
      return false
    }

    return Date.now() > userInfo.tokenExpire
  }

  /**
   * 刷新用户信息
   * @returns {Promise<object>} 用户信息
   */
  async refreshUserInfo() {
    try {
      // 这里可以调用API获取最新用户信息
      // const response = await userApi.getUserInfo()
      // const userInfo = response.data
      
      // 暂时返回缓存的用户信息
      const userInfo = this.getUserInfo()
      
      if (userInfo) {
        uni.setStorageSync('userInfo', userInfo)
      }
      
      return userInfo
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      return null
    }
  }

  /**
   * 初始化权限管理
   */
  init() {
    // 监听页面显示事件，检查登录状态
    uni.onAppShow(() => {
      if (this.isTokenExpired()) {
        this.handleLogout(true)
      }
    })

    console.log('权限管理初始化完成')
  }
}

// 创建权限管理实例
const permissionManager = new PermissionManager()

// 导出权限检查方法
export const {
  isLoggedIn,
  getUserInfo,
  getUserRole,
  getUserPermissions,
  hasPermission,
  hasRole,
  canAccess,
  routeGuard,
  handleLoginSuccess,
  handleLogout,
  isTokenExpired,
  refreshUserInfo
} = permissionManager

// 导出权限管理实例
export default permissionManager