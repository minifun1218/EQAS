<template>
  <view class="interview-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">口语面试训练</view>
      <view class="nav-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-text">第 {{currentQuestion + 1}} 题 / 共 {{questions.length}} 题</text>
        <text class="score-text">得分: {{score}}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: progressWidth}"></view>
      </view>
    </view>

    <!-- 导播图轮播 -->
    <view v-if="!trainingStarted" class="banner-section">
      <swiper 
        class="banner-swiper"
        circular
        autoplay
        interval="4000"
        duration="500"
        indicator-dots
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#ffffff"
      >
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <view class="banner-item" :style="{ background: banner.gradient }">
            <view class="banner-content">
              <view class="banner-icon">{{ banner.icon }}</view>
              <view class="banner-title">{{ banner.title }}</view>
              <view class="banner-subtitle">{{ banner.subtitle }}</view>
              <view class="banner-tips">{{ banner.tips }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 面试场景选择 -->
    <view v-if="!trainingStarted" class="scenario-selection">
      <view class="selection-header">
        <text class="selection-title">选择面试场景</text>
        <text class="selection-desc">请选择您要练习的口语面试场景</text>
      </view>
      <view class="scenario-list">
        <view 
          v-for="scenario in scenarios" 
          :key="scenario.id"
          class="scenario-card"
          @click="selectScenario(scenario)"
        >
          <view class="scenario-icon">{{scenario.icon}}</view>
          <view class="scenario-info">
            <text class="scenario-name">{{scenario.name}}</text>
            <text class="scenario-description">{{scenario.description}}</text>
            <text class="scenario-duration">预计时长: {{scenario.duration}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 面试训练界面 -->
    <view v-if="trainingStarted" class="training-interface">
      <!-- 题目展示区域 -->
      <view class="question-section">
        <view class="question-card">
          <view class="question-header">
            <text class="question-type">{{currentQuestionData.type}}</text>
            <text class="question-time">建议时间: {{currentQuestionData.timeLimit}}秒</text>
          </view>
          <view class="question-content">
            <text class="question-text">{{currentQuestionData.question}}</text>
          </view>
          <view v-if="currentQuestionData.context" class="question-context">
            <text class="context-label">背景信息:</text>
            <text class="context-text">{{currentQuestionData.context}}</text>
          </view>
        </view>
      </view>

      <!-- 录音控制区域 -->
      <view class="recording-section">
        <view class="recording-controls">
          <view class="timer-display">
            <text class="timer-text">{{formatTime(recordingTime)}}</text>
            <text class="timer-limit">/ {{formatTime(currentQuestionData.timeLimit)}}</text>
          </view>
          <view class="record-button" :class="{recording: isRecording}" @click="toggleRecording">
            <text class="record-icon">{{isRecording ? '⏹' : '🎤'}}</text>
          </view>
          <view class="recording-status">
            <text class="status-text">{{recordingStatus}}</text>
          </view>
        </view>
        
        <!-- 录音波形显示 -->
        <view v-if="isRecording" class="waveform-display">
          <view class="wave-bar" v-for="n in 20" :key="n" :style="{height: getWaveHeight(n)}"></view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <view class="action-buttons">
          <button 
            class="btn btn-replay" 
            @click="replayQuestion"
            :disabled="isRecording"
          >
            重听题目
          </button>
          <button 
            class="btn btn-submit" 
            @click="submitAnswer"
            :disabled="!hasRecording || showResult"
          >
            提交回答
          </button>
        </view>
        
        <button 
          v-if="showResult"
          class="btn btn-next"
          @click="nextQuestion"
        >
          {{currentQuestion < questions.length - 1 ? '下一题' : '完成面试'}}
        </button>
      </view>

      <!-- 评分结果 -->
      <view v-if="showResult" class="result-section">
        <view class="result-header">
          <text class="result-title">回答评价</text>
        </view>
        <view class="result-content">
          <view class="score-breakdown">
            <view class="score-item">
              <text class="score-label">流利度</text>
              <view class="score-bar">
                <view class="score-fill" :style="{width: currentResult.fluency * 20 + '%'}"></view>
              </view>
              <text class="score-value">{{currentResult.fluency}}/5</text>
            </view>
            <view class="score-item">
              <text class="score-label">准确性</text>
              <view class="score-bar">
                <view class="score-fill" :style="{width: currentResult.accuracy * 20 + '%'}"></view>
              </view>
              <text class="score-value">{{currentResult.accuracy}}/5</text>
            </view>
            <view class="score-item">
              <text class="score-label">完整性</text>
              <view class="score-bar">
                <view class="score-fill" :style="{width: currentResult.completeness * 20 + '%'}"></view>
              </view>
              <text class="score-value">{{currentResult.completeness}}/5</text>
            </view>
          </view>
          <view class="feedback-section">
            <text class="feedback-title">改进建议:</text>
            <text class="feedback-text">{{currentResult.feedback}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">面试完成</text>
        </view>
        <view class="modal-body">
          <view class="final-stats">
            <view class="stat-item">
              <text class="stat-label">总题数</text>
              <text class="stat-value">{{questions.length}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">平均流利度</text>
              <text class="stat-value">{{averageScore.fluency.toFixed(1)}}/5</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">平均准确性</text>
              <text class="stat-value">{{averageScore.accuracy.toFixed(1)}}/5</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总得分</text>
              <text class="stat-value">{{score}}</text>
            </view>
          </view>
          <view class="performance-summary">
            <text class="summary-text">{{getPerformanceSummary()}}</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn btn-primary" @click="restartTraining">重新训练</button>
          <button class="btn btn-secondary" @click="goBack">返回</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { trainingApi } from '@/api/index.js'

export default {
  name: 'OralInterview',
  data() {
    return {
      trainingStarted: false,
      currentQuestion: 0,
      score: 0,
      isRecording: false,
      recordingTime: 0,
      hasRecording: false,
      showResult: false,
      showCompleteModal: false,
      recordingTimer: null,
      currentResult: {},
      loading: true,
      banners: [],
      scenarios: [],
      selectedScenario: null,
      questions: []
    }
  },
  onLoad() {
    this.loadTrainingData()
  },
  computed: {
    currentQuestionData() {
      return this.questions[this.currentQuestion] || {}
    },
    progressWidth() {
      return `${(this.currentQuestion / this.questions.length) * 100}%`
    },
    recordingStatus() {
      if (this.isRecording) return '正在录音...'
      if (this.hasRecording) return '录音完成'
      return '点击开始录音'
    },
    averageScore() {
      if (this.questions.length === 0) return { fluency: 0, accuracy: 0, completeness: 0 }
      
      let totalFluency = 0, totalAccuracy = 0, totalCompleteness = 0
      this.questions.forEach(q => {
        if (q.result) {
          totalFluency += q.result.fluency
          totalAccuracy += q.result.accuracy
          totalCompleteness += q.result.completeness
        }
      })
      
      return {
        fluency: totalFluency / this.questions.length,
        accuracy: totalAccuracy / this.questions.length,
        completeness: totalCompleteness / this.questions.length
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    selectScenario(scenario) {
      this.selectedScenario = scenario
      this.loadQuestions(scenario.id)
      this.trainingStarted = true
    },
    async loadTrainingData() {
      try {
        this.loading = true
        
        // 获取轮播图数据
        const bannerResponse = await trainingApi.getOralBanners()
        if (bannerResponse.code === 200) {
          this.banners = bannerResponse.data
        }

        // 获取场景数据
        const scenarioResponse = await trainingApi.getOralScenarios()
        if (scenarioResponse.code === 200) {
          this.scenarios = scenarioResponse.data
        }
      } catch (error) {
        console.error('获取训练数据失败:', error)
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    async loadQuestions(scenarioId) {
      try {
        this.loading = true
        const response = await trainingApi.getOralQuestions(scenarioId)
        if (response.code === 200) {
          this.questions = response.data
        } else {
          console.error('获取题目失败:', response.message)
          uni.showToast({
            title: '题目加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取题目失败:', error)
        uni.showToast({
          title: '题目加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },
    startRecording() {
      this.isRecording = true
      this.recordingTime = 0
      this.hasRecording = false
      
      this.recordingTimer = setInterval(() => {
        this.recordingTime++
        if (this.recordingTime >= this.currentQuestionData.timeLimit) {
          this.stopRecording()
        }
      }, 1000)
      
      uni.showToast({
        title: '开始录音',
        icon: 'none'
      })
    },
    stopRecording() {
      this.isRecording = false
      this.hasRecording = true
      
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
        this.recordingTimer = null
      }
      
      uni.showToast({
        title: '录音结束',
        icon: 'success'
      })
    },
    replayQuestion() {
      // 模拟重播题目
      uni.showToast({
        title: '重播题目',
        icon: 'none'
      })
    },
    async submitAnswer() {
      if (!this.hasRecording) return
      
      try {
        // 提交录音进行评分
        const response = await trainingApi.submitOralAnswer({
          questionId: this.currentQuestionData.id,
          scenarioId: this.selectedScenario.id,
          recordingData: 'base64_audio_data', // 实际录音数据
          duration: this.recordingTime
        })
        
        if (response.code === 200) {
          this.currentResult = response.data
          this.questions[this.currentQuestion].result = response.data
          
          // 计算得分
          const avgScore = (response.data.fluency + response.data.accuracy + response.data.completeness) / 3
          this.score += Math.round(avgScore * 20)
          
          this.showResult = true
          
          uni.showToast({
            title: '评分完成',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('提交答案失败:', error)
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        })
      }
    },
    generateMockResult() {
      // 模拟评分结果
      return {
        fluency: Math.floor(Math.random() * 2) + 3, // 3-5分
        accuracy: Math.floor(Math.random() * 2) + 3, // 3-5分
        completeness: Math.floor(Math.random() * 2) + 3, // 3-5分
        feedback: this.getRandomFeedback()
      }
    },
    getRandomFeedback() {
      const feedbacks = [
        '回答流利度较好，建议在专业术语的使用上更加准确。',
        '表达清晰，逻辑性强，可以适当增加一些具体的例子。',
        '整体表现不错，建议在时间控制上更加精准。',
        '语音语调自然，建议在回答的完整性上进一步提升。',
        '专业知识掌握扎实，表达能力有待加强。'
      ]
      return feedbacks[Math.floor(Math.random() * feedbacks.length)]
    },
    async nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++
        this.showResult = false
        this.hasRecording = false
        this.recordingTime = 0
        this.currentResult = {}
      } else {
        // 提交完整训练结果
        await this.submitTrainingResult()
        this.showCompleteModal = true
      }
    },
    async submitTrainingResult() {
      try {
        const results = this.questions.map(q => q.result).filter(r => r)
        await trainingApi.submitOralTrainingResult({
          scenarioId: this.selectedScenario.id,
          totalScore: this.score,
          results: results,
          completedAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('提交训练结果失败:', error)
      }
    },
    restartTraining() {
      this.trainingStarted = false
      this.currentQuestion = 0
      this.score = 0
      this.showResult = false
      this.showCompleteModal = false
      this.hasRecording = false
      this.recordingTime = 0
      this.selectedScenario = null
      this.questions = []
    },
    closeModal() {
      this.showCompleteModal = false
    },
    getPerformanceSummary() {
      const avgTotal = (this.averageScore.fluency + this.averageScore.accuracy + this.averageScore.completeness) / 3
      if (avgTotal >= 4.5) return '优秀！您的口语表达能力很强，完全符合航空英语要求。'
      if (avgTotal >= 4.0) return '良好！您的口语水平不错，继续保持并加强练习。'
      if (avgTotal >= 3.5) return '合格！基本达到要求，建议多加练习提升流利度。'
      return '需要加强！建议多进行口语练习，提升表达能力。'
    },
    getWaveHeight(index) {
      // 模拟音频波形
      const height = Math.random() * 40 + 10
      return `${height}rpx`
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.interview-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: white;
  border-bottom: 1rpx solid #eee;
}

.nav-left {
  width: 80rpx;
}

.nav-back {
  font-size: 40rpx;
  color: #4facfe;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 80rpx;
}

/* 进度区域 */
.progress-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.progress-text, .score-text {
  font-size: 28rpx;
  color: #666;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.3s ease;
}

/* 场景选择区域 */
.scenario-selection {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.selection-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.selection-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.selection-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.scenario-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.scenario-card {
  display: flex;
  align-items: center;
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  padding: 25rpx 20rpx;
  transition: all 0.3s ease;
}

.scenario-card:active {
  border-color: #4facfe;
  background: #f0f9ff;
}

.scenario-icon {
  font-size: 64rpx;
  margin-right: 32rpx;
}

.scenario-info {
  flex: 1;
}

.scenario-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.scenario-description {
  font-size: 28rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.scenario-duration {
  font-size: 24rpx;
  color: #4facfe;
  font-weight: 500;
  display: block;
}

/* 训练界面 */
.training-interface {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.question-section {
  margin-bottom: 30rpx;
}

.question-card {
  border: 2rpx solid #4facfe;
  border-radius: 20rpx;
  padding: 30rpx;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.question-type {
  font-size: 28rpx;
  color: #4facfe;
  font-weight: 600;
  background-color: #f0f9ff;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.question-time {
  font-size: 24rpx;
  color: #666666;
}

.question-content {
  margin-bottom: 24rpx;
}

.question-text {
  font-size: 32rpx;
  color: #333333;
  line-height: 1.6;
  font-weight: 500;
}

.question-context {
  background-color: #f8f9fa;
  padding: 24rpx;
  border-radius: 16rpx;
  border-left: 4rpx solid #4facfe;
}

.context-label {
  font-size: 24rpx;
  color: #4facfe;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.context-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

/* 录音控制区域 */
.recording-section {
  border: 2rpx solid #4facfe;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.recording-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.timer-display {
  display: flex;
  align-items: baseline;
}

.timer-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #333333;
}

.timer-limit {
  font-size: 28rpx;
  color: #666666;
  margin-left: 8rpx;
}

.record-button {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(79, 172, 254, 0.3);
  transition: all 0.3s ease;
}

.record-button.recording {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.record-button:active {
  transform: scale(0.95);
}

.record-icon {
  font-size: 48rpx;
  color: #ffffff;
}

.recording-status {
  text-align: right;
}

.status-text {
  font-size: 24rpx;
  color: #666666;
}

.waveform-display {
  display: flex;
  align-items: end;
  justify-content: center;
  height: 80rpx;
  gap: 4rpx;
}

.wave-bar {
  width: 6rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 3rpx;
  animation: wave 1s infinite ease-in-out;
}

.wave-bar:nth-child(2n) {
  animation-delay: 0.1s;
}

.wave-bar:nth-child(3n) {
  animation-delay: 0.2s;
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

/* 操作按钮 */
.action-section {
  margin-bottom: 30rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
}

.btn-replay {
  background: #f0f0f0;
  color: #666;
}

.btn-replay:not([disabled]):active {
  background: #e0e0e0;
}

.btn-submit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-submit:not([disabled]):active {
  opacity: 0.8;
}

.btn-next {
  width: 100%;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
}

.btn[disabled] {
  opacity: 0.5;
}

/* 评分结果 */
.result-section {
  border: 2rpx solid #52c41a;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.score-breakdown {
  margin-bottom: 32rpx;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.score-label {
  width: 120rpx;
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

.score-bar {
  flex: 1;
  height: 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  margin: 0 16rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.score-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

/* 导播图样式 */
.banner-section {
  margin-bottom: 32rpx;
}

.banner-swiper {
  height: 400rpx;
  border-radius: 24rpx;
  overflow: hidden;
  margin: 0 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.banner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.banner-content {
  text-align: center;
  color: #ffffff;
  padding: 0 40rpx;
  z-index: 2;
}

.banner-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.banner-title {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: 28rpx;
  margin-bottom: 16rpx;
  opacity: 0.9;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.banner-tips {
  font-size: 24rpx;
  opacity: 0.8;
  line-height: 1.4;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.score-value {
  width: 80rpx;
  text-align: right;
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
}

.feedback-section {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 10rpx;
}

.feedback-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.feedback-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 30rpx;
  max-width: 600rpx;
  width: 90%;
}

.modal-header {
  text-align: center;
  margin-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  padding-bottom: 20rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 30rpx;
}

.final-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.performance-summary {
  text-align: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 10rpx;
}

.summary-text {
  font-size: 28rpx;
  font-weight: bold;
  color: white;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
}

.btn-primary {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}

.btn-secondary {
  flex: 1;
  height: 80rpx;
  background: #f0f0f0;
  color: #666;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
}
</style>