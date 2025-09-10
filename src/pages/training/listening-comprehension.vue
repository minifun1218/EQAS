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
      <!-- 作答时间显示 -->
      <view v-if="isAnswerTimeActive" class="answer-time-info">
        <text class="answer-time-text">作答时间: {{answerTimeLeft}}秒</text>
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
          v-show="!showOptionsRestricted || index === 0"
          class="option-item"
          :class="{
            'selected': selectedAnswer === index,
            'correct': showResult && index === currentQuestionData.correctAnswer,
            'wrong': showResult && selectedAnswer === index && index !== currentQuestionData.correctAnswer,
            'disabled': showOptionsRestricted && index !== 0
          }"
          @click="selectAnswer(index)"
        >
          <view class="option-label">{{String.fromCharCode(65 + index)}}</view>
          <text class="option-text">{{option}}</text>
        </view>
        <!-- 播放时的提示信息 -->
        <view v-if="showOptionsRestricted" class="options-hint">
          <text class="hint-text">录音播放中，仅显示第一个选项。播放完成后将显示所有选项。</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button 
          class="btn btn-replay" 
          @click="replayAudio"
          :disabled="hasPlayedOnce || isPlaying"
        >
          {{hasPlayedOnce ? '已播放' : '重播音频'}}
        </button>
        <button 
          class="btn btn-submit" 
          @click="submitAnswer"
          :disabled="selectedAnswer === null || showResult || showOptionsRestricted"
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
import { trainingApi } from '@/api/index.js'

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
      loading: false,
      questions: [],
      // 新增字段
      hasPlayedOnce: false, // 是否已播放过一次
      answerTimeLeft: 15, // 剩余作答时间（秒）
      answerTimer: null, // 作答计时器
      isAnswerTimeActive: false, // 是否在作答时间内
      speechRate: 110, // 语速控制（每分钟词数）
      showOptionsRestricted: false, // 是否限制显示选项
      answerHistory: [] // 答题历史记录
    }
  },
  
  onLoad() {
    this.loadQuestions()
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
    async loadQuestions() {
      this.loading = true
      try {
        const response = await trainingApi.getListeningQuestions({
          speechRate: this.speechRate, // 传递语速参数
          format: 'multiple-choice' // 指定四选一格式
        })
        if (response.code === 200) {
          // 确保所有题目都是四选一格式
          this.questions = response.data.map(question => {
            // 如果选项不足4个，补充默认选项
            while (question.options.length < 4) {
              question.options.push('选项待补充')
            }
            // 如果选项超过4个，只取前4个
            if (question.options.length > 4) {
              question.options = question.options.slice(0, 4)
              // 确保正确答案索引不超出范围
              if (question.correctAnswer >= 4) {
                question.correctAnswer = 0
              }
            }
            // 根据语速计算音频时长
            question.duration = this.calculateQuestionDuration(question)
            return question
          })
        } else {
          uni.showToast({
            title: '加载题目失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载听力题目失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    async submitTrainingResult() {
      try {
        // 计算详细统计信息
        const totalTime = this.answerHistory.reduce((sum, answer) => sum + answer.timeUsed, 0)
        const averageTime = totalTime / this.questions.length
        
        const result = {
          trainingType: 'listening-comprehension',
          totalQuestions: this.questions.length,
          correctCount: this.correctCount,
          score: this.score,
          accuracy: Math.round(this.correctCount / this.questions.length * 100),
          completedAt: new Date().toISOString(),
          // 新增详细信息
          speechRate: this.speechRate,
          totalTime: totalTime,
          averageTime: Math.round(averageTime * 100) / 100,
          answerHistory: this.answerHistory,
          trainingSettings: {
            playOnce: true, // 每段录音只播放一次
            answerTimeLimit: 15, // 15秒作答时间
            optionsFormat: 'four-choice', // 四选一格式
            autoScoring: true // 自动评分
          }
        }
        
        const response = await trainingApi.submitTrainingResult(result)
        if (response.code === 200) {
          console.log('训练结果提交成功')
        }
      } catch (error) {
        console.error('提交训练结果失败:', error)
      }
    },
    
    goBack() {
      uni.navigateBack()
    },
    togglePlay() {
      // 如果已经播放过一次，不允许再次播放
      if (this.hasPlayedOnce && !this.isPlaying) {
        uni.showToast({
          title: '每段录音只能播放一次',
          icon: 'none'
        })
        return
      }
      
      this.isPlaying = !this.isPlaying
      // 这里应该控制实际的音频播放
      if (this.isPlaying) {
        this.startAudioTimer()
        this.showOptionsRestricted = true // 播放时限制选项显示
      } else {
        this.stopAudioTimer()
      }
    },
    startAudioTimer() {
      this.audioTimer = setInterval(() => {
        this.currentTime += 1
        if (this.currentTime >= this.duration) {
          this.isPlaying = false
          this.hasPlayedOnce = true // 标记已播放过一次
          this.showOptionsRestricted = false // 播放结束后显示所有选项
          this.startAnswerTimer() // 开始作答计时
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
      // 移除重播功能，因为每段录音只能播放一次
      uni.showToast({
        title: '每段录音只能播放一次',
        icon: 'none'
      })
    },
    selectAnswer(index) {
      if (!this.showResult) {
        this.selectedAnswer = index
      }
    },
    submitAnswer() {
      if (this.selectedAnswer === null) return
      
      this.stopAnswerTimer() // 停止作答计时
      this.showResult = true
      
      // 自动评分逻辑
      const isCorrect = this.selectedAnswer === this.currentQuestionData.correctAnswer
      if (isCorrect) {
        this.correctCount++
        // 根据剩余时间给分，最高10分
        const timeBonus = Math.max(0, this.answerTimeLeft)
        const baseScore = 8 // 基础分
        const bonusScore = Math.min(2, timeBonus * 0.1) // 时间奖励分
        const questionScore = Math.round(baseScore + bonusScore)
        this.score += questionScore
        
        uni.showToast({
          title: `答对了！+${questionScore}分`,
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: '答错了',
          icon: 'none'
        })
      }
      
      // 记录答题结果
      this.recordAnswer({
        questionIndex: this.currentQuestion,
        selectedAnswer: this.selectedAnswer,
        correctAnswer: this.currentQuestionData.correctAnswer,
        isCorrect: isCorrect,
        timeUsed: 15 - this.answerTimeLeft
      })
    },
    nextQuestion() {
      this.stopAnswerTimer() // 停止作答计时
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++
        this.selectedAnswer = null
        this.showResult = false
        this.currentTime = 0
        this.isPlaying = false
        this.hasPlayedOnce = false // 重置播放状态
        this.answerTimeLeft = 15 // 重置作答时间
        this.isAnswerTimeActive = false
        this.showOptionsRestricted = false
        this.stopAudioTimer()
      } else {
        this.showCompleteModal = true
        this.submitTrainingResult()
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
      // 重置新增字段
      this.hasPlayedOnce = false
      this.answerTimeLeft = 15
      this.isAnswerTimeActive = false
      this.showOptionsRestricted = false
      this.answerHistory = []
      this.stopAudioTimer()
      this.stopAnswerTimer()
    },
    closeModal() {
      this.showCompleteModal = false
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 新增方法
    startAnswerTimer() {
      this.isAnswerTimeActive = true
      this.answerTimeLeft = 15
      this.answerTimer = setInterval(() => {
        this.answerTimeLeft--
        if (this.answerTimeLeft <= 0) {
          this.stopAnswerTimer()
          // 时间到自动提交答案（如果已选择）或跳过
          if (this.selectedAnswer !== null) {
            this.submitAnswer()
          } else {
            uni.showToast({
              title: '作答时间已到',
              icon: 'none'
            })
            this.nextQuestion()
          }
        }
      }, 1000)
    },
    
    stopAnswerTimer() {
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
      this.isAnswerTimeActive = false
    },
    
    calculateAudioDuration() {
      // 根据语速计算音频时长
      // 假设每题平均50个词，根据语速计算时长
      const wordsPerQuestion = 50
      const wordsPerSecond = this.speechRate / 60
      return Math.ceil(wordsPerQuestion / wordsPerSecond)
    },
    
    calculateQuestionDuration(question) {
      // 根据题目内容和语速计算具体时长
      const questionText = question.question || ''
      const optionsText = question.options.join(' ')
      const totalText = questionText + ' ' + optionsText
      const wordCount = totalText.split(' ').length
      const wordsPerSecond = this.speechRate / 60
      return Math.max(30, Math.ceil(wordCount / wordsPerSecond)) // 最少30秒
    },
    
    recordAnswer(answerData) {
      // 记录答题数据，用于后续分析
      if (!this.answerHistory) {
        this.answerHistory = []
      }
      this.answerHistory.push({
        ...answerData,
        timestamp: new Date().toISOString()
      })
    }
  },
  beforeDestroy() {
    this.stopAudioTimer()
    this.stopAnswerTimer()
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

/* 作答时间显示 */
.answer-time-info {
  text-align: center;
  margin-bottom: 15rpx;
}

.answer-time-text {
  font-size: 30rpx;
  color: #ff6b35;
  font-weight: bold;
  background: #fff3f0;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  border: 2rpx solid #ff6b35;
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

.option-item.disabled {
  opacity: 0.5;
  pointer-events: none;
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

/* 选项限制提示 */
.options-hint {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f0f9ff;
  border: 2rpx solid #4facfe;
  border-radius: 10rpx;
  text-align: center;
}

.hint-text {
  font-size: 26rpx;
  color: #4facfe;
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
  cursor: not-allowed;
}

.btn-replay[disabled] {
  background: #e0e0e0;
  color: #999;
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