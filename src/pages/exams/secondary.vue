<template>
  <cus-navbar title="复试英语考试">
  </cus-navbar>
  <view class="exam-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-text">正在加载考试数据...</view>
    </view>
    
    <!-- 考试内容 -->
     <view v-if="!loading" class="exam-content">
       <!-- 顶部标题栏 -->
       <view class="header">
      <view class="exam-info">
        <text class="time">剩余时间: {{ formatTime(remainingTime) }}</text>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <view class="progress-text">{{ currentStep }}/{{ totalSteps }} - {{ currentStepName }}</view>
    </view>

    <!-- 考试内容区域 -->
    <view class="exam-content">
      <!-- 模拟通话 -->
      <view v-if="currentStep === 1" class="exam-module">
        <view class="module-header">
          <view class="module-title">模拟通话</view>
          <view class="module-desc">模拟管制情景中的陆空通话</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>在模拟的管制情景中，作为空管员与"飞行员"进行陆空通话。务必在听到"滴"声后再开始发言。非常规陆空通话（特情）是考察重点。</text>
          </view>
          <view class="communication-area">
            <view class="round-counter">
              <text>通话回合: {{ currentRound }}/{{ totalRounds }}</text>
            </view>
            <view class="scenario-info">
              <view class="scenario-title">当前场景</view>
              <view class="scenario-desc">{{ currentScenario.description }}</view>
              <view class="scenario-details">
                <view class="detail-item" v-for="(detail, index) in currentScenario.details" :key="index">
                  <text>• {{ detail }}</text>
                </view>
              </view>
            </view>
            <view class="communication-log">
              <view 
                v-for="(log, index) in communicationLogs" 
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <text class="speaker">{{ log.speaker }}:</text>
                <text class="content">{{ log.content }}</text>
                <text class="timestamp">{{ log.time }}</text>
              </view>
            </view>
            <view class="communication-controls">
              <button 
                class="listen-btn"
                @click="playInstruction"
                :disabled="waitingForBeep"
              >
                {{ waitingForBeep ? '等待提示音' : '听取指令' }}
              </button>
              <button 
                class="respond-btn"
                :class="{ recording: isRecording.communication }"
                @click="toggleRecording('communication')"
                :disabled="!canRespond"
              >
                {{ isRecording.communication ? '结束通话' : '开始通话' }}
              </button>
              <button 
                class="emergency-btn"
                @click="handleEmergency"
                :disabled="!emergencyAvailable"
              >
                紧急情况处理
              </button>
            </view>
            <view class="communication-status">
              <view class="status-item">
                <text class="status-label">通话质量:</text>
                <text class="status-value" :class="communicationQuality.toLowerCase()">{{ communicationQuality }}</text>
              </view>
              <view class="status-item">
                <text class="status-label">响应时间:</text>
                <text class="status-value">{{ responseTime }}s</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 口语面试 -->
      <view v-if="currentStep === 2" class="exam-module">
        <view class="module-header">
          <view class="module-title">口语能力面试 (OPI)</view>
          <view class="module-desc">航空专业相关的深度英语交谈</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>与考官进行航空专业相关的深度英语交谈，重点考察语言组织能力、专业知识表达和应变能力。请保持自然流畅的对话。</text>
          </view>
          <view class="interview-area">
            <view class="interview-progress">
              <text>面试进度: {{ currentQuestion + 1 }}/{{ interviewQuestions.length }}</text>
            </view>
            
            <!-- 当前问题 -->
            <view class="current-question">
              <view class="question-header">
                <text class="question-number">问题 {{ currentQuestion + 1 }}</text>
                <text class="question-category">{{ currentQuestionData.category }}</text>
              </view>
              <view class="question-content">
                <text class="question-text">{{ currentQuestionData.text }}</text>
              </view>
              <view v-if="currentQuestionData.hints" class="question-hints">
                <text class="hints-title">提示要点:</text>
                <view class="hints-list">
                  <text v-for="(hint, index) in currentQuestionData.hints" :key="index" class="hint-item">
                    • {{ hint }}
                  </text>
                </view>
              </view>
            </view>
            
            <!-- 录音控制 -->
            <view class="recording-controls">
              <button 
                class="record-btn"
                :class="{ recording: isRecording[`interview${currentQuestion}`] }"
                @click="toggleRecording(`interview${currentQuestion}`)"
              >
                {{ isRecording[`interview${currentQuestion}`] ? '停止回答' : '开始回答' }}
              </button>
              <view v-if="recordingTime[`interview${currentQuestion}`] > 0" class="recording-info">
                <text class="recording-time">回答时长: {{ formatTime(recordingTime[`interview${currentQuestion}`]) }}</text>
                <view class="recording-quality">
                  <text class="quality-label">语音质量:</text>
                  <view class="quality-bars">
                    <view 
                      v-for="n in 5" 
                      :key="n"
                      class="quality-bar"
                      :class="{ active: n <= voiceQuality }"
                    ></view>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 问题导航 -->
            <view class="question-navigation">
              <button 
                class="nav-btn prev"
                @click="previousQuestion"
                :disabled="currentQuestion === 0"
              >
                上一题
              </button>
              <view class="question-indicators">
                <view 
                  v-for="(question, index) in interviewQuestions" 
                  :key="index"
                  class="indicator"
                  :class="{ 
                    current: index === currentQuestion,
                    completed: recordingTime[`interview${index}`] > 0
                  }"
                  @click="goToQuestion(index)"
                >
                  {{ index + 1 }}
                </view>
              </view>
              <button 
                class="nav-btn next"
                @click="nextQuestion"
                :disabled="currentQuestion === interviewQuestions.length - 1"
              >
                下一题
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer">
      <button 
        class="prev-btn"
        @click="previousStep"
        :disabled="currentStep === 1"
      >
        上一步
      </button>
      <button 
        class="next-btn"
        @click="nextStep"
        :disabled="!canProceed"
      >
        {{ currentStep === totalSteps ? '提交考试' : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script>
import CusNavbar from "../../components/cus-navbar.vue";
import { examsApi } from '@/api/index.js'

export default {
  components: {CusNavbar},
  data() {
    return {
      currentStep: 1,
      totalSteps: 2,
      remainingTime: 3600, // 60分钟
      timer: null,
      examData: {},
      loading: false,
      
      // 录音状态
      isRecording: {},
      recordingTime: {},
      voiceQuality: 4,
      
      // 模拟通话
      currentRound: 1,
      totalRounds: 25,
      waitingForBeep: false,
      canRespond: false,
      emergencyAvailable: false,
      communicationQuality: '良好',
      responseTime: 0,
      
      currentScenario: {},
      scenarios: [],
      
      communicationLogs: [],
      
      // 口语面试
      currentQuestion: 0,
      interviewQuestions: [],
      
      // 错误处理
      loadError: false
    }
  },
  
  computed: {
    progressPercent() {
      return (this.currentStep / this.totalSteps) * 100
    },
    
    currentStepName() {
      const stepNames = ['模拟通话', '口语面试']
      return stepNames[this.currentStep - 1]
    },
    
    currentQuestionData() {
      return this.interviewQuestions[this.currentQuestion] || {}
    },
    
    canProceed() {
      switch(this.currentStep) {
        case 1:
          return this.currentRound >= this.totalRounds
        case 2:
          return this.checkInterviewCompletion()
        default:
          return false
      }
    }
  },
  
  mounted() {
    this.loadExamData()
    this.startTimer()
    this.initializeEmergencyScenario()
  },
  
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    async loadExamData() {
      try {
        this.loading = true
        this.loadError = false
        const response = await examsApi.getSecondaryExamData()
        if (response.code === 200) {
          this.examData = response.data.examData || response.data
          const data = this.examData
          
          // 模拟通话数据
          if (data.simulatedCall) {
            this.scenarios = data.simulatedCall.scenarios || []
            this.currentScenario = this.scenarios[0] || {}
            this.totalRounds = data.simulatedCall.totalRounds || 25
            this.communicationLogs = data.simulatedCall.initialLogs || [{
              speaker: '系统',
              content: '复试模拟通话即将开始，请准备...',
              type: 'system'
            }]
          }
          
          // 口语面试数据
          if (data.oralInterview) {
            this.interviewQuestions = data.oralInterview.questions || []
          }
        } else {
          throw new Error(response.message || '获取考试数据失败')
        }
      } catch (error) {
        console.error('加载考试数据失败:', error)
        this.loadError = true
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'error'
        })
        // 设置默认数据以防止页面崩溃
        this.setDefaultExamData()
      } finally {
        this.loading = false
      }
    },
    
    setDefaultExamData() {
      this.scenarios = [{
        title: '默认通话场景',
        description: '场景描述',
        details: ['场景详情']
      }]
      this.currentScenario = this.scenarios[0]
      this.interviewQuestions = [{
        text: '请介绍一下您的航空专业背景',
        category: '专业背景',
        hints: ['教育经历', '工作经验', '专业技能']
      }]
      this.communicationLogs = [{
        speaker: '系统',
        content: '复试模拟通话即将开始，请准备...',
        type: 'system'
      }]
      this.totalRounds = 25
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
        } else {
          this.submitExam()
        }
      }, 1000)
    },
    
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    initializeEmergencyScenario() {
      // 初始化紧急情况场景
      setTimeout(() => {
        this.emergencyAvailable = true
      }, 5000)
    },
    
    playInstruction() {
      this.waitingForBeep = true
      this.responseTime = 0
      
      // 模拟播放指令
      setTimeout(() => {
        this.waitingForBeep = false
        this.canRespond = true
        // 开始计时响应时间
        const startTime = Date.now()
        const timer = setInterval(() => {
          if (!this.canRespond) {
            clearInterval(timer)
            this.responseTime = Math.round((Date.now() - startTime) / 1000)
          }
        }, 100)
      }, 3000)
    },
    
    toggleRecording(key) {
      if (this.isRecording[key]) {
        this.isRecording[key] = false
        this.canRespond = false
        
        // 添加通话记录
        if (key === 'communication') {
          this.addCommunicationLog()
          this.currentRound++
          this.updateCommunicationQuality()
        }
      } else {
        this.isRecording[key] = true
        this.recordingTime[key] = 0
        this.startRecordingTimer(key)
      }
    },
    
    startRecordingTimer(key) {
      const timer = setInterval(() => {
        if (this.isRecording[key]) {
          this.recordingTime[key]++
          // 模拟语音质量检测
          if (key.includes('interview')) {
            this.updateVoiceQuality()
          }
        } else {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    addCommunicationLog() {
      const responses = [
        'CCA1234, Beijing Control, Mayday received, turn left heading 090, descend and maintain FL200, vectors for ILS approach runway 36L.',
        'CCA1234, contact Beijing Tower 118.1, emergency services are standing by.',
        'CCA1234, you are cleared for emergency landing runway 36L, wind 360 degrees 8 knots.'
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      const currentTime = this.formatTime(3600 - this.remainingTime)
      
      this.communicationLogs.push({
        speaker: 'Controller',
        content: randomResponse,
        type: 'controller',
        time: currentTime
      })
    },
    
    updateCommunicationQuality() {
      const qualities = ['优秀', '良好', '一般']
      const weights = [0.4, 0.5, 0.1] // 根据响应时间和准确性调整
      
      if (this.responseTime <= 3) {
        this.communicationQuality = '优秀'
      } else if (this.responseTime <= 6) {
        this.communicationQuality = '良好'
      } else {
        this.communicationQuality = '一般'
      }
    },
    
    updateVoiceQuality() {
      // 模拟语音质量检测
      this.voiceQuality = Math.min(5, Math.max(1, this.voiceQuality + (Math.random() - 0.5)))
    },
    
    handleEmergency() {
      // 处理紧急情况
      uni.showModal({
        title: '紧急情况',
        content: '请立即处理紧急情况，优先保障飞行安全',
        success: (res) => {
          if (res.confirm) {
            this.emergencyAvailable = false
            // 触发紧急处理流程
          }
        }
      })
    },
    
    previousQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--
      }
    },
    
    nextQuestion() {
      if (this.currentQuestion < this.interviewQuestions.length - 1) {
        this.currentQuestion++
      }
    },
    
    goToQuestion(index) {
      this.currentQuestion = index
    },
    
    checkInterviewCompletion() {
      // 检查所有面试问题是否都有回答
      for (let i = 0; i < this.interviewQuestions.length; i++) {
        const key = `interview${i}`
        if (!this.recordingTime[key] || this.recordingTime[key] < 30) {
          return false
        }
      }
      return true
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++
      } else {
        this.submitExam()
      }
    },
    
    submitExam() {
      uni.showModal({
        title: '提交考试',
        content: '确定要提交中级复试吗？',
        success: (res) => {
          if (res.confirm) {
            // 跳转到结果页面
            uni.navigateTo({
              url: '/pages/exams/result?level=secondary'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.exam-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20rpx;
}

.header {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e9ecef;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #495057;
  text-align: center;
  margin-bottom: 20rpx;
}

.exam-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time {
  color: #dc3545;
  font-size: 28rpx;
  font-weight: bold;
}

.progress-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e9ecef;
}

.progress-bar {
  height: 12rpx;
  background: #e9ecef;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  background: #6c757d;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: #6c757d;
  font-size: 28rpx;
}

.exam-content {
  margin-bottom: 120rpx;
}

.exam-module {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e9ecef;
}

.module-header {
  margin-bottom: 30rpx;
  text-align: center;
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #495057;
  margin-bottom: 10rpx;
}

.module-desc {
  color: #6c757d;
  font-size: 26rpx;
}

.instruction {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 30rpx;
  border-left: 6rpx solid #6c757d;
}

.instruction text {
  color: #495057;
  font-size: 26rpx;
  line-height: 1.6;
}

.communication-area {
  margin-top: 30rpx;
}

.round-counter {
  text-align: center;
  margin-bottom: 20rpx;
}

.round-counter text {
  color: #6c757d;
  font-size: 28rpx;
  font-weight: bold;
}

.scenario-info {
  background: #fff3cd;
  border: 2rpx solid #ffeaa7;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.scenario-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #856404;
  margin-bottom: 10rpx;
}

.scenario-desc {
  font-size: 26rpx;
  color: #856404;
  margin-bottom: 15rpx;
}

.scenario-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-item text {
  font-size: 24rpx;
  color: #6c757d;
}

.communication-log {
  background: #495057;
  border-radius: 15rpx;
  padding: 20rpx;
  height: 300rpx;
  overflow-y: auto;
  margin-bottom: 20rpx;
}

.log-item {
  margin-bottom: 15rpx;
  padding: 10rpx;
  border-radius: 8rpx;
  position: relative;
}

.log-item.system {
  background: #6c757d;
}

.log-item.pilot {
  background: #dc3545;
}

.log-item.controller {
  background: #0d6efd;
}

.speaker {
  color: #f8f9fa;
  font-weight: bold;
  font-size: 24rpx;
}

.content {
  color: white;
  font-size: 26rpx;
  margin-left: 10rpx;
  line-height: 1.4;
}

.timestamp {
  position: absolute;
  top: 5rpx;
  right: 10rpx;
  color: #adb5bd;
  font-size: 20rpx;
}

.communication-controls {
  display: flex;
  gap: 15rpx;
  justify-content: center;
  margin-bottom: 20rpx;
}

.listen-btn {
  background: #fd7e14;
  color: white;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx 25rpx;
  font-size: 24rpx;
}

.respond-btn {
  background: #198754;
  color: white;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx 25rpx;
  font-size: 24rpx;
}

.respond-btn.recording {
  background: #dc3545;
  animation: pulse 1s infinite;
}

.emergency-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx 25rpx;
  font-size: 24rpx;
}

.emergency-btn:disabled {
  background: #adb5bd;
}

.communication-status {
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  border-radius: 10rpx;
  padding: 15rpx;
}

.status-item {
  text-align: center;
}

.status-label {
  font-size: 22rpx;
  color: #6c757d;
  display: block;
  margin-bottom: 5rpx;
}

.status-value {
  font-size: 24rpx;
  font-weight: bold;
}

.status-value.优秀 {
  color: #198754;
}

.status-value.良好 {
  color: #fd7e14;
}

.status-value.一般 {
  color: #dc3545;
}

.interview-area {
  margin-top: 30rpx;
}

.interview-progress {
  text-align: center;
  margin-bottom: 20rpx;
}

.interview-progress text {
  color: #6c757d;
  font-size: 28rpx;
  font-weight: bold;
}

.current-question {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 30rpx;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.question-number {
  font-size: 28rpx;
  font-weight: bold;
  color: #495057;
}

.question-category {
  background: #6c757d;
  color: white;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
}

.question-content {
  margin-bottom: 20rpx;
}

.question-text {
  color: #495057;
  font-size: 28rpx;
  line-height: 1.6;
}

.question-hints {
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
  border: 1rpx solid #e9ecef;
}

.hints-title {
  color: #6c757d;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.hints-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hint-item {
  color: #6c757d;
  font-size: 24rpx;
}

.question-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 15rpx;
  padding: 20rpx;
}

.nav-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.nav-btn:disabled {
  background: #adb5bd;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  flex-direction: column;
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin-top: 20px;
}
</style>