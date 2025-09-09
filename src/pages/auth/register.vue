<template>
  <view class="register-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">← 返回</text>
      <text class="nav-title">用户注册</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 注册表单区域 -->
    <view class="form-section">
      <view class="form-container">
        <view class="form-title">创建账号</view>
        <view class="form-subtitle">加入ICAO4航空英语学习平台</view>
        
        <view class="form-group">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              class="form-input" 
              type="text" 
              v-model="registerForm.username" 
              placeholder="请输入用户名" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <view class="input-wrapper">
            <text class="input-icon">📱</text>
            <input 
              class="form-input" 
              type="number" 
              v-model="registerForm.phone" 
              placeholder="请输入手机号" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <view class="input-wrapper">
            <text class="input-icon">✉️</text>
            <input 
              class="form-input" 
              type="text" 
              v-model="registerForm.email" 
              placeholder="请输入邮箱地址" 
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
              v-model="registerForm.password" 
              placeholder="请输入密码" 
              placeholder-class="input-placeholder"
            />
            <text class="toggle-password" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </text>
          </view>
        </view>

        <view class="form-group">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              class="form-input" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              v-model="registerForm.confirmPassword" 
              placeholder="请确认密码" 
              placeholder-class="input-placeholder"
            />
            <text class="toggle-password" @click="toggleConfirmPassword">
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </text>
          </view>
        </view>

        <view class="form-group">
          <view class="verification-wrapper">
            <view class="input-wrapper verification-input">
              <text class="input-icon">🔢</text>
              <input 
                class="form-input" 
                type="number" 
                v-model="registerForm.verificationCode" 
                placeholder="请输入验证码" 
                placeholder-class="input-placeholder"
              />
            </view>
            <button 
              class="verification-btn" 
              @click="sendVerificationCode" 
              :disabled="isCodeSending || countdown > 0"
            >
              <text v-if="countdown > 0">{{ countdown }}s</text>
              <text v-else-if="isCodeSending">发送中...</text>
              <text v-else>获取验证码</text>
            </button>
          </view>
        </view>

        <view class="agreement-wrapper" @click="toggleAgreement">
          <text class="checkbox" :class="{ active: registerForm.agreement }">✓</text>
          <text class="agreement-text">
            我已阅读并同意
            <text class="agreement-link" @click.stop="showAgreement">《用户协议》</text>
            和
            <text class="agreement-link" @click.stop="showPrivacy">《隐私政策》</text>
          </text>
        </view>

        <button class="register-btn" @click="handleRegister" :disabled="isLoading">
          <text v-if="isLoading">注册中...</text>
          <text v-else>立即注册</text>
        </button>

        <view class="login-link">
          <text class="login-text">已有账号？</text>
          <text class="login-btn-text" @click="goToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 表单数据
const registerForm = reactive({
  username: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  agreement: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const isCodeSending = ref(false)
const countdown = ref(0)

// 切换密码显示
function togglePassword() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 切换协议同意
function toggleAgreement() {
  registerForm.agreement = !registerForm.agreement
}

// 发送验证码
function sendVerificationCode() {
  if (!registerForm.phone.trim()) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none'
    })
    return
  }

  isCodeSending.value = true
  
  // 模拟发送验证码
  setTimeout(() => {
    isCodeSending.value = false
    countdown.value = 60
    
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })
  }, 1500)
}

// 处理注册
async function handleRegister() {
  // 表单验证
  if (!registerForm.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  
  if (registerForm.username.length < 3 || registerForm.username.length > 20) {
    uni.showToast({ title: '用户名长度应为3-20个字符', icon: 'none' })
    return
  }
  
  if (!registerForm.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  
  if (!registerForm.email.trim()) {
    uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
    return
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }
  
  if (!registerForm.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  
  if (registerForm.password.length < 6) {
    uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }
  
  if (!registerForm.verificationCode.trim()) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  if (!registerForm.agreement) {
    uni.showToast({ title: '请同意用户协议和隐私政策', icon: 'none' })
    return
  }

  isLoading.value = true
  
  try {
    const result = await userStore.register({
      username: registerForm.username,
      phone: registerForm.phone,
      email: registerForm.email,
      password: registerForm.password,
      verificationCode: registerForm.verificationCode
    })
    
    if (result.success) {
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      // 跳转到登录页面
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: result.message || '注册失败',
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

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 跳转到登录页面
function goToLogin() {
  uni.navigateBack()
}

// 显示用户协议
function showAgreement() {
  uni.showToast({
    title: '用户协议页面开发中',
    icon: 'none'
  })
}

// 显示隐私政策
function showPrivacy() {
  uni.showToast({
    title: '隐私政策页面开发中',
    icon: 'none'
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 顶部导航 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 40rpx 20rpx;
  color: #ffffff;
}

.back-btn {
  font-size: 28rpx;
  padding: 10rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.nav-placeholder {
  width: 80rpx;
}

/* 表单区域 */
.form-section {
  padding: 40rpx 40rpx 60rpx;
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
  margin-bottom: 12rpx;
}

.form-subtitle {
  font-size: 26rpx;
  color: #7f8c8d;
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

.verification-wrapper {
  display: flex;
  gap: 16rpx;
}

.verification-input {
  flex: 1;
}

.verification-btn {
  width: 200rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: bold;
}

.verification-btn:disabled {
  opacity: 0.6;
}

.agreement-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40rpx;
  padding: 0 4rpx;
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
  margin-top: 4rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.checkbox.active {
  background: #667eea;
  border-color: #667eea;
  color: #ffffff;
}

.agreement-text {
  font-size: 26rpx;
  color: #7f8c8d;
  line-height: 1.5;
}

.agreement-link {
  color: #667eea;
  font-weight: bold;
}

.register-btn {
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

.register-btn:disabled {
  opacity: 0.6;
}

.register-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.login-link {
  text-align: center;
}

.login-text {
  font-size: 26rpx;
  color: #7f8c8d;
  margin-right: 8rpx;
}

.login-btn-text {
  font-size: 26rpx;
  color: #667eea;
  font-weight: bold;
}
</style>