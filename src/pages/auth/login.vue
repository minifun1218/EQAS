<template>
  <view class="login-page">
    <!-- 顶部Logo区域 -->
    <view class="header-section">
      <view class="logo-container">
        <text class="app-logo">✈️</text>
        <text class="app-name">ICAO4</text>
        <text class="app-subtitle">航空英语考试系统</text>
      </view>
    </view>

    <!-- 登录表单区域 -->
    <view class="form-section">
      <view class="form-container">
        <view class="form-title">欢迎登录</view>
        
        <view class="form-group">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              class="form-input" 
              type="text" 
              v-model="loginForm.username" 
              placeholder="请输入用户名/手机号" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              class="form-input" 
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginForm.password" 
              placeholder="请输入密码" 
              placeholder-class="input-placeholder"
            />
            <text class="toggle-password" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </text>
          </view>
        </view>

        <view class="form-options">
          <view class="remember-wrapper" @click="toggleRemember">
            <text class="checkbox" :class="{ active: loginForm.remember }">✓</text>
            <text class="remember-text">记住密码</text>
          </view>
          <text class="forgot-link" @click="goToForgot">忘记密码？</text>
        </view>

        <button class="login-btn" @click="handleLogin" :disabled="isLoading">
          <text v-if="isLoading">登录中...</text>
          <text v-else>登录</text>
        </button>

        <view class="register-link">
          <text class="register-text">还没有账号？</text>
          <text class="register-btn" @click="goToRegister">立即注册</text>
        </view>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="footer-section">
      <view class="footer-text">专业的航空英语学习平台</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const isLoading = ref(false)

// 页面加载时检查是否有保存的密码
onMounted(() => {
  const savedPassword = uni.getStorageSync('savedPassword')
  if (savedPassword) {
    loginForm.username = savedPassword.username
    loginForm.password = savedPassword.password
    loginForm.remember = true
  }
})

// 切换密码显示
function togglePassword() {
  showPassword.value = !showPassword.value
}

// 切换记住密码
function toggleRemember() {
  loginForm.remember = !loginForm.remember
}

// 处理登录
async function handleLogin() {
  if (!loginForm.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }
  
  if (!loginForm.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  isLoading.value = true
  
  try {
    const result = await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (result.success) {
      // 保存密码（如果选择了记住密码）
      if (loginForm.remember) {
        uni.setStorageSync('savedPassword', {
          username: loginForm.username,
          password: loginForm.password
        })
      } else {
        uni.removeStorageSync('savedPassword')
      }
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: result.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 跳转到注册页面
function goToRegister() {
  uni.navigateTo({
    url: '/pages/auth/register'
  })
}

// 跳转到忘记密码页面
function goToForgot() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 顶部Logo区域 */
.header-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
}

.logo-container {
  text-align: center;
  color: #ffffff;
}

.app-logo {
  font-size: 120rpx;
  display: block;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

/* 表单区域 */
.form-section {
  flex: 2;
  padding: 60rpx 40rpx;
}

.form-container {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 60rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 20rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.input-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: #7f8c8d;
}

.form-input {
  flex: 1;
  height: 88rpx;
  font-size: 28rpx;
  color: #2c3e50;
  background: transparent;
  border: none;
}

.input-placeholder {
  color: #bdc3c7;
}

.toggle-password {
  font-size: 32rpx;
  color: #7f8c8d;
  padding: 10rpx;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.remember-wrapper {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: transparent;
  margin-right: 12rpx;
  transition: all 0.3s ease;
}

.checkbox.active {
  background: #667eea;
  border-color: #667eea;
  color: #ffffff;
}

.remember-text {
  font-size: 26rpx;
  color: #7f8c8d;
}

.forgot-link {
  font-size: 26rpx;
  color: #667eea;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
  transition: all 0.3s ease;
}

.login-btn:disabled {
  opacity: 0.6;
}

.login-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.register-link {
  text-align: center;
}

.register-text {
  font-size: 26rpx;
  color: #7f8c8d;
  margin-right: 8rpx;
}

.register-btn {
  font-size: 26rpx;
  color: #667eea;
  font-weight: bold;
}

/* 底部区域 */
.footer-section {
  padding: 40rpx;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}
</style>