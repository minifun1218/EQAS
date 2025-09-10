<template>
  <cus-navbar
      title="训练中心"
      :fixed="true"
      :placeholder="true"
      :bordered="true"
      background="#ffffff"
      color="#111">
  </cus-navbar>
  <view class="training-container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="title">
        <text class="title-main">ICAO4</text>
        <text class="title-sub">专业航空英语训练平台</text>
        <view class="title-accent"></view>
      </view>
    </view>

    <!-- 训练进度概览 -->
    <view class="progress-section">
      <view class="progress-card">
        <text class="progress-title">训练进度</text>
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-number">{{progressData.overallProgress}}%</text>
            <text class="stat-label">总体完成度</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-number">{{progressData.completedTrainings}}</text>
            <text class="stat-label">已完成训练</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 训练模块列表 -->
    <view class="training-modules">
      <text class="section-title">训练模块</text>
      
      <!-- 听力理解训练 -->
      <view class="module-card listening-card" @click="goToListeningComprehension">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">听力理解训练</view>
            <view class="card-badge basic">听力训练</view>
          </view>
          <view class="card-desc">提升航空英语听力理解能力</view>
          <view class="card-footer">
            <text class="time-text">约 25 分钟</text>
          </view>
        </view>
      </view>

      <!-- 故事复述训练 -->
      <view class="module-card speaking-card" @click="goToStoryRetelling">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">故事复述训练</view>
            <view class="card-badge core">口语表达</view>
          </view>
          <view class="card-desc">练习完整复述航空相关故事</view>
          <view class="card-footer">
            <text class="time-text">约 20 分钟</text>
          </view>
        </view>
      </view>

      <!-- 听力简单训练 -->
      <view class="module-card basic-card" @click="goToBasicListening">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">听力简答训练</view>
            <view class="card-badge basic">基础训练</view>
          </view>
          <view class="card-desc">基础听力技能强化练习</view>
          <view class="card-footer">
            <text class="time-text">约 15 分钟</text>
          </view>
        </view>
      </view>

      <!-- 模拟通话训练 -->
      <view class="module-card simulation-card" @click="goToSimulatedCall">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">模拟通话训练</view>
            <view class="card-badge core">实战模拟</view>
          </view>
          <view class="card-desc">真实场景模拟通话练习</view>
          <view class="card-footer">
            <text class="time-text">约 30 分钟</text>
          </view>
        </view>
      </view>

      <!-- 口语面试训练 -->
      <view class="module-card interview-card" @click="goToOralInterview">
        <view class="card-content">
          <view class="card-header">
            <view class="card-title">口语面试训练</view>
            <view class="card-badge core">面试准备</view>
          </view>
          <view class="card-desc">面试场景口语表达训练</view>
          <view class="card-footer">
            <text class="time-text">约 35 分钟</text>
          </view>
        </view>
      </view>

      
    </view>
  </view>
</template>

<script>
import CusNavbar from "../../components/cus-navbar.vue";
import { trainingApi } from '@/api/index.js'

export default {
  name: 'TrainingIndex',
  components: {CusNavbar},
  data() {
    return {
      progressData: {
        overallProgress: 0,
        completedTrainings: 0,
        totalTrainings: 0
      },
      trainingModules: [],
      loading: false
    }
  },
  
  onLoad() {
    this.loadTrainingData()
  },
  methods: {
    async loadTrainingData() {
      this.loading = true
      try {
        // 加载训练列表数据
        const trainingResponse = await trainingApi.getTrainingList()
        if (trainingResponse.code === 200) {
          const trainingData = trainingResponse.data || []
          
          // 计算训练进度数据
          const completedTrainings = trainingData.filter(item => item.status === 'completed').length
          const totalTrainings = trainingData.length || 1
          const overallProgress = Math.round((completedTrainings / totalTrainings) * 100)
          
          this.progressData = {
            overallProgress: overallProgress,
            completedTrainings: completedTrainings,
            totalTrainings: totalTrainings
          }
          
          // 设置训练模块数据
          this.trainingModules = trainingData
        } else {
          // 设置默认数据
          this.progressData = {
            overallProgress: 0,
            completedTrainings: 0,
            totalTrainings: 0
          }
          this.trainingModules = []
        }
      } catch (error) {
        console.error('加载训练数据失败:', error)
        // 设置默认数据
        this.progressData = {
          overallProgress: 0,
          completedTrainings: 0,
          totalTrainings: 0
        }
        this.trainingModules = []
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    // 跳转到听力理解训练
    goToListeningComprehension() {
      uni.navigateTo({
        url: '/pages/training/listening-comprehension'
      })
    },
    // 跳转到故事复述训练
    goToStoryRetelling() {
      uni.navigateTo({
        url: '/pages/training/story-retelling'
      })
    },
    // 跳转到听力简单训练
    goToBasicListening() {
      uni.navigateTo({
        url: '/pages/training/simple-listening'
      })
    },
    // 跳转到模拟通话训练
    goToSimulatedCall() {
      uni.navigateTo({
        url: '/pages/training/simulated-call'
      })
    },
    // 跳转到口语面试训练
    goToOralInterview() {
      uni.navigateTo({
        url: '/pages/training/oral-interview'
      })
    },
    // 跳转到单词词汇意思训练
    goToVocabularyMeaning() {
      uni.navigateTo({
        url: '/pages/training/vocabulary-meaning'
      })
    }
  }
}
</script>

<style scoped>
.training-container {
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
.training-modules {
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
