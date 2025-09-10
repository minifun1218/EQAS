<template>
  <view class="page">
    <cus-navbar
        title="首页"
        :fixed="true"
        :placeholder="true"
        :bordered="true"
        background="#ffffff"
        color="#111">
    </cus-navbar>

    <!-- 导播图轮播 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        :circular="true"
        indicator-color="rgba(255, 255, 255, 0.3)"
        indicator-active-color="#ffffff">
        <swiper-item v-for="(banner, index) in banners" :key="banner.id || index">
          <view class="banner-item" @click="handleBannerClick(banner)">
            <image class="banner-bg" :src="buildFullPath(banner.image)" mode="aspectFill" />
            <view class="banner-content">
              <view class="banner-title">{{ banner.title }}</view>
              <view class="banner-subtitle">{{ banner.subtitle }}</view>
              <view class="banner-tips">{{ banner.tips }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 学习进度概览 -->
    <view class="progress-overview">
      <view class="section-title">学习概览</view>
      <view v-if="loading" class="loading-container">
        <text class="loading-text">正在加载数据...</text>
      </view>
      <view v-else-if="!isLoggedIn" class="login-prompt">
        <view class="login-title">请先登录</view>
        <view class="login-desc">登录后查看您的学习进度和数据统计</view>
        <view class="login-btn" @click="goToLogin">立即登录</view>
      </view>
      <view v-else class="progress-cards">
        <view class="progress-card">
          <view class="progress-number">{{ studyDays }}</view>
          <view class="progress-label">学习天数</view>
        </view>
        <view class="progress-card">
          <view class="progress-number">{{ studyHours }}</view>
          <view class="progress-label">学习时长</view>
        </view>
        <view class="progress-card">
          <view class="progress-number">{{ completedExams }}</view>
          <view class="progress-label">完成考试</view>
        </view>
        <view class="progress-card">
          <view class="progress-number">{{ averageScore }}</view>
          <view class="progress-label">平均分数</view>
        </view>
      </view>
    </view>



    <!-- 快速入口 -->
    <view class="quick-access">
      <view class="section-title">快速入口</view>

        <view class="quick-list">
          <view class="quick-item" @click="goToVocabulary">

            <view class="quick-info">
              <view class="quick-title">高频词汇表</view>
              <view class="quick-desc">学习考试重要词汇</view>
            </view>
            <view class="quick-arrow">></view>
          </view>
          <view v-if="isLoggedIn">
            <view class="quick-item" @click="goToMistakes">
              <view class="quick-info">
                <view class="quick-title">错题本</view>
                <view class="quick-desc">复习错误题目</view>
              </view>
              <view class="quick-arrow">></view>
            </view>

            <view class="quick-item" @click="goToHistory">
              <view class="quick-info">
                <view class="quick-title">练习历史</view>
                <view class="quick-desc">查看学习记录</view>
              </view>
              <view class="quick-arrow">></view>
            </view>
          </view>
        </view>



    </view>



  </view>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { studyApi, systemApi } from '../../api/index.js'
  import {buildFullPath} from '../../utils/pathUtils'
  // 学习数据
  const studyDays = ref(0)
  const studyHours = ref('0h')
  const completedExams = ref(0)
  const averageScore = ref('0分')
  const loading = ref(true)
  const isLoggedIn = ref(false)

  // 导播图数据
  const banners = ref([])

  // 页面加载时获取数据
  onMounted(async () => {
    checkLoginStatus()
    await loadHomeData()
  })

  // 检查登录状态
  function checkLoginStatus() {
    const token = uni.getStorageSync('token')
    isLoggedIn.value = !!token
  }

  // 获取首页数据
  async function loadHomeData() {
    try {
      loading.value = true

      if (isLoggedIn.value) {
        // 已登录用户：并行请求首页数据，使用Promise.allSettled避免单个请求失败影响整体
        const [statsResult, bannersResult] = await Promise.allSettled([
          studyApi.getHomeStats().catch(err => ({ code: -1, error: err })),
          systemApi.getHomeBanners().catch(err => ({ code: -1, error: err }))
        ])

        // 处理学习统计数据
        if (statsResult.status === 'fulfilled' && statsResult.value.code === 200) {
          const stats = statsResult.value.data
          studyDays.value = stats.studyDays || 0
          studyHours.value = stats.studyHours || '0h'
          completedExams.value = stats.completedExams || 0
          averageScore.value = stats.averageScore || '0分'
        } else {
          // 设置默认统计数据
          studyDays.value = 0
          studyHours.value = '0h'
          completedExams.value = 0
          averageScore.value = '0分'
        }

        // 处理轮播图数据
        if (bannersResult.status === 'fulfilled') {
          const response = bannersResult.value
          const isSuccess = response.code === 200 || response.code === 0 || response.success === true
          
          if (isSuccess && response.data) {
            banners.value = response.data.banners || response.data || []
          }
        }
      } else {
        // 未登录用户：只获取轮播图数据，不需要认证
        try {
          const bannersResponse = await systemApi.getHomeBanners()
          
          // 检查响应是否成功
          const isSuccess = bannersResponse.code === 200 || bannersResponse.code === 0 || bannersResponse.success === true
          
          if (isSuccess && bannersResponse.data) {
            banners.value = bannersResponse.data.banners || bannersResponse.data || []
          } else {
            console.log('轮播图数据格式异常，使用默认数据')
            banners.value = []
          }
        } catch (bannerError) {
          console.log('获取轮播图失败，使用默认数据', bannerError)
          banners.value = []
        }

        // 设置默认的学习数据（未登录状态）
        studyDays.value = 0
        studyHours.value = '0h'
        completedExams.value = 0
        averageScore.value = '0分'
      }

    } catch (error) {
      console.error('获取首页数据失败:', error)
      // 不显示错误提示，直接设置默认数据
      setDefaultData()
    } finally {
      loading.value = false
    }
  }

  // 设置默认数据
  function setDefaultData() {
    studyDays.value = 0
    studyHours.value = '0h'
    completedExams.value = 0
    averageScore.value = '0分'
    banners.value = [
      {
        id: 1,
        title: 'ICAO4英语考试系统',
        subtitle: '专业的航空英语学习与考试平台',
        tips: '全面提升航空英语水平，助力职业发展',
        image: '/static/images/banner1.jpg',
        link: '',
        sort: 1,
        status: 1
      }
    ]
  }

  // 页面跳转方法
  function goToStudy() {
    uni.switchTab({
      url: '/pages/study/index'
    })
  }

  function goToTraining() {
    uni.switchTab({
      url: '/pages/training/index'
    })
  }

  function goToExam() {
    uni.switchTab({
      url: '/pages/exams/index'
    })
  }

  function goToProfile() {
    uni.switchTab({
      url: '/pages/user/index'
    })
  }

  function goToVocabulary() {
    uni.navigateTo({
      url: '/pages/study/vocabulary'
    })
  }

  function goToMistakes() {
    uni.navigateTo({
      url: '/pages/user/mistakes'
    })
  }

  function goToHistory() {
    uni.navigateTo({
      url: '/pages/user/history'
    })
  }

  function goToLogin() {
    uni.navigateTo({
      url: '/pages/auth/login'
    })
  }

  // 处理轮播图点击
  function handleBannerClick(banner) {
    if (banner.link) {
      // 判断是否为tabBar页面
      const tabBarPages = ['/pages/index/index', '/pages/study/index', '/pages/training/index', '/pages/exams/index', '/pages/user/index']
      if (tabBarPages.includes(banner.link)) {
        uni.switchTab({
          url: banner.link
        })
      } else {
        uni.navigateTo({
          url: banner.link
        })
      }
    }
  }
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 120rpx;
}

/* 导播图样式 */
.banner-section {
  margin-bottom: 30rpx;
}

.banner-swiper {
  height: 400rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: #fff;
  text-align: center;
  padding: 0 40rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.4);
}

.banner-title {
  font-size: 46rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.banner-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 6rpx;
}

.banner-tips {
  font-size: 24rpx;
  opacity: 0.8;
}

/* 学习进度概览 */
.progress-overview {
  margin: 0 30rpx 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}

.loading-container {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.loading-text {
  font-size: 28rpx;
  color: #7f8c8d;
}

.login-prompt {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.login-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
}

.login-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10rpx;
}

.login-desc {
  font-size: 26rpx;
  color: #7f8c8d;
  margin-bottom: 30rpx;
  line-height: 1.4;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  display: inline-block;
  transition: transform 0.2s ease;
}

.login-btn:active {
  transform: scale(0.98);
}

.progress-cards {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.progress-card {
  flex: 1;
  text-align: center;
}

.progress-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.progress-label {
  font-size: 24rpx;
  color: #7f8c8d;
}

/* 功能模块 */
.function-modules {
  margin: 0 30rpx 30rpx;
}

.module-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.module-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.module-item:active {
  transform: scale(0.98);
}

.module-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.module-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.module-desc {
  font-size: 24rpx;
  color: #7f8c8d;
  line-height: 1.4;
}

/* 快速入口 */
.quick-access {
  margin: 0 30rpx;
}

.quick-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.quick-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.quick-item:last-child {
  border-bottom: none;
}

.quick-item:active {
  background-color: #f8f9fa;
}

.quick-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.quick-info {
  flex: 1;
}

.quick-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 6rpx;
}

.quick-desc {
  font-size: 24rpx;
  color: #7f8c8d;
}

.quick-arrow {
  font-size: 28rpx;
  color: #bdc3c7;
}
</style>
