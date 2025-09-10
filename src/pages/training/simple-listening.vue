<template>
  <view class="listening-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">听力简答</view>
      <view class="nav-right"></view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-text">对话 {{currentDialogue + 1}}/2 - 问题 {{currentQuestion + 1}}/3</view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: ((currentDialogue * 3 + currentQuestion + 1) / 6 * 100) + '%'}"></view>
      </view>
      <view class="time-info">
        <text class="total-time">总时间: {{formatTime(totalTime)}}</text>
        <text class="answer-time" v-if="isAnswering">答题时间: {{answerTimeLeft}}秒</text>
      </view>
    </view>

    <!-- 对话播放区域 -->
    <view class="dialogue-section" v-if="!isAnswering">
      <view class="dialogue-title">对话 {{currentDialogue + 1}}</view>
      <view class="dialogue-content">{{dialogues[currentDialogue].content}}</view>
      <view class="audio-controls">
        <button class="control-btn" @click="playDialogue" :disabled="dialoguePlayed">
          <text class="control-icon">{{isPlaying ? '⏸' : '▶'}}</text>
        </button>
      </view>
      <view class="audio-progress" v-if="isPlaying">
        <view class="progress-time">{{formatTime(currentTime)}} / {{formatTime(dialogueDuration)}}</view>
        <view class="progress-slider">
          <view class="slider-track">
            <view class="slider-fill" :style="{width: (currentTime / dialogueDuration * 100) + '%'}"></view>
          </view>
        </view>
      </view>
      <view class="dialogue-status" v-if="dialoguePlayed">
        <text class="status-text">对话播放完毕，请开始回答问题</text>
      </view>
    </view>

    <!-- 答题区域 -->
    <view class="answer-section" v-if="isAnswering">
      <view class="question-info">
        <view class="question-title">问题 {{currentQuestion + 1}}</view>
        <view class="question-text">{{dialogues[currentDialogue].questions[currentQuestion]}}</view>
      </view>
      
      <view class="recording-area">
        <view class="recording-status">
          <text class="status-text" v-if="!isRecording && !recordingCompleted">请开始录音回答问题</text>
          <text class="status-text recording" v-if="isRecording">正在录音中...</text>
          <text class="status-text completed" v-if="recordingCompleted">录音完成</text>
        </view>
        
        <view class="recording-controls">
          <button class="record-btn" @click="toggleRecording" :disabled="answerTimeLeft <= 0">
            <text class="record-icon">{{isRecording ? '⏹' : '🎤'}}</text>
          </button>
        </view>
        
        <view class="recording-timer">
          <text class="timer-text">剩余时间: {{answerTimeLeft}}秒</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button class="btn btn-primary" @click="startAnswering" v-if="!isAnswering && dialoguePlayed">
        开始答题
      </button>
      <button class="btn btn-primary" @click="nextQuestion" v-if="isAnswering && recordingCompleted">
        {{getNextButtonText()}}
      </button>
    </view>



    <!-- 训练完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">训练完成</text>
        </view>
        <view class="modal-body">
          <view class="result-display">
            <text class="result-text">训练统计</text>
            <view class="result-item">
              <text class="result-label">完成对话：</text>
              <text class="result-value">{{dialogues.length}}段</text>
            </view>
            <view class="result-item">
              <text class="result-label">回答问题：</text>
              <text class="result-value">{{recordings.length}}题</text>
            </view>
            <view class="result-item">
              <text class="result-label">总用时：</text>
              <text class="result-value">{{formatTime(totalTime)}}</text>
            </view>
          </view>
          <view class="performance-text">
            恭喜完成听力简答训练！
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
  name: 'SimpleListening',
  data() {
    return {
      currentDialogue: 0,
      currentQuestion: 0,
      isPlaying: false,
      currentTime: 0,
      dialogueDuration: 60, // 对话时长约1分钟
      dialoguePlayed: false,
      isAnswering: false,
      isRecording: false,
      recordingCompleted: false,
      answerTimeLeft: 20, // 20秒答题时间
      totalTime: 0, // 总用时
      showCompleteModal: false,
      loading: true,
      dialogues: [],
      recordings: [], // 存储录音数据
      timer: null,
      answerTimer: null,
      totalTimer: null
    }
  },
  onLoad() {
    this.loadDialogues()
    this.startTotalTimer()
  },
  methods: {
    async loadDialogues() {
      try {
        this.loading = true
        // 模拟加载对话数据
        this.dialogues = [
          {
            id: 1,
            content: "Pilot: Tower, this is Flight 123 requesting permission to land. We have a fuel emergency and need immediate clearance. Tower: Flight 123, you are cleared for immediate landing on runway 27. Emergency vehicles are standing by. Pilot: Thank you, tower. We are on final approach now. Our fuel gauge shows critical levels. Tower: Roger, Flight 123. Wind is calm, visibility is good. You are cleared to land. Emergency crews are in position. Pilot: Understood. We should be able to make it safely. Thank you for your assistance.",
            questions: [
              "What type of emergency is Flight 123 experiencing?",
              "Which runway has the tower cleared for landing?",
              "What emergency preparations has the tower made?"
            ]
          },
          {
            id: 2,
            content: "Controller: Good morning, Flight 456. Please report your current altitude and heading. Pilot: Good morning, control. We are currently at 35,000 feet, heading 270 degrees west. Controller: Flight 456, due to weather conditions ahead, please descend to 25,000 feet and turn to heading 290 degrees. Pilot: Descending to 25,000 feet and turning to 290 degrees, Flight 456. Controller: Thank you. Please maintain that altitude and heading until further notice. We will update you on weather conditions shortly. Pilot: Will maintain 25,000 feet and heading 290. Standing by for weather update.",
            questions: [
              "What was Flight 456's initial altitude?",
              "What new heading did the controller assign?",
              "Why did the controller request the altitude change?"
            ]
          }
        ]
        this.initializeDialogue()
      } catch (error) {
        console.error('获取对话数据失败:', error)
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    initializeDialogue() {
      this.dialoguePlayed = false
      this.isAnswering = false
      this.isRecording = false
      this.recordingCompleted = false
      this.currentQuestion = 0
      this.answerTimeLeft = 20
      this.currentTime = 0
    },
    
    playDialogue() {
      if (this.dialoguePlayed) return
      
      this.isPlaying = true
      this.currentTime = 0
      this.startDialogueTimer()
    },
    
    startDialogueTimer() {
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        if (this.currentTime < this.dialogueDuration) {
          this.currentTime++
        } else {
          this.isPlaying = false
          this.dialoguePlayed = true
          clearInterval(this.timer)
        }
      }, 1000)
    },
    
    startTotalTimer() {
      this.totalTimer = setInterval(() => {
        this.totalTime++
      }, 1000)
    },
    
    startAnswerTimer() {
      if (this.answerTimer) clearInterval(this.answerTimer)
      this.answerTimeLeft = 20
      this.answerTimer = setInterval(() => {
        if (this.answerTimeLeft > 0) {
          this.answerTimeLeft--
        } else {
          this.timeUp()
        }
      }, 1000)
    },
    
    stopAnswerTimer() {
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
    },
    
    timeUp() {
      if (this.isRecording) {
        this.stopRecording()
      }
      this.stopAnswerTimer()
      this.recordingCompleted = true
      
      uni.showToast({
        title: '答题时间结束',
        icon: 'none'
      })
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    startAnswering() {
      this.isAnswering = true
      this.startAnswerTimer()
    },
    
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },
    
    startRecording() {
      if (this.answerTimeLeft <= 0) return
      
      this.isRecording = true
      // 这里应该调用实际的录音API
      console.log('开始录音')
      
      uni.showToast({
        title: '开始录音',
        icon: 'none'
      })
    },
    
    stopRecording() {
      this.isRecording = false
      this.recordingCompleted = true
      
      // 这里应该停止录音并保存录音数据
      const recordingData = {
        dialogueId: this.dialogues[this.currentDialogue].id,
        questionIndex: this.currentQuestion,
        question: this.dialogues[this.currentDialogue].questions[this.currentQuestion],
        recordingTime: 20 - this.answerTimeLeft,
        timestamp: new Date().toISOString()
      }
      
      this.recordings.push(recordingData)
      console.log('录音完成', recordingData)
      
      uni.showToast({
        title: '录音完成',
        icon: 'success'
      })
    },
    
    getNextButtonText() {
      if (this.currentQuestion < 2) {
        return '下一问题'
      } else if (this.currentDialogue < 1) {
        return '下一对话'
      } else {
        return '完成训练'
      }
    },
    
    nextQuestion() {
      this.stopAnswerTimer()
      
      if (this.currentQuestion < 2) {
        // 下一个问题
        this.currentQuestion++
        this.isAnswering = true
        this.isRecording = false
        this.recordingCompleted = false
        this.startAnswerTimer()
      } else if (this.currentDialogue < 1) {
        // 下一个对话
        this.currentDialogue++
        this.initializeDialogue()
      } else {
        // 完成训练
        this.completeTraining()
      }
    },
    
    async completeTraining() {
      await this.submitTrainingResult()
      this.showCompleteModal = true
      
      if (this.totalTimer) {
        clearInterval(this.totalTimer)
      }
    },
    async submitTrainingResult() {
      try {
        await trainingApi.submitSimpleListeningResult({
          dialogues: this.dialogues.length,
          totalQuestions: 6,
          recordings: this.recordings,
          totalTime: this.totalTime,
          completedAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('提交训练结果失败:', error)
      }
    },
    
    restartTraining() {
      this.currentDialogue = 0
      this.currentQuestion = 0
      this.totalTime = 0
      this.recordings = []
      this.showCompleteModal = false
      this.initializeDialogue()
      this.startTotalTimer()
    },
    
    goBack() {
      uni.navigateBack()
    }
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.answerTimer) {
      clearInterval(this.answerTimer)
    }
    if (this.totalTimer) {
      clearInterval(this.totalTimer)
    }
  }
}
</script>

<style scoped>
.listening-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.3s ease;
}

.dialogue-section {
  background: white;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.answer-section {
  background: white;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.dialogue-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}

.dialogue-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #4facfe;
}

.dialogue-status {
  text-align: center;
  margin-top: 20rpx;
}

.status-text {
  font-size: 28rpx;
  color: #52c41a;
  font-weight: 500;
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

.question-info {
  margin-bottom: 30rpx;
}

.question-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
  text-align: center;
}

.question-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  padding: 20rpx;
  background: #f0f8ff;
  border-radius: 12rpx;
  border-left: 4rpx solid #4facfe;
}

.recording-area {
  text-align: center;
}

.recording-status {
  margin-bottom: 30rpx;
}

.recording-status .status-text {
  font-size: 28rpx;
  color: #666;
}

.recording-status .status-text.recording {
  color: #ff4d4f;
  animation: pulse 1.5s infinite;
}

.recording-status .status-text.completed {
  color: #52c41a;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.recording-controls {
  margin-bottom: 30rpx;
}

.record-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
  transition: all 0.3s ease;
}

.record-btn:disabled {
  background: #d9d9d9;
  box-shadow: none;
}

.record-icon {
  font-size: 40rpx;
  color: white;
}

.recording-timer {
  margin-top: 20rpx;
}

.timer-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.time-info {
  display: flex;
  justify-content: space-between;
  margin-top: 15rpx;
  font-size: 24rpx;
  color: #666;
}

.total-time {
  color: #4facfe;
}

.answer-time {
  color: #ff4d4f;
  font-weight: 600;
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
  border-bottom: 1rpx solid #eee;
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

.result-display {
  text-align: center;
  margin-bottom: 30rpx;
}

.result-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 30rpx;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-size: 28rpx;
  color: #666;
}

.result-value {
  font-size: 28rpx;
  color: #4facfe;
  font-weight: 600;
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