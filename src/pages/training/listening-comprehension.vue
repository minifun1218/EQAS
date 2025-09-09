<template>
  <view class="listening-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">听力理解训练</view>
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

    <!-- 音频播放区域 -->
    <view class="audio-section">
      <view class="audio-player">
        <view class="audio-controls">
          <view class="play-btn" @click="togglePlay">
            <text class="play-icon">{{isPlaying ? '⏸' : '▶'}}</text>
          </view>
          <view class="audio-info">
            <text class="audio-title">{{currentQuestionData.title}}</text>
            <text class="audio-duration">{{formatTime(currentTime)}} / {{formatTime(duration)}}</text>
          </view>
        </view>
        <view class="audio-progress">
          <view class="audio-progress-bar">
            <view class="audio-progress-fill" :style="{width: audioProgressWidth}"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 题目内容 -->
    <view class="question-section">
      <view class="question-text">
        <text class="question-title">{{currentQuestionData.question}}</text>
      </view>
      
      <!-- 选择题选项 -->
      <view class="options-list">
        <view 
          v-for="(option, index) in currentQuestionData.options" 
          :key="index"
          class="option-item"
          :class="{
            'selected': selectedAnswer === index,
            'correct': showResult && index === currentQuestionData.correctAnswer,
            'wrong': showResult && selectedAnswer === index && index !== currentQuestionData.correctAnswer
          }"
          @click="selectAnswer(index)"
        >
          <view class="option-label">{{String.fromCharCode(65 + index)}}</view>
          <text class="option-text">{{option}}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button 
          class="btn btn-replay" 
          @click="replayAudio"
          :disabled="isPlaying"
        >
          重播音频
        </button>
        <button 
          class="btn btn-submit" 
          @click="submitAnswer"
          :disabled="selectedAnswer === null || showResult"
        >
          提交答案
        </button>
      </view>
      
      <button 
        v-if="showResult"
        class="btn btn-next"
        @click="nextQuestion"
      >
        {{currentQuestion < questions.length - 1 ? '下一题' : '完成训练'}}
      </button>
    </view>

    <!-- 答案解析 -->
    <view v-if="showResult" class="explanation-section">
      <view class="explanation-title">答案解析</view>
      <view class="explanation-content">
        <text class="explanation-text">{{currentQuestionData.explanation}}</text>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">训练完成</text>
        </view>
        <view class="modal-body">
          <view class="result-stats">
            <view class="stat-item">
              <text class="stat-label">总题数</text>
              <text class="stat-value">{{questions.length}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确数</text>
              <text class="stat-value">{{correctCount}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确率</text>
              <text class="stat-value">{{Math.round(correctCount / questions.length * 100)}}%</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总得分</text>
              <text class="stat-value">{{score}}</text>
            </view>
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
export default {
  name: 'ListeningComprehension',
  data() {
    return {
      currentQuestion: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      correctCount: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 180, // 3分钟
      showCompleteModal: false,
      questions: [
        {
          id: 1,
          title: '塔台与飞行员通话 - 起飞许可',
          audioUrl: '/static/audio/listening1.mp3',
          question: '根据听到的对话，飞行员被许可在哪条跑道起飞？',
          options: [
            '跑道 09L',
            '跑道 09R', 
            '跑道 27L',
            '跑道 27R'
          ],
          correctAnswer: 1,
          explanation: '在对话中，塔台明确指示"Runway 09R, cleared for takeoff"，因此正确答案是跑道 09R。'
        },
        {
          id: 2,
          title: '进近管制通话 - 高度指令',
          audioUrl: '/static/audio/listening2.mp3',
          question: '管制员要求飞机保持的高度是多少？',
          options: [
            '3000英尺',
            '4000英尺',
            '5000英尺', 
            '6000英尺'
          ],
          correctAnswer: 2,
          explanation: '管制员在通话中说"Maintain 5000 feet"，要求飞机保持5000英尺高度。'
        },
        {
          id: 3,
          title: '紧急情况通话 - 燃油不足',
          audioUrl: '/static/audio/listening3.mp3',
          question: '飞行员报告的紧急情况是什么？',
          options: [
            '发动机故障',
            '燃油不足',
            '液压系统故障',
            '通讯设备故障'
          ],
          correctAnswer: 1,
          explanation: '飞行员在通话中明确报告"Low fuel, request priority landing"，表示燃油不足需要优先降落。'
        }
      ]
    }
  },
  computed: {
    currentQuestionData() {
      return this.questions[this.currentQuestion] || {}
    },
    progressWidth() {
      return `${(this.currentQuestion / this.questions.length) * 100}%`
    },
    audioProgressWidth() {
      return `${(this.currentTime / this.duration) * 100}%`
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
      // 这里应该控制实际的音频播放
      if (this.isPlaying) {
        this.startAudioTimer()
      } else {
        this.stopAudioTimer()
      }
    },
    startAudioTimer() {
      this.audioTimer = setInterval(() => {
        this.currentTime += 1
        if (this.currentTime >= this.duration) {
          this.isPlaying = false
          this.currentTime = 0
          clearInterval(this.audioTimer)
        }
      }, 1000)
    },
    stopAudioTimer() {
      if (this.audioTimer) {
        clearInterval(this.audioTimer)
      }
    },
    replayAudio() {
      this.currentTime = 0
      this.isPlaying = true
      this.startAudioTimer()
    },
    selectAnswer(index) {
      if (!this.showResult) {
        this.selectedAnswer = index
      }
    },
    submitAnswer() {
      if (this.selectedAnswer === null) return
      
      this.showResult = true
      if (this.selectedAnswer === this.currentQuestionData.correctAnswer) {
        this.correctCount++
        this.score += 10
      }
    },
    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++
        this.selectedAnswer = null
        this.showResult = false
        this.currentTime = 0
        this.isPlaying = false
        this.stopAudioTimer()
      } else {
        this.showCompleteModal = true
      }
    },
    restartTraining() {
      this.currentQuestion = 0
      this.selectedAnswer = null
      this.showResult = false
      this.score = 0
      this.correctCount = 0
      this.currentTime = 0
      this.isPlaying = false
      this.showCompleteModal = false
      this.stopAudioTimer()
    },
    closeModal() {
      this.showCompleteModal = false
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  },
  beforeDestroy() {
    this.stopAudioTimer()
  }
}
</script>

<style scoped>
.listening-container {
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

/* 音频播放区域 */
.audio-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.audio-player {
  border: 2rpx solid #4facfe;
  border-radius: 20rpx;
  padding: 30rpx;
}

.audio-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.play-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.play-icon {
  color: white;
  font-size: 32rpx;
}

.audio-info {
  flex: 1;
}

.audio-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.audio-duration {
  font-size: 24rpx;
  color: #999;
}

.audio-progress {
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
}

.audio-progress-bar {
  height: 100%;
  background: #f0f0f0;
}

.audio-progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.1s ease;
}

/* 题目区域 */
.question-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.question-text {
  margin-bottom: 30rpx;
}

.question-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
}

.options-list {
  
}

.option-item {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  transition: all 0.3s ease;
}

.option-item.selected {
  border-color: #4facfe;
  background: #f0f9ff;
}

.option-item.correct {
  border-color: #52c41a;
  background: #f6ffed;
}

.option-item.wrong {
  border-color: #ff4d4f;
  background: #fff2f0;
}

.option-label {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
  margin-right: 20rpx;
}

.option-item.selected .option-label {
  background: #4facfe;
  color: white;
}

.option-item.correct .option-label {
  background: #52c41a;
  color: white;
}

.option-item.wrong .option-label {
  background: #ff4d4f;
  color: white;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

/* 操作按钮 */
.action-section {
  padding: 30rpx;
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

/* 答案解析 */
.explanation-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.explanation-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.explanation-content {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 10rpx;
}

.explanation-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

/* 完成弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  padding: 40rpx 30rpx 20rpx;
  text-align: center;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  padding: 30rpx;
}

.result-stats {
  
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-footer {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  gap: 20rpx;
}

.btn-primary {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 28rpx;
}

.btn-secondary {
  flex: 1;
  height: 80rpx;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 15rpx;
  font-size: 28rpx;
}
</style>