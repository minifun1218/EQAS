<template>
  <view class="cus-navbar">
    <!-- 左侧 Logo 和导航 -->
    <view class="nav-left">
      <text class="app-name">ICAO4</text>
      <text class="nav-link">{{ title || '首页' }}</text>
    </view>

    <!-- 右侧头像和下拉菜单 -->
    <view class="nav-right">
      <!-- 未登录状态 -->
      <view v-if="!isLoggedIn" class="login-actions">
        <text class="login-btn" @tap="goToLogin">登录</text>
        <text class="register-btn" @tap="goToRegister">注册</text>
      </view>
      
      <!-- 已登录状态 -->
      <view v-else class="user-section">
        <view class="avatar-wrapper" @tap="toggleMenu">
          <image class="avatar-img" :src="userInfo.avatar || defaultAvatar" />
        </view>

        <!-- 下拉菜单 -->
        <view class="dropdown-menu" v-show="showMenu">
          <view class="dropdown-item" @tap="goProfile">个人中心</view>
          <view class="dropdown-item" @tap="goSettings">设置</view>
          <view class="dropdown-item danger" @tap="logout">退出登录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useUserStore } from '@/store/user'

  // 定义props
  const props = defineProps({
    title: {
      type: String,
      default: '首页'
    }
  })

  const userStore = useUserStore()
  const showMenu = ref(false)
  
  // 使用computed从store获取登录状态和用户信息
  const isLoggedIn = computed(() => userStore.isAuthenticated)
  const userInfo = computed(() => userStore.userInfo)
  const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

  // 切换菜单
  function toggleMenu() {
    showMenu.value = !showMenu.value
  }

  // 点击页面其他地方关闭菜单
  function handleClickOutside(e) {
    const menu = document.querySelector('.dropdown-menu')
    const avatar = document.querySelector('.avatar-wrapper')
    if (!menu?.contains(e.target) && !avatar?.contains(e.target)) {
      showMenu.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    // 从本地存储加载用户状态
    userStore.loadFromStorage()
    // 检查登录状态是否过期
    userStore.checkLoginExpiry()
  })
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  // 跳转到登录页面
  function goToLogin() {
    uni.navigateTo({ url: '/pages/auth/login' })
  }

  // 跳转到注册页面
  function goToRegister() {
    uni.navigateTo({ url: '/pages/auth/register' })
  }

  function goProfile() {
    showMenu.value = false
    uni.navigateTo({ url: '/pages/user/profile' })
  }

  function goSettings() {
    showMenu.value = false
    uni.navigateTo({ url: '/pages/user/settings' })
  }

  function logout() {
    showMenu.value = false
    uni.showModal({
      title: '提示',
      content: '确认退出登录？',
      success: res => {
        if (res.confirm) {
          // 使用store的logout方法
          userStore.logout()
          
          uni.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          
          // 跳转到登录页面
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/auth/login' })
          }, 1500)
        }
      }
    })
  }
</script>

<style scoped>
.cus-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
}

.app-name {
  color: #2b6cfb;
  font-weight: bold;
  font-size: 32rpx;
  margin-right: 24rpx;
}

.nav-link {
  color: #555;
  font-size: 28rpx;
}

.nav-right {
  position: relative;
  display: flex;
  align-items: center;
}

/* 登录注册按钮样式 */
.login-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.login-btn, .register-btn {
  padding: 20rpx 40rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2rpx solid transparent;
  letter-spacing: 0.5rpx;
  position: relative;
  overflow: hidden;
}

.login-btn {
  color: #6366f1;
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.1);
}

.login-btn:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.5);
  color: #4f46e5;
  box-shadow: 0 6rpx 20rpx rgba(99, 102, 241, 0.15);
  transform: translateY(-1rpx);
}

.login-btn:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.2);
}

.register-btn {
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 8rpx 25rpx rgba(99, 102, 241, 0.25),
              0 4rpx 12rpx rgba(99, 102, 241, 0.15);
}

.register-btn:hover {
  background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 30rpx rgba(99, 102, 241, 0.3),
              0 6rpx 16rpx rgba(99, 102, 241, 0.2);
}

.register-btn:active {
  transform: translateY(1rpx) scale(0.98);
  box-shadow: 0 6rpx 20rpx rgba(99, 102, 241, 0.35);
}

/* 用户头像区域 */
.user-section {
  position: relative;
}

.avatar-wrapper {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #e3f2fd;
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  border-color: #2b6cfb;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 80rpx;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12rpx;
  width: 200rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.dropdown-item {
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item.danger {
  color: #e43d33;
}
</style>
