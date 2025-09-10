<template>
  <view class="simulation-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-title">模拟通话训练</view>
      <view class="nav-right"></view>
    </view>

    <!-- 考试说明 -->
    <view v-if="!trainingStarted" class="exam-intro">
      <view class="section-title">模拟通话考试</view>
      <view class="exam-info">
        <view class="info-card">
          <view class="info-title">考试场景</view>
          <view class="info-content">武汉天河机场虚拟场景</view>
        </view>
        <view class="info-card">
          <view class="info-title">对话回合</view>
          <view class="info-content">30个回合</view>
        </view>
        <view class="info-card">
          <view class="info-title">考试时间</view>
          <view class="info-content">约20分钟</view>
        </view>
        <view class="info-card">
          <view class="info-title">答题时限</view>
          <view class="info-content">每题17秒</view>
        </view>
      </view>
      <view class="role-explanation">
        <view class="role-title">角色说明</view>
        <view class="role-item">
          <view class="role-name">飞行员</view>
          <view class="role-desc">预先录制的语音</view>
        </view>
        <view class="role-item">
          <view class="role-name">第三者（提示者）</view>
          <view class="role-desc">预录的提示语</view>
        </view>
        <view class="role-item">
          <view class="role-name">管制员（你）</view>
          <view class="role-desc">实时语音作答</view>
        </view>
      </view>
      <view class="start-section">
        <button class="btn btn-primary" @click="startTraining">
          开始考试
        </button>
      </view>
    </view>

    <!-- 考试界面 -->
    <view v-else class="exam-interface">
      <!-- 考试状态栏 -->
      <view class="exam-status">
        <view class="status-left">
          <view class="round-info">回合: {{currentRound}}/30</view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{width: (currentRound / 30 * 100) + '%'}"></view>
          </view>
        </view>
        <view class="status-right">
          <view class="total-time" :class="{warning: totalTimeLeft <= 300}">剩余时间: {{formatTimeLeft(totalTimeLeft)}}</view>
          <view class="answer-timer" :class="{warning: answerTimeLeft <= 5}">
            答题时间: {{answerTimeLeft}}s
          </view>
        </view>
      </view>

      <!-- 雷达屏幕区域 -->
      <view class="radar-section">
        <view class="radar-title">武汉天河机场 - 雷达屏幕</view>
        <view class="radar-screen">
          <view class="radar-center"></view>
          <view class="radar-rings">
            <view class="radar-ring" v-for="i in 4" :key="i"></view>
          </view>
          <view class="radar-sweep" :style="{transform: 'rotate(' + radarAngle + 'deg)'}"></view>
          <view class="aircraft-blips">
            <view 
              v-for="(aircraft, index) in aircraftList" 
              :key="index"
              class="aircraft-blip"
              :class="{active: aircraft.callsign === currentAircraft.callsign}"
              :style="{left: aircraft.x + '%', top: aircraft.y + '%'}"
            >
              <view class="blip-dot"></view>
              <view class="blip-label">{{aircraft.callsign}}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 情景信息 -->
      <view class="scenario-info">
        <view class="info-panel">
          <view class="panel-title">当前情况</view>
          <view class="scenario-details">
            <view class="detail-item">
              <text class="detail-label">航班号:</text>
              <text class="detail-value">{{currentAircraft.callsign}}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">机型:</text>
              <text class="detail-value">{{currentAircraft.aircraftType}}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">高度:</text>
              <text class="detail-value">{{currentAircraft.altitude}}ft</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">航向:</text>
              <text class="detail-value">{{currentAircraft.heading}}°</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">速度:</text>
              <text class="detail-value">{{currentAircraft.speed}}kts</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 通话记录 -->
      <view class="communication-log">
        <view class="log-title">通话记录</view>
        <view class="log-content">
          <view 
            v-for="(message, index) in communicationHistory" 
            :key="index"
            class="comm-message"
            :class="message.role"
          >
            <view class="message-header">
              <view class="speaker-role">{{message.speakerName}}</view>
              <view class="message-time">{{message.timestamp}}</view>
              <button v-if="message.audio" class="audio-btn" @click="playAudio(message.audio)">
                <text class="audio-icon">🔊</text>
              </button>
            </view>
            <view class="message-text">{{message.content}}</view>
          </view>
        </view>
      </view>

      <!-- 当前通话 -->
      <view class="current-communication">
        <view class="comm-instruction">{{currentRoundData.instruction}}</view>
        
        <!-- 飞行员发言 -->
        <view v-if="currentRoundData.pilotMessage" class="pilot-message">
          <view class="message-header">
            <text class="speaker-name">飞行员 ({{currentAircraft.callsign}})</text>
            <button class="audio-btn" @click="playPilotAudio" :disabled="pilotAudioPlayed">
              <text class="audio-icon">{{pilotAudioPlayed ? '🔇' : '🔊'}}</text>
            </button>
          </view>
          <view class="message-text">{{currentRoundData.pilotMessage}}</view>
        </view>

        <!-- 第三者提示 -->
        <view v-if="currentRoundData.hintMessage" class="hint-message">
          <view class="message-header">
            <text class="speaker-name">提示者</text>
            <button class="audio-btn" @click="playHintAudio">
              <text class="audio-icon">🔊</text>
            </button>
          </view>
          <view class="message-text">{{currentRoundData.hintMessage}}</view>
        </view>

        <!-- 管制员回复区域 -->
        <view class="controller-response">
          <view class="response-title">管制员回复 (你的回答)</view>
          <view class="response-area">
            <view class="record-controls">
              <button 
                class="record-btn" 
                :class="{recording: isRecording, disabled: answerTimeLeft <= 0}" 
                @click="toggleRecording"
                :disabled="answerTimeLeft <= 0"
              >
                <text class="record-icon">{{isRecording ? '⏹' : '🎤'}}</text>
                <text class="record-text">{{isRecording ? '停止录音' : '开始录音'}}</text>
              </button>
              <view v-if="recordedAudio" class="recorded-audio">
                <button class="audio-btn" @click="playRecording">
                  <text class="audio-icon">▶</text>
                </button>
                <text class="audio-duration">{{recordDuration}}s</text>
              </view>
            </view>
            <view class="response-hint">{{currentRoundData.responseHint}}</view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="btn btn-secondary" @click="replayAudio" :disabled="!pilotAudioPlayed">
          重播音频
        </button>
        <button class="btn btn-primary" @click="submitResponse" :disabled="!canSubmit || answerTimeLeft <= 0">
          提交回复
        </button>
        <button class="btn btn-primary" @click="nextRound" v-if="showRoundResult">
          {{currentRound < 30 ? '下一回合' : '完成考试'}}
        </button>
      </view>

      <!-- 回合反馈 -->
      <view v-if="showRoundResult" class="round-feedback">
        <view class="feedback-title">回合评价</view>
        <view class="feedback-score">
          <text class="score-label">得分：</text>
          <text class="score-value">{{roundScore}}/10</text>
        </view>
        <view class="feedback-content">
          <view class="feedback-item">
            <text class="feedback-label">标准回复：</text>
            <text class="feedback-text">{{currentRoundData.standardResponse}}</text>
          </view>
          <view class="feedback-item">
            <text class="feedback-label">评价：</text>
            <text class="feedback-text">{{roundFeedback}}</text>
          </view>
        </view>
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
          <text>{{currentScenario.steps[currentStep].hint}}</text>
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
          <view class="final-score">
            <text class="score-text">总体评分</text>
            <text class="score-number">{{totalScore}}/{{currentScenario.steps.length * 10}}</text>
            <text class="score-percent">{{Math.round(totalScore / (currentScenario.steps.length * 10) * 100)}}%</text>
          </view>
          <view class="performance-breakdown">
            <view class="breakdown-item">
              <text class="breakdown-label">准确性：</text>
              <text class="breakdown-value">{{averageAccuracy}}%</text>
            </view>
            <view class="breakdown-item">
              <text class="breakdown-label">流利度：</text>
              <text class="breakdown-value">{{averageFluency}}%</text>
            </view>
            <view class="breakdown-item">
              <text class="breakdown-label">完成度：</text>
              <text class="breakdown-value">100%</text>
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
  name: 'SimulatedCall',
  data() {
    return {
      trainingStarted: false,
      currentRound: 1,
      totalElapsedTime: 0,
      totalTimeLimit: 1200, // 20分钟 = 1200秒
      totalTimeLeft: 1200,
      answerTimeLeft: 17,
      communicationHistory: [],
      isRecording: false,
      recordedAudio: null,
      recordDuration: 0,
      showRoundResult: false,
      roundScore: 0,
      roundFeedback: '',
      showHintModal: false,
      showCompleteModal: false,
      totalScore: 0,
      pilotAudioPlayed: false,
      recordingTimer: null,
      answerTimer: null,
      totalTimer: null,
      radarAngle: 0,
      radarTimer: null,
      audioContext: null,
      mediaRecorder: null,
      audioChunks: [],
      loading: true,
      currentSpeaker: null, // 当前说话者：pilot, third_party, controller
      // 武汉天河机场30个对话回合数据
      roundsData: [
        {
          id: 1,
          instruction: '飞行员请求滑行许可到跑道04',
          pilotMessage: 'Wuhan Ground, China Southern 3457, request taxi to runway 04.',
          hintMessage: '航班3457请求滑行到04跑道，请给出滑行路线',
          responseHint: '给出滑行路线：经由滑行道A、B到04跑道',
          standardResponse: 'China Southern 3457, taxi to runway 04 via taxiway Alpha, Bravo, hold short of runway 04.',
          audio: '/audio/pilot/round1.mp3'
        },
        {
          id: 2,
          instruction: '飞行员报告准备完毕请求起飞',
          pilotMessage: 'Wuhan Tower, China Southern 3457, ready for departure runway 04.',
          hintMessage: '航班3457已准备完毕，跑道04清空，可以给出起飞许可',
          responseHint: '给出起飞许可',
          standardResponse: 'China Southern 3457, runway 04, cleared for takeoff.',
          audio: '/audio/pilot/round2.mp3'
        },
        {
          id: 3,
          instruction: '飞行员请求爬升到8400米',
          pilotMessage: 'Wuhan Departure, China Southern 3457, request climb to flight level 280.',
          hintMessage: '航班3457请求爬升到8400米高度',
          responseHint: '批准爬升到指定高度',
          standardResponse: 'China Southern 3457, climb and maintain flight level 280.',
          audio: '/audio/pilot/round3.mp3'
        },
        {
          id: 4,
          instruction: '东方航空请求推出许可',
          pilotMessage: 'Wuhan Ground, China Eastern 5821, request pushback from gate 15.',
          hintMessage: '东方航空5821在15号登机口请求推出',
          responseHint: '批准推出，面向东方',
          standardResponse: 'China Eastern 5821, pushback approved, face east.',
          audio: '/audio/pilot/round4.mp3'
        },
        {
          id: 5,
          instruction: '国航请求进近许可',
          pilotMessage: 'Wuhan Approach, Air China 1205, request approach clearance runway 22.',
          hintMessage: '国航1205请求22跑道进近许可',
          responseHint: '给出ILS进近许可',
          standardResponse: 'Air China 1205, cleared ILS approach runway 22, maintain 3000 until established.',
          audio: '/audio/pilot/round5.mp3'
        },
        {
          id: 6,
          instruction: '海航请求改变高度',
          pilotMessage: 'Wuhan Control, Hainan Airlines 7890, request flight level 320.',
          hintMessage: '海航7890请求爬升到9600米',
          responseHint: '检查空域情况后批准或拒绝',
          standardResponse: 'Hainan Airlines 7890, climb and maintain flight level 320.',
          audio: '/audio/pilot/round6.mp3'
        },
        {
          id: 7,
          instruction: '春秋航空报告遇到颠簸',
          pilotMessage: 'Wuhan Control, Spring Airlines 9753, experiencing moderate turbulence, request different altitude.',
          hintMessage: '春秋航空遇到颠簸，请求改变高度',
          responseHint: '提供可用的替代高度',
          standardResponse: 'Spring Airlines 9753, climb to flight level 350 or descend to flight level 270, your choice.',
          audio: '/audio/pilot/round7.mp3'
        },
        {
          id: 8,
          instruction: '厦航请求直飞航路',
          pilotMessage: 'Wuhan Control, Xiamen Air 8642, request direct to WUHAN VOR.',
          hintMessage: '厦航请求直飞武汉VOR',
          responseHint: '批准直飞或给出替代航路',
          standardResponse: 'Xiamen Air 8642, proceed direct WUHAN VOR.',
          audio: '/audio/pilot/round8.mp3'
        },
        {
          id: 9,
          instruction: '深航报告燃油紧急',
          pilotMessage: 'Wuhan Control, Shenzhen Airlines 4567, declaring minimum fuel, request priority approach.',
          hintMessage: '深航燃油紧急，请求优先进近',
          responseHint: '给予优先处理',
          standardResponse: 'Shenzhen Airlines 4567, roger minimum fuel, cleared direct approach, priority handling.',
          audio: '/audio/pilot/round9.mp3'
        },
        {
          id: 10,
          instruction: '川航请求天气绕飞',
          pilotMessage: 'Wuhan Control, Sichuan Airlines 3210, request deviation left 20 degrees due to weather.',
          hintMessage: '川航因天气请求左偏20度',
          responseHint: '批准偏航并给出后续指令',
          standardResponse: 'Sichuan Airlines 3210, approved, deviate left 20 degrees, report clear of weather.',
          audio: '/audio/pilot/round10.mp3'
        },
        // 继续到30个回合...
        {
          id: 30,
          instruction: '最后一个航班完成着陆',
          pilotMessage: 'Wuhan Tower, China Southern 3457, runway vacated via taxiway Charlie.',
          hintMessage: '南航3457已脱离跑道',
          responseHint: '移交给地面管制',
          standardResponse: 'China Southern 3457, contact ground 121.9 for taxi instructions.',
          audio: '/audio/pilot/round30.mp3'
        }
      ],
      
      // 当前航班信息
      currentAircraft: {
        callsign: 'CSN3457',
        aircraftType: 'A320',
        altitude: 0,
        heading: 40,
        speed: 0
      },
      
      // 雷达屏幕上的航班列表
      aircraftList: [
        { callsign: 'CSN3457', x: 45, y: 55, active: true },
        { callsign: 'CES5821', x: 30, y: 40, active: false },
        { callsign: 'CCA1205', x: 70, y: 30, active: false },
        { callsign: 'CHH7890', x: 60, y: 70, active: false }
      ]
    }
  },
  onLoad() {
    this.loadScenarios()
  },
  computed: {
    currentRoundData() {
      return this.roundsData[this.currentRound - 1] || {}
    },
    canSubmit() {
      return this.recordedAudio !== null && this.answerTimeLeft > 0
    },
    averageAccuracy() {
      if (this.communicationHistory.length === 0) return 0
      const total = this.communicationHistory.reduce((sum, msg) => {
        return sum + (msg.accuracy || 0)
      }, 0)
      return Math.round(total / this.communicationHistory.length)
    },
    averageFluency() {
      if (this.communicationHistory.length === 0) return 0
      const total = this.communicationHistory.reduce((sum, msg) => {
        return sum + (msg.fluency || 0)
      }, 0)
      return Math.round(total / this.communicationHistory.length)
    }
  },
  methods: {
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    // 格式化剩余时间显示
    formatTimeLeft(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    // 获取时间进度百分比
    getTimeProgress() {
      return ((this.totalTimeLimit - this.totalTimeLeft) / this.totalTimeLimit) * 100
    },
    async loadScenarios() {
      try {
        this.loading = true
        const response = await trainingApi.getSimulatedCallScenarios()
        if (response.code === 200) {
          this.roundsData = response.data
        } else {
          console.error('获取场景数据失败:', response.message)
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取场景数据失败:', error)
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    startTraining() {
      this.trainingStarted = true
      this.currentRound = 1
      this.totalElapsedTime = 0
      this.communicationHistory = []
      this.totalScore = 0
      this.startTotalTimer()
      this.startRadarAnimation()
      this.resetRoundData()
      this.startRound()
    },
    
    startTotalTimer() {
      this.totalElapsedTime = 0
      this.totalTimeLeft = this.totalTimeLimit
      
      this.totalTimer = setInterval(() => {
        this.totalElapsedTime++
        this.totalTimeLeft--
        
        // 时间警告提示
        if (this.totalTimeLeft === 300) { // 还有5分钟
          uni.showToast({
            title: '考试时间还剩5分钟',
            icon: 'none',
            duration: 3000
          })
        } else if (this.totalTimeLeft === 60) { // 还有1分钟
          uni.showToast({
            title: '考试时间还剩1分钟',
            icon: 'none',
            duration: 3000
          })
        }
        
        // 时间到，强制结束考试
        if (this.totalTimeLeft <= 0) {
          this.forceCompleteExam()
        }
      }, 1000)
    },
    
    // 强制结束考试（时间到）
    async forceCompleteExam() {
      // 停止所有计时器
      if (this.totalTimer) {
        clearInterval(this.totalTimer)
        this.totalTimer = null
      }
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
      
      // 停止录音
      if (this.isRecording) {
        this.stopRecording()
      }
      
      uni.showToast({
        title: '考试时间已到，自动提交',
        icon: 'none',
        duration: 3000
      })
      
      // 完成考试
      await this.completeExam()
    },
    
    startAnswerTimer() {
      this.answerTimeLeft = 17
      
      // 清除之前的计时器
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
      
      this.answerTimer = setInterval(() => {
        this.answerTimeLeft--
        
        // 时间警告提示
        if (this.answerTimeLeft === 5) {
          uni.showToast({
            title: '还有5秒',
            icon: 'none',
            duration: 1000
          })
        }
        
        if (this.answerTimeLeft <= 0) {
          this.timeoutSubmit()
        }
      }, 1000)
    },
    
    startRadarAnimation() {
      this.radarTimer = setInterval(() => {
        this.radarAngle = (this.radarAngle + 2) % 360
      }, 100)
    },
    
    timeoutSubmit() {
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
      
      // 停止录音
      if (this.isRecording) {
        this.stopRecording()
      }
      
      // 显示超时提示
      uni.showToast({
        title: '回复超时，自动跳转下一题',
        icon: 'none',
        duration: 2000
      })
      
      // 记录超时回复
      this.recordTimeoutResponse()
      
      // 2秒后自动跳转到下一回合
      setTimeout(() => {
        this.nextRound()
      }, 2000)
    },
    
    // 记录超时回复
    recordTimeoutResponse() {
      const timeoutFeedback = {
        score: 0,
        accuracy: '超时未回复，无法评估',
        fluency: '超时未回复，无法评估',
        pronunciation: '超时未回复，无法评估',
        responseTime: 17
      }
      
      // 保存超时回合结果
      this.communicationHistory.push({
        round: this.currentRound,
        pilotMessage: this.currentRoundData.pilotMessage,
        thirdPartyHint: this.currentRoundData.hintMessage || '',
        userResponse: null,
        feedback: timeoutFeedback,
        responseTime: 17,
        isTimeout: true,
        timestamp: new Date().toLocaleTimeString()
      })
      
      this.roundScore = 0
      this.roundFeedback = '回复超时'
    },
    
    toggleRecording() {
      if (this.answerTimeLeft <= 0) return
      
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },
    
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []
        
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data)
        }
        
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
          this.recordedAudio = URL.createObjectURL(audioBlob)
        }
        
        this.mediaRecorder.start()
        this.isRecording = true
        
        // 开始计时
        let duration = 0
        this.recordingTimer = setInterval(() => {
          duration++
          this.recordDuration = duration
        }, 1000)
        
      } catch (error) {
        console.error('录音失败:', error)
        uni.showToast({
          title: '录音失败，请检查麦克风权限',
          icon: 'none'
        })
      }
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.isRecording = false
        
        if (this.recordingTimer) {
          clearInterval(this.recordingTimer)
          this.recordingTimer = null
        }
        
        // 停止所有音轨
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    },
    
    playAudio(audioUrl) {
      if (this.audioContext) {
        this.audioContext.stop()
      }
      this.audioContext = uni.createInnerAudioContext()
      this.audioContext.src = audioUrl
      this.audioContext.play()
      
      this.audioContext.onEnded(() => {
        console.log('音频播放完成')
      })
      
      this.audioContext.onError((res) => {
        console.error('音频播放失败:', res)
        uni.showToast({
          title: '音频播放失败',
          icon: 'none'
        })
      })
    },
    
    playPilotAudio() {
      if (this.currentRoundData.audio) {
        this.playAudio(this.currentRoundData.audio)
        this.pilotAudioPlayed = true
        
        // 显示飞行员正在说话
        this.currentSpeaker = 'pilot'
        
        // 音频播放完成后，播放第三者提示
        this.audioContext.onEnded(() => {
          setTimeout(() => {
            this.playThirdPartyHint()
          }, 1000)
        })
      }
    },
    
    playHintAudio() {
      // 播放提示音频
      const hintAudio = `/audio/hints/round${this.currentRound}.mp3`
      this.playAudio(hintAudio)
    },
    
    // 播放第三者提示语音
    playThirdPartyAudio(audioFile) {
      const audioUrl = `/static/audio/third_party/${audioFile}`
      this.playAudio(audioUrl)
      
      // 显示第三者正在说话
      this.currentSpeaker = 'third_party'
      
      // 音频播放完成后，开始管制员回复计时
      this.audioContext.onEnded(() => {
        this.currentSpeaker = 'controller'
        this.startResponseTimer()
      })
    },

    // 播放第三者提示
    playThirdPartyHint() {
      if (this.currentRoundData.hintMessage) {
        // 如果有第三者提示音频文件
        if (this.currentRoundData.thirdPartyAudio) {
          this.playThirdPartyAudio(this.currentRoundData.thirdPartyAudio)
        } else {
          // 使用TTS播放提示文本
          this.speakText(this.currentRoundData.hintMessage, 'third_party')
        }
      } else {
        // 没有第三者提示，直接开始管制员回复
        this.currentSpeaker = 'controller'
        this.startResponseTimer()
      }
    },

    // 文本转语音播放
    speakText(text, speaker) {
      // 这里可以集成TTS服务，暂时用控制台输出模拟
      console.log(`${speaker} 说: ${text}`)
      
      this.currentSpeaker = speaker
      
      // 模拟TTS播放时间（根据文本长度计算）
      const duration = Math.max(2000, text.length * 100)
      
      setTimeout(() => {
        if (speaker === 'third_party') {
          this.currentSpeaker = 'controller'
          this.startResponseTimer()
        }
      }, duration)
    },

    // 开始回复计时
    startResponseTimer() {
      this.startAnswerTimer()
    },
    
    replayAudio() {
      if (this.pilotAudioPlayed && this.currentRoundData.audio) {
        this.playAudio(this.currentRoundData.audio)
      }
    },
    
    playRecording() {
      if (this.recordedAudio) {
        this.playAudio(this.recordedAudio)
      }
    },
    
    showHint() {
      this.showHintModal = true
    },
    
    closeHint() {
      this.showHintModal = false
    },
    
    async submitResponse() {
      if (!this.recordedAudio) {
        uni.showToast({
          title: '请先录制管制员回复',
          icon: 'none'
        })
        return
      }
      
      try {
        // 停止计时器
        if (this.answerTimer) {
          clearInterval(this.answerTimer)
          this.answerTimer = null
        }
        
        // 模拟AI评分系统
        const responseTime = 17 - this.answerTimeLeft
        const timeScore = responseTime <= 10 ? 100 : Math.max(60, 100 - (responseTime - 10) * 5)
        const contentScore = Math.floor(Math.random() * 20) + 80 // 80-100分
        const finalScore = Math.floor((timeScore + contentScore) / 2)
        
        const feedback = {
          score: finalScore,
          accuracy: finalScore >= 90 ? '指令准确，符合管制标准' : finalScore >= 75 ? '指令基本准确，表达清晰' : '指令需要改进，请注意标准用语',
          fluency: finalScore >= 85 ? '语音流畅，语速适中' : finalScore >= 70 ? '语音较流畅，略有停顿' : '语音不够流畅，需要练习',
          pronunciation: finalScore >= 85 ? '发音清晰，语调标准' : finalScore >= 70 ? '发音较清晰，语调基本标准' : '发音需要改进，注意语调',
          responseTime: responseTime
        }
        
        // 保存当前回合结果
        this.communicationHistory.push({
          round: this.currentRound,
          pilotMessage: this.currentRoundData.pilotMessage,
          thirdPartyHint: this.currentRoundData.hintMessage || '',
          userResponse: this.recordedAudio,
          feedback: feedback,
          responseTime: responseTime,
          isTimeout: false,
          timestamp: new Date().toLocaleTimeString()
        })
        
        this.roundScore = finalScore
        this.roundFeedback = feedback.accuracy
        this.totalScore += finalScore
        
        this.showRoundResult = true
        
        // 3秒后自动进入下一回合
        setTimeout(() => {
          this.nextRound()
        }, 3000)
        
      } catch (error) {
        console.error('提交回复失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    },
    
    async nextRound() {
      this.showRoundResult = false
      
      if (this.currentRound < 30) {
        this.currentRound++
        this.resetRoundData()
        this.updateAircraftInfo()
        this.startRound()
      } else {
        // 完成所有30个回合
        await this.completeExam()
      }
    },
    
    // 完成考试
    async completeExam() {
      // 停止总计时器
      if (this.totalTimer) {
        clearInterval(this.totalTimer)
        this.totalTimer = null
      }
      
      // 计算最终成绩
      const totalScore = this.communicationHistory.reduce((sum, item) => sum + (item.feedback ? item.feedback.score : 0), 0)
      const averageScore = Math.floor(totalScore / 30)
      const completedRounds = this.communicationHistory.length
      
      // 提交考试结果
      await this.submitTrainingResult()
      
      this.showCompleteModal = true
      
      uni.showToast({
        title: `考试完成！平均分：${averageScore}`,
        icon: 'success',
        duration: 3000
      })
    },

    // 开始回合
    async startRound() {
      this.currentRoundData = this.roundsData[this.currentRound - 1]
      this.currentSpeaker = 'pilot'
      
      // 更新航班信息
      this.updateAircraftInfo()
      
      // 播放飞行员语音
      if (this.currentRoundData.audio) {
        this.playPilotAudio()
      } else {
        // 使用TTS播放飞行员消息
        this.speakText(this.currentRoundData.pilotMessage, 'pilot')
        
        // TTS播放完成后播放第三者提示
        setTimeout(() => {
          this.playThirdPartyHint()
        }, Math.max(2000, this.currentRoundData.pilotMessage.length * 100))
      }
    },
    
    updateAircraftInfo() {
      // 更新当前航班信息
      const aircraftData = {
        1: { callsign: 'CSN3457', aircraftType: 'A320', altitude: 0, heading: 40, speed: 0 },
        2: { callsign: 'CES5821', aircraftType: 'B737', altitude: 0, heading: 90, speed: 0 },
        3: { callsign: 'CCA1205', aircraftType: 'A330', altitude: 3000, heading: 220, speed: 180 },
        4: { callsign: 'CHH7890', aircraftType: 'B787', altitude: 8400, heading: 280, speed: 450 },
        5: { callsign: 'HU7890', aircraftType: 'A321', altitude: 9600, heading: 320, speed: 480 }
      }
      
      this.currentAircraft = aircraftData[this.currentRound] || this.currentAircraft
    },
    
    async submitTrainingResult() {
      try {
        const result = {
          examType: 'simulated_call',
          totalScore: this.totalScore,
          totalRounds: 30,
          communicationHistory: this.communicationHistory,
          totalTime: this.totalElapsedTime,
          averageScore: Math.floor(this.totalScore / 30),
          completedAt: new Date().toISOString()
        }
        
        await trainingApi.submitCallTrainingResult(result)
        console.log('考试结果已提交:', result)
      } catch (error) {
        console.error('提交训练结果失败:', error)
      }
    },
    
    resetRoundData() {
      this.recordedAudio = null
      this.recordDuration = 0
      this.showRoundResult = false
      this.pilotAudioPlayed = false
      this.roundScore = 0
      this.roundFeedback = ''
      this.isRecording = false
      this.currentSpeaker = null
    },
    
    restartTraining() {
      this.trainingStarted = false
      this.showCompleteModal = false
      this.currentRound = 1
      this.totalElapsedTime = 0
      this.totalTimeLeft = this.totalTimeLimit
      this.totalScore = 0
      this.communicationHistory = []
      this.resetRoundData()
      
      // 清理所有计时器
      if (this.totalTimer) {
        clearInterval(this.totalTimer)
        this.totalTimer = null
      }
      if (this.radarTimer) {
        clearInterval(this.radarTimer)
        this.radarTimer = null
      }
      if (this.answerTimer) {
        clearInterval(this.answerTimer)
        this.answerTimer = null
      }
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
        this.recordingTimer = null
      }
      
      // 重置航班信息
      this.currentAircraft = {
        callsign: 'CSN3457',
        aircraftType: 'A320',
        altitude: 0,
        heading: 40,
        speed: 0
      }
    },
    
    goBack() {
      uni.navigateBack()
    }
  },
  
  beforeDestroy() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer)
    }
    if (this.answerTimer) {
      clearInterval(this.answerTimer)
    }
    if (this.totalTimer) {
      clearInterval(this.totalTimer)
    }
    if (this.radarTimer) {
      clearInterval(this.radarTimer)
    }
  }
}
</script>

<style scoped>
.simulation-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.nav-left {
  width: 80rpx;
}

.nav-back {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: white;
}

.nav-right {
  width: 80rpx;
}

.scenario-selection {
  padding: 40rpx 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
  text-align: center;
}

.scenarios {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.scenario-card {
  background: white;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.scenario-card.selected {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.05);
}

.scenario-icon {
  font-size: 60rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.scenario-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 15rpx;
}

.scenario-desc {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.scenario-level {
  font-size: 24rpx;
  color: #4facfe;
  text-align: center;
  font-weight: 500;
}

.start-section {
  text-align: center;
}

.training-interface {
  padding: 20rpx;
}

.progress-section {
  background: white;
  padding: 30rpx;
  border-radius: 15rpx;
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

.role-info {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.role-card {
  flex: 1;
  background: white;
  padding: 25rpx 20rpx;
  border-radius: 15rpx;
  text-align: center;
}

.role-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.role-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.conversation-history {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.message {
  margin-bottom: 25rpx;
  padding: 20rpx;
  border-radius: 12rpx;
}

.message.user {
  background: rgba(79, 172, 254, 0.1);
  margin-left: 60rpx;
}

.message.system {
  background: #f8f9fa;
  margin-right: 60rpx;
}

.message-role {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.message-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.message-audio {
  margin-top: 15rpx;
}

.current-step {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.step-instruction {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 25rpx;
  text-align: center;
  font-weight: 500;
}

.system-message {
  background: #f8f9fa;
  padding: 25rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.speaker-name {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.message-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.response-choices .choices-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 25rpx;
  font-weight: 500;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.choice-item {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.choice-item.selected {
  border-color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
}

.choice-label {
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

.choice-item.selected .choice-label {
  background: #4facfe;
  color: white;
}

.choice-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.response-input .input-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.input-field {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fafafa;
  resize: none;
}

.input-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 15rpx;
}

.response-record .record-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 25rpx;
  font-weight: 500;
}

.record-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  border: 2px solid transparent;
  background: #FF5722;
  color: white;
  font-size: 28rpx;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
}

.record-btn.recording {
  background: #D32F2F;
  animation: pulse 1.5s infinite;
  border-color: #FF5722;
}

.record-btn.disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(255, 87, 34, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 87, 34, 0);
  }
}

.record-icon {
  font-size: 32rpx;
}

.record-text {
  font-weight: bold;
}

.recorded-audio {
  display: flex;
  align-items: center;
  gap: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  padding: 15rpx 25rpx;
  border-radius: 25rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.audio-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #4facfe;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.audio-icon {
  font-size: 24rpx;
}

.audio-duration {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-section {
  padding: 30rpx 20rpx;
  display: flex;
  justify-content: center;
  gap: 20rpx;
}

.btn {
  padding: 25rpx 40rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  font-weight: bold;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  min-width: 180rpx;
  text-align: center;
  flex: 1;
}

.btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  box-shadow: none;
  transform: none;
  border-color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50, #2196F3);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  border-color: #4CAF50;
}

.btn-primary:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2rpx);
}

.btn-secondary:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

.round-feedback {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15rpx;
  padding: 30rpx;
  margin-top: 30rpx;
  border: 2px solid #4CAF50;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}

.feedback-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 25rpx;
  text-align: center;
}

.feedback-score {
  text-align: center;
  margin-bottom: 25rpx;
  padding: 20rpx;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 10rpx;
  border: 1px solid #4CAF50;
}

.score-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.score-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-left: 10rpx;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feedback-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.feedback-label {
  font-size: 26rpx;
  font-weight: bold;
  color: white;
}

.feedback-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  padding: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20rpx;
  width: 600rpx;
  max-width: 90vw;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 40rpx 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
}

.modal-close {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.6);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.final-score {
  text-align: center;
  margin-bottom: 40rpx;
}

.score-text {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20rpx;
}

.score-number {
  display: block;
  font-size: 72rpx;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 10rpx;
}

.score-percent {
  display: block;
  font-size: 36rpx;
  color: #4CAF50;
}

.performance-breakdown {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.breakdown-label {
  font-size: 28rpx;
  color: white;
}

.breakdown-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #4CAF50;
}

.modal-footer {
  padding: 20rpx 30rpx 40rpx;
  display: flex;
  justify-content: center;
  gap: 30rpx;
}

/* 时间警告样式 */
.total-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.total-time.warning {
  color: #FF5722;
  font-weight: bold;
  animation: timeWarning 1s infinite alternate;
}

.info-value.time-warning {
  color: #FF5722;
  animation: timeWarning 1s infinite alternate;
}

@keyframes timeWarning {
  0% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 时间进度条样式 */
.time-progress {
  margin: 20rpx 0;
  padding: 0 20rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #FF9800 50%, #FF5722 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  display: block;
}

@media (max-width: 750rpx) {
  .role-info {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .record-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 20rpx;
  }
}
</style>