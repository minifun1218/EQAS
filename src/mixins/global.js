// 全局混入
import { 
  formatDate, 
  formatRelativeTime, 
  formatFileSize, 
  formatDuration,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  debounce,
  throttle
} from '@/utils/index'
import { 
  hasPermission, 
  hasRole, 
  isLoggedIn,
  getUserInfo 
} from '@/utils/permission'
import { APP_CONFIG } from '@/config/index'

/**
 * 全局混入对象
 */
export default {
  data() {
    return {
      // 全局配置
      $config: APP_CONFIG
    }
  },

  computed: {
    // 当前用户信息
    $currentUser() {
      return getUserInfo()
    },

    // 是否已登录
    $isLoggedIn() {
      return isLoggedIn()
    },

    // 用户角色
    $userRole() {
      return this.$currentUser?.role || null
    },

    // 用户权限
    $userPermissions() {
      return this.$currentUser?.permissions || []
    },

    // 系统信息
    $systemInfo() {
      try {
        return uni.getSystemInfoSync()
      } catch (error) {
        return {}
      }
    },

    // 状态栏高度
    $statusBarHeight() {
      return this.$systemInfo.statusBarHeight || 0
    },

    // 导航栏高度
    $navBarHeight() {
      // #ifdef MP-WEIXIN
      const menuButton = uni.getMenuButtonBoundingClientRect()
      return menuButton.height + (menuButton.top - this.$statusBarHeight) * 2
      // #endif
      
      // #ifndef MP-WEIXIN
      return 44
      // #endif
    },

    // 安全区域
    $safeArea() {
      return this.$systemInfo.safeArea || {}
    },

    // 底部安全距离
    $safeAreaBottom() {
      return this.$systemInfo.safeAreaInsets?.bottom || 0
    }
  },

  methods: {
    // 格式化方法
    $formatDate: formatDate,
    $formatRelativeTime: formatRelativeTime,
    $formatFileSize: formatFileSize,
    $formatDuration: formatDuration,

    // UI交互方法
    $toast: showToast,
    $loading: showLoading,
    $hideLoading: hideLoading,
    $confirm: showConfirm,

    // 工具方法
    $debounce: debounce,
    $throttle: throttle,

    // 权限检查方法
    $hasPermission: hasPermission,
    $hasRole: hasRole,

    /**
     * 安全导航
     * @param {string} url 目标页面
     * @param {object} options 导航选项
     */
    $navigateTo(url, options = {}) {
      const {
        type = 'navigateTo',
        params = {},
        requireAuth = false,
        requiredPermissions = [],
        requiredRoles = []
      } = options

      // 权限检查
      if (requireAuth && !this.$isLoggedIn) {
        this.$toast('请先登录', 'none')
        return
      }

      if (requiredPermissions.length > 0 && !this.$hasPermission(requiredPermissions)) {
        this.$toast('权限不足', 'none')
        return
      }

      if (requiredRoles.length > 0 && !this.$hasRole(requiredRoles)) {
        this.$toast('角色权限不足', 'none')
        return
      }

      // 构建URL参数
      let targetUrl = url
      if (Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')
        targetUrl += (url.includes('?') ? '&' : '?') + queryString
      }

      // 执行导航
      const navigateOptions = { url: targetUrl }
      
      switch (type) {
        case 'navigateTo':
          uni.navigateTo(navigateOptions)
          break
        case 'redirectTo':
          uni.redirectTo(navigateOptions)
          break
        case 'reLaunch':
          uni.reLaunch(navigateOptions)
          break
        case 'switchTab':
          uni.switchTab(navigateOptions)
          break
        case 'navigateBack':
          uni.navigateBack({ delta: params.delta || 1 })
          break
        default:
          uni.navigateTo(navigateOptions)
      }
    },

    /**
     * 返回上一页
     * @param {number} delta 返回层数
     */
    $goBack(delta = 1) {
      const pages = getCurrentPages()
      if (pages.length > delta) {
        uni.navigateBack({ delta })
      } else {
        // 如果没有足够的页面可返回，跳转到首页
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text 要复制的文本
     * @param {string} successMsg 成功提示
     */
    $copyText(text, successMsg = '复制成功') {
      uni.setClipboardData({
        data: text,
        success: () => {
          this.$toast(successMsg, 'success')
        },
        fail: () => {
          this.$toast('复制失败', 'none')
        }
      })
    },

    /**
     * 预览图片
     * @param {string|array} urls 图片地址
     * @param {number} current 当前显示图片索引
     */
    $previewImage(urls, current = 0) {
      const imageUrls = Array.isArray(urls) ? urls : [urls]
      uni.previewImage({
        urls: imageUrls,
        current: current
      })
    },

    /**
     * 拨打电话
     * @param {string} phoneNumber 电话号码
     */
    $makePhoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber,
        fail: () => {
          this.$toast('拨打电话失败', 'none')
        }
      })
    },

    /**
     * 获取位置信息
     * @param {object} options 选项
     * @returns {Promise} 位置信息
     */
    $getLocation(options = {}) {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          ...options,
          success: resolve,
          fail: reject
        })
      })
    },

    /**
     * 选择图片
     * @param {object} options 选项
     * @returns {Promise} 图片信息
     */
    $chooseImage(options = {}) {
      return new Promise((resolve, reject) => {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          ...options,
          success: resolve,
          fail: reject
        })
      })
    },

    /**
     * 上传文件
     * @param {string} filePath 文件路径
     * @param {object} options 选项
     * @returns {Promise} 上传结果
     */
    $uploadFile(filePath, options = {}) {
      return new Promise((resolve, reject) => {
        const {
          url = '/api/upload',
          name = 'file',
          formData = {},
          header = {}
        } = options

        uni.uploadFile({
          url,
          filePath,
          name,
          formData,
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`,
            ...header
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 200) {
                resolve(data)
              } else {
                reject(new Error(data.message || '上传失败'))
              }
            } catch (error) {
              reject(new Error('响应数据格式错误'))
            }
          },
          fail: reject
        })
      })
    },

    /**
     * 下载文件
     * @param {string} url 文件地址
     * @param {object} options 选项
     * @returns {Promise} 下载结果
     */
    $downloadFile(url, options = {}) {
      return new Promise((resolve, reject) => {
        uni.downloadFile({
          url,
          ...options,
          success: resolve,
          fail: reject
        })
      })
    },

    /**
     * 扫码
     * @param {object} options 选项
     * @returns {Promise} 扫码结果
     */
    $scanCode(options = {}) {
      return new Promise((resolve, reject) => {
        uni.scanCode({
          scanType: ['qrCode', 'barCode'],
          ...options,
          success: resolve,
          fail: reject
        })
      })
    },

    /**
     * 震动反馈
     * @param {string} type 震动类型
     */
    $vibrateShort(type = 'medium') {
      uni.vibrateShort({ type })
    },

    /**
     * 设置导航栏标题
     * @param {string} title 标题
     */
    $setNavigationBarTitle(title) {
      uni.setNavigationBarTitle({ title })
    },

    /**
     * 显示导航栏加载
     */
    $showNavigationBarLoading() {
      uni.showNavigationBarLoading()
    },

    /**
     * 隐藏导航栏加载
     */
    $hideNavigationBarLoading() {
      uni.hideNavigationBarLoading()
    }
  },

  // 生命周期钩子
  onLoad() {
    // 页面加载时的通用逻辑
  },

  onShow() {
    // 页面显示时的通用逻辑
  },

  onHide() {
    // 页面隐藏时的通用逻辑
  },

  onUnload() {
    // 页面卸载时的通用逻辑
  }
}