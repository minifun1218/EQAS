<template>
  <view class="login-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">← 返回</text>
      <text class="nav-title">用户登录</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 登录表单区域 -->
    <view class="form-section">
      <view class="form-container">
        <view class="form-title">欢迎回来</view>
        <view class="form-subtitle">登录ICAO4航空英语学习平台</view>

        <view class="form-group">
          <view class="input-wrapper">
            <input
                class="form-input"
                type="text"
                v-model="loginForm.username"
                placeholder="请输入用户名/手机号/邮箱"
                placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <view class="input-wrapper">
            <input
                class="form-input"
                :type="showPassword ? 'text' : 'password'"
                v-model="loginForm.password"
                placeholder="请输入密码"
                placeholder-class="input-placeholder"
            />
            <text class="toggle-password" @click="togglePassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <view class="form-options">
          <view class="remember-wrapper" @click="toggleRemember">
            <text class="checkbox" :class="{ active: loginForm.remember }">✓</text>
            <text class="remember-text">记住密码</text>
          </view>
          <text class="forgot-password" @click="goToForgotPassword">忘记密码？</text>
        </view>

        <button class="login-btn" @click="handleLogin" :disabled="isLoading">
          <text v-if="isLoading">登录中...</text>
          <text v-else>立即登录</text>
        </button>

        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>

        <view class="social-login">
          <button class="social-btn wechat" @click="loginWithWechat">
            <text class="social-icon">📱</text>
            <text class="social-text">微信登录</text>
          </button>
          <button class="social-btn qq" @click="loginWithQQ">
            <text class="social-icon">🐧</text>
            <text class="social-text">QQ登录</text>
          </button>
        </view>

        <view class="register-link">
          <text class="register-text">还没有账号？</text>
          <text class="register-btn-text" @click="goToRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '../../store/user';

const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const isLoading = ref(false)

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
  // 表单验证
  if (!loginForm.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }

  if (!loginForm.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  if (loginForm.password.length < 6) {
    uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
    return
  }

  isLoading.value = true

  try {
    const result = await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })

    if (result.success) {
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        uni.reLaunch({
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
    console.error('登录失败:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 微信登录
function loginWithWechat() {
  uni.showToast({
    title: '微信登录功能开发中',
    icon: 'none'
  })
}

// QQ登录
function loginWithQQ() {
  uni.showToast({
    title: 'QQ登录功能开发中',
    icon: 'none'
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 跳转到注册页面
function goToRegister() {
  uni.navigateTo({
    url: '/pages/auth/register/register'
  })
}

// 跳转到忘记密码页面
function goToForgotPassword() {
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none'
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f1f3f5 50%, #e8eaed 100%);
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* 顶部导航 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80rpx 50rpx 30rpx;
  color: #4a5568;
  position: relative;
  z-index: 1;
}

.back-btn {
  font-size: 30rpx;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  color: #6b7280;
}

.back-btn:active {
  background: rgba(107, 114, 128, 0.1);
  transform: scale(0.95);
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.5rpx;
}

.nav-placeholder {
  width: 80rpx;
}

/* 表单区域 */
.form-section {
  padding: 20rpx 50rpx 80rpx;
  position: relative;
  z-index: 1;
}

.form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  padding: 80rpx 50rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.06),
              0 8rpx 25rpx rgba(0, 0, 0, 0.04),
              inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 32rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.form-title {
  font-size: 42rpx;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-bottom: 16rpx;
  letter-spacing: 0.5rpx;
}

.form-subtitle {
  font-size: 28rpx;
  color: #718096;
  text-align: center;
  margin-bottom: 80rpx;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 36rpx;
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 20rpx;
  padding: 0 24rpx;
  border: 2rpx solid rgba(226, 232, 240, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10rpx);
}

.input-wrapper:focus-within {
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 6rpx rgba(99, 102, 241, 0.08),
              0 8rpx 25rpx rgba(99, 102, 241, 0.1);
  transform: translateY(-2rpx);
}

.form-input {
  flex: 1;
  height: 96rpx;
  font-size: 30rpx;
  color: #2d3748;
  background: transparent;
  border: none;
  font-weight: 500;
}

.input-placeholder {
  color: #a0aec0;
}

.toggle-password {
  font-size: 26rpx;
  color: #6366f1;
  padding: 12rpx 16rpx;
  font-weight: 600;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.toggle-password:active {
  background: rgba(99, 102, 241, 0.1);
  transform: scale(0.95);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50rpx;
  padding: 0 8rpx;
}

.remember-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid rgba(203, 213, 225, 0.8);
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: transparent;
  margin-right: 16rpx;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(248, 250, 252, 0.8);
}

.checkbox.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
}

.remember-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 500;
}

.forgot-password {
  font-size: 28rpx;
  color: #6366f1;
  font-weight: 600;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.forgot-password:active {
  background: rgba(99, 102, 241, 0.1);
  transform: scale(0.95);
}

.login-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  border-radius: 24rpx;
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 40rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12rpx 40rpx rgba(99, 102, 241, 0.25),
              0 4rpx 12rpx rgba(99, 102, 241, 0.15);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.login-btn:active::before {
  left: 100%;
}

.login-btn:disabled {
  opacity: 0.5;
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
  box-shadow: 0 4rpx 12rpx rgba(148, 163, 184, 0.2);
  transform: none;
}

.login-btn:active:not(:disabled) {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 8rpx 25rpx rgba(99, 102, 241, 0.3),
              0 2rpx 8rpx rgba(99, 102, 241, 0.2);
}

.divider {
  display: flex;
  align-items: center;
  margin: 50rpx 0;
  position: relative;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, rgba(203, 213, 225, 0.6) 50%, transparent 100%);
}

.divider-text {
  font-size: 26rpx;
  color: #94a3b8;
  margin: 0 24rpx;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.social-login {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.social-btn {
  flex: 1;
  height: 88rpx;
  border: 2rpx solid rgba(226, 232, 240, 0.8);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.social-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-btn:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.social-btn:active::before {
  opacity: 1;
}

.social-btn.wechat:active {
  border-color: rgba(7, 193, 96, 0.6);
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
}

.social-btn.qq:active {
  border-color: rgba(18, 183, 245, 0.6);
  box-shadow: 0 4rpx 12rpx rgba(18, 183, 245, 0.2);
}

.social-icon {
  font-size: 36rpx;
}

.social-text {
  font-size: 28rpx;
  color: #475569;
  font-weight: 600;
}

.register-link {
  text-align: center;
  padding: 20rpx 0;
}

.register-text {
  font-size: 28rpx;
  color: #64748b;
  margin-right: 12rpx;
  font-weight: 500;
}

.register-btn-text {
  font-size: 28rpx;
  color: #6366f1;
  font-weight: 700;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.register-btn-text:active {
  background: rgba(99, 102, 241, 0.1);
  transform: scale(0.95);
}
</style>