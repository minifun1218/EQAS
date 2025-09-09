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
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <view class="banner-item">
            <image class="banner-bg" :src="banner.image" mode="aspectFill" />
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
      <view class="progress-cards">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { studyApi, systemApi } from '@/api/index.js'
import CusTopHeaders from "../../components/cus-top-headers.vue";

// 学习数据
const studyDays = ref(0)
const studyHours = ref('0h')
const completedExams = ref(0)
const averageScore = ref('0分')
const loading = ref(true)

// 导播图数据
const banners = ref([])

// 页面加载时获取数据
onMounted(async () => {
  await loadStudyStats()
  await loadBanners()
})

// 获取学习统计数据
async function loadStudyStats() {
  try {
    const response = await studyApi.getStudyStats()
    if (response.code === 200) {
      const stats = response.data
      studyDays.value = stats.studyDays || 0
      studyHours.value = stats.studyHours || '0h'
      completedExams.value = stats.completedExams || 0
      averageScore.value = stats.averageScore || '0分'
    }
  } catch (error) {
    console.error('获取学习统计失败:', error)
  }
}

// 获取轮播图数据
async function loadBanners() {
  try {
    const response = await systemApi.getSystemConfig()
    if (response.code === 200 && response.data.banners) {
      banners.value = response.data.banners
    } else {
      // 如果后端没有配置，使用默认数据
      banners.value = [
        {
          title: 'ICAO4英语考试系统',
          subtitle: '专业的航空英语学习与考试平台',
          tips: '全面提升航空英语水平，助力职业发展',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          image: '/static/images/banner1.jpg'
        },
        {
          title: '智能学习系统',
          subtitle: '个性化学习路径规划',
          tips: '根据学习进度智能推荐学习内容',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          image: '/static/images/banner2.jpg'
        },
        {
          title: '专业考试训练',
          subtitle: '真实考试环境模拟',
          tips: '听力、口语、阅读全方位训练',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          image: '/static/images/banner3.jpg'
        }
      ]
    }
  } catch (error) {
    console.error('获取轮播图数据失败:', error)
    // 使用默认数据
    banners.value = [
      {
        title: 'ICAO4英语考试系统',
        subtitle: '专业的航空英语学习与考试平台',
        tips: '全面提升航空英语水平，助力职业发展',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        image: '/static/images/banner1.jpg'
      }
    ]
  } finally {
    loading.value = false
  }
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
