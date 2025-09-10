<template>
  <view class="cus-navbar">
    <!-- 左侧 Logo 和导航 -->
    <view class="nav-left">
      <text class="app-name">ICAO4</text>
      <text class="nav-link">{{ props.title }}</text>
    </view>

    <!-- 右侧头像和下拉菜单 -->
    <view class="nav-right">


      <!-- 已登录状态 -->
      <view v-if="isLoggedIn" class="user-section">
        <view class="avatar-wrapper" @tap.stop="toggleMenu">
          <image class="avatar-img" :src="userInfo.avatar || defaultAvatar" />
        </view>

        <!-- 遮罩：点击收起菜单（兼容 App/小程序/H5）-->
        <view
            v-if="showMenu"
            class="menu-mask"
            @tap="showMenu = false"
        ></view>

        <!-- 下拉菜单 -->
        <view class="dropdown-menu" v-show="showMenu" @tap.stop>
          <view class="dropdown-item" @tap="goProfile">个人中心</view>
          <view class="dropdown-item" @tap="goSettings">设置</view>
          <view class="dropdown-item danger" @tap="logout">退出登录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'

const props = defineProps({
  title: { type: String, default: '首页' }
})

const userStore = useUserStore()
const showMenu = ref(false)

const isLoggedIn = computed(() => userStore.isAuthenticated)
const userInfo = computed(() => userStore.userInfo || {})
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

function toggleMenu() {
  showMenu.value = !showMenu.value
}

userStore.loadFromStorage?.()
userStore.checkLoginExpiry?.()

function goToLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}
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
        userStore.logout?.()
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/auth/login' })
        }, 800)
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
  height: 120rpx;              /* 固定高度，整体更高 */
  padding: 0 32rpx;            /* 左右留白加大，去掉上下 padding */
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
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

/* —— 登录 / 注册（淡蓝色、小一点） —— */
.login-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 22rpx;         /* 小一号 */
  font-size: 24rpx;             /* 小一号 */
  border-radius: 999rpx;        /* pill */
  font-weight: 600;
  letter-spacing: 0.5rpx;
  line-height: 1;
  border: 2rpx solid transparent;
  /* App/小程序没有 hover，H5 会有一点点视觉反馈 */
}

.auth-btn.login {
  height: 60rpx;
  width: 80rpx;
  color: #374151; /* 深灰文字 */
  background: #f3f4f6; /* 默认淡灰色 */
  border-color: #d1d5db;
  transition: all 0.25s ease;
}

/* 鼠标悬停（H5端有效） */
.auth-btn.login:hover {
  background: rgba(59, 130, 246, 0.12);  /* 淡蓝色 */
  border-color: rgba(59, 130, 246, 0.28);
  color: #1e40af;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.15);
}

/* 点击时（H5 + 小程序） */
.auth-btn.login:active {
  background: rgba(59, 130, 246, 0.20);
  border-color: rgba(59, 130, 246, 0.35);
  color: #1e3a8a;
  transform: scale(0.96);
  box-shadow: 0 2rpx 6rpx rgba(59, 130, 246, 0.25);
}
/* —— 用户头像 & 菜单 —— */
.user-section {
  position: relative;
}

.avatar-wrapper {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #e3f2fd;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
}

/* 遮罩层：点外部收起菜单 */
.menu-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: transparent;
  z-index: 998; /* 在菜单下面一点点，用于接管点击 */
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 80rpx;
  background-color: #fff;
  border: 1px solid #eaecef;
  border-radius: 16rpx;
  width: 220rpx;
  box-shadow: 0 10rpx 30rpx rgba(2, 6, 23, 0.10);
  z-index: 999;
  overflow: hidden;
}

.dropdown-item {
  padding: 22rpx;
  text-align: center;
  font-size: 26rpx;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}
.dropdown-item:last-child {
  border-bottom: none;
}
.dropdown-item.danger {
  color: #e43d33;
}
</style>
