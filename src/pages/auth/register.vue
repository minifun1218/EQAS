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
            <input
                class="form-input"
                :type="showPassword ? 'text' : 'password'"
                v-model="registerForm.password"
                placeholder="请输入密码"
                placeholder-class="input-placeholder"
            />
            <text class="toggle-password" @click="togglePassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <view class="form-group">
          <view class="input-wrapper">
            <input
                class="form-input"
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="registerForm.confirmPassword"
                placeholder="请确认密码"
                placeholder-class="input-placeholder"
            />
            <text class="toggle-password" @click="toggleConfirmPassword">
              {{ showConfirmPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <view class="form-group">
          <view class="verification-wrapper">
            <view class="input-wrapper verification-input">
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

// const userStore = useUserStore()

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })

    // 跳转到登录页面
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
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
  background: linear-gradient(135deg, #fafbfc 0%, #f1f3f5 50%, #e8eaed 100%);
  position: relative;
}

.register-page::before {
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

.verification-wrapper {
  display: flex;
  gap: 20rpx;
}

.verification-input {
  flex: 1;
}

.verification-btn {
  width: 220rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 25rpx rgba(99, 102, 241, 0.25),
              0 4rpx 12rpx rgba(99, 102, 241, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.verification-btn:active:not(:disabled) {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 4rpx 15rpx rgba(99, 102, 241, 0.3);
}

.verification-btn:disabled {
  opacity: 0.5;
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
  box-shadow: 0 4rpx 12rpx rgba(148, 163, 184, 0.2);
  transform: none;
}

.agreement-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 50rpx;
  padding: 0 8rpx;
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
  margin-top: 6rpx;
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

.agreement-text {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.6;
  font-weight: 500;
}

.agreement-link {
  color: #6366f1;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.agreement-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.register-btn {
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
  box-shadow: 0 12rpx 30rpx rgba(99, 102, 241, 0.3),
              0 6rpx 16rpx rgba(99, 102, 241, 0.2);
  letter-spacing: 0.5rpx;
}

.register-btn:disabled {
  opacity: 0.5;
  background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
  box-shadow: 0 6rpx 20rpx rgba(148, 163, 184, 0.2);
  transform: none;
}

.register-btn:active:not(:disabled) {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 8rpx 20rpx rgba(99, 102, 241, 0.4);
}

.login-link {
  text-align: center;
  padding: 20rpx 0;
}

.login-text {
  font-size: 28rpx;
  color: #64748b;
  margin-right: 12rpx;
  font-weight: 500;
}

.login-btn-text {
  font-size: 28rpx;
  color: #6366f1;
  font-weight: 700;
  transition: all 0.3s ease;
}

.login-btn-text:active {
  color: #4f46e5;
  transform: scale(0.95);
}
</style>
