import { defineStore } from 'pinia'
import { userApi } from '@/api/index'
import { handleLoginSuccess, handleLogout } from '@/utils/permission'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: {
      id: null,
      username: '',
      email: '',
      phone: '',
      avatar: '',
      nickname: '',
      createTime: null
    },
    token: '',
    loginTime: null
  }),
  
  getters: {
    // 获取用户显示名称
    displayName: (state) => {
      return state.userInfo.nickname || state.userInfo.username || '用户'
    },
    
    // 检查是否已登录
    isAuthenticated: (state) => {
      return state.isLoggedIn && state.token
    },
    
    // 获取用户头像
    userAvatar: (state) => {
      return state.userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
  },
  
  actions: {
    // 登录
    async login(loginData) {
      try {
        // 调用登录API
        const response = await userApi.login(loginData)
        
        if (response && response.data) {
          const { user, token } = response.data
          
          // 更新状态
          this.isLoggedIn = true
          this.userInfo = {
            id: user.id,
            username: user.username,
            email: user.email || '',
            phone: user.phone || '',
            avatar: user.avatar || '',
            nickname: user.nickname || user.username,
            createTime: user.createTime || new Date().toISOString()
          }
          this.token = token
          this.loginTime = new Date().toISOString()
          
          // 使用权限管理器处理登录成功
          await handleLoginSuccess(this.userInfo, this.token)
          
          return {
            success: true,
            message: response.message || '登录成功',
            data: this.userInfo
          }
        } else {
          throw new Error('登录响应数据格式错误')
        }
      } catch (error) {
        // 如果是网络错误，使用模拟数据进行开发
        if (process.env.NODE_ENV === 'development' && error.message.includes('网络')) {
          console.warn('开发模式：使用模拟登录数据')
          
          const mockUserInfo = {
            id: 1,
            username: loginData.username,
            email: loginData.email || '',
            phone: loginData.phone || '',
            avatar: '',
            nickname: loginData.username,
            createTime: new Date().toISOString()
          }
          
          const mockToken = 'mock_token_' + Date.now()
          
          this.isLoggedIn = true
          this.userInfo = mockUserInfo
          this.token = mockToken
          this.loginTime = new Date().toISOString()
          this.saveToStorage()
          
          return {
            success: true,
            message: '登录成功（开发模式）',
            data: mockUserInfo
          }
        }
        
        return {
          success: false,
          message: error.message || '登录失败'
        }
      }
    },
    
    // 注册
    async register(registerData) {
      try {
        // 调用注册API
        const response = await userApi.register(registerData)
        
        if (response && response.data) {
          return {
            success: true,
            message: response.message || '注册成功',
            data: response.data
          }
        } else {
          throw new Error('注册响应数据格式错误')
        }
      } catch (error) {
        // 如果是网络错误，使用模拟数据进行开发
        if (process.env.NODE_ENV === 'development' && error.message.includes('网络')) {
          console.warn('开发模式：使用模拟注册数据')
          
          const mockUserInfo = {
            id: Date.now(),
            username: registerData.username,
            email: registerData.email,
            phone: registerData.phone,
            avatar: '',
            nickname: registerData.username,
            createTime: new Date().toISOString()
          }
          
          return {
            success: true,
            message: '注册成功（开发模式）',
            data: mockUserInfo
          }
        }
        
        return {
          success: false,
          message: error.message || '注册失败'
        }
      }
    },
    
    // 退出登录
    async logout() {
      this.isLoggedIn = false
      this.userInfo = {
        id: null,
        username: '',
        email: '',
        phone: '',
        avatar: '',
        nickname: '',
        createTime: null
      }
      this.token = ''
      this.loginTime = null
      
      // 使用权限管理器处理登出
      await handleLogout(true)
    },
    
    // 更新用户信息
    updateUserInfo(newInfo) {
      this.userInfo = { ...this.userInfo, ...newInfo }
      this.saveToStorage()
    },
    
    // 保存到本地存储
    saveToStorage() {
      try {
        uni.setStorageSync('isLoggedIn', this.isLoggedIn)
        uni.setStorageSync('userInfo', this.userInfo)
        uni.setStorageSync('token', this.token)
        uni.setStorageSync('loginTime', this.loginTime)
      } catch (error) {
        console.error('保存用户信息到本地存储失败:', error)
      }
    },
    
    // 从本地存储加载
    loadFromStorage() {
      try {
        const isLoggedIn = uni.getStorageSync('isLoggedIn')
        const userInfo = uni.getStorageSync('userInfo')
        const token = uni.getStorageSync('token')
        const loginTime = uni.getStorageSync('loginTime')
        
        if (isLoggedIn && userInfo && token) {
          this.isLoggedIn = isLoggedIn
          this.userInfo = userInfo
          this.token = token
          this.loginTime = loginTime
        }
      } catch (error) {
        console.error('从本地存储加载用户信息失败:', error)
      }
    },
    
    // 清除本地存储
    clearStorage() {
      try {
        uni.removeStorageSync('isLoggedIn')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('token')
        uni.removeStorageSync('loginTime')
        uni.removeStorageSync('savedPassword')
      } catch (error) {
        console.error('清除本地存储失败:', error)
      }
    },
    
    // 检查登录状态是否过期
    checkLoginExpiry() {
      if (!this.isLoggedIn || !this.loginTime) {
        return false
      }
      
      const loginTime = new Date(this.loginTime)
      const now = new Date()
      const diffHours = (now - loginTime) / (1000 * 60 * 60)
      
      // 登录状态保持7天
      if (diffHours > 24 * 7) {
        this.logout()
        return false
      }
      
      return true
    }
  }
})