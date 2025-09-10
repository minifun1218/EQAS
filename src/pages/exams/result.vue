<template>
  <view class="result-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-text">正在加载考试结果...</view>
    </view>
    
    <!-- 考试结果内容 -->
    <view v-if="!loading" class="result-content">
      <!-- 顶部标题栏 -->
      <view class="header">
        <view class="title">ICAO4 考试结果</view>
        <view class="exam-type">{{ examTypeText }}</view>
      </view>

      <!-- 总体成绩卡片 -->
    <view class="overall-score-card">
      <view class="score-circle">
        <view class="score-number">{{ overallScore }}</view>
        <view class="score-label">总分</view>
      </view>
      <view class="score-info">
        <view class="score-level" :class="scoreLevel.toLowerCase()">{{ scoreLevel }}</view>
        <view class="score-desc">{{ scoreDescription }}</view>
        <view class="exam-date">考试时间: {{ examDate }}</view>
      </view>
    </view>

    <!-- 成绩分析 -->
    <view class="analysis-section">
      <view class="section-title">
        <text class="title-icon">📊</text>
        <text class="title-text">成绩分析</text>
      </view>
      
      <!-- 各模块成绩 -->
      <view class="module-scores">
        <view 
          v-for="(module, index) in moduleScores" 
          :key="index"
          class="module-item"
        >
          <view class="module-header">
            <view class="module-name">{{ module.name }}</view>
            <view class="module-score" :class="getScoreClass(module.score)">{{ module.score }}分</view>
          </view>
          <view class="module-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :class="getScoreClass(module.score)"
                :style="{ width: (module.score / 100) * 100 + '%' }"
              ></view>
            </view>
            <view class="module-level">{{ getModuleLevel(module.score) }}</view>
          </view>
          <view class="module-details">
            <view class="detail-item">
              <text class="detail-label">用时:</text>
              <text class="detail-value">{{ module.duration }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">准确率:</text>
              <text class="detail-value">{{ module.accuracy }}%</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">流利度:</text>
              <text class="detail-value">{{ module.fluency }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 能力雷达图 -->
    <view class="radar-section">
      <view class="section-title">
        <text class="title-icon">🎯</text>
        <text class="title-text">能力分析</text>
      </view>
      <view class="radar-chart">
        <!-- 这里可以集成图表库，暂时用文字描述 -->
        <view class="ability-grid">
          <view 
            v-for="(ability, index) in abilities" 
            :key="index"
            class="ability-item"
          >
            <view class="ability-name">{{ ability.name }}</view>
            <view class="ability-bars">
              <view 
                v-for="n in 5" 
                :key="n"
                class="ability-bar"
                :class="{ active: n <= ability.level }"
              ></view>
            </view>
            <view class="ability-score">{{ ability.score }}分</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 详细报告 -->
    <view class="report-section">
      <view class="section-title">
        <text class="title-icon">📋</text>
        <text class="title-text">详细报告</text>
      </view>
      
      <!-- 优势分析 -->
      <view class="report-card">
        <view class="report-header">
          <text class="report-title">✅ 优势表现</text>
        </view>
        <view class="report-content">
          <view 
            v-for="(strength, index) in strengths" 
            :key="index"
            class="report-item positive"
          >
            <text class="item-text">{{ strength }}</text>
          </view>
        </view>
      </view>
      
      <!-- 改进建议 -->
      <view class="report-card">
        <view class="report-header">
          <text class="report-title">💡 改进建议</text>
        </view>
        <view class="report-content">
          <view 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="report-item suggestion"
          >
            <text class="item-text">{{ suggestion }}</text>
          </view>
        </view>
      </view>
      
      <!-- 学习资源推荐 -->
      <view class="report-card">
        <view class="report-header">
          <text class="report-title">📚 学习资源推荐</text>
        </view>
        <view class="report-content">
          <view 
            v-for="(resource, index) in resources" 
            :key="index"
            class="resource-item"
            @click="openResource(resource)"
          >
            <view class="resource-info">
              <text class="resource-title">{{ resource.title }}</text>
              <text class="resource-desc">{{ resource.description }}</text>
            </view>
            <text class="resource-arrow">→</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史成绩对比 -->
    <view class="history-section">
      <view class="section-title">
        <text class="title-icon">📈</text>
        <text class="title-text">历史成绩对比</text>
      </view>
      <view class="history-chart">
        <view class="chart-header">
          <text class="chart-title">最近5次考试成绩趋势</text>
        </view>
        <view class="chart-content">
          <view class="chart-bars">
            <view 
              v-for="(score, index) in historyScores" 
              :key="index"
              class="chart-bar"
            >
              <view 
                class="bar-fill"
                :style="{ height: (score / 100) * 200 + 'rpx' }"
                :class="index === historyScores.length - 1 ? 'current' : ''"
              ></view>
              <text class="bar-label">{{ score }}</text>
              <text class="bar-date">{{ getHistoryDate(index) }}</text>
            </view>
          </view>
        </view>
        <view class="trend-info">
          <view class="trend-item">
            <text class="trend-label">平均分:</text>
            <text class="trend-value">{{ averageScore }}分</text>
          </view>
          <view class="trend-item">
            <text class="trend-label">进步幅度:</text>
            <text class="trend-value" :class="improvementClass">{{ improvement }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button class="action-btn secondary" @click="viewCertificate">
        <text class="btn-icon">🏆</text>
        <text class="btn-text">查看证书</text>
      </button>
      <button class="action-btn primary" @click="downloadReport">
        <text class="btn-icon">📄</text>
        <text class="btn-text">下载报告</text>
      </button>
      <button class="action-btn secondary" @click="shareResult">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享成绩</text>
      </button>
      <button class="action-btn primary" @click="retakeExam">
        <text class="btn-icon">🔄</text>
        <text class="btn-text">重新考试</text>
      </button>
    </view>

    <!-- 底部导航 -->
    <view class="footer">
      <button class="footer-btn" @click="goHome">
        <text class="footer-icon">🏠</text>
        <text class="footer-text">返回首页</text>
      </button>
      <button class="footer-btn" @click="goTraining">
        <text class="footer-icon">💪</text>
        <text class="footer-text">继续训练</text>
      </button>
    </view>
    </view>
  </view>
</template>

<script>
import { examsApi } from '@/api/index.js'

export default {
  data() {
    return {
      examLevel: 'primary', // primary 或 secondary
      overallScore: 0,
      examDate: '',
      examId: '',
      loading: false,
      
      // 模块成绩数据
      moduleScores: [],
      
      // 能力分析
      abilities: [],
      
      // 优势表现
      strengths: [],
      
      // 改进建议
      suggestions: [],
      
      // 学习资源推荐
      resources: [],
      
      // 历史成绩
      historyScores: [],
      
      // 错误处理
      loadError: false
    }
  },
  
  computed: {
    examTypeText() {
      return this.examLevel === 'primary' ? '初级英语考试' : '中级英语复试'
    },
    
    scoreLevel() {
      if (this.overallScore >= 90) return '优秀'
      if (this.overallScore >= 80) return '良好'
      if (this.overallScore >= 70) return '合格'
      return '不合格'
    },
    
    scoreDescription() {
      if (this.overallScore >= 90) return '恭喜！您的英语水平已达到ICAO4级标准'
      if (this.overallScore >= 80) return '表现良好，基本达到ICAO4级要求'
      if (this.overallScore >= 70) return '达到合格标准，仍有提升空间'
      return '未达到合格标准，建议加强训练'
    },
    
    averageScore() {
      const sum = this.historyScores.reduce((a, b) => a + b, 0)
      return Math.round(sum / this.historyScores.length)
    },
    
    improvement() {
      if (this.historyScores.length < 2) return '0'
      const current = this.historyScores[this.historyScores.length - 1]
      const previous = this.historyScores[this.historyScores.length - 2]
      const diff = current - previous
      return diff > 0 ? `+${diff}分` : `${diff}分`
    },
    
    improvementClass() {
      const current = this.historyScores[this.historyScores.length - 1]
      const previous = this.historyScores[this.historyScores.length - 2]
      const diff = current - previous
      return diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'
    }
  },
  
  onLoad(options) {
    if (options.level) {
      this.examLevel = options.level
    }
    if (options.examId) {
      this.examId = options.examId
    }
    this.loadExamResult()
  },
  
  methods: {
    async loadExamResult() {
      try {
        this.loading = true
        this.loadError = false
        const response = await examsApi.getExamResult(this.examId || 'latest', this.examLevel)
        if (response.code === 200) {
          const result = response.data.examResult || response.data
          
          // 基本信息
          this.overallScore = result.overallScore || 0
          this.examDate = result.examDate || new Date().toLocaleDateString()
          
          // 模块成绩
          this.moduleScores = result.moduleScores || []
          
          // 能力分析
          this.abilities = result.abilityAnalysis || []
          
          // 优势表现
          this.strengths = result.strengths || []
          
          // 改进建议
          this.suggestions = result.suggestions || []
          
          // 学习资源推荐
          this.resources = result.recommendedResources || []
          
          // 历史成绩
          this.historyScores = result.historyScores || []
        } else {
          throw new Error(response.message || '获取考试结果失败')
        }
      } catch (error) {
        console.error('加载考试结果失败:', error)
        this.loadError = true
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'error'
        })
        // 设置默认数据以防止页面崩溃
        this.setDefaultResultData()
      } finally {
        this.loading = false
      }
    },
    
    setDefaultResultData() {
      this.overallScore = 0
      this.examDate = new Date().toLocaleDateString()
      this.moduleScores = [
        { name: '听力理解', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '故事复述', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '听力简答', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '模拟通话', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '口语面试', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' }
      ]
      this.abilities = [
        { name: '发音准确性', score: 0 },
        { name: '语法正确性', score: 0 },
        { name: '词汇丰富度', score: 0 },
        { name: '流利度', score: 0 },
        { name: '理解能力', score: 0 },
        { name: '交际能力', score: 0 }
      ]
      this.strengths = ['数据加载中...']
      this.suggestions = ['数据加载中...']
      this.resources = []
      this.historyScores = [0]
    },
    initializeModuleScores() {
      // 保留原有的初始化逻辑作为备用（用于无接口数据时的占位展示）
      this.moduleScores = [
        { name: '听力理解', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '故事复述', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '听力简答', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '模拟通话', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' },
        { name: '口语面试', score: 0, duration: '0分钟', accuracy: 0, fluency: '—' }
      ]
    },
    
    getScoreClass(score) {
      if (score >= 90) return 'excellent'
      if (score >= 80) return 'good'
      if (score >= 70) return 'pass'
      return 'fail'
    },
    
    getModuleLevel(score) {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '合格'
      return '不合格'
    },
    
    getHistoryDate(index) {
      const dates = ['12-01', '12-08', '12-15', '12-22', '01-15']
      return dates[index] || ''
    },
    
    openResource(resource) {
      uni.navigateTo({
        url: resource.url
      })
    },
    
    viewCertificate() {
      if (this.overallScore >= 70) {
        uni.navigateTo({
          url: `/pages/certificate/index?score=${this.overallScore}&level=${this.examLevel}`
        })
      } else {
        uni.showToast({
          title: '成绩未达到证书要求',
          icon: 'none'
        })
      }
    },
    
    downloadReport() {
      uni.showLoading({
        title: '生成报告中...'
      })
      
      // 模拟下载过程
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '报告已保存到相册',
          icon: 'success'
        })
      }, 2000)
    },
    
    shareResult() {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: 'https://example.com/result',
        title: `我在ICAO4考试中获得了${this.overallScore}分！`,
        summary: `${this.examTypeText}成绩：${this.overallScore}分 - ${this.scoreLevel}`,
        imageUrl: '/static/images/share-logo.png',
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        }
      })
    },
    
    retakeExam() {
      uni.showModal({
        title: '重新考试',
        content: '确定要重新参加考试吗？',
        success: (res) => {
          if (res.confirm) {
            const examPage = this.examLevel === 'primary' ? 'primary' : 'secondary'
            uni.redirectTo({
              url: `/pages/exams/preexam?target=${examPage}`
            })
          }
        }
      })
    },
    
    goHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    
    goTraining() {
      uni.switchTab({
        url: '/pages/training/index'
      })
    }
  }
}
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10rpx;
}

.exam-type {
  color: #667eea;
  font-size: 28rpx;
}

.overall-score-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.score-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border: 3rpx solid #2196f3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.score-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #1976d2;
}

.score-label {
  font-size: 24rpx;
  color: #1976d2;
  opacity: 0.8;
}

.score-info {
  flex: 1;
}

.score-level {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.score-level.优秀 {
  color: #27ae60;
}

.score-level.良好 {
  color: #f39c12;
}

.score-level.合格 {
  color: #3498db;
}

.score-level.不合格 {
  color: #e74c3c;
}

.score-desc {
  color: #7f8c8d;
  font-size: 26rpx;
  margin-bottom: 15rpx;
  line-height: 1.4;
}

.exam-date {
  color: #95a5a6;
  font-size: 24rpx;
}

.analysis-section, .radar-section, .report-section, .history-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.title-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.title-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #2c3e50;
}

.module-scores {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.module-item {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.module-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.module-score {
  font-size: 28rpx;
  font-weight: bold;
}

.module-score.excellent {
  color: #27ae60;
}

.module-score.good {
  color: #f39c12;
}

.module-score.pass {
  color: #3498db;
}

.module-score.fail {
  color: #e74c3c;
}

.module-progress {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #e9ecef;
  border-radius: 4rpx;
  overflow: hidden;
  margin-right: 15rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-fill.excellent {
  background: #27ae60;
}

.progress-fill.good {
  background: #f39c12;
}

.progress-fill.pass {
  background: #3498db;
}

.progress-fill.fail {
  background: #e74c3c;
}

.module-level {
  font-size: 24rpx;
  color: #6c757d;
  min-width: 60rpx;
}

.module-details {
  display: flex;
  justify-content: space-between;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  font-size: 22rpx;
  color: #6c757d;
  margin-bottom: 5rpx;
}

.detail-value {
  font-size: 24rpx;
  color: #2c3e50;
  font-weight: bold;
}

.ability-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.ability-item {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 20rpx;
  text-align: center;
}

.ability-name {
  font-size: 26rpx;
  color: #2c3e50;
  margin-bottom: 15rpx;
}

.ability-bars {
  display: flex;
  justify-content: center;
  gap: 5rpx;
  margin-bottom: 10rpx;
}

.ability-bar {
  width: 8rpx;
  height: 30rpx;
  background: #e9ecef;
  border-radius: 2rpx;
}

.ability-bar.active {
  background: #64b5f6;
}

.ability-score {
  font-size: 24rpx;
  color: #1976d2;
  font-weight: bold;
}

.report-card {
  margin-bottom: 25rpx;
}

.report-header {
  margin-bottom: 15rpx;
}

.report-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.report-item {
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  border-left: 4rpx solid;
}

.report-item.positive {
  background: #d4edda;
  border-color: #27ae60;
}

.report-item.suggestion {
  background: #fff3cd;
  border-color: #f39c12;
}

.item-text {
  color: #2c3e50;
  font-size: 26rpx;
  line-height: 1.5;
}

.resource-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5rpx;
}

.resource-desc {
  font-size: 24rpx;
  color: #6c757d;
}

.resource-arrow {
  color: #1976d2;
  font-size: 28rpx;
  font-weight: bold;
}

.chart-header {
  text-align: center;
  margin-bottom: 20rpx;
}

.chart-title {
  font-size: 26rpx;
  color: #6c757d;
}

.chart-content {
  margin-bottom: 20rpx;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 250rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 5rpx;
}

.bar-fill {
  width: 30rpx;
  background: #64b5f6;
  border-radius: 4rpx 4rpx 0 0;
  margin-bottom: 10rpx;
  transition: height 0.3s ease;
}

.bar-fill.current {
  background: #e74c3c;
}

.bar-label {
  font-size: 22rpx;
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.bar-date {
  font-size: 20rpx;
  color: #6c757d;
}

.trend-info {
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  border-radius: 10rpx;
  padding: 20rpx;
}

.trend-item {
  text-align: center;
}

.trend-label {
  font-size: 22rpx;
  color: #6c757d;
  margin-bottom: 5rpx;
}

.trend-value {
  font-size: 26rpx;
  font-weight: bold;
}

.trend-value.positive {
  color: #27ae60;
}

.trend-value.negative {
  color: #e74c3c;
}

.trend-value.neutral {
  color: #6c757d;
}

.action-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25rpx;
  border-radius: 15rpx;
  border: none;
  min-height: 120rpx;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.btn-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.btn-text {
  font-size: 24rpx;
  font-weight: bold;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.footer-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #f8f9fa;
  border: none;
  border-radius: 15rpx;
}

.footer-icon {
  font-size: 28rpx;
  margin-bottom: 5rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #6c757d;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-text {
  font-size: 28rpx;
  color: #6c757d;
}
</style>
