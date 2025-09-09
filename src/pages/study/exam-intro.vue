<template>
  <cus-navbar
      title="考试介绍"
      :fixed="true"
      :placeholder="true"
      :bordered="true"
      background="#ffffff"
      color="#111">
  </cus-navbar>
  
  <view class="exam-intro-container">
    <!-- 顶部导航 -->
    <cus-header title="考试介绍" @go-back="goBack">
    </cus-header>

    <!-- 视频播放区域 -->
    <view class="video-section">
      <view class="video-container">
        <video 
          class="intro-video"
          :src="videoUrl"
          :poster="videoPoster"
          controls
          :show-fullscreen-btn="true"
          :show-play-btn="true"
          :show-center-play-btn="true"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @ended="onVideoEnd"
        >
        </video>
        <view class="video-overlay" v-if="!isVideoPlaying">
          <view class="play-button" @click="playVideo">
            <text class="play-icon">▶</text>
          </view>
        </view>
      </view>
      <view class="video-info">
        <text class="video-title">ICAO4级英语考试介绍</text>
        <view class="video-meta">
          <text class="video-duration">时长：10分钟</text>
          <view class="video-badge">官方介绍</view>
        </view>
      </view>
    </view>

    <!-- 图文介绍内容 -->
    <view class="content-section">
      <view class="section-header">
        <text class="section-title">考试概述</text>
        <text class="section-subtitle">全面了解ICAO英语等级考试</text>
      </view>
      
      <!-- 考试基本信息 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
        </view>
        <view class="info-list">
          <view class="info-item">
            <view class="info-dot"></view>
            <text class="info-label">考试全称</text>
            <text class="info-value">国际民航组织英语等级考试</text>
          </view>
          <view class="info-item">
            <view class="info-dot"></view>
            <text class="info-label">考试等级</text>
            <text class="info-value">ICAO Level 4</text>
          </view>
          <view class="info-item">
            <view class="info-dot"></view>
            <text class="info-label">考试时长</text>
            <text class="info-value">约45分钟</text>
          </view>
          <view class="info-item">
            <view class="info-dot"></view>
            <text class="info-label">有效期</text>
            <text class="info-value">3年</text>
          </view>
        </view>
      </view>

      <!-- 考试内容 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">考试内容</text>
        </view>
        <view class="content-list">
          <view class="content-item" v-for="(item, index) in examContent" :key="index">
            <view class="content-info">
              <text class="content-name">{{ item.name }}</text>
              <text class="content-desc">{{ item.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 评分标准 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">评分标准</text>
        </view>
        <view class="scoring-list">
          <view class="scoring-item" v-for="(item, index) in scoringCriteria" :key="index">
            <view class="scoring-header">
              <text class="scoring-name">{{ item.name }}</text>
              <view class="scoring-weight">{{ item.weight }}</view>
            </view>
            <text class="scoring-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>

      <!-- 备考建议 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">备考建议</text>
        </view>
        <view class="tips-list">
          <view class="tip-item" v-for="(tip, index) in studyTips" :key="index">
            <view class="tip-number">{{ index + 1 }}</view>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CusNavbar from "../../components/cus-navbar.vue";
import CusHeader from "../../components/cus-header.vue";

export default {
  name: 'ExamIntro',
  components: {CusHeader, CusNavbar},
  data() {
    return {
      videoUrl: '/static/videos/icao-intro.mp4',
      videoPoster: '/static/images/video-poster.jpg',
      isVideoPlaying: false,
      examContent: [
        {
          name: '听力理解',
          description: '测试对航空英语对话和指令的理解能力'
        },
        {
          name: '口语表达',
          description: '评估航空情境下的英语口语交流能力'
        },
        {
          name: '阅读理解',
          description: '考查对航空技术文档的阅读理解能力'
        },
        {
          name: '书面表达',
          description: '测试航空相关的英语写作和表达能力'
        }
      ],
      scoringCriteria: [
        {
          name: '发音',
          weight: '25%',
          description: '清晰度、重音、语调和节奏的准确性'
        },
        {
          name: '结构',
          weight: '25%',
          description: '语法结构的正确性和复杂性'
        },
        {
          name: '词汇',
          weight: '25%',
          description: '词汇量的丰富性和使用的准确性'
        },
        {
          name: '流利度',
          weight: '25%',
          description: '语言表达的流畅性和自然性'
        }
      ],
      studyTips: [
        '熟悉航空专业术语和标准通话用语',
        '多听航空英语对话，提高听力理解能力',
        '练习口语表达，注重发音和语调',
        '阅读航空技术文档，扩大专业词汇量',
        '参加模拟考试，熟悉考试流程和题型',
        '保持良好的学习习惯，制定合理的复习计划'
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    playVideo() {
      // 播放视频的逻辑
      this.isVideoPlaying = true
    },
    onVideoPlay() {
      this.isVideoPlaying = true
    },
    onVideoPause() {
      this.isVideoPlaying = false
    },
    onVideoEnd() {
      this.isVideoPlaying = false
    }
  }
}
</script>

<style scoped>
.exam-intro-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.video-section {
  background: white;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #e8eaed;
}

.video-container {
  position: relative;
  width: 100%;
  height: 400rpx;
}

.intro-video {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border-radius: 16rpx 16rpx 0 0;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.play-button {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.play-button:active {
  transform: scale(0.95);
}

.play-icon {
  font-size: 40rpx;
  color: #4285f4;
  margin-left: 8rpx;
}

.video-info {
  padding: 30rpx;
}

.video-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #202124;
  display: block;
  margin-bottom: 16rpx;
}

.video-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.video-duration {
  font-size: 26rpx;
  color: #5f6368;
}

.video-badge {
  background: #e8f0fe;
  color: #1a73e8;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.content-section {
  padding: 0 30rpx 60rpx;
}

.section-header {
  margin-bottom: 40rpx;
  padding-top: 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #202124;
  display: block;
  margin-bottom: 8rpx;
}

.section-subtitle {
  font-size: 28rpx;
  color: #5f6368;
  font-weight: 400;
}

.info-card {
  background: white;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #e8eaed;
}

.card-header {
  padding: 30rpx;
  background: #f8f9fa;
  border-bottom: 1rpx solid #e8eaed;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #202124;
}

.info-list {
  padding: 30rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 16rpx 0;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #4285f4;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.info-label {
  font-size: 28rpx;
  color: #5f6368;
  width: 160rpx;
  flex-shrink: 0;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #202124;
  flex: 1;
  font-weight: 500;
}

.content-list {
  padding: 30rpx;
}

.content-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #4285f4;
}

.content-item:last-child {
  margin-bottom: 0;
}

.content-info {
  flex: 1;
}

.content-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #202124;
  display: block;
  margin-bottom: 8rpx;
}

.content-desc {
  font-size: 26rpx;
  color: #5f6368;
  line-height: 1.6;
}

.scoring-list {
  padding: 30rpx;
}

.scoring-item {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e8eaed;
}

.scoring-item:last-child {
  margin-bottom: 0;
}

.scoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.scoring-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #202124;
}

.scoring-weight {
  background: #e8f0fe;
  color: #1a73e8;
  font-size: 24rpx;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 600;
}

.scoring-desc {
  font-size: 26rpx;
  color: #5f6368;
  line-height: 1.6;
}

.tips-list {
  padding: 30rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e8eaed;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-number {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #4285f4;
  color: white;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  font-weight: 600;
}

.tip-text {
  font-size: 28rpx;
  color: #202124;
  line-height: 1.6;
  flex: 1;
  font-weight: 400;
}
</style>
