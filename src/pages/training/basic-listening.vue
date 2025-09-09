<template>
  <view class="listening-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">基础听力训练</view>
      <view class="nav-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-text">第 {{currentExercise + 1}} 题 / 共 {{exercises.length}} 题</text>
        <text class="score-text">得分: {{score}}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: progressWidth}"></view>
      </view>
    </view>

    <!-- 音频播放区域 -->
    <view class="audio-section">
      <view class="audio-player">
        <view class="audio-header">
          <text class="audio-title">{{exercises[currentExercise].title}}</text>
          <text class="audio-type">{{exercises[currentExercise].type}}</text>
        </view>
        <view class="audio-controls">
          <view class="play-btn" @click="togglePlay">
            <text class="play-icon">{{isPlaying ? '⏸' : '▶'}}</text>
          </view>
          <view class="audio-info">
            <text class="audio-duration">{{formatTime(currentTime)}} / {{formatTime(duration)}}</text>
            <view class="audio-progress">
              <view class="audio-progress-bar">
                <view class="audio-progress-fill" :style="{width: audioProgressWidth}"></view>
              </view>
            </view>
          </view>
          <view class="replay-btn" @click="replayAudio">
            <text class="replay-icon">🔄</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 练习内容 -->
    <view class="exercise-section">
      <view class="exercise-card">
        <view class="exercise-instruction">
          <text class="instruction-text">{{exercises[currentExercise].instruction}}</text>
        </view>
        
        <!-- 选择题 -->
        <view v-if="exercises[currentExercise].exerciseType === 'choice'" class="choice-exercise">
          <view class="question-text">{{exercises[currentExercise].question}}</view>
          <view class="options-list">
            <view 
              v-for="(option, index) in exercises[currentExercise].options" 
              :key="index"
              class="option-item"
              :class="{selected: selectedOption === index, correct: showResult && index === exercises[currentExercise].correctAnswer, wrong: showResult && selectedOption === index && index !== exercises[currentExercise].correctAnswer}"
              @click="selectOption(index)"
            >
              <view class="option-label">{{String.fromCharCode(65 + index)}}</view>
              <text class="option-text">{{option}}</text>
            </view>
          </view>
        </view>

        <!-- 填空题 -->
        <view v-else-if="exercises[currentExercise].exerciseType === 'fill'" class="fill-exercise">
          <view class="fill-question">{{exercises[currentExercise].question}}</view>
          <view class="fill-inputs">
            <view 
              v-for="(blank, index) in exercises[currentExercise].blanks" 
              :key="index"
              class="fill-item"
            >
              <text class="fill-label">{{blank.label}}:</text>
              <input 
                class="fill-input" 
                v-model="userAnswers[index]" 
                :placeholder="blank.placeholder"
                :disabled="showResult"
              />
            </view>
          </view>
        </view>

        <!-- 判断题 -->
        <view v-else-if="exercises[currentExercise].exerciseType === 'judge'" class="judge-exercise">
          <view class="judge-question">{{exercises[currentExercise].question}}</view>
          <view class="judge-options">
            <view 
              class="judge-option"
              :class="{selected: selectedJudge === true, correct: showResult && exercises[currentExercise].correctAnswer === true, wrong: showResult && selectedJudge === true && exercises[currentExercise].correctAnswer !== true}"
              @click="selectJudge(true)"
            >
              <text class="judge-text">正确</text>
            </view>
            <view 
              class="judge-option"
              :class="{selected: selectedJudge === false, correct: showResult && exercises[currentExercise].correctAnswer === false, wrong: showResult && selectedJudge === false && exercises[currentExercise].correctAnswer !== false}"
              @click="selectJudge(false)"
            >
              <text class="judge-text">错误</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-buttons">
        <button class="btn btn-hint" @click="showHint" v-if="!showResult && exercises[currentExercise].hint">
          提示
        </button>
        <button class="btn btn-submit" @click="submitAnswer" v-if="!showResult" :disabled="!canSubmit">
          提交答案
        </button>
        <button class="btn btn-next" @click="nextExercise" v-if="showResult">
          {{currentExercise < exercises.length - 1 ? '下一题' : '完成训练'}}
        </button>
      </view>
    </view>

    <!-- 答案解析 -->
    <view v-if="showResult" class="explanation-section">
      <view class="explanation-card">
        <view class="explanation-header">
          <text class="explanation-title">答案解析</text>
          <view class="result-badge" :class="{correct: isCurrentCorrect, wrong: !isCurrentCorrect}">
            <text class="result-text">{{isCurrentCorrect ? '正确' : '错误'}}</text>
          </view>
        </view>
        <view class="explanation-content">
          <view class="correct-answer">
            <text class="answer-label">正确答案:</text>
            <text class="answer-text">{{getCorrectAnswerText()}}</text>
          </view>
          <view class="explanation-text">
            <text>{{exercises[currentExercise].explanation}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提示弹窗 -->
    <view v-if="showHintModal" class="modal-overlay" @click="closeHintModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">提示</text>
        </view>
        <view class="modal-body">
          <text class="hint-text">{{exercises[currentExercise].hint}}</text>
        </view>
        <view class="modal-footer">
          <button class="btn btn-primary" @click="closeHintModal">知道了</button>
        </view>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">训练完成</text>
        </view>
        <view class="modal-body">
          <view class="final-stats">
            <view class="stat-item">
              <text class="stat-label">总题数</text>
              <text class="stat-value">{{exercises.length}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确数</text>
              <text class="stat-value">{{correctCount}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确率</text>
              <text class="stat-value">{{Math.round(correctCount / exercises.length * 100)}}%</text>
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
export default {
  name: 'BasicListening',
  data() {
    return {
      currentExercise: 0,
      selectedOption: null,
      selectedJudge: null,
      userAnswers: {},
      showResult: false,
      showHintModal: false,
      showCompleteModal: false,
      score: 0,
      correctCount: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 120,
      audioTimer: null,
      isCurrentCorrect: false,
      exercises: [
        {
          id: 1,
          title: '数字识别训练',
          type: '基础听力',
          exerciseType: 'choice',
          instruction: '请仔细听音频中的数字，选择正确答案',
          audioUrl: '/static/audio/numbers.mp3',
          question: '听到的航班号是什么？',
          options: [
            'CA1234',
            'CZ1234', 
            'MU1234',
            'HU1234'
          ],
          correctAnswer: 0,
          explanation: '在航空通信中，航班号的准确识别非常重要。CA代表中国国际航空公司。',
          hint: '注意区分字母C和数字的发音差异'
        },
        {
          id: 2,
          title: '时间表达训练',
          type: '基础听力',
          exerciseType: 'fill',
          instruction: '请听音频，填写正确的时间信息',
          audioUrl: '/static/audio/time.mp3',
          question: '请填写听到的时间信息：',
          blanks: [
            { label: '起飞时间', placeholder: '如：14:30' },
            { label: '到达时间', placeholder: '如：16:45' }
          ],
          correctAnswer: ['14:30', '16:45'],
          explanation: '24小时制时间表达在航空领域是标准格式，需要准确理解小时和分钟。',
          hint: '注意区分thirty和thirteen的发音'
        },
        {
          id: 3,
          title: '方位识别训练',
          type: '基础听力',
          exerciseType: 'choice',
          instruction: '请听音频中的方位指令，选择正确的方向',
          audioUrl: '/static/audio/direction.mp3',
          question: '飞机被指示转向哪个方向？',
          options: [
            '左转090度',
            '右转090度',
            '左转180度', 
            '右转180度'
          ],
          correctAnswer: 1,
          explanation: '方位指令在航空通信中必须准确理解，右转090度意味着向东转向。',
          hint: '仔细区分left和right的发音'
        },
        {
          id: 4,
          title: '高度信息训练',
          type: '基础听力',
          exerciseType: 'fill',
          instruction: '请听音频，填写高度相关信息',
          audioUrl: '/static/audio/altitude.mp3',
          question: '请填写听到的高度信息：',
          blanks: [
            { label: '当前高度', placeholder: '如：3000' },
            { label: '目标高度', placeholder: '如：5000' }
          ],
          correctAnswer: ['3000', '5000'],
          explanation: '高度信息通常以英尺为单位，在航空通信中是关键的安全信息。',
          hint: '注意thousand的发音和数字的清晰度'
        },
        {
          id: 5,
          title: '天气信息判断',
          type: '基础听力',
          exerciseType: 'judge',
          instruction: '请听天气播报，判断以下说法是否正确',
          audioUrl: '/static/audio/weather.mp3',
          question: '当前天气条件适合飞行',
          correctAnswer: false,
          explanation: '根据播报，当前有强风和低能见度，不适合正常飞行操作。',
          hint: '注意听关键词：wind、visibility、conditions'
        }
      ]
    }
  },
  computed: {
    progressWidth() {
      return `${((this.currentExercise + 1) / this.exercises.length) * 100}%`
    },
    audioProgressWidth() {
      return `${(this.currentTime / this.duration) * 100}%`
    },
    canSubmit() {
      const exercise = this.exercises[this.currentExercise]
      if (exercise.exerciseType === 'choice') {
        return this.selectedOption !== null
      } else if (exercise.exerciseType === 'fill') {
        return exercise.blanks.every((_, index) => this.userAnswers[index] && this.userAnswers[index].trim())
      } else if (exercise.exerciseType === 'judge') {
        return this.selectedJudge !== null
      }
      return false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    togglePlay() {
      if (this.isPlaying) {
        this.pauseAudio()
      } else {
        this.playAudio()
      }
    },
    playAudio() {
      this.isPlaying = true
      this.currentTime = 0
      this.audioTimer = setInterval(() => {
        this.currentTime++
        if (this.currentTime >= this.duration) {
          this.pauseAudio()
        }
      }, 1000)
      
      uni.showToast({
        title: '播放音频',
        icon: 'none'
      })
    },
    pauseAudio() {
      this.isPlaying = false
      if (this.audioTimer) {
        clearInterval(this.audioTimer)
        this.audioTimer = null
      }
    },
    replayAudio() {
      this.pauseAudio()
      this.currentTime = 0
      this.playAudio()
    },
    selectOption(index) {
      if (!this.showResult) {
        this.selectedOption = index
      }
    },
    selectJudge(value) {
      if (!this.showResult) {
        this.selectedJudge = value
      }
    },
    showHint() {
      this.showHintModal = true
    },
    closeHintModal() {
      this.showHintModal = false
    },
    submitAnswer() {
      const exercise = this.exercises[this.currentExercise]
      let isCorrect = false
      
      if (exercise.exerciseType === 'choice') {
        isCorrect = this.selectedOption === exercise.correctAnswer
      } else if (exercise.exerciseType === 'fill') {
        isCorrect = exercise.correctAnswer.every((answer, index) => {
          const userAnswer = this.userAnswers[index] ? this.userAnswers[index].trim() : ''
          return userAnswer.toLowerCase() === answer.toLowerCase()
        })
      } else if (exercise.exerciseType === 'judge') {
        isCorrect = this.selectedJudge === exercise.correctAnswer
      }
      
      this.isCurrentCorrect = isCorrect
      if (isCorrect) {
        this.score += 20
        this.correctCount++
      }
      
      this.showResult = true
      this.pauseAudio()
      
      uni.showToast({
        title: isCorrect ? '回答正确' : '回答错误',
        icon: isCorrect ? 'success' : 'error'
      })
    },
    nextExercise() {
      if (this.currentExercise < this.exercises.length - 1) {
        this.currentExercise++
        this.resetExerciseState()
      } else {
        this.showCompleteModal = true
      }
    },
    resetExerciseState() {
      this.selectedOption = null
      this.selectedJudge = null
      this.userAnswers = {}
      this.showResult = false
      this.isCurrentCorrect = false
      this.currentTime = 0
      this.pauseAudio()
    },
    restartTraining() {
      this.currentExercise = 0
      this.score = 0
      this.correctCount = 0
      this.showCompleteModal = false
      this.resetExerciseState()
    },
    closeCompleteModal() {
      this.showCompleteModal = false
    },
    getCorrectAnswerText() {
      const exercise = this.exercises[this.currentExercise]
      if (exercise.exerciseType === 'choice') {
        return `${String.fromCharCode(65 + exercise.correctAnswer)}. ${exercise.options[exercise.correctAnswer]}`
      } else if (exercise.exerciseType === 'fill') {
        return exercise.correctAnswer.join(', ')
      } else if (exercise.exerciseType === 'judge') {
        return exercise.correctAnswer ? '正确' : '错误'
      }
      return ''
    },
    getPerformanceSummary() {
      const accuracy = this.correctCount / this.exercises.length
      if (accuracy >= 0.9) return '优秀！您的基础听力能力很强！'
      if (accuracy >= 0.7) return '良好！继续保持，多加练习！'
      if (accuracy >= 0.6) return '合格！建议加强基础听力训练！'
      return '需要加强！建议多听多练，提升听力基础！'
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  },
  beforeDestroy() {
    if (this.audioTimer) {
      clearInterval(this.audioTimer)
    }
  }
}
</script>

<style scoped>
.listening-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 48rpx;
  color: #ffffff;
  font-weight: 300;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.nav-right {
  width: 60rpx;
}

.progress-section {
  padding: 32rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-text, .score-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.progress-bar {
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #ffffff;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.audio-section {
  padding: 0 32rpx 32rpx;
}

.audio-player {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.audio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.audio-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.audio-type {
  font-size: 24rpx;
  color: #4facfe;
  background-color: #f0f9ff;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.play-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(79, 172, 254, 0.3);
}

.play-icon {
  font-size: 32rpx;
  color: #ffffff;
}

.audio-info {
  flex: 1;
}

.audio-duration {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.audio-progress {
  width: 100%;
}

.audio-progress-bar {
  height: 6rpx;
  background-color: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
}

.audio-progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 3rpx;
  transition: width 0.3s ease;
}

.replay-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.replay-icon {
  font-size: 24rpx;
}

.exercise-section {
  padding: 0 32rpx 32rpx;
}

.exercise-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.exercise-instruction {
  margin-bottom: 32rpx;
}

.instruction-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.choice-exercise .question-text {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.option-item.selected {
  border-color: #4facfe;
  background-color: #f0f9ff;
}

.option-item.correct {
  border-color: #52c41a;
  background-color: #f6ffed;
}

.option-item.wrong {
  border-color: #ff4d4f;
  background-color: #fff2f0;
}

.option-label {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #4facfe;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.option-item.correct .option-label {
  background-color: #52c41a;
}

.option-item.wrong .option-label {
  background-color: #ff4d4f;
}

.option-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.4;
}

.fill-exercise .fill-question {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.fill-inputs {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.fill-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.fill-label {
  font-size: 28rpx;
  color: #666666;
  min-width: 120rpx;
}

.fill-input {
  flex: 1;
  height: 80rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
}

.fill-input:focus {
  border-color: #4facfe;
}

.judge-exercise .judge-question {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.judge-options {
  display: flex;
  gap: 24rpx;
}

.judge-option {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e8e8e8;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.judge-option.selected {
  border-color: #4facfe;
  background-color: #f0f9ff;
}

.judge-option.correct {
  border-color: #52c41a;
  background-color: #f6ffed;
}

.judge-option.wrong {
  border-color: #ff4d4f;
  background-color: #fff2f0;
}

.judge-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.action-section {
  padding: 0 32rpx 32rpx;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.btn:active {
  transform: scale(0.95);
}

.btn-hint {
  background-color: #faad14;
  color: #ffffff;
}

.btn-submit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
}

.btn-submit:disabled {
  background-color: #d9d9d9;
  color: #999999;
}

.btn-next {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #ffffff;
}

.explanation-section {
  padding: 0 32rpx 32rpx;
}

.explanation-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.explanation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.explanation-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.result-badge {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.result-badge.correct {
  background-color: #f6ffed;
  color: #52c41a;
}

.result-badge.wrong {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.explanation-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.correct-answer {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.answer-label {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

.answer-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
}

.explanation-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #4facfe;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 24rpx;
  margin: 32rpx;
  max-width: 600rpx;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  padding: 48rpx 32rpx 24rpx;
  text-align: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.modal-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.modal-body {
  padding: 32rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  text-align: center;
}

.final-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.stat-item {
  text-align: center;
  padding: 24rpx;
  background-color: #f8f9fa;
  border-radius: 16rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  display: block;
}

.performance-summary {
  text-align: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 16rpx;
}

.summary-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
}

.btn-primary {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.btn-secondary {
  flex: 1;
  height: 88rpx;
  background-color: #f5f5f5;
  color: #666666;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}
</style>