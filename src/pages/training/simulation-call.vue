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

    <!-- 场景选择 -->
    <view v-if="!trainingStarted" class="scenario-selection">
      <view class="section-title">选择训练场景</view>
      <view class="scenarios">
        <view 
          v-for="(scenario, index) in scenarios" 
          :key="index"
          class="scenario-card"
          :class="{selected: selectedScenario === index}"
          @click="selectScenario(index)"
        >
          <view class="scenario-icon">{{scenario.icon}}</view>
          <view class="scenario-name">{{scenario.name}}</view>
          <view class="scenario-desc">{{scenario.description}}</view>
          <view class="scenario-level">难度: {{scenario.level}}</view>
        </view>
      </view>
      <view class="start-section">
        <button class="btn btn-primary" @click="startTraining" :disabled="selectedScenario === null">
          开始训练
        </button>
      </view>
    </view>

    <!-- 训练界面 -->
    <view v-else class="training-interface">
      <!-- 进度显示 -->
      <view class="progress-section">
        <view class="progress-text">对话进度: {{currentStep + 1}}/{{currentScenario.steps.length}}</view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{width: ((currentStep + 1) / currentScenario.steps.length * 100) + '%'}"></view>
        </view>
      </view>

      <!-- 角色信息 -->
      <view class="role-info">
        <view class="role-card">
          <view class="role-title">你的角色</view>
          <view class="role-name">{{currentScenario.userRole}}</view>
        </view>
        <view class="role-card">
          <view class="role-title">对话对象</view>
          <view class="role-name">{{currentScenario.partnerRole}}</view>
        </view>
      </view>

      <!-- 对话历史 -->
      <view class="conversation-history">
        <view 
          v-for="(message, index) in conversationHistory" 
          :key="index"
          class="message"
          :class="{user: message.isUser, system: !message.isUser}"
        >
          <view class="message-role">{{message.role}}</view>
          <view class="message-content">{{message.content}}</view>
          <view v-if="message.audio" class="message-audio">
            <button class="audio-btn" @click="playAudio(message.audio)">
              <text class="audio-icon">🔊</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 当前步骤 -->
      <view class="current-step">
        <view class="step-instruction">{{currentScenario.steps[currentStep].instruction}}</view>
        
        <!-- 系统消息 -->
        <view v-if="currentScenario.steps[currentStep].systemMessage" class="system-message">
          <view class="message-header">
            <text class="speaker-name">{{currentScenario.partnerRole}}</text>
            <button class="audio-btn" @click="playSystemAudio">
              <text class="audio-icon">🔊</text>
            </button>
          </view>
          <view class="message-text">{{currentScenario.steps[currentStep].systemMessage}}</view>
        </view>

        <!-- 用户回复选项 -->
        <view v-if="currentScenario.steps[currentStep].responseType === 'choice'" class="response-choices">
          <view class="choices-title">请选择合适的回复：</view>
          <view class="choices">
            <view 
              v-for="(choice, index) in currentScenario.steps[currentStep].choices" 
              :key="index"
              class="choice-item"
              :class="{selected: selectedChoice === index}"
              @click="selectChoice(index)"
            >
              <text class="choice-label">{{String.fromCharCode(65 + index)}}</text>
              <text class="choice-text">{{choice.text}}</text>
            </view>
          </view>
        </view>

        <!-- 自由输入 -->
        <view v-else-if="currentScenario.steps[currentStep].responseType === 'input'" class="response-input">
          <view class="input-title">请输入你的回复：</view>
          <textarea 
            class="input-field" 
            v-model="userInput" 
            :placeholder="currentScenario.steps[currentStep].placeholder"
            maxlength="200"
          ></textarea>
          <view class="input-hint">{{currentScenario.steps[currentStep].hint}}</view>
        </view>

        <!-- 录音回复 -->
        <view v-else-if="currentScenario.steps[currentStep].responseType === 'record'" class="response-record">
          <view class="record-title">请录制你的回复：</view>
          <view class="record-controls">
            <button class="record-btn" :class="{recording: isRecording}" @click="toggleRecording">
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
          <view class="record-hint">{{currentScenario.steps[currentStep].hint}}</view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="btn btn-secondary" @click="showHint" v-if="!showStepResult">提示</button>
        <button class="btn btn-primary" @click="submitResponse" v-if="!showStepResult && canSubmit">
          提交回复
        </button>
        <button class="btn btn-primary" @click="nextStep" v-if="showStepResult">
          {{currentStep < currentScenario.steps.length - 1 ? '继续对话' : '完成训练'}}
        </button>
      </view>

      <!-- 步骤反馈 -->
      <view v-if="showStepResult" class="step-feedback">
        <view class="feedback-title">回复评价</view>
        <view class="feedback-score">
          <text class="score-label">得分：</text>
          <text class="score-value">{{stepScore}}/10</text>
        </view>
        <view class="feedback-content">
          <view class="feedback-item">
            <text class="feedback-label">准确性：</text>
            <text class="feedback-text">{{stepFeedback.accuracy}}</text>
          </view>
          <view class="feedback-item">
            <text class="feedback-label">流利度：</text>
            <text class="feedback-text">{{stepFeedback.fluency}}</text>
          </view>
          <view class="feedback-item">
            <text class="feedback-label">建议：</text>
            <text class="feedback-text">{{stepFeedback.suggestion}}</text>
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
export default {
  name: 'SimulationCall',
  data() {
    return {
      trainingStarted: false,
      selectedScenario: null,
      currentStep: 0,
      conversationHistory: [],
      selectedChoice: null,
      userInput: '',
      isRecording: false,
      recordedAudio: null,
      recordDuration: 0,
      showStepResult: false,
      showHintModal: false,
      showCompleteModal: false,
      stepScore: 0,
      totalScore: 0,
      stepFeedback: {},
      scenarios: [
        {
          id: 1,
          name: '起飞许可申请',
          description: '向塔台申请起飞许可的标准流程',
          level: '初级',
          icon: '🛫',
          userRole: '飞行员',
          partnerRole: '塔台管制员',
          steps: [
            {
              instruction: '向塔台报告准备起飞',
              systemMessage: 'Tower, this is China Air 1234, ready for departure.',
              responseType: 'choice',
              choices: [
                { text: 'China Air 1234, request taxi to runway 09L', score: 6 },
                { text: 'Tower, China Air 1234, ready for takeoff', score: 10 },
                { text: 'China Air 1234, requesting departure clearance', score: 8 }
              ],
              hint: '标准的起飞准备报告应该包含呼号和准备状态'
            },
            {
              instruction: '确认起飞许可信息',
              systemMessage: 'China Air 1234, cleared for takeoff runway 09L, wind 090 degrees 12 knots.',
              responseType: 'choice',
              choices: [
                { text: 'Cleared for takeoff runway 09L, China Air 1234', score: 10 },
                { text: 'Roger, taking off now', score: 6 },
                { text: 'Copy that, runway 09L', score: 7 }
              ],
              hint: '复述许可信息是确保安全的重要步骤'
            }
          ]
        },
        {
          id: 2,
          name: '进近管制通话',
          description: '与进近管制的标准通话程序',
          level: '中级',
          icon: '🛬',
          userRole: '飞行员',
          partnerRole: '进近管制员',
          steps: [
            {
              instruction: '联系进近管制',
              systemMessage: null,
              responseType: 'input',
              placeholder: '请输入联系进近管制的标准用语...',
              hint: '包含呼号、高度、位置和意图'
            },
            {
              instruction: '执行雷达引导指令',
              systemMessage: 'China Air 1234, turn left heading 270, descend and maintain 3000 feet.',
              responseType: 'record',
              hint: '清晰复述指令并确认执行'
            }
          ]
        },
        {
          id: 3,
          name: '紧急情况处理',
          description: '模拟紧急情况下的通话程序',
          level: '高级',
          icon: '🚨',
          userRole: '飞行员',
          partnerRole: '管制员',
          steps: [
            {
              instruction: '报告紧急情况',
              systemMessage: null,
              responseType: 'input',
              placeholder: '报告发动机故障情况...',
              hint: 'Mayday呼叫格式：Mayday, Mayday, Mayday + 呼号 + 问题 + 意图'
            },
            {
              instruction: '请求优先降落',
              systemMessage: 'China Air 1234, roger your emergency, say your intentions.',
              responseType: 'choice',
              choices: [
                { text: 'Request immediate return to departure airport', score: 9 },
                { text: 'We need priority landing, engine failure', score: 10 },
                { text: 'Emergency landing requested', score: 7 }
              ],
              hint: '明确说明意图和所需协助'
            }
          ]
        }
      ]
    }
  },
  computed: {
    currentScenario() {
      return this.selectedScenario !== null ? this.scenarios[this.selectedScenario] : null
    },
    canSubmit() {
      const step = this.currentScenario.steps[this.currentStep]
      if (step.responseType === 'choice') {
        return this.selectedChoice !== null
      } else if (step.responseType === 'input') {
        return this.userInput.trim().length > 0
      } else if (step.responseType === 'record') {
        return this.recordedAudio !== null
      }
      return false
    },
    averageAccuracy() {
      return Math.round(this.totalScore / (this.currentStep + 1) * 10)
    },
    averageFluency() {
      return Math.round(this.totalScore / (this.currentStep + 1) * 8)
    }
  },
  methods: {
    selectScenario(index) {
      this.selectedScenario = index
    },
    
    startTraining() {
      if (this.selectedScenario === null) return
      this.trainingStarted = true
      this.currentStep = 0
      this.conversationHistory = []
      this.totalScore = 0
    },
    
    selectChoice(index) {
      this.selectedChoice = index
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
      this.recordDuration = 0
      this.recordTimer = setInterval(() => {
        this.recordDuration++
      }, 1000)
    },
    
    stopRecording() {
      this.isRecording = false
      this.recordedAudio = 'mock_audio_data'
      if (this.recordTimer) {
        clearInterval(this.recordTimer)
      }
    },
    
    playAudio(audioData) {
      // 模拟音频播放
      console.log('Playing audio:', audioData)
    },
    
    playSystemAudio() {
      // 播放系统消息音频
      console.log('Playing system message audio')
    },
    
    playRecording() {
      // 播放录音
      console.log('Playing recorded audio')
    },
    
    showHint() {
      this.showHintModal = true
    },
    
    closeHint() {
      this.showHintModal = false
    },
    
    submitResponse() {
      const step = this.currentScenario.steps[this.currentStep]
      let userResponse = ''
      let score = 0
      
      if (step.responseType === 'choice') {
        const choice = step.choices[this.selectedChoice]
        userResponse = choice.text
        score = choice.score
      } else if (step.responseType === 'input') {
        userResponse = this.userInput
        score = Math.min(10, Math.max(6, Math.floor(Math.random() * 5) + 6)) // 模拟评分
      } else if (step.responseType === 'record') {
        userResponse = '[录音回复]'
        score = Math.min(10, Math.max(6, Math.floor(Math.random() * 5) + 6)) // 模拟评分
      }
      
      // 添加到对话历史
      this.conversationHistory.push({
        role: this.currentScenario.userRole,
        content: userResponse,
        isUser: true
      })
      
      if (step.systemMessage) {
        this.conversationHistory.push({
          role: this.currentScenario.partnerRole,
          content: step.systemMessage,
          isUser: false,
          audio: 'system_audio_data'
        })
      }
      
      this.stepScore = score
      this.totalScore += score
      
      // 生成反馈
      this.stepFeedback = {
        accuracy: score >= 9 ? '优秀' : score >= 7 ? '良好' : '需要改进',
        fluency: score >= 8 ? '流利' : score >= 6 ? '一般' : '不够流利',
        suggestion: score >= 9 ? '回复准确，继续保持！' : score >= 7 ? '基本正确，注意用词准确性' : '建议多练习标准用语'
      }
      
      this.showStepResult = true
    },
    
    nextStep() {
      if (this.currentStep < this.currentScenario.steps.length - 1) {
        this.currentStep++
        this.resetStepData()
      } else {
        this.showCompleteModal = true
      }
    },
    
    resetStepData() {
      this.selectedChoice = null
      this.userInput = ''
      this.recordedAudio = null
      this.recordDuration = 0
      this.showStepResult = false
    },
    
    restartTraining() {
      this.trainingStarted = false
      this.selectedScenario = null
      this.showCompleteModal = false
      this.resetStepData()
    },
    
    goBack() {
      uni.navigateBack()
    }
  },
  
  beforeDestroy() {
    if (this.recordTimer) {
      clearInterval(this.recordTimer)
    }
  }
}
</script>

<style scoped>
.simulation-container {
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
  align-items: center;
  gap: 30rpx;
  margin-bottom: 20rpx;
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding: 20rpx 30rpx;
  border-radius: 25rpx;
  border: none;
  background: #4facfe;
  color: white;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.record-btn.recording {
  background: #ff4757;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.record-icon {
  font-size: 32rpx;
}

.recorded-audio {
  display: flex;
  align-items: center;
  gap: 15rpx;
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
  color: #666;
}

.record-hint {
  font-size: 24rpx;
  color: #999;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.step-feedback {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.feedback-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.feedback-score {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.score-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 15rpx;
}

.score-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #4facfe;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.feedback-item {
  display: flex;
  align-items: flex-start;
}

.feedback-label {
  font-size: 26rpx;
  color: #666;
  width: 120rpx;
  flex-shrink: 0;
}

.feedback-text {
  font-size: 26rpx;
  color: #333;
  flex: 1;
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

.final-score {
  text-align: center;
  margin-bottom: 40rpx;
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
  background: #f8f9fa;
  border-radius: 10rpx;
}

.breakdown-label {
  font-size: 28rpx;
  color: #666;
}

.breakdown-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #4facfe;
}

.modal-footer {
  padding: 20rpx 30rpx 40rpx;
  display: flex;
  justify-content: center;
  gap: 30rpx;
}

/* 响应式适配 */
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