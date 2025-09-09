<template>
  <view class="vocabulary-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">单词词汇意思训练</view>
      <view class="nav-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-text">第 {{currentWord + 1}} 词 / 共 {{vocabularyList.length}} 词</text>
        <text class="score-text">得分: {{score}}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: progressWidth}"></view>
      </view>
    </view>

    <!-- 单词展示区域 -->
    <view class="word-section">
      <view class="word-card">
        <view class="word-display">
          <text class="word-english">{{currentWordData.english}}</text>
          <text class="word-phonetic">{{currentWordData.phonetic}}</text>
        </view>
        <view class="word-audio">
          <view class="audio-btn" @click="playWordAudio">
            <text class="audio-icon">{{isPlaying ? '⏸' : '🔊'}}</text>
            <text class="audio-text">发音</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 题目内容 -->
    <view class="question-section">
      <view class="question-text">
        <text class="question-title">请选择该单词的正确中文意思：</text>
      </view>
      
      <!-- 选择题选项 -->
      <view class="options-list">
        <view 
          v-for="(option, index) in currentWordData.options" 
          :key="index"
          class="option-item"
          :class="{
            'selected': selectedAnswer === index,
            'correct': showResult && index === currentWordData.correctAnswer,
            'wrong': showResult && selectedAnswer === index && index !== currentWordData.correctAnswer
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
          class="btn btn-hint" 
          @click="showHint"
          :disabled="hintUsed || showResult"
        >
          {{hintUsed ? '已使用提示' : '使用提示'}}
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
        @click="nextWord"
      >
        {{currentWord < vocabularyList.length - 1 ? '下一词' : '完成训练'}}
      </button>
    </view>

    <!-- 提示信息 -->
    <view v-if="showHintContent" class="hint-section">
      <view class="hint-title">💡 提示</view>
      <view class="hint-content">
        <text class="hint-text">{{currentWordData.hint}}</text>
      </view>
    </view>

    <!-- 答案解析 -->
    <view v-if="showResult" class="explanation-section">
      <view class="explanation-title">词汇解析</view>
      <view class="explanation-content">
        <view class="word-details">
          <text class="correct-meaning">正确答案：{{currentWordData.correctMeaning}}</text>
          <text class="word-usage">用法：{{currentWordData.usage}}</text>
          <text class="example-sentence">例句：{{currentWordData.example}}</text>
        </view>
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
              <text class="stat-label">总词数</text>
              <text class="stat-value">{{vocabularyList.length}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确数</text>
              <text class="stat-value">{{correctCount}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确率</text>
              <text class="stat-value">{{Math.round(correctCount / vocabularyList.length * 100)}}%</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总得分</text>
              <text class="stat-value">{{score}}</text>
            </view>
          </view>
          <view class="performance-level">
            <text class="level-text">{{getPerformanceLevel()}}</text>
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
  name: 'VocabularyMeaning',
  data() {
    return {
      currentWord: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      correctCount: 0,
      isPlaying: false,
      showCompleteModal: false,
      hintUsed: false,
      showHintContent: false,
      vocabularyList: [
        {
          id: 1,
          english: 'altitude',
          phonetic: '/ˈæltɪtuːd/',
          options: [
            '速度',
            '高度',
            '方向',
            '距离'
          ],
          correctAnswer: 1,
          correctMeaning: '高度',
          hint: '这个词与飞机在空中的垂直位置有关',
          usage: '用于描述飞机相对于海平面的垂直高度',
          example: 'The aircraft is maintaining an altitude of 10,000 feet.'
        },
        {
          id: 2,
          english: 'runway',
          phonetic: '/ˈrʌnweɪ/',
          options: [
            '滑行道',
            '跑道',
            '停机坪',
            '航站楼'
          ],
          correctAnswer: 1,
          correctMeaning: '跑道',
          hint: '飞机起飞和降落时使用的长条形区域',
          usage: '机场中供飞机起飞和降落的专用道路',
          example: 'The pilot was cleared to land on runway 27L.'
        },
        {
          id: 3,
          english: 'clearance',
          phonetic: '/ˈklɪərəns/',
          options: [
            '许可',
            '警告',
            '报告',
            '请求'
          ],
          correctAnswer: 0,
          correctMeaning: '许可',
          hint: '管制员给飞行员的官方授权',
          usage: '空中交通管制中的正式授权指令',
          example: 'Request clearance for takeoff on runway 09R.'
        },
        {
          id: 4,
          english: 'approach',
          phonetic: '/əˈproʊtʃ/',
          options: [
            '起飞',
            '进近',
            '滑行',
            '爬升'
          ],
          correctAnswer: 1,
          correctMeaning: '进近',
          hint: '飞机准备降落时的飞行阶段',
          usage: '描述飞机向机场降落的飞行过程',
          example: 'The aircraft is on final approach to runway 18.'
        },
        {
          id: 5,
          english: 'emergency',
          phonetic: '/ɪˈmɜːrdʒənsi/',
          options: [
            '正常',
            '紧急',
            '延误',
            '取消'
          ],
          correctAnswer: 1,
          correctMeaning: '紧急',
          hint: '需要立即处理的危险情况',
          usage: '描述需要紧急处理的航空情况',
          example: 'Mayday, mayday, we have an emergency situation.'
        }
      ]
    }
  },
  computed: {
    currentWordData() {
      return this.vocabularyList[this.currentWord] || {}
    },
    progressWidth() {
      return `${(this.currentWord / this.vocabularyList.length) * 100}%`
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    playWordAudio() {
      this.isPlaying = true
      // 模拟音频播放
      setTimeout(() => {
        this.isPlaying = false
      }, 1500)
      
      uni.showToast({
        title: '播放发音',
        icon: 'none',
        duration: 1500
      })
    },
    selectAnswer(index) {
      if (!this.showResult) {
        this.selectedAnswer = index
      }
    },
    showHint() {
      if (!this.hintUsed && !this.showResult) {
        this.hintUsed = true
        this.showHintContent = true
      }
    },
    submitAnswer() {
      if (this.selectedAnswer === null) return
      
      this.showResult = true
      const isCorrect = this.selectedAnswer === this.currentWordData.correctAnswer
      
      if (isCorrect) {
        this.correctCount++
        let points = 10
        if (this.hintUsed) points = 7 // 使用提示扣分
        this.score += points
        
        uni.showToast({
          title: '回答正确！',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: '回答错误',
          icon: 'error'
        })
      }
    },
    nextWord() {
      if (this.currentWord < this.vocabularyList.length - 1) {
        this.currentWord++
        this.selectedAnswer = null
        this.showResult = false
        this.hintUsed = false
        this.showHintContent = false
      } else {
        this.showCompleteModal = true
      }
    },
    restartTraining() {
      this.currentWord = 0
      this.selectedAnswer = null
      this.showResult = false
      this.score = 0
      this.correctCount = 0
      this.showCompleteModal = false
      this.hintUsed = false
      this.showHintContent = false
    },
    closeModal() {
      this.showCompleteModal = false
    },
    getPerformanceLevel() {
      const accuracy = this.correctCount / this.vocabularyList.length
      if (accuracy >= 0.9) return '优秀！词汇掌握很好！'
      if (accuracy >= 0.8) return '良好！继续加油！'
      if (accuracy >= 0.7) return '及格！需要多加练习'
      return '需要加强词汇学习'
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
.vocabulary-container {
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

/* 单词展示区域 */
.word-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.word-card {
  border: 2rpx solid #4facfe;
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
}

.word-display {
  margin-bottom: 32rpx;
}

.word-english {
  font-size: 64rpx;
  font-weight: 700;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.word-phonetic {
  font-size: 32rpx;
  color: #666666;
  font-style: italic;
  display: block;
}

.word-audio {
  display: flex;
  justify-content: center;
}

.audio-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(79, 172, 254, 0.3);
}

.audio-btn:active {
  transform: scale(0.95);
}

.audio-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.audio-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
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
  text-align: center;
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

.btn-hint {
  background: #f0f0f0;
  color: #666;
}

.btn-hint:not([disabled]):active {
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

/* 提示信息 */
.hint-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.hint-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #faad14;
  margin-bottom: 20rpx;
}

.hint-content {
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 10rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
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

.word-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.correct-meaning {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.word-usage {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.example-sentence {
  font-size: 28rpx;
  color: #4facfe;
  font-style: italic;
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

.performance-level {
  text-align: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 16rpx;
  margin-top: 20rpx;
}

.level-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
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