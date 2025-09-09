<template>
  <cus-navbar title="初级英语考试">
  </cus-navbar>

  <view class="exam-container">
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
      <!-- 听力理解 -->
      <view v-if="currentStep === 1" class="exam-module">
        <view class="module-header">
          <view class="module-title">听力理解</view>
          <view class="module-desc">航空相关对话、指令、信息</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>请仔细听取音频内容，选择正确答案。录音可能带有杂音或不同口音，请在有限时间内作答。</text>
          </view>
          <view class="audio-player">
            <button class="play-btn" @click="playAudio('listening')">
              {{ audioPlaying.listening ? '暂停' : '播放' }}
            </button>
            <view class="audio-progress">
              <view class="audio-fill" :style="{ width: audioProgress.listening + '%' }"></view>
            </view>
          </view>
          <view class="question-area">
            <view class="question">{{ listeningQuestion }}</view>
            <view class="options">
              <view
                  v-for="(option, index) in listeningOptions"
                  :key="index"
                  class="option"
                  :class="{ selected: selectedAnswers.listening === index }"
                  @click="selectAnswer('listening', index)"
              >
                <text>{{ String.fromCharCode(65 + index) }}. {{ option }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 故事复述 -->
      <view v-if="currentStep === 2" class="exam-module">
        <view class="module-header">
          <view class="module-title">故事复述</view>
          <view class="module-desc">听取航空特情/事故短文并复述大意</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>请听取约1分钟、100-120词的航空短文（播放两遍），然后复述大意。建议第一遍听大意，第二遍记细节。</text>
          </view>
          <view class="audio-player">
            <button class="play-btn" @click="playAudio('story')">
              {{ audioPlaying.story ? '暂停' : '播放故事' }}
            </button>
            <text class="play-count">已播放: {{ storyPlayCount }}/2</text>
          </view>
          <view class="recording-area">
            <button
                class="record-btn"
                :class="{ recording: isRecording.story }"
                @click="toggleRecording('story')"
            >
              {{ isRecording.story ? '停止录音' : '开始复述' }}
            </button>
            <view v-if="recordingTime.story > 0" class="recording-time">
              录音时长: {{ formatTime(recordingTime.story) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 听力简答 -->
      <view v-if="currentStep === 3" class="exam-module">
        <view class="module-header">
          <view class="module-title">听力简答</view>
          <view class="module-desc">听两段对话并口头回答问题</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>请听两段对话（各伴随3个问题），每段对话只播放一遍，然后口头回答问题。</text>
          </view>
          <view class="dialogue-section">
            <view class="dialogue-item" v-for="(dialogue, dIndex) in dialogues" :key="dIndex">
              <view class="dialogue-header">
                <text>对话 {{ dIndex + 1 }}</text>
                <button class="play-btn" @click="playDialogue(dIndex)">
                  {{ audioPlaying[`dialogue${dIndex}`] ? '播放中' : '播放对话' }}
                </button>
              </view>
              <view class="questions">
                <view
                    v-for="(question, qIndex) in dialogue.questions"
                    :key="qIndex"
                    class="question-item"
                >
                  <text class="question-text">{{ qIndex + 1 }}. {{ question }}</text>
                  <button
                      class="answer-btn"
                      :class="{ recording: isRecording[`dialogue${dIndex}_q${qIndex}`] }"
                      @click="toggleRecording(`dialogue${dIndex}_q${qIndex}`)"
                  >
                    {{ isRecording[`dialogue${dIndex}_q${qIndex}`] ? '停止回答' : '开始回答' }}
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 模拟通话 -->
      <view v-if="currentStep === 4" class="exam-module">
        <view class="module-header">
          <view class="module-title">模拟通话</view>
          <view class="module-desc">模拟管制情景中的陆空通话</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>在模拟的管制情景中，作为空管员与"飞行员"进行陆空通话。务必在听到"滴"声后再开始发言。</text>
          </view>
          <view class="communication-area">
            <view class="round-counter">
              <text>通话回合: {{ currentRound }}/{{ totalRounds }}</text>
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
            </view>
          </view>
        </view>
      </view>

      <!-- 口语面试 -->
      <view v-if="currentStep === 5" class="exam-module">
        <view class="module-header">
          <view class="module-title">口语面试 (OPI)</view>
          <view class="module-desc">航空专业相关的英语交谈</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>与考官进行航空专业相关的英语交谈，可能围绕图片展开讨论。请避免冷场，可适当使用套话争取思考时间。</text>
          </view>
          <view class="interview-area">
            <view class="interview-questions">
              <view
                  v-for="(question, index) in interviewQuestions"
                  :key="index"
                  class="interview-question"
              >
                <text class="question-text">{{ question.text }}</text>
                <button
                    class="answer-btn"
                    :class="{ recording: isRecording[`interview${index}`] }"
                    @click="toggleRecording(`interview${index}`)"
                >
                  {{ isRecording[`interview${index}`] ? '停止回答' : '开始回答' }}
                </button>
                <view v-if="recordingTime[`interview${index}`] > 0" class="answer-time">
                  回答时长: {{ formatTime(recordingTime[`interview${index}`]) }}
                </view>
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

export default {
  components: {CusNavbar},
  data() {
    return {
      currentStep: 1,
      totalSteps: 5,
      remainingTime: 5400, // 90分钟
      timer: null,

      // 音频播放状态
      audioPlaying: {
        listening: false,
        story: false,
        dialogue0: false,
        dialogue1: false
      },
      audioProgress: {
        listening: 0
      },

      // 录音状态
      isRecording: {},
      recordingTime: {},

      // 听力理解
      listeningQuestion: '根据听到的管制指令，飞机应该执行什么操作？',
      listeningOptions: [
        '保持当前高度，等待进一步指令',
        '立即下降到FL200',
        '转向090度，下降到FL180',
        '联系塔台频率118.1'
      ],
      selectedAnswers: {
        listening: null
      },

      // 故事复述
      storyPlayCount: 0,

      // 听力简答
      dialogues: [
        {
          questions: [
            '飞行员报告了什么问题？',
            '管制员给出了什么指令？',
            '飞机的目标高度是多少？'
          ]
        },
        {
          questions: [
            '天气条件如何？',
            '备降机场是哪个？',
            '预计到达时间是什么时候？'
          ]
        }
      ],

      // 模拟通话
      currentRound: 1,
      totalRounds: 20,
      waitingForBeep: false,
      canRespond: false,
      communicationLogs: [
        {
          speaker: '系统',
          content: '模拟通话即将开始，请准备...',
          type: 'system'
        }
      ],

      // 口语面试
      interviewQuestions: [
        { text: '请描述管制场景中的关键要素' },
        { text: '在这种情况下，作为管制员你会如何处理？' },
        { text: '请谈谈团队协作在空管工作中的重要性' },
        { text: '如果遇到紧急情况，你的处置原则是什么？' }
      ]
    }
  },

  computed: {
    progressPercent() {
      return (this.currentStep / this.totalSteps) * 100
    },

    currentStepName() {
      const stepNames = ['听力理解', '故事复述', '听力简答', '模拟通话', '口语面试']
      return stepNames[this.currentStep - 1]
    },

    canProceed() {
      // 根据当前步骤检查是否可以继续
      switch(this.currentStep) {
        case 1:
          return this.selectedAnswers.listening !== null
        case 2:
          return this.storyPlayCount >= 2 && this.recordingTime.story > 0
        case 3:
          return this.checkDialogueAnswers()
        case 4:
          return this.currentRound >= this.totalRounds
        case 5:
          return this.checkInterviewAnswers()
        default:
          return false
      }
    }
  },

  mounted() {
    this.startTimer()
  },

  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  methods: {
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

    playAudio(type) {
      this.audioPlaying[type] = !this.audioPlaying[type]
      if (type === 'story' && this.audioPlaying[type]) {
        this.storyPlayCount++
      }
    },

    selectAnswer(type, index) {
      this.selectedAnswers[type] = index
    },

    toggleRecording(key) {
      if (this.isRecording[key]) {
        this.isRecording[key] = false
        // 停止录音逻辑
      } else {
        this.isRecording[key] = true
        this.recordingTime[key] = 0
        // 开始录音逻辑
        this.startRecordingTimer(key)
      }
    },

    startRecordingTimer(key) {
      const timer = setInterval(() => {
        if (this.isRecording[key]) {
          this.recordingTime[key]++
        } else {
          clearInterval(timer)
        }
      }, 1000)
    },

    playDialogue(index) {
      const key = `dialogue${index}`
      this.audioPlaying[key] = true
      // 播放对话逻辑
      setTimeout(() => {
        this.audioPlaying[key] = false
      }, 3000)
    },

    playInstruction() {
      this.waitingForBeep = true
      // 播放指令逻辑
      setTimeout(() => {
        this.waitingForBeep = false
        this.canRespond = true
        // 播放提示音
      }, 2000)
    },

    checkDialogueAnswers() {
      // 检查听力简答是否完成
      for (let i = 0; i < this.dialogues.length; i++) {
        for (let j = 0; j < this.dialogues[i].questions.length; j++) {
          const key = `dialogue${i}_q${j}`
          if (!this.recordingTime[key] || this.recordingTime[key] === 0) {
            return false
          }
        }
      }
      return true
    },

    checkInterviewAnswers() {
      // 检查口语面试是否完成
      for (let i = 0; i < this.interviewQuestions.length; i++) {
        const key = `interview${i}`
        if (!this.recordingTime[key] || this.recordingTime[key] === 0) {
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
        content: '确定要提交考试吗？',
        success: (res) => {
          if (res.confirm) {
            // 跳转到结果页面
            uni.navigateTo({
              url: '/pages/exams/result'
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
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e9ecef;
}

.exam-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time {
  color: #dc3545;
  font-size: 28rpx;
  font-weight: 600;
}

.progress-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e9ecef;
}

.progress-bar {
  height: 8rpx;
  background: #e9ecef;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  border-radius: 4rpx;
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
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e9ecef;
}

.module-header {
  margin-bottom: 30rpx;
  text-align: center;
}

.module-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #212529;
  margin-bottom: 10rpx;
}

.module-desc {
  color: #6c757d;
  font-size: 26rpx;
}

.instruction {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  margin-bottom: 30rpx;
  border-left: 4rpx solid #007bff;
}

.instruction text {
  color: #495057;
  font-size: 26rpx;
  line-height: 1.6;
}

.audio-player {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.play-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 15rpx 30rpx;
  font-size: 26rpx;
}

.play-btn:disabled {
  background: #adb5bd;
}

.audio-progress {
  flex: 1;
  height: 6rpx;
  background: #e9ecef;
  border-radius: 3rpx;
  overflow: hidden;
}

.audio-fill {
  height: 100%;
  background: #007bff;
  border-radius: 3rpx;
}

.play-count {
  color: #6c757d;
  font-size: 24rpx;
}

.question-area {
  margin-top: 30rpx;
}

.question {
  font-size: 28rpx;
  color: #212529;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.option {
  background: #f8f9fa;
  border: 2rpx solid #dee2e6;
  border-radius: 12rpx;
  padding: 20rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option.selected {
  background: #e7f3ff;
  border-color: #007bff;
}

.option text {
  color: #212529;
  font-size: 26rpx;
}

.recording-area {
  text-align: center;
  margin-top: 30rpx;
}

.record-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.record-btn.recording {
  background: #c82333;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.recording-time, .answer-time {
  color: #dc3545;
  font-size: 24rpx;
  margin-top: 10rpx;
}

.dialogue-section {
  margin-top: 30rpx;
}

.dialogue-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #dee2e6;
}

.dialogue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.dialogue-header text {
  font-size: 28rpx;
  font-weight: 600;
  color: #212529;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx;
  background: white;
  border-radius: 8rpx;
  border: 1rpx solid #dee2e6;
}

.question-text {
  flex: 1;
  color: #212529;
  font-size: 26rpx;
}

.answer-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 16rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.answer-btn.recording {
  background: #dc3545;
}

.communication-area {
  margin-top: 30rpx;
}

.round-counter {
  text-align: center;
  margin-bottom: 20rpx;
}

.round-counter text {
  color: #007bff;
  font-size: 28rpx;
  font-weight: 600;
}

.communication-log {
  background: #343a40;
  border-radius: 12rpx;
  padding: 20rpx;
  height: 300rpx;
  overflow-y: auto;
  margin-bottom: 20rpx;
}

.log-item {
  margin-bottom: 15rpx;
  padding: 10rpx;
  border-radius: 6rpx;
}

.log-item.system {
  background: #495057;
}

.log-item.pilot {
  background: #28a745;
}

.log-item.controller {
  background: #007bff;
}

.speaker {
  color: #f8f9fa;
  font-weight: 600;
  font-size: 24rpx;
}

.content {
  color: white;
  font-size: 26rpx;
  margin-left: 10rpx;
}

.communication-controls {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.listen-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 20rpx;
  padding: 15rpx 30rpx;
  font-size: 26rpx;
}

.respond-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 15rpx 30rpx;
  font-size: 26rpx;
}

.respond-btn.recording {
  background: #dc3545;
}

.interview-area {
  margin-top: 30rpx;
}

.interview-questions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.interview-question {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  border: 1rpx solid #dee2e6;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
  border-top: 1rpx solid #e9ecef;
  display: flex;
  gap: 20rpx;
}

.prev-btn, .next-btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  border: none;
}

.prev-btn {
  background: #6c757d;
  color: white;
}

.prev-btn:disabled {
  background: #adb5bd;
}

.next-btn {
  background: #007bff;
  color: white;
}

.next-btn:disabled {
  background: #adb5bd;
}
</style>
