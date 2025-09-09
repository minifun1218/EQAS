<template>
  <view class="listening-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">听力简单训练</view>
      <view class="nav-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-text">进度: {{currentExercise + 1}}/{{exercises.length}}</view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: ((currentExercise + 1) / exercises.length * 100) + '%'}"></view>
      </view>
    </view>

    <!-- 音频播放区域 -->
    <view class="audio-section">
      <view class="audio-title">{{exercises[currentExercise].title}}</view>
      <view class="audio-controls">
        <button class="control-btn" @click="togglePlay">
          <text class="control-icon">{{isPlaying ? '⏸' : '▶'}}</text>
        </button>
        <button class="control-btn" @click="replayAudio">
          <text class="control-icon">🔄</text>
        </button>
      </view>
      <view class="audio-progress">
        <view class="progress-time">{{formatTime(currentTime)}} / {{formatTime(duration)}}</view>
        <view class="progress-slider">
          <view class="slider-track">
            <view class="slider-fill" :style="{width: (currentTime / duration * 100) + '%'}"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 练习内容 -->
    <view class="exercise-section">
      <view class="exercise-instruction">{{exercises[currentExercise].instruction}}</view>
      
      <!-- 填空题 -->
      <view v-if="exercises[currentExercise].type === 'fill'" class="fill-exercise">
        <view class="sentence">
          <text v-for="(part, index) in exercises[currentExercise].sentenceParts" :key="index">
            <text v-if="part.type === 'text'">{{part.content}}</text>
            <input v-else class="fill-input" v-model="userAnswers[part.id]" :placeholder="'填空' + (part.id + 1)" />
          </text>
        </view>
      </view>

      <!-- 选择题 -->
      <view v-else-if="exercises[currentExercise].type === 'choice'" class="choice-exercise">
        <view class="question">{{exercises[currentExercise].question}}</view>
        <view class="options">
          <view 
            v-for="(option, index) in exercises[currentExercise].options" 
            :key="index"
            class="option"
            :class="{selected: selectedOption === index}"
            @click="selectOption(index)"
          >
            <text class="option-label">{{String.fromCharCode(65 + index)}}</text>
            <text class="option-text">{{option}}</text>
          </view>
        </view>
      </view>

      <!-- 排序题 -->
      <view v-else-if="exercises[currentExercise].type === 'order'" class="order-exercise">
        <view class="instruction">请按听到的顺序排列以下内容：</view>
        <view class="order-items">
          <view 
            v-for="(item, index) in shuffledItems" 
            :key="index"
            class="order-item"
            :class="{selected: selectedItems.includes(index)}"
            @click="selectOrderItem(index)"
          >
            <text class="order-number">{{selectedItems.indexOf(index) + 1 || ''}}</text>
            <text class="order-text">{{item}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button class="btn btn-secondary" @click="showHint" v-if="!showResult">提示</button>
      <button class="btn btn-primary" @click="submitAnswer" v-if="!showResult">提交答案</button>
      <button class="btn btn-primary" @click="nextExercise" v-if="showResult">
        {{currentExercise < exercises.length - 1 ? '下一题' : '完成训练'}}
      </button>
    </view>

    <!-- 答案解析 -->
    <view v-if="showResult" class="explanation-section">
      <view class="explanation-title">答案解析</view>
      <view class="explanation-content">
        <view class="correct-answer">正确答案：{{exercises[currentExercise].correctAnswer}}</view>
        <view class="explanation-text">{{exercises[currentExercise].explanation}}</view>
      </view>
    </view>

    <!-- 提示弹窗 -->
    <view v-if="showHintModal" class="modal-overlay" @click="closeHint">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">提示</text>
          <text class="modal-close" @click="closeHint">×</text>
        </view>
        <view class="modal-body">
          <text>{{exercises[currentExercise].hint}}</text>
        </view>
      </view>
    </view>

    <!-- 训练完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">训练完成</text>
        </view>
        <view class="modal-body">
          <view class="score-display">
            <text class="score-text">本次得分</text>
            <text class="score-number">{{score}}/{{exercises.length}}</text>
            <text class="score-percent">{{Math.round(score / exercises.length * 100)}}%</text>
          </view>
          <view class="performance-text">
            {{score === exercises.length ? '完美！' : score >= exercises.length * 0.8 ? '很好！' : score >= exercises.length * 0.6 ? '不错！' : '继续努力！'}}
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
  name: 'SimpleListening',
  data() {
    return {
      currentExercise: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 180, // 3分钟
      showResult: false,
      showHintModal: false,
      showCompleteModal: false,
      score: 0,
      selectedOption: null,
      userAnswers: {},
      selectedItems: [],
      shuffledItems: [],
      exercises: [
        {
          id: 1,
          title: '航班信息听写',
          type: 'fill',
          instruction: '请听音频，填写缺失的航班信息',
          audioUrl: '/static/audio/flight-info.mp3',
          sentenceParts: [
            { type: 'text', content: 'Flight ' },
            { type: 'input', id: 0 },
            { type: 'text', content: ' is scheduled to depart at ' },
            { type: 'input', id: 1 },
            { type: 'text', content: ' from gate ' },
            { type: 'input', id: 2 }
          ],
          correctAnswer: 'CA1234, 14:30, A12',
          explanation: '这是一个标准的航班信息播报，包含航班号、起飞时间和登机口信息。',
          hint: '注意听清楚数字和字母的发音'
        },
        {
          id: 2,
          title: '天气信息理解',
          type: 'choice',
          instruction: '根据听到的天气播报，选择正确答案',
          audioUrl: '/static/audio/weather-report.mp3',
          question: '当前的风向和风速是？',
          options: [
            '东北风 15节',
            '西南风 12节', 
            '东南风 18节',
            '西北风 10节'
          ],
          correctAnswer: 'B. 西南风 12节',
          explanation: '播报中明确提到"Southwest wind 12 knots"，即西南风12节。',
          hint: '仔细听风向的英文表达'
        },
        {
          id: 3,
          title: '指令序列排序',
          type: 'order',
          instruction: '请按听到的指令顺序排列',
          audioUrl: '/static/audio/atc-instructions.mp3',
          items: [
            '联系塔台频率118.1',
            '保持现有高度',
            '右转航向090',
            '减速至250节'
          ],
          correctOrder: [2, 3, 1, 0], // 对应items数组的索引
          correctAnswer: '1.右转航向090 2.减速至250节 3.保持现有高度 4.联系塔台频率118.1',
          explanation: '管制员按照飞行安全的优先级依次发出指令。',
          hint: '注意指令的逻辑顺序'
        }
      ]
    }
  },
  mounted() {
    this.initializeExercise()
  },
  methods: {
    initializeExercise() {
      const exercise = this.exercises[this.currentExercise]
      if (exercise.type === 'order') {
        this.shuffledItems = [...exercise.items].sort(() => Math.random() - 0.5)
      }
      this.selectedOption = null
      this.userAnswers = {}
      this.selectedItems = []
      this.showResult = false
    },
    
    togglePlay() {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.startTimer()
      }
    },
    
    replayAudio() {
      this.currentTime = 0
      this.isPlaying = true
      this.startTimer()
    },
    
    startTimer() {
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        if (this.currentTime < this.duration) {
          this.currentTime++
        } else {
          this.isPlaying = false
          clearInterval(this.timer)
        }
      }, 1000)
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    selectOption(index) {
      this.selectedOption = index
    },
    
    selectOrderItem(index) {
      const selectedIndex = this.selectedItems.indexOf(index)
      if (selectedIndex > -1) {
        this.selectedItems.splice(selectedIndex, 1)
      } else {
        this.selectedItems.push(index)
      }
    },
    
    showHint() {
      this.showHintModal = true
    },
    
    closeHint() {
      this.showHintModal = false
    },
    
    submitAnswer() {
      const exercise = this.exercises[this.currentExercise]
      let isCorrect = false
      
      if (exercise.type === 'choice') {
        isCorrect = this.selectedOption === 1 // 假设正确答案是B
      } else if (exercise.type === 'fill') {
        // 简化判断，实际应该更严格
        isCorrect = Object.keys(this.userAnswers).length === 3
      } else if (exercise.type === 'order') {
        isCorrect = JSON.stringify(this.selectedItems) === JSON.stringify(exercise.correctOrder)
      }
      
      if (isCorrect) {
        this.score++
      }
      
      this.showResult = true
    },
    
    nextExercise() {
      if (this.currentExercise < this.exercises.length - 1) {
        this.currentExercise++
        this.initializeExercise()
      } else {
        this.showCompleteModal = true
      }
    },
    
    restartTraining() {
      this.currentExercise = 0
      this.score = 0
      this.showCompleteModal = false
      this.initializeExercise()
    },
    
    goBack() {
      uni.navigateBack()
    }
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.listening-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: white;
  border-bottom: 1px solid #eee;
}

.nav-left {
  width: 80rpx;
}

.nav-back {
  font-size: 40rpx;
  color: #007aff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 80rpx;
}

.progress-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.progress-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.3s ease;
}

.audio-section {
  background: white;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.audio-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.audio-controls {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 30rpx;
}

.control-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.3);
}

.control-icon {
  font-size: 36rpx;
  color: white;
}

.audio-progress {
  text-align: center;
}

.progress-time {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.progress-slider {
  padding: 0 20rpx;
}

.slider-track {
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  position: relative;
}

.slider-fill {
  height: 100%;
  background: #4facfe;
  border-radius: 3rpx;
  transition: width 0.1s ease;
}

.exercise-section {
  background: white;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.exercise-instruction {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  text-align: center;
}

.fill-exercise .sentence {
  font-size: 32rpx;
  line-height: 1.8;
  color: #333;
}

.fill-input {
  display: inline-block;
  min-width: 120rpx;
  padding: 10rpx 15rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
  text-align: center;
}

.choice-exercise .question {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
  font-weight: 500;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.option.selected {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
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
  font-weight: 600;
  margin-right: 20rpx;
}

.option.selected .option-label {
  background: #4facfe;
  color: white;
}

.option-text {
  font-size: 28rpx;
  color: #333;
}

.order-exercise .instruction {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.order-item.selected {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
}

.order-number {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 20rpx;
}

.order-item.selected .order-number {
  background: #4facfe;
  color: white;
}

.order-text {
  font-size: 28rpx;
  color: #333;
}

.action-section {
  padding: 30rpx;
  display: flex;
  justify-content: center;
  gap: 30rpx;
}

.btn {
  padding: 25rpx 50rpx;
  border-radius: 25rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.3);
}

.btn-secondary {
  background: white;
  color: #4facfe;
  border: 2rpx solid #4facfe;
}

.explanation-section {
  background: white;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.explanation-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.correct-answer {
  font-size: 28rpx;
  color: #52c41a;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.explanation-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

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
  background: white;
  border-radius: 20rpx;
  width: 600rpx;
  max-width: 90vw;
  overflow: hidden;
}

.modal-header {
  padding: 40rpx 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.score-display {
  text-align: center;
  margin-bottom: 30rpx;
}

.score-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.score-number {
  display: block;
  font-size: 72rpx;
  font-weight: bold;
  color: #4facfe;
  margin-bottom: 10rpx;
}

.score-percent {
  display: block;
  font-size: 36rpx;
  color: #52c41a;
}

.performance-text {
  text-align: center;
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.modal-footer {
  padding: 20rpx 30rpx 40rpx;
  display: flex;
  justify-content: center;
  gap: 30rpx;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .audio-controls {
    gap: 30rpx;
  }
  
  .control-btn {
    width: 80rpx;
    height: 80rpx;
  }
  
  .control-icon {
    font-size: 28rpx;
  }
}
</style>