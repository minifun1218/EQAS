<template>
  <cus-navbar
      title="学习中心"
      :fixed="true"
      :placeholder="true"
      :bordered="true"
      background="#ffffff"
      color="#111">
  </cus-navbar>

  <view class="study-container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="title">
        <text class="title-main">ICAO4</text>
        <text class="title-sub">专业航空英语学习平台</text>
        <view class="title-accent"></view>
      </view>
    </view>

    <!-- 学习进度概览 -->
    <view class="progress-section">
      <view class="progress-card">
        <text class="progress-title">学习进度</text>
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-number">{{ studyData.progress?.totalProgress || 0 }}%</text>
            <text class="stat-label">总体完成度</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-number">{{ studyData.progress?.completedCourses || 0 }}</text>
            <text class="stat-label">已学课程</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习模块列表 -->
    <view class="study-modules">
      <text class="section-title">学习模块</text>

      <!-- 考试介绍 -->
      <view class="module-card intro-card" @click="goToExamIntro">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">考试介绍</view>
            <view class="card-badge basic">基础必读</view>
          </view>
          <view class="card-desc">了解考试流程、评分标准和注意事项，为考试做好充分准备</view>
          <view class="card-footer">
            <text class="time-text">约 10 分钟</text>
          </view>
        </view>
      </view>

      <!-- 标准通话用语 -->
      <view class="module-card phrase-card" @click="goToStandardPhrase">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">标准通话用语</view>
            <view class="card-badge core">核心内容</view>
          </view>
          <view class="card-desc">掌握专业通话术语和标准表达方式，提升沟通效率</view>
          <view class="card-footer">
            <text class="time-text">约 30 分钟</text>
          </view>
        </view>
      </view>

      <!-- 高频词汇表 -->
      <view class="module-card vocab-card" @click="goToVocabulary">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">高频词汇表</view>
            <view class="card-badge vocab">词汇积累</view>
          </view>
          <view class="card-desc">学习考试中常见的重要词汇，扩充专业词汇量</view>
          <view class="card-footer">
            <text class="time-text">约 20 分钟</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { studyApi } from '@/api/index.js'

export default {
  name: 'StudyIndex',
  data() {
    return {
      loading: false,
      studyData: {
        progress: {
          totalProgress: 0,
          completedCourses: 0
        },
        modules: []
      }
    }
  },
  
  mounted() {
    this.loadStudyData()
  },
  
  methods: {
    async loadStudyData() {
      try {
        this.loading = true
        const response = await studyApi.getStudyOverview()
        if (response.code === 200 && response.data) {
          // 确保数据结构完整性
          this.studyData = {
            progress: {
              totalProgress: response.data.progress?.totalProgress || 0,
              completedCourses: response.data.progress?.completedCourses || 0
            },
            modules: response.data.modules || []
          }
        } else {
          // API调用失败时使用默认数据
          console.warn('API返回数据格式不正确:', response)
        }
      } catch (error) {
        console.error('加载学习数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 跳转到考试介绍
    goToExamIntro() {
      uni.navigateTo({ url: '/pages/study/exam-intro' });
    },
    // 跳转到标准通话用语
    goToStandardPhrase() {
      uni.navigateTo({ url: '/pages/study/standard-terms' });
    },
    // 跳转到高频词汇表
    goToVocabulary() {
      uni.navigateTo({ url: '/pages/study/vocabulary' });
    }
  }
}
</script>

<style scoped>
.study-container {
  min-height: 100vh;
  background: #f4f7fa;
  padding-bottom: 120rpx;
}

/* 顶部标题区域 */
.header {
  background: #ffffff;
  padding: 80rpx 40rpx 40rpx;
  color: #1e293b;
}

.title {
  display: flex;
  flex-direction: column;
}

.title-main {
  font-size: 56rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
}

.title-sub {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 500;
}

.title-accent {
  width: 60rpx;
  height: 6rpx;
  background: #cbd5e1;
  border-radius: 3rpx;
  margin-top: 16rpx;
}

/* 学习进度区域 */
.progress-section {
  padding: 0 30rpx;
  margin-top: -30rpx;
  position: relative;
  z-index: 2;
}

.progress-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e2e8f0;
}

.progress-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24rpx;
}

.progress-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #64748b;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #e2e8f0;
}

/* 模块卡片区域 */
.study-modules {
  padding: 50rpx 30rpx 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 30rpx;
  display: block;
}

.module-card {
  background: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  border-left: 6rpx solid #e0e7ff;
  display: flex;
}

.card-content {
  padding: 30rpx 28rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e293b;
}

.card-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: white;
}

.card-badge.basic {
  background: #10b981;
}

.card-badge.core {
  background: #f59e0b;
}

.card-badge.vocab {
  background: #6366f1;
}

.card-desc {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 20rpx;
}

.card-footer {
  display: flex;
  justify-content: flex-start;
}

.time-text {
  font-size: 24rpx;
  color: #94a3b8;
  font-weight: 500;
}
</style>
