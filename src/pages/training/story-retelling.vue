<template>
  <view class="story-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">故事复述训练</view>
      <view class="nav-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-text">第 {{currentStory + 1}} 个 / 共 {{stories.length}} 个故事</text>
        <text class="score-text">得分: {{totalScore}}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: progressWidth}"></view>
      </view>
    </view>

    <!-- 训练步骤指示 -->
    <view class="steps-section">
      <view class="step-item" :class="{active: currentStep >= 1, completed: currentStep > 1}">
        <view class="step-number">1</view>
        <text class="step-text">听故事</text>
      </view>
      <view class="step-line" :class="{active: currentStep > 1}"></view>
      <view class="step-item" :class="{active: currentStep >= 2, completed: currentStep > 2}">
        <view class="step-number">2</view>
        <text class="step-text">复述录音</text>
      </view>
      <view class="step-line" :class="{active: currentStep > 2}"></view>
      <view class="step-item" :class="{active: currentStep >= 3}">
        <view class="step-number">3</view>
        <text class="step-text">查看评分</text>
      </view>
    </view>

    <!-- 故事播放区域 -->
    <view v-if="currentStep === 1" class="story-section">
      <view class="story-header">
        <text class="story-title">{{currentStoryData.title}}</text>
        <text class="story-difficulty">难度: {{currentStoryData.difficulty}}</text>
      </view>
      
      <view class="audio-player">
        <view class="audio-controls">
          <view class="play-btn" @click="toggleStoryPlay">
            <text class="play-icon">{{isStoryPlaying ? '⏸' : '▶'}}</text>
          </view>
          <view class="audio-info">
            <text class="audio-duration">{{formatTime(storyCurrentTime)}} / {{formatTime(storyDuration)}}</text>
            <text class="play-count">已播放 {{playCount}} 次</text>
          </view>
        </view>
        <view class="audio-progress">
          <view class="audio-progress-bar">
            <view class="audio-progress-fill" :style="{width: storyProgressWidth}"></view>
          </view>
        </view>
      </view>

      <view class="story-content">
        <view class="story-text">
          <text class="content-text">{{currentStoryData.content}}</text>
        </view>
      </view>

      <view class="story-actions">
        <button class="btn btn-replay" @click="replayStory">重新播放</button>
        <button class="btn btn-next" @click="startRetelling" :disabled="playCount === 0">开始复述</button>
      </view>
    </view>

    <!-- 录音复述区域 -->
    <view v-if="currentStep === 2" class="recording-section">
      <view class="recording-header">
        <text class="recording-title">请复述刚才听到的故事</text>
        <text class="recording-tip">建议录音时长: {{currentStoryData.suggestedDuration}}秒</text>
      </view>

      <view class="recording-controls">
        <view class="record-btn" :class="{recording: isRecording}" @click="toggleRecording">
          <text class="record-icon">{{isRecording ? '⏹' : '🎤'}}</text>
        </view>
        <view class="recording-info">
          <text class="recording-status">{{recordingStatus}}</text>
          <text class="recording-time">{{formatTime(recordingTime)}}</text>
        </view>
      </view>

      <view v-if="hasRecording" class="playback-section">
        <view class="playback-title">录音回放</view>
        <view class="playback-controls">
          <view class="play-btn small" @click="togglePlayback">
            <text class="play-icon">{{isPlayingBack ? '⏸' : '▶'}}</text>
          </view>
          <view class="playback-progress">
            <view class="playback-bar">
              <view class="playback-fill" :style="{width: playbackProgressWidth}"></view>
            </view>
          </view>
          <text class="playback-time">{{formatTime(playbackTime)}} / {{formatTime(recordingDuration)}}</text>
        </view>
      </view>

      <view class="recording-actions">
        <button class="btn btn-secondary" @click="goBackToStory">重新听故事</button>
        <button class="btn btn-record" @click="restartRecording" v-if="hasRecording">重新录音</button>
        <button class="btn btn-submit" @click="submitRecording" :disabled="!hasRecording">提交录音</button>
      </view>
    </view>

    <!-- 评分结果区域 -->
    <view v-if="currentStep === 3" class="result-section">
      <view class="result-header">
        <text class="result-title">复述评分结果</text>
      </view>

      <view class="score-cards">
        <view class="score-card">
          <text class="score-label">流利度</text>
          <view class="score-value">
            <text class="score-number">{{currentResult.fluency}}</text>
            <text class="score-total">/10</text>
          </view>
          <view class="score-bar">
            <view class="score-fill" :style="{width: currentResult.fluency * 10 + '%'}"></view>
          </view>
        </view>
        
        <view class="score-card">
          <text class="score-label">准确性</text>
          <view class="score-value">
            <text class="score-number">{{currentResult.accuracy}}</text>
            <text class="score-total">/10</text>
          </view>
          <view class="score-bar">
            <view class="score-fill" :style="{width: currentResult.accuracy * 10 + '%'}"></view>
          </view>
        </view>
        
        <view class="score-card">
          <text class="score-label">完整性</text>
          <view class="score-value">
            <text class="score-number">{{currentResult.completeness}}</text>
            <text class="score-total">/10</text>
          </view>
          <view class="score-bar">
            <view class="score-fill" :style="{width: currentResult.completeness * 10 + '%'}"></view>
          </view>
        </view>
        
        <view class="score-card total">
          <text class="score-label">总分</text>
          <view class="score-value">
            <text class="score-number">{{currentResult.totalScore}}</text>
            <text class="score-total">/30</text>
          </view>
        </view>
      </view>

      <view class="feedback-section">
        <view class="feedback-title">详细反馈</view>
        <view class="feedback-content">
          <text class="feedback-text">{{currentResult.feedback}}</text>
        </view>
      </view>

      <view class="result-actions">
        <button class="btn btn-retry" @click="retryStory">重新练习</button>
        <button class="btn btn-next" @click="nextStory">
          {{currentStory < stories.length - 1 ? '下一个故事' : '完成训练'}}
        </button>
      </view>
    </view>

    <!-- 完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">训练完成</text>
        </view>
        <view class="modal-body">
          <view class="final-stats">
            <view class="stat-item">
              <text class="stat-label">完成故事数</text>
              <text class="stat-value">{{stories.length}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">平均得分</text>
              <text class="stat-value">{{Math.round(totalScore / stories.length)}}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">总得分</text>
              <text class="stat-value">{{totalScore}}</text>
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
  name: 'StoryRetelling',
  data() {
    return {
      currentStory: 0,
      currentStep: 1, // 1: 听故事, 2: 录音复述, 3: 查看评分
      totalScore: 0,
      
      // 故事播放相关
      isStoryPlaying: false,
      storyCurrentTime: 0,
      storyDuration: 120,
      playCount: 0,
      
      // 录音相关
      isRecording: false,
      hasRecording: false,
      recordingTime: 0,
      recordingDuration: 0,
      recordingStatus: '点击开始录音',
      
      // 回放相关
      isPlayingBack: false,
      playbackTime: 0,
      
      // 评分结果
      currentResult: {},
      showCompleteModal: false,
      
      stories: [
        {
          id: 1,
          title: '紧急迫降程序',
          difficulty: '中级',
          audioUrl: '/static/audio/story1.mp3',
          suggestedDuration: 90,
          content: '昨天下午，一架从北京飞往上海的航班在飞行过程中遇到了紧急情况。飞行员发现左侧发动机出现异常，立即按照标准程序联系了地面管制。管制员迅速为该航班安排了优先降落，并通知了机场的紧急救援队伍。飞行员冷静地执行了单发动机降落程序，最终安全降落在备降机场。所有乘客和机组人员都安然无恙，这次成功的紧急处置体现了飞行员的专业素养和良好的应急反应能力。'
        },
        {
          id: 2,
          title: '恶劣天气飞行',
          difficulty: '高级',
          audioUrl: '/static/audio/story2.mp3',
          suggestedDuration: 100,
          content: '在一个雷雨交加的夜晚，机长李华正驾驶着一架大型客机准备降落。天气雷达显示前方有强对流天气，能见度极低。塔台通知跑道湿滑，侧风达到了临界值。李华凭借丰富的飞行经验，选择了合适的进近方式，调整了飞行速度和高度。在最后的关键时刻，他果断决定复飞，重新规划航线。经过20分钟的等待，天气条件有所改善，飞机最终安全着陆。这次飞行充分展现了飞行员在复杂气象条件下的决策能力和技术水平。'
        },
        {
          id: 3,
          title: '国际航线协调',
          difficulty: '高级',
          audioUrl: '/static/audio/story3.mp3',
          suggestedDuration: 110,
          content: '在执行跨洋国际航线任务时，机组需要与多个国家的管制部门进行协调。飞行员王明在飞越太平洋时，需要按照国际民航组织的标准程序，定时报告位置和高度。由于时差和语言差异，沟通变得更加复杂。在飞行过程中，他们遇到了航路拥堵，需要申请改变飞行高度层。通过与各国管制员的密切配合，飞机顺利通过了各个管制区域。这次飞行不仅考验了机组的专业技能，也体现了国际航空合作的重要性。整个航程历时12小时，最终准时到达目的地。'
        }
      ]
    }
  },
  computed: {
    currentStoryData() {
      return this.stories[this.currentStory] || {}
    },
    progressWidth() {
      return `${(this.currentStory / this.stories.length) * 100}%`
    },
    storyProgressWidth() {
      return `${(this.storyCurrentTime / this.storyDuration) * 100}%`
    },
    playbackProgressWidth() {
      return `${(this.playbackTime / this.recordingDuration) * 100}%`
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    // 故事播放相关方法
    toggleStoryPlay() {
      this.isStoryPlaying = !this.isStoryPlaying
      if (this.isStoryPlaying) {
        this.startStoryTimer()
        if (this.storyCurrentTime === 0) {
          this.playCount++
        }
      } else {
        this.stopStoryTimer()
      }
    },
    
    startStoryTimer() {
      this.storyTimer = setInterval(() => {
        this.storyCurrentTime += 1
        if (this.storyCurrentTime >= this.storyDuration) {
          this.isStoryPlaying = false
          this.storyCurrentTime = 0
          clearInterval(this.storyTimer)
        }
      }, 1000)
    },
    
    stopStoryTimer() {
      if (this.storyTimer) {
        clearInterval(this.storyTimer)
      }
    },
    
    replayStory() {
      this.storyCurrentTime = 0
      this.isStoryPlaying = true
      this.playCount++
      this.startStoryTimer()
    },
    
    startRetelling() {
      this.currentStep = 2
      this.stopStoryTimer()
    },
    
    // 录音相关方法
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },
    
    startRecording() {
      this.isRecording = true
      this.recordingStatus = '正在录音...'
      this.recordingTime = 0
      this.hasRecording = false
      
      this.recordingTimer = setInterval(() => {
        this.recordingTime += 1
      }, 1000)
    },
    
    stopRecording() {
      this.isRecording = false
      this.recordingStatus = '录音完成'
      this.recordingDuration = this.recordingTime
      this.hasRecording = true
      
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
      }
    },
    
    restartRecording() {
      this.recordingTime = 0
      this.recordingDuration = 0
      this.hasRecording = false
      this.recordingStatus = '点击开始录音'
      this.isPlayingBack = false
      this.playbackTime = 0
    },
    
    togglePlayback() {
      this.isPlayingBack = !this.isPlayingBack
      if (this.isPlayingBack) {
        this.startPlaybackTimer()
      } else {
        this.stopPlaybackTimer()
      }
    },
    
    startPlaybackTimer() {
      this.playbackTimer = setInterval(() => {
        this.playbackTime += 1
        if (this.playbackTime >= this.recordingDuration) {
          this.isPlayingBack = false
          this.playbackTime = 0
          clearInterval(this.playbackTimer)
        }
      }, 1000)
    },
    
    stopPlaybackTimer() {
      if (this.playbackTimer) {
        clearInterval(this.playbackTimer)
      }
    },
    
    goBackToStory() {
      this.currentStep = 1
      this.restartRecording()
    },
    
    submitRecording() {
      // 模拟评分过程
      this.currentStep = 3
      this.generateScore()
    },
    
    // 评分相关方法
    generateScore() {
      // 模拟AI评分
      const fluency = Math.floor(Math.random() * 3) + 7 // 7-9分
      const accuracy = Math.floor(Math.random() * 3) + 6 // 6-8分
      const completeness = Math.floor(Math.random() * 3) + 7 // 7-9分
      const totalScore = fluency + accuracy + completeness
      
      this.currentResult = {
        fluency,
        accuracy,
        completeness,
        totalScore,
        feedback: this.generateFeedback(fluency, accuracy, completeness)
      }
      
      this.totalScore += totalScore
    },
    
    generateFeedback(fluency, accuracy, completeness) {
      let feedback = ''
      
      if (fluency >= 8) {
        feedback += '流利度表现优秀，语速适中，停顿自然。'
      } else if (fluency >= 6) {
        feedback += '流利度良好，建议减少不必要的停顿。'
      } else {
        feedback += '流利度需要提高，多练习连贯表达。'
      }
      
      if (accuracy >= 7) {
        feedback += '内容准确性很好，关键信息表达清晰。'
      } else if (accuracy >= 5) {
        feedback += '内容基本准确，注意细节的准确性。'
      } else {
        feedback += '内容准确性有待提高，需要更仔细地听取原文。'
      }
      
      if (completeness >= 8) {
        feedback += '复述完整度很高，涵盖了故事的主要内容。'
      } else if (completeness >= 6) {
        feedback += '复述较为完整，可以补充更多细节。'
      } else {
        feedback += '复述完整度不足，建议重点关注故事结构。'
      }
      
      return feedback
    },
    
    retryStory() {
      this.currentStep = 1
      this.storyCurrentTime = 0
      this.isStoryPlaying = false
      this.playCount = 0
      this.restartRecording()
      this.currentResult = {}
    },
    
    nextStory() {
      if (this.currentStory < this.stories.length - 1) {
        this.currentStory++
        this.currentStep = 1
        this.storyCurrentTime = 0
        this.isStoryPlaying = false
        this.playCount = 0
        this.restartRecording()
        this.currentResult = {}
      } else {
        this.showCompleteModal = true
      }
    },
    
    restartTraining() {
      this.currentStory = 0
      this.currentStep = 1
      this.totalScore = 0
      this.storyCurrentTime = 0
      this.isStoryPlaying = false
      this.playCount = 0
      this.restartRecording()
      this.currentResult = {}
      this.showCompleteModal = false
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
    this.stopStoryTimer()
    if (this.recordingTimer) clearInterval(this.recordingTimer)
    this.stopPlaybackTimer()
  }
}
</script>

<style scoped>
.story-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏样式 */
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

/* 步骤指示器 */
.steps-section {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-number {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.step-item.active .step-number {
  background: #4facfe;
  color: white;
}

.step-item.completed .step-number {
  background: #52c41a;
  color: white;
}

.step-text {
  font-size: 24rpx;
  color: #999;
}

.step-item.active .step-text,
.step-item.completed .step-text {
  color: #333;
}

.step-line {
  flex: 1;
  height: 2rpx;
  background: #f0f0f0;
  margin: 0 20rpx;
}

.step-line.active {
  background: #4facfe;
}

/* 故事播放区域 */
.story-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.story-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.story-difficulty {
  font-size: 24rpx;
  color: #4facfe;
  background: #f0f9ff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.audio-player {
  border: 2rpx solid #4facfe;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
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

.play-btn.small {
  width: 60rpx;
  height: 60rpx;
}

.play-icon {
  color: white;
  font-size: 32rpx;
}

.audio-info {
  flex: 1;
}

.audio-duration {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.play-count {
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

.story-content {
  margin-bottom: 30rpx;
}

.story-text {
  padding: 30rpx;
  background: #f9f9f9;
  border-radius: 15rpx;
  border-left: 6rpx solid #4facfe;
}

.content-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.story-actions {
  display: flex;
  gap: 20rpx;
}

/* 录音区域 */
.recording-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.recording-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.recording-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.recording-tip {
  font-size: 24rpx;
  color: #999;
}

.recording-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.record-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  transition: all 0.3s ease;
}

.record-btn.recording {
  background: #ff3742;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.record-icon {
  color: white;
  font-size: 40rpx;
}

.recording-info {
  text-align: center;
}

.recording-status {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.recording-time {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4757;
}

.playback-section {
  margin-bottom: 30rpx;
}

.playback-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.playback-controls {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 15rpx;
}

.playback-progress {
  flex: 1;
  margin: 0 20rpx;
}

.playback-bar {
  height: 6rpx;
  background: #e0e0e0;
  border-radius: 3rpx;
  overflow: hidden;
}

.playback-fill {
  height: 100%;
  background: #4facfe;
  transition: width 0.1s ease;
}

.playback-time {
  font-size: 24rpx;
  color: #666;
}

.recording-actions {
  display: flex;
  gap: 15rpx;
}

/* 评分结果区域 */
.result-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 20rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.score-cards {
  margin-bottom: 40rpx;
}

.score-card {
  display: flex;
  align-items: center;
  padding: 25rpx;
  margin-bottom: 20rpx;
  background: #f9f9f9;
  border-radius: 15rpx;
}

.score-card.total {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.score-label {
  font-size: 28rpx;
  flex: 1;
}

.score-value {
  display: flex;
  align-items: baseline;
  margin-right: 20rpx;
}

.score-number {
  font-size: 36rpx;
  font-weight: bold;
}

.score-total {
  font-size: 24rpx;
  opacity: 0.7;
}

.score-bar {
  width: 120rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
}

.score-card:not(.total) .score-bar {
  background: #e0e0e0;
}

.score-fill {
  height: 100%;
  background: #4facfe;
  transition: width 0.5s ease;
}

.score-card.total .score-fill {
  background: rgba(255, 255, 255, 0.8);
}

.feedback-section {
  margin-bottom: 30rpx;
}

.feedback-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.feedback-content {
  padding: 25rpx;
  background: #f9f9f9;
  border-radius: 15rpx;
  border-left: 6rpx solid #4facfe;
}

.feedback-text {
  font-size: 26rpx;
  line-height: 1.5;
  color: #666;
}

.result-actions {
  display: flex;
  gap: 20rpx;
}

/* 按钮样式 */
.btn {
  flex: 1;
  height: 80rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
}

.btn-replay, .btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-next, .btn-submit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-record {
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  color: white;
}

.btn-retry {
  background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  color: white;
}

.btn[disabled] {
  opacity: 0.5;
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

.final-stats {
  
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