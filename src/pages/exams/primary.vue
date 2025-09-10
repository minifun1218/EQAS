<template>
  <cus-navbar title="初级英语考试">
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
      <!-- 听力理解 -->
      <view v-if="currentStep === 1" class="exam-module">
        <view class="module-header">
          <view class="module-title">听力理解</view>
          <view class="module-desc">航空相关对话、指令、信息 (共15题，20分钟)</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>请仔细听取音频内容，选择正确答案。录音可能带有杂音或不同口音，每段对话仅播放一遍，每题有15秒作答时间。</text>
          </view>
          
          <!-- 题目进度 -->
          <view class="question-progress">
            <text class="progress-info">第 {{ currentListeningQuestion + 1 }} 题 / 共 15 题</text>
            <view class="question-timer" v-if="questionTimeLeft > 0">
              <text class="timer-text">剩余时间: {{ questionTimeLeft }}秒</text>
            </view>
          </view>
          
          <!-- 音频播放器 -->
          <view class="audio-player">
            <button 
              class="play-btn" 
              @click="playListeningAudio()"
              :disabled="audioPlayed[currentListeningQuestion] || audioPlaying.listening"
            >
              {{ audioPlaying.listening ? '播放中...' : (audioPlayed[currentListeningQuestion] ? '已播放' : '播放音频') }}
            </button>
            <view class="audio-progress" v-if="audioPlaying.listening">
              <view class="audio-fill" :style="{ width: audioProgress.listening + '%' }"></view>
            </view>
            <text class="audio-info">语速: 100-120词/分钟</text>
          </view>
          
          <!-- 题目内容 -->
          <view class="question-area" v-if="currentListeningData">
            <view class="question">{{ currentListeningData.question }}</view>
            <view class="options">
              <view
                v-for="(option, index) in currentListeningData.options"
                :key="index"
                class="option"
                :class="{ 
                  selected: selectedAnswers.listening[currentListeningQuestion] === index,
                  disabled: questionTimeLeft === 0 && selectedAnswers.listening[currentListeningQuestion] === null
                }"
                @click="selectListeningAnswer(index)"
              >
                <text>{{ String.fromCharCode(65 + index) }}. {{ option }}</text>
              </view>
            </view>
          </view>
          
          <!-- 题目导航 -->
          <view class="question-nav">
            <button 
              class="nav-btn prev-question" 
              @click="previousQuestion()"
              :disabled="currentListeningQuestion === 0"
            >
              上一题
            </button>
            <button 
              class="nav-btn next-question" 
              @click="nextQuestion()"
              :disabled="currentListeningQuestion === 14 || !selectedAnswers.listening[currentListeningQuestion]"
            >
              {{ currentListeningQuestion === 14 ? '完成听力' : '下一题' }}
            </button>
          </view>
        </view>
      </view>

      <!-- 故事复述 -->
      <view v-if="currentStep === 2" class="exam-module">
        <view class="module-header">
          <view class="module-title">故事复述</view>
          <view class="module-desc">听取航空特情/事故短文并复述大意</view>
          <view class="time-info">考试时间：5分钟</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>请听取约100-120词的航空短文（播放两遍，间隔5秒），然后在300秒内完成口头复述。</text>
          </view>
          
          <!-- 阶段状态显示 -->
          <view class="story-phase">
            <view class="phase-indicator">
              <text class="phase-text">当前阶段：{{ storyPhaseText }}</text>
              <text v-if="storyPhase === 'prepare' && storyTimer > 0" class="phase-timer">
                准备时间：{{ formatTime(storyTimer) }}
              </text>
            </view>
          </view>
          
          <!-- 音频播放区域 -->
          <view v-if="storyPhase === 'listening'" class="audio-player">
            <button 
              class="play-btn" 
              @click="playStoryAudio"
              :disabled="storyPlayCount >= 2"
            >
              {{ audioPlaying.story ? '播放中...' : '播放故事' }}
            </button>
            <text class="play-count">已播放: {{ storyPlayCount }}/2</text>
            <view v-if="storyPlayCount > 0 && storyPlayCount < 2" class="next-play-info">
              <text>{{ storyIntervalTimer > 0 ? `${storyIntervalTimer}秒后播放第二遍` : '可播放第二遍' }}</text>
            </view>
          </view>
          
          <!-- 录音区域 -->
          <view v-if="storyPhase === 'prepare'" class="recording-area">
            <view class="recording-instruction">
              <text>请在300秒内完成故事复述，时间结束后将自动跳转到下一题。</text>
            </view>
            <button
              class="record-btn"
              :class="{ recording: isRecording.story }"
              @click="toggleStoryRecording"
            >
              {{ isRecording.story ? '停止录音' : '开始复述' }}
            </button>
            <view v-if="recordingTime.story > 0" class="recording-time">
              录音时长: {{ formatTime(recordingTime.story) }}
            </view>
          </view>
          
          <!-- 完成提示 -->
          <view v-if="storyPhase === 'completed'" class="completion-info">
            <text>故事复述已完成，即将跳转到下一题...</text>
          </view>
        </view>
      </view>

      <!-- 听力简答 -->
      <view v-if="currentStep === 3" class="exam-module">
        <view class="module-header">
          <view class="module-title">听力简答</view>
          <view class="module-desc">听两段对话并口头回答问题</view>
          <view class="time-info">考试时间：5分钟 | 总共6道题目</view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>请听两段对话（各100-120词），每段对话播放一遍后回答3个问题，每题作答时间20秒。</text>
          </view>
          
          <!-- 当前状态显示 -->
          <view class="dialogue-status">
            <view class="status-info">
              <text class="status-text">{{ dialogueStatusText }}</text>
              <text v-if="currentQuestionTimer > 0" class="question-timer">
                剩余时间：{{ currentQuestionTimer }}秒
              </text>
            </view>
            <view class="progress-info">
              <text>进度：{{ completedQuestions }}/6</text>
            </view>
          </view>
          
          <!-- 对话播放阶段 -->
          <view v-if="dialoguePhase === 'listening'" class="dialogue-listening">
            <view class="current-dialogue">
              <view class="dialogue-header">
                <text class="dialogue-title">对话 {{ currentDialogueIndex + 1 }}</text>
                <text class="dialogue-desc">长度约{{ dialogues[currentDialogueIndex]?.wordCount || 110 }}词</text>
              </view>
              <button 
                class="play-btn large" 
                @click="playCurrentDialogue"
                :disabled="dialoguePlayStatus[currentDialogueIndex]"
              >
                {{ audioPlaying[`dialogue${currentDialogueIndex}`] ? '播放中...' : 
                   dialoguePlayStatus[currentDialogueIndex] ? '已播放' : '播放对话' }}
              </button>
            </view>
          </view>
          
          <!-- 答题阶段 -->
          <view v-if="dialoguePhase === 'answering'" class="dialogue-answering">
            <view class="current-question">
              <view class="question-header">
                <text class="question-title">对话{{ currentDialogueIndex + 1 }} - 问题{{ currentQuestionIndex + 1 }}</text>
              </view>
              <view class="question-content">
                <text class="question-text">{{ currentQuestionData?.text }}</text>
              </view>
              <view class="answer-controls">
                <button
                  class="answer-btn"
                  :class="{ recording: isRecording[currentQuestionKey] }"
                  @click="toggleQuestionRecording"
                  :disabled="currentQuestionTimer <= 0"
                >
                  {{ isRecording[currentQuestionKey] ? '停止回答' : '开始回答' }}
                </button>
                <view v-if="recordingTime[currentQuestionKey] > 0" class="recording-time">
                  录音时长：{{ formatTime(recordingTime[currentQuestionKey]) }}
                </view>
              </view>
            </view>
          </view>
          
          <!-- 完成提示 -->
          <view v-if="dialoguePhase === 'completed'" class="completion-info">
            <text>听力简答已完成，即将跳转到下一题...</text>
          </view>
        </view>
      </view>

      <!-- 模拟通话 -->
      <view v-if="currentStep === 4" class="exam-module">
        <view class="module-header">
          <view class="module-title">模拟通话</view>
          <view class="module-desc">模拟管制情景中的陆空通话</view>
          <view class="exam-requirements">
            <text>考试时间：约20分钟 | 对话回合：30轮 | 每题限时：17秒 | 场景：武汉天河国际机场</text>
          </view>
        </view>
        <view class="module-content">
          <view class="instruction">
            <text>在模拟的管制情景中，作为空管员与"飞行员"进行陆空通话。务必在听到"滴"声后再开始发言。</text>
          </view>
          
          <!-- 机场信息和雷达屏幕 -->
          <view class="airport-radar-section">
            <view class="airport-info">
              <view class="info-header">
                <text class="airport-name">{{ airportInfo.name }} ({{ airportInfo.icao }})</text>
              </view>
              <view class="info-details">
                <view class="detail-item">
                  <text class="label">跑道：</text>
                  <text class="value">{{ airportInfo.runways.join(', ') }}</text>
                </view>
                <view class="detail-item">
                  <text class="label">塔台频率：</text>
                  <text class="value">{{ airportInfo.frequency.tower }}</text>
                </view>
                <view class="detail-item">
                  <text class="label">地面频率：</text>
                  <text class="value">{{ airportInfo.frequency.ground }}</text>
                </view>
              </view>
            </view>
            <view class="radar-screen">
              <view class="radar-header">
                <text>模拟雷达屏幕</text>
              </view>
              <view class="radar-display">
                <view class="radar-center"></view>
                <view class="radar-rings">
                  <view class="radar-ring" v-for="i in 3" :key="i"></view>
                </view>
                <view class="aircraft-targets">
                  <view class="aircraft" v-for="(aircraft, index) in radarData.aircrafts" :key="index"
                        :style="{ left: aircraft.x + 'px', top: aircraft.y + 'px' }">
                    <text class="callsign">{{ aircraft.callsign }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <view class="communication-area">
            <view class="communication-status">
              <view class="round-counter">
                <text>通话回合: {{ currentRound }}/{{ totalRounds }}</text>
              </view>
              <view class="timer-display" :class="{ warning: communicationTimer <= 5 }">
                <text>剩余时间: {{ communicationTimer }}秒</text>
              </view>
            </view>
            
            <view class="scenario-info" v-if="currentScenario.title">
              <view class="scenario-title">当前场景：{{ currentScenario.title }}</view>
              <view class="scenario-desc">{{ currentScenario.description }}</view>
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
                <text class="timestamp" v-if="log.timestamp">{{ log.timestamp }}</text>
              </view>
            </view>
            
            <view class="communication-controls">
              <button
                  v-if="currentRound === 0"
                  class="start-btn"
                  @click="startCommunication"
              >
                开始模拟通话
              </button>
              <template v-else>
                <button
                    class="listen-btn"
                    @click="playPilotMessage"
                    :disabled="communicationTimer > 0"
                >
                  播放飞行员语音
                </button>
                <button
                    class="respond-btn"
                    :class="{ recording: isRecording.communication }"
                    @click="toggleRecording('communication')"
                    :disabled="communicationTimer <= 0"
                >
                  {{ isRecording.communication ? '停止录音' : '开始录音回复' }}
                </button>
                <button
                    class="submit-btn"
                    @click="submitControllerResponse"
                    :disabled="!isRecording.communication && communicationTimer > 0"
                >
                  提交回复
                </button>
              </template>
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
        
        <!-- 考试要求说明 -->
        <view class="exam-requirements">
          <view class="requirement-item">
            <text class="requirement-label">考试时间：</text>
            <text class="requirement-value">15-20分钟</text>
          </view>
          <view class="requirement-item">
            <text class="requirement-label">话题数量：</text>
            <text class="requirement-value">{{ totalTopics }}个话题</text>
          </view>
          <view class="requirement-item">
            <text class="requirement-label">每题时间：</text>
            <text class="requirement-value">60秒</text>
          </view>
          <view class="requirement-item">
            <text class="requirement-label">完成进度：</text>
            <text class="requirement-value">{{ completedTopics }}/{{ totalTopics }}</text>
          </view>
        </view>
        
        <view class="module-content">
          <!-- 状态显示 -->
          <view class="interview-status">
            <view class="status-info">
              <text class="status-text">{{ interviewStatusText }}</text>
            </view>
            <view v-if="interviewPhase === 'answering'" class="question-timer">
              <text class="timer-text">剩余时间: {{ questionTimer }}秒</text>
            </view>
          </view>
          
          <!-- 听取问题阶段 -->
          <view v-if="interviewPhase === 'listening'" class="interview-listening">
            <view class="current-topic">
              <view class="topic-info">
                <text class="topic-title">话题 {{ currentTopicIndex + 1 }}: {{ currentInterviewQuestion?.topic || '加载中...' }}</text>
                <text class="question-text">{{ currentInterviewQuestion?.text || '问题加载中...' }}</text>
              </view>
              <button class="play-btn large" @click="playInterviewQuestion">
                <text class="play-icon">▶</text>
                <text class="play-text">播放问题</text>
              </button>
            </view>
          </view>
          
          <!-- 回答问题阶段 -->
          <view v-if="interviewPhase === 'answering'" class="interview-answering">
            <view class="current-question">
              <view class="question-info">
                <text class="topic-title">话题 {{ currentTopicIndex + 1 }}: {{ currentInterviewQuestion?.topic || '当前话题' }}</text>
                <text class="question-text">{{ currentInterviewQuestion?.text || '当前问题' }}</text>
              </view>
              
              <view class="answer-controls">
                <button 
                  class="answer-btn"
                  :class="{ recording: isRecording[currentInterviewQuestionKey] }"
                  @click="toggleInterviewRecording"
                >
                  {{ isRecording[currentInterviewQuestionKey] ? '停止录音' : '开始录音' }}
                </button>
                
                <button 
                  class="next-btn"
                  @click="nextInterviewQuestion"
                  :disabled="questionTimer > 0"
                >
                  下一题
                </button>
              </view>
              
              <view v-if="recordingTime[currentInterviewQuestionKey] > 0" class="answer-time">
                <text>录音时长: {{ formatTime(recordingTime[currentInterviewQuestionKey]) }}</text>
              </view>
            </view>
          </view>
          
          <!-- 完成阶段 -->
          <view v-if="interviewPhase === 'completed'" class="interview-completed">
            <view class="completion-info">
              <text class="completion-title">口语面试已完成</text>
              <text class="completion-desc">正在提交考试结果...</text>
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
      // 考试基本信息
      examType: 'primary',
      currentStep: 1,
      totalSteps: 5,
      remainingTime: 45 * 60, // 45分钟转换为秒
      timer: null,
      examData: {},
      loading: false,

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
      audioDuration: {},

      // 录音状态
      isRecording: {},
      recordingTime: {},

      // 听力理解 (15题)
      currentListeningQuestion: 0,
      listeningQuestions: [],
      selectedAnswers: {
        listening: new Array(15).fill(null)
      },
      audioPlayed: new Array(15).fill(false),
      questionTimeLeft: 0,
      questionTimer: null,
      listeningCompleted: false,

      // 故事复述
      storyPlayCount: 0,
      storyContent: '',
      storyPhase: 'listening', // listening, prepare, completed
      storyTimer: 300, // 300秒准备时间
      storyIntervalTimer: 0, // 两次播放间隔计时器
      storyPhaseTimer: null,
      storyIntervalTimerRef: null,

      // 听力简答
      dialogues: [],
      dialoguePhase: 'listening', // listening, answering, completed
      currentDialogueIndex: 0, // 当前对话索引 (0-1)
      currentQuestionIndex: 0, // 当前问题索引 (0-2)
      currentQuestionTimer: 20, // 当前问题计时器
      questionTimerRef: null,
      dialoguePlayStatus: [false, false], // 对话播放状态
      completedQuestions: 0, // 已完成问题数量

      // 模拟通话
      currentRound: 1,
      totalRounds: 30, // 30个对话回合
      waitingForBeep: false,
      canRespond: false,
      communicationLogs: [],
      scenarios: [],
      currentScenario: {}, // 当前场景信息
      communicationTimer: 17, // 每题17秒作答时间
      communicationTimerRef: null, // 通话计时器引用
      communicationResponseTime: 17, // 从后端获取的响应时间
      communicationRounds: [], // 从后端获取的通话轮次数据
      radarData: {}, // 雷达屏幕数据
      airportInfo: { // 武汉天河机场信息
        name: '武汉天河国际机场',
        icao: 'ZHHH',
        runways: ['04L/22R', '04R/22L'],
        frequency: {
          tower: '118.1',
          ground: '121.6',
          approach: '119.2'
        }
      },

      // 口语面试
      interviewQuestions: [],
      currentTopicIndex: 0, // 当前话题索引 (0-3)
      currentInterviewQuestionIndex: 0, // 当前问题索引 (0-3)
      interviewPhase: 'listening', // listening, answering, completed
      questionTimer: 60, // 每题60秒作答时间
      interviewTimerRef: null,
      completedTopics: 0, // 已完成话题数量
      totalTopics: 4, // 总话题数量
      totalQuestionsPerTopic: 4, // 每个话题问题数量
      
      // 错误处理
      loadError: false
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

    // 故事复述阶段文本
    storyPhaseText() {
      switch(this.storyPhase) {
        case 'listening':
          return '听取故事'
        case 'prepare':
          return '准备复述'
        case 'completed':
          return '复述完成'
        default:
          return '未知阶段'
      }
    },

    canProceed() {
      // 根据当前步骤检查是否可以继续
      switch(this.currentStep) {
        case 1:
          return this.listeningCompleted
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
    },

    // 当前听力题目数据
    currentListeningData() {
      if (this.listeningQuestions && this.listeningQuestions.length > 0) {
        return this.listeningQuestions[this.currentListeningQuestion] || null
      }
      return null
    },

    // 听力简答状态文本
    dialogueStatusText() {
      switch(this.dialoguePhase) {
        case 'listening':
          return `正在播放对话 ${this.currentDialogueIndex + 1}`
        case 'answering':
          return `对话${this.currentDialogueIndex + 1} - 问题${this.currentQuestionIndex + 1}`
        case 'completed':
          return '听力简答已完成'
        default:
          return '未知状态'
      }
    },

    // 当前问题数据
    currentQuestionData() {
      if (this.dialogues && this.dialogues[this.currentDialogueIndex]) {
        const dialogue = this.dialogues[this.currentDialogueIndex]
        if (dialogue.questions && dialogue.questions[this.currentQuestionIndex]) {
          return dialogue.questions[this.currentQuestionIndex]
        }
      }
      return null
    },

    // 当前问题的录音键
    currentQuestionKey() {
      return `dialogue${this.currentDialogueIndex}_q${this.currentQuestionIndex}`
    },

    // OPI状态文本
    interviewStatusText() {
      switch(this.interviewPhase) {
        case 'listening':
          return `正在播放话题 ${this.currentTopicIndex + 1} - 问题 ${this.currentInterviewQuestionIndex + 1}`
        case 'answering':
          return `话题${this.currentTopicIndex + 1} - 问题${this.currentInterviewQuestionIndex + 1} (${this.questionTimer}秒)`
        case 'completed':
          return '口语面试已完成'
        default:
          return '未知状态'
      }
    },

    // 当前面试问题数据
    currentInterviewQuestion() {
      if (this.interviewQuestions && this.interviewQuestions[this.currentTopicIndex]) {
        const topic = this.interviewQuestions[this.currentTopicIndex]
        if (topic.questions && topic.questions[this.currentInterviewQuestionIndex]) {
          return topic.questions[this.currentInterviewQuestionIndex]
        }
      }
      return null
    },

    // 当前面试问题的录音键
    currentInterviewQuestionKey() {
      return `interview_t${this.currentTopicIndex}_q${this.currentInterviewQuestionIndex}`
    }
  },

  mounted() {
    this.loadExamData()
    this.startTimer()
  },

  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.questionTimer) {
      clearInterval(this.questionTimer)
    }
    // 清理故事复述计时器
    this.clearStoryTimers()
    // 清理听力简答计时器
    if (this.questionTimerRef) {
      clearInterval(this.questionTimerRef)
    }
    // 清理OPI计时器
    if (this.interviewTimerRef) {
      clearInterval(this.interviewTimerRef)
    }
    // 清理模拟通话计时器
    if (this.communicationTimerRef) {
      clearInterval(this.communicationTimerRef)
    }
  },

  methods: {
    async loadExamData() {
      try {
        this.loading = true
        this.loadError = false
        const response = await examsApi.getPrimaryExamData()
        if (response.code === 200) {
          this.examData = response.data.examData || response.data
          const data = this.examData
          
          // 听力理解数据 (15题)
          if (data.listeningComprehension) {
            this.listeningQuestions = data.listeningComprehension.questions || []
            // 如果数据不足15题，生成默认题目
            while (this.listeningQuestions.length < 15) {
              this.listeningQuestions.push({
                question: `听力题目 ${this.listeningQuestions.length + 1}`,
                options: ['选项A', '选项B', '选项C', '选项D'],
                audioUrl: '',
                correctAnswer: 0
              })
            }
          }
          
          // 故事复述数据
          if (data.storyRetelling) {
            this.storyContent = data.storyRetelling.story?.content || ''
          }
          
          // 听力简答数据
          if (data.listeningQA) {
            this.dialogues = data.listeningQA.questions || []
          }
          
          // 模拟通话数据
          if (data.simulatedCall) {
            this.scenarios = [data.simulatedCall.scenario] || []
            this.totalRounds = data.simulatedCall.totalRounds || 30
            this.communicationResponseTime = data.simulatedCall.responseTime || 17
            
            // 设置机场信息
            if (data.simulatedCall.airport) {
              this.airportInfo = data.simulatedCall.airport
            }
            
            // 设置雷达数据
            if (data.simulatedCall.radarData) {
              this.radarData = data.simulatedCall.radarData
            }
            
            // 设置通话轮次数据
            if (data.simulatedCall.rounds) {
              this.communicationRounds = data.simulatedCall.rounds
            }
          }
          
          // 口语面试数据
          if (data.oralInterview) {
            this.interviewQuestions = data.oralInterview.questions || []
          }
          
          // 音频时长数据
          this.audioDuration = data.audioDuration || {}
          
          // 初始化通话日志
          this.communicationLogs = [{
            speaker: '系统',
            content: '模拟通话即将开始，请准备...',
            type: 'system'
          }]
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
      // 生成15道默认听力题目
      this.listeningQuestions = []
      for (let i = 0; i < 15; i++) {
        this.listeningQuestions.push({
          question: `听力理解题目 ${i + 1}：请根据音频内容选择正确答案`,
          options: ['选项A', '选项B', '选项C', '选项D'],
          audioUrl: '',
          correctAnswer: 0
        })
      }
      this.storyContent = '故事内容加载中...'
      this.dialogues = []
      this.scenarios = [{
        title: '武汉天河国际机场塔台管制',
        description: '模拟武汉天河国际机场塔台管制员与飞行员的通话',
        details: ['机场信息：武汉天河国际机场(ZHHH)', '跑道：04L/22R, 04R/22L', '频率：塔台118.1, 地面121.6']
      }]
      this.interviewQuestions = [{
        text: '请介绍一下您自己',
        preparationTime: 30,
        responseTime: 120
      }]
      this.totalRounds = 30
      this.communicationResponseTime = 17
    },
    
    // 获取模拟通话数据
    async loadCommunicationData() {
      try {
        const response = await examsApi.getCommunicationData()
        if (response.code === 200) {
          const data = response.data
          this.currentScenario = data.scenario
          this.totalRounds = data.totalRounds || 30
          this.communicationResponseTime = data.responseTime || 17
          this.airportInfo = data.airport
          this.radarData = data.radarData
          this.communicationRounds = data.rounds
          return true
        }
      } catch (error) {
        console.error('获取模拟通话数据失败:', error)
        return false
      }
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

    playAudio(type) {
      this.audioPlaying[type] = !this.audioPlaying[type]
      if (type === 'story' && this.audioPlaying[type]) {
        this.storyPlayCount++
      }
    },

    selectAnswer(type, index) {
      this.selectedAnswers[type] = index
    },

    // 选择听力答案
    selectListeningAnswer(index) {
      if (this.questionTimeLeft === 0 && this.selectedAnswers.listening[this.currentListeningQuestion] === null) {
        return // 时间到且未选择答案，不允许选择
      }
      this.selectedAnswers.listening[this.currentListeningQuestion] = index
      
      // 停止当前题目计时器
      if (this.questionTimer) {
        clearInterval(this.questionTimer)
        this.questionTimer = null
        this.questionTimeLeft = 0
      }
    },

    // 播放听力音频
    playListeningAudio() {
      if (this.audioPlayed[this.currentListeningQuestion] || this.audioPlaying.listening) {
        return
      }
      
      this.audioPlaying.listening = true
      this.audioPlayed[this.currentListeningQuestion] = true
      this.audioProgress.listening = 0
      
      // 模拟音频播放进度
      const progressInterval = setInterval(() => {
        if (this.audioProgress.listening < 100) {
          this.audioProgress.listening += 2
        } else {
          clearInterval(progressInterval)
          this.audioPlaying.listening = false
          this.startQuestionTimer()
        }
      }, 100)
    },

    // 开始题目计时器 (15秒)
    startQuestionTimer() {
      this.questionTimeLeft = 15
      this.questionTimer = setInterval(() => {
        if (this.questionTimeLeft > 0) {
          this.questionTimeLeft--
        } else {
          clearInterval(this.questionTimer)
          this.questionTimer = null
          // 时间到自动跳转下一题（如果未选择答案）
          if (this.selectedAnswers.listening[this.currentListeningQuestion] === null) {
            uni.showToast({
              title: '时间到，自动跳转',
              icon: 'none'
            })
            setTimeout(() => {
              this.nextQuestion()
            }, 1000)
          }
        }
      }, 1000)
    },

    // 上一题
    previousQuestion() {
      if (this.currentListeningQuestion > 0) {
        // 停止当前计时器
        if (this.questionTimer) {
          clearInterval(this.questionTimer)
          this.questionTimer = null
          this.questionTimeLeft = 0
        }
        this.currentListeningQuestion--
      }
    },

    // 下一题
    nextQuestion() {
      // 停止当前计时器
      if (this.questionTimer) {
        clearInterval(this.questionTimer)
        this.questionTimer = null
        this.questionTimeLeft = 0
      }
      
      if (this.currentListeningQuestion < 14) {
        this.currentListeningQuestion++
      } else {
        // 完成听力部分
        this.completeListening()
      }
    },

    // 完成听力理解
    completeListening() {
      // 检查是否所有题目都已作答
      const unansweredCount = this.selectedAnswers.listening.filter(answer => answer === null).length
      
      if (unansweredCount > 0) {
        uni.showModal({
          title: '提示',
          content: `还有${unansweredCount}道题未作答，确定要完成听力部分吗？`,
          success: (res) => {
            if (res.confirm) {
              this.listeningCompleted = true
              uni.showToast({
                title: '听力部分已完成',
                icon: 'success'
              })
              // 初始化故事复述阶段
              this.initStoryRetelling()
            }
          }
        })
      } else {
        this.listeningCompleted = true
        uni.showToast({
          title: '听力部分已完成',
          icon: 'success'
        })
        // 初始化故事复述阶段
        this.initStoryRetelling()
      }
    },
    
    // 故事复述相关方法
    initStoryRetelling() {
      this.storyPhase = 'listening'
      this.storyTimer = 300
      this.storyPlayCount = 0
      this.storyIntervalTimer = 0
    },
    
    async playStoryAudio() {
      if (this.storyPlayCount >= 2) return
      
      try {
        this.audioPlaying.story = true
        this.storyPlayCount++
        
        // 模拟音频播放（实际项目中应该播放真实音频）
        setTimeout(() => {
          this.audioPlaying.story = false
          
          if (this.storyPlayCount === 1) {
            // 第一遍播放完成，开始5秒间隔
            this.startStoryInterval()
          } else if (this.storyPlayCount === 2) {
            // 两遍播放完成，进入准备阶段
            this.startStoryPrepare()
          }
        }, 60000) // 模拟1分钟音频
        
      } catch (error) {
        console.error('播放故事音频失败:', error)
        this.audioPlaying.story = false
      }
    },
    
    startStoryInterval() {
      this.storyIntervalTimer = 5
      this.storyIntervalTimerRef = setInterval(() => {
        this.storyIntervalTimer--
        if (this.storyIntervalTimer <= 0) {
          clearInterval(this.storyIntervalTimerRef)
          this.storyIntervalTimerRef = null
        }
      }, 1000)
    },
    
    startStoryPrepare() {
      this.storyPhase = 'prepare'
      this.storyTimer = 300 // 300秒准备时间
      
      this.storyPhaseTimer = setInterval(() => {
        this.storyTimer--
        if (this.storyTimer <= 0) {
          this.completeStoryRetelling()
        }
      }, 1000)
    },
    
    toggleStoryRecording() {
      if (this.isRecording.story) {
        this.stopRecording('story')
      } else {
        this.startRecording('story')
      }
    },
    
    completeStoryRetelling() {
      this.storyPhase = 'completed'
      this.clearStoryTimers()
      
      if (this.isRecording.story) {
        this.stopRecording('story')
      }
      
      // 2秒后自动跳转到下一题
      setTimeout(() => {
        this.currentStep = 3
        this.initDialogueQA()
      }, 2000)
    },
    
    // 初始化听力简答
    initDialogueQA() {
      this.dialoguePhase = 'listening'
      this.currentDialogueIndex = 0
      this.currentQuestionIndex = 0
      this.currentQuestionTimer = 20
      this.dialoguePlayStatus = [false, false]
      this.completedQuestions = 0
    },
    
    clearStoryTimers() {
      if (this.storyPhaseTimer) {
        clearInterval(this.storyPhaseTimer)
        this.storyPhaseTimer = null
      }
      if (this.storyIntervalTimerRef) {
        clearInterval(this.storyIntervalTimerRef)
        this.storyIntervalTimerRef = null
      }
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

    startRecording(key) {
      this.isRecording[key] = true
      this.recordingTime[key] = 0
      this.startRecordingTimer(key)
    },
    
    stopRecording(key) {
      this.isRecording[key] = false
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

    // 模拟通话相关方法
    // 开始模拟通话
    async startCommunication() {
      this.currentRound = 1
      this.communicationLogs = []
      
      // 从后端获取模拟通话数据
      const dataLoaded = await this.loadCommunicationData()
      if (!dataLoaded) {
        // 如果获取失败，使用默认数据
        this.currentScenario = {
          name: '武汉天河机场进近管制',
          description: '模拟武汉天河机场进近管制场景，处理航班进近请求',
          airport: '武汉天河机场 (ZHHH)',
          runway: '04L/22R, 04R/22L'
        }
        this.airportInfo = {
          name: '武汉天河机场',
          icao: 'ZHHH',
          elevation: '113英尺',
          runways: ['04L/22R', '04R/22L']
        }
        this.radarData = {
          aircrafts: [
            { callsign: 'CCA1234', altitude: 8000, heading: 0o40, speed: 250 },
            { callsign: 'CSN5678', altitude: 6000, heading: 220, speed: 180 }
          ]
        }
      }
      
      this.playPilotMessage()
    },

    // 播放飞行员语音
    playPilotMessage() {
      if (this.currentRound > this.totalRounds) {
        this.completeCommunication()
        return
      }

      let currentMessage, pilotCallsign
      
      // 优先使用从后端获取的通话轮次数据
      if (this.communicationRounds && this.communicationRounds[this.currentRound - 1]) {
        const roundData = this.communicationRounds[this.currentRound - 1]
        currentMessage = roundData.transcription || roundData.content
        pilotCallsign = roundData.pilotCallsign || 'Unknown Aircraft'
        
        // 播放音频（如果有音频URL）
        if (roundData.audioUrl) {
          // 这里可以添加实际的音频播放逻辑
          console.log('播放音频:', roundData.audioUrl)
        }
      } else {
        // 使用默认消息
        const messages = [
          'Wuhan Approach, China Airlines 1234, requesting approach clearance',
          'Approach, China Southern 5678, level 6000, requesting vectors for ILS approach',
          'Wuhan Tower, Air China 9012, ready for departure runway 04L',
          'Approach, Shenzhen Airlines 3456, requesting descent to 4000 feet',
          'Tower, China Eastern 7890, requesting taxi to gate after landing'
        ]
        
        currentMessage = messages[(this.currentRound - 1) % messages.length]
        pilotCallsign = currentMessage.split(',')[1]?.trim() || 'Unknown Aircraft'
      }
      
      // 添加到通话日志
      this.communicationLogs.push({
        speaker: pilotCallsign,
        content: currentMessage,
        time: this.formatCurrentTime(),
        type: 'pilot'
      })
      
      // 模拟音频播放
      setTimeout(() => {
        this.startCommunicationTimer()
      }, 3000)
    },

    // 开始通话计时器（使用从后端获取的响应时间）
    startCommunicationTimer() {
      this.communicationTimer = this.communicationResponseTime || 17
      this.communicationTimerRef = setInterval(() => {
        this.communicationTimer--
        if (this.communicationTimer <= 0) {
          this.timeoutCommunication()
        }
      }, 1000)
    },

    // 超时处理
    timeoutCommunication() {
      if (this.communicationTimerRef) {
        clearInterval(this.communicationTimerRef)
        this.communicationTimerRef = null
      }
      
      // 添加超时记录
      this.communicationLogs.push({
        speaker: '系统',
        content: '回复超时，自动跳转到下一回合',
        time: this.formatCurrentTime(),
        type: 'system'
      })
      
      this.nextCommunicationRound()
    },

    // 提交管制员回复
    submitControllerResponse() {
      if (this.communicationTimerRef) {
        clearInterval(this.communicationTimerRef)
        this.communicationTimerRef = null
      }
      
      let response
      
      // 优先使用从后端获取的预期响应
      if (this.communicationRounds && this.communicationRounds[this.currentRound - 1]) {
        const roundData = this.communicationRounds[this.currentRound - 1]
        response = roundData.expectedResponse || roundData.response
      } else {
        // 使用默认响应
        const responses = [
          'China Airlines 1234, cleared ILS approach runway 04L, contact tower 118.1',
          'China Southern 5678, turn left heading 180, descend and maintain 4000 feet',
          'Air China 9012, cleared for takeoff runway 04L, contact departure 119.3',
          'Shenzhen Airlines 3456, descend and maintain 4000 feet, expect ILS approach',
          'China Eastern 7890, taxi via taxiway A to gate 15, contact ground 121.9'
        ]
        
        response = responses[(this.currentRound - 1) % responses.length]
      }
      
      this.communicationLogs.push({
        speaker: '管制员',
        content: response,
        time: this.formatCurrentTime(),
        type: 'controller'
      })
      
      this.nextCommunicationRound()
    },

    // 下一个通话回合
    nextCommunicationRound() {
      this.currentRound++
      
      if (this.currentRound <= this.totalRounds) {
        // 短暂停顿后播放下一个飞行员消息
        setTimeout(() => {
          this.playPilotMessage()
        }, 2000)
      } else {
        this.completeCommunication()
      }
    },

    // 完成模拟通话
    completeCommunication() {
      // 清理计时器
      if (this.communicationTimerRef) {
        clearInterval(this.communicationTimerRef)
        this.communicationTimerRef = null
      }
      
      this.communicationLogs.push({
        speaker: '系统',
        content: '模拟通话已完成，即将跳转到下一题...',
        time: this.formatCurrentTime(),
        type: 'system'
      })
      
      setTimeout(() => {
        this.nextStep()
      }, 3000)
    },

    // 格式化当前时间
    formatCurrentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', { hour12: false })
    },

    // 播放当前对话
    playCurrentDialogue() {
      if (this.dialoguePlayStatus[this.currentDialogueIndex]) return
      
      const key = `dialogue${this.currentDialogueIndex}`
      this.audioPlaying[key] = true
      
      // 模拟音频播放
      setTimeout(() => {
        this.audioPlaying[key] = false
        this.dialoguePlayStatus[this.currentDialogueIndex] = true
        
        // 播放完成后进入答题阶段
        this.dialoguePhase = 'answering'
        this.startQuestionTimer()
      }, 60000) // 模拟1分钟对话
    },

    // 开始问题计时器
    startQuestionTimer() {
      this.currentQuestionTimer = 20
      this.questionTimerRef = setInterval(() => {
        this.currentQuestionTimer--
        if (this.currentQuestionTimer <= 0) {
          this.nextDialogueQuestion()
        }
      }, 1000)
    },

    // 切换问题录音
    toggleQuestionRecording() {
      const key = this.currentQuestionKey
      if (this.isRecording[key]) {
        this.stopRecording(key)
        this.nextDialogueQuestion()
      } else {
        this.startRecording(key)
      }
    },

    // 下一个对话问题
    nextDialogueQuestion() {
      // 清除当前计时器
      if (this.questionTimerRef) {
        clearInterval(this.questionTimerRef)
        this.questionTimerRef = null
      }
      
      this.completedQuestions++
      
      if (this.currentQuestionIndex < 2) {
        // 同一对话的下一个问题
        this.currentQuestionIndex++
        this.startQuestionTimer()
      } else if (this.currentDialogueIndex < 1) {
        // 下一个对话
        this.currentDialogueIndex++
        this.currentQuestionIndex = 0
        this.dialoguePhase = 'listening'
      } else {
        // 所有对话完成
        this.dialoguePhase = 'completed'
        setTimeout(() => {
          this.currentStep = 4
        }, 2000)
      }
    },

    checkDialogueAnswers() {
      // 检查听力简答是否完成
      return this.completedQuestions >= 6
    },

    checkInterviewAnswers() {
      // 检查口语面试是否完成
      return this.completedTopics >= this.totalTopics
    },

    // 初始化OPI
    initOralInterview() {
      this.interviewPhase = 'listening'
      this.currentTopicIndex = 0
      this.currentInterviewQuestionIndex = 0
      this.completedTopics = 0
      this.questionTimer = 60
    },

    // 播放当前面试问题音频
    playInterviewQuestion() {
      if (this.currentInterviewQuestion && this.currentInterviewQuestion.audioUrl) {
        // 播放音频逻辑
        console.log('播放面试问题音频:', this.currentInterviewQuestion.audioUrl)
        
        // 音频播放完成后开始答题计时
        setTimeout(() => {
          this.startInterviewTimer()
        }, 3000) // 假设音频播放3秒
      } else {
        // 没有音频直接开始计时
        this.startInterviewTimer()
      }
    },

    // 开始面试问题计时
    startInterviewTimer() {
      this.interviewPhase = 'answering'
      this.questionTimer = 60
      
      this.interviewTimerRef = setInterval(() => {
        if (this.questionTimer > 0) {
          this.questionTimer--
        } else {
          // 时间到，自动跳转下一题
          this.nextInterviewQuestion()
        }
      }, 1000)
    },

    // 切换面试录音状态
    toggleInterviewRecording() {
      const key = this.currentInterviewQuestionKey
      this.toggleRecording(key)
    },

    // 下一个面试问题
    nextInterviewQuestion() {
      // 清除当前计时器
      if (this.interviewTimerRef) {
        clearInterval(this.interviewTimerRef)
        this.interviewTimerRef = null
      }
      
      if (this.currentInterviewQuestionIndex < this.totalQuestionsPerTopic - 1) {
        // 同一话题的下一个问题
        this.currentInterviewQuestionIndex++
        this.playInterviewQuestion()
      } else if (this.currentTopicIndex < this.totalTopics - 1) {
        // 下一个话题
        this.completedTopics++
        this.currentTopicIndex++
        this.currentInterviewQuestionIndex = 0
        this.interviewPhase = 'listening'
        
        // 短暂停顿后播放下一话题
        setTimeout(() => {
          this.playInterviewQuestion()
        }, 1000)
      } else {
        // 所有话题完成
        this.completedTopics++
        this.interviewPhase = 'completed'
        
        setTimeout(() => {
          this.submitExam()
        }, 2000)
      }
    },
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++
        
        // 初始化对应模块
        if (this.currentStep === 5) {
          this.initOralInterview()
          // 开始第一个问题
          setTimeout(() => {
            this.playInterviewQuestion()
          }, 1000)
        }
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

.option.disabled {
  background: #f8f9fa;
  border-color: #dee2e6;
  opacity: 0.6;
  cursor: not-allowed;
}

/* 听力理解专用样式 */
.question-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e3f2fd;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #bbdefb;
}

.progress-info {
  font-size: 28rpx;
  font-weight: 600;
  color: #1976d2;
}

.question-timer {
  background: #fff3cd;
  border: 1rpx solid #ffeaa7;
  border-radius: 8rpx;
  padding: 8rpx 15rpx;
}

.timer-text {
  font-size: 24rpx;
  color: #856404;
  font-weight: 600;
}

.audio-info {
  font-size: 22rpx;
  color: #6c757d;
  margin-left: 15rpx;
}

.question-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  gap: 20rpx;
}

.nav-btn {
  flex: 1;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.nav-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.nav-btn.prev-question {
  background: #6c757d;
}

.nav-btn.next-question {
  background: #28a745;
}

.nav-btn.next-question:disabled {
  background: #adb5bd;
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

/* 故事复述专用样式 */
.story-phase {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #f0f8ff;
  border-radius: 12rpx;
  border-left: 4rpx solid #4a90e2;
}

.phase-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.phase-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.phase-timer {
  font-size: 24rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.next-play-info {
  margin-top: 15rpx;
  padding: 10rpx;
  background: #fff3cd;
  border-radius: 8rpx;
  text-align: center;
}

.next-play-info text {
  font-size: 24rpx;
  color: #856404;
}

.recording-instruction {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background: #e8f5e8;
  border-radius: 8rpx;
  border-left: 4rpx solid #28a745;
}

.recording-instruction text {
  font-size: 26rpx;
  color: #155724;
  line-height: 1.5;
}

.completion-info {
  text-align: center;
  padding: 30rpx;
  background: #d4edda;
  border-radius: 12rpx;
  border: 1rpx solid #c3e6cb;
}

.completion-info text {
  font-size: 28rpx;
  color: #155724;
  font-weight: bold;
}

.time-info {
  font-size: 24rpx;
  color: #666;
  margin-top: 5rpx;
}

/* OPI口语面试专用样式 */
.interview-status {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #6f42c1;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.interview-listening {
  margin-bottom: 20rpx;
}

.current-topic {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  border: 1rpx solid #dee2e6;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.topic-info {
  margin-bottom: 20rpx;
}

.topic-title {
  font-size: 30rpx;
  color: #495057;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.question-text {
  font-size: 26rpx;
  color: #6c757d;
  line-height: 1.5;
  display: block;
}

.play-btn.large {
  width: 100%;
  height: 80rpx;
  background: #6f42c1;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.play-btn.large:active {
  background: #5a2d91;
}

.play-icon {
  font-size: 32rpx;
}

.interview-answering {
  margin-bottom: 20rpx;
}

.current-question {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  border: 1rpx solid #dee2e6;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.question-info {
  margin-bottom: 20rpx;
}

.answer-controls {
  display: flex;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.answer-btn {
  flex: 1;
  height: 70rpx;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: bold;
}

.answer-btn.recording {
  background: #dc3545;
  animation: pulse 1.5s infinite;
}

.next-btn {
  flex: 1;
  height: 70rpx;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: bold;
}

.next-btn:disabled {
  background: #adb5bd;
  opacity: 0.6;
}

.answer-time {
  text-align: center;
  font-size: 24rpx;
  color: #6c757d;
}

.interview-completed {
  margin-bottom: 20rpx;
}

.completion-info {
  text-align: center;
  padding: 40rpx;
  background: #d1ecf1;
  border-radius: 12rpx;
  border: 1rpx solid #bee5eb;
}

.completion-title {
  font-size: 32rpx;
  color: #0c5460;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.completion-desc {
  font-size: 26rpx;
  color: #0c5460;
  display: block;
}

/* 听力简答专用样式 */
.dialogue-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #17a2b8;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.status-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.question-timer {
  font-size: 24rpx;
  color: #dc3545;
  font-weight: bold;
}

.progress-info {
  font-size: 26rpx;
  color: #666;
}

.dialogue-listening {
  text-align: center;
  padding: 40rpx 20rpx;
}

.current-dialogue {
  background: #e3f2fd;
  border-radius: 12rpx;
  padding: 30rpx;
  border: 2rpx solid #2196f3;
}

.dialogue-header {
  margin-bottom: 20rpx;
}

.dialogue-title {
  font-size: 32rpx;
  color: #1976d2;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.dialogue-desc {
  font-size: 24rpx;
  color: #666;
}

.play-btn.large {
  padding: 20rpx 40rpx;
  font-size: 30rpx;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12rpx;
  min-width: 200rpx;
}

.play-btn.large:disabled {
  background: #ccc;
  color: #666;
}

.dialogue-answering {
  padding: 20rpx;
}

.current-question {
  background: #fff8e1;
  border-radius: 12rpx;
  padding: 30rpx;
  border: 2rpx solid #ffc107;
}

.question-header {
  margin-bottom: 20rpx;
  text-align: center;
}

.question-title {
  font-size: 28rpx;
  color: #f57c00;
  font-weight: bold;
}

.question-content {
  margin-bottom: 25rpx;
  padding: 20rpx;
  background: white;
  border-radius: 8rpx;
  border-left: 4rpx solid #ff9800;
}

.question-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
}

.answer-controls {
  text-align: center;
}

.answer-btn {
  padding: 18rpx 36rpx;
  font-size: 28rpx;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
}

.answer-btn.recording {
  background: #dc3545;
  animation: pulse 1s infinite;
}

.answer-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 模拟通话专用样式 */
.airport-radar {
  background: #1a1a1a;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.radar-header {
  color: #00ff00;
  font-size: 24rpx;
  margin-bottom: 20rpx;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.radar-screen {
  position: relative;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, #003300 0%, #001100 100%);
  border-radius: 50%;
  margin: 0 auto;
  border: 2rpx solid #00ff00;
}

.radar-rings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.radar-ring {
  position: absolute;
  border: 1rpx solid #00ff00;
  border-radius: 50%;
  opacity: 0.3;
}

.radar-ring:nth-child(1) {
  top: 25%;
  left: 25%;
  right: 25%;
  bottom: 25%;
}

.radar-ring:nth-child(2) {
  top: 15%;
  left: 15%;
  right: 15%;
  bottom: 15%;
}

.radar-ring:nth-child(3) {
  top: 5%;
  left: 5%;
  right: 5%;
  bottom: 5%;
}

.aircraft-targets {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.aircraft {
  position: absolute;
  color: #00ff00;
  font-size: 20rpx;
  font-family: 'Courier New', monospace;
}

.callsign {
  background: rgba(0, 255, 0, 0.2);
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
}

.communication-area {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
}

.communication-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background: white;
  border-radius: 10rpx;
  border: 1rpx solid #dee2e6;
}

.round-counter {
  font-size: 28rpx;
  font-weight: 600;
  color: #495057;
}

.timer-display {
  font-size: 32rpx;
  font-weight: 700;
  color: #28a745;
  padding: 8rpx 15rpx;
  background: #d4edda;
  border-radius: 8rpx;
}

.timer-display.warning {
  color: #dc3545;
  background: #f8d7da;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

.scenario-info {
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #dee2e6;
}

.scenario-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10rpx;
}

.scenario-desc {
  font-size: 24rpx;
  color: #6c757d;
  line-height: 1.5;
}

.communication-log {
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  max-height: 400rpx;
  overflow-y: auto;
  border: 1rpx solid #dee2e6;
}

.log-item {
  margin-bottom: 15rpx;
  padding: 12rpx;
  border-radius: 8rpx;
  border-left: 4rpx solid #007bff;
}

.log-item.pilot {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.log-item.controller {
  background: #e8f5e8;
  border-left-color: #4caf50;
}

.log-item.system {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.speaker {
  font-size: 24rpx;
  font-weight: 600;
  color: #495057;
  margin-bottom: 5rpx;
  display: block;
}

.content {
  font-size: 26rpx;
  color: #212529;
  line-height: 1.4;
  display: block;
  margin-bottom: 5rpx;
}

.timestamp {
  font-size: 20rpx;
  color: #6c757d;
  float: right;
}

.communication-controls {
  display: flex;
  gap: 15rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.start-btn, .listen-btn, .respond-btn, .submit-btn {
  padding: 20rpx 30rpx;
  border-radius: 25rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  min-width: 140rpx;
}

.start-btn {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 123, 255, 0.3);
}

.listen-btn {
  background: #17a2b8;
  color: white;
}

.listen-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.respond-btn {
  background: #28a745;
  color: white;
}

.respond-btn.recording {
  background: #dc3545;
  animation: pulse 1s infinite;
}

.respond-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.submit-btn {
  background: #ffc107;
  color: #212529;
}

.submit-btn:disabled {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}
</style>
