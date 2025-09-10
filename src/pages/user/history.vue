<template>
  <view class="history-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">练习历史</text>
      <view class="nav-right" @click="showFilterModal">
        <text class="filter-icon">⚙</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="overview-card">
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-number">{{ totalSessions }}</text>
            <text class="stat-label">总练习次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ totalTime }}</text>
            <text class="stat-label">总练习时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ averageScore }}%</text>
            <text class="stat-label">平均分数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ bestScore }}%</text>
            <text class="stat-label">最高分数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间筛选 -->
    <view class="time-filter">
      <scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
        <view class="time-tabs">
          <view 
            v-for="tab in timeTabs" 
            :key="tab.key"
            class="time-tab"
            :class="{active: activeTimeFilter === tab.key}"
            @click="switchTimeFilter(tab.key)"
          >
            <text class="tab-text">{{ tab.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 练习记录列表 -->
    <view class="history-list">
      <view v-if="filteredHistory.length === 0" class="empty-state">
        <view class="empty-icon">📊</view>
        <text class="empty-title">暂无练习记录</text>
        <text class="empty-desc">开始练习后，记录会显示在这里</text>
      </view>
      
      <!-- 按日期分组显示 -->
      <view v-for="group in groupedHistory" :key="group.date" class="date-group">
        <view class="date-header">
          <text class="date-text">{{ formatGroupDate(group.date) }}</text>
          <text class="date-count">{{ group.sessions.length }} 次练习</text>
        </view>
        
        <view 
          v-for="session in group.sessions" 
          :key="session.id"
          class="history-item"
          @click="viewSessionDetail(session)"
        >
          <view class="session-header">
            <view class="session-type">
              <view class="type-icon" :style="{backgroundColor: getTypeColor(session.type)}">
                <text class="type-emoji">{{ getTypeIcon(session.type) }}</text>
              </view>
              <view class="type-info">
                <text class="type-name">{{ getTypeName(session.type) }}</text>
                <text class="session-time">{{ formatTime(session.startTime) }}</text>
              </view>
            </view>
            
            <view class="session-score">
              <text class="score-text" :class="getScoreClass(session.score)">{{ session.score }}%</text>
            </view>
          </view>
          
          <view class="session-stats">
            <view class="stat-row">
              <view class="stat-item-small">
                <text class="stat-icon">⏱</text>
                <text class="stat-text">{{ formatDuration(session.duration) }}</text>
              </view>
              <view class="stat-item-small">
                <text class="stat-icon">📝</text>
                <text class="stat-text">{{ session.totalQuestions }} 题</text>
              </view>
              <view class="stat-item-small">
                <text class="stat-icon">✓</text>
                <text class="stat-text">{{ session.correctAnswers }} 对</text>
              </view>
              <view class="stat-item-small">
                <text class="stat-icon">✗</text>
                <text class="stat-text">{{ session.wrongAnswers }} 错</text>
              </view>
            </view>
          </view>
          
          <view v-if="session.achievements && session.achievements.length > 0" class="session-achievements">
            <text class="achievement-label">获得成就:</text>
            <view class="achievement-list">
              <view 
                v-for="achievement in session.achievements" 
                :key="achievement.id"
                class="achievement-badge"
              >
                <text class="achievement-icon">{{ achievement.icon }}</text>
                <text class="achievement-name">{{ achievement.name }}</text>
              </view>
            </view>
          </view>
          
          <view class="session-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{width: session.score + '%'}"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilter" class="modal-overlay" @click="hideFilterModal">
      <view class="filter-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">筛选条件</text>
          <view class="close-btn" @click="hideFilterModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view class="filter-content">
          <!-- 练习类型筛选 -->
          <view class="filter-section">
            <text class="filter-title">练习类型</text>
            <view class="filter-options">
              <view 
                v-for="type in typeOptions" 
                :key="type.key"
                class="filter-option"
                :class="{active: selectedTypes.includes(type.key)}"
                @click="toggleType(type.key)"
              >
                <view class="option-icon" :style="{backgroundColor: type.color}">
                  <text class="option-emoji">{{ type.icon }}</text>
                </view>
                <text class="option-text">{{ type.name }}</text>
                <text v-if="selectedTypes.includes(type.key)" class="check-icon">✓</text>
              </view>
            </view>
          </view>
          
          <!-- 分数范围筛选 -->
          <view class="filter-section">
            <text class="filter-title">分数范围</text>
            <view class="score-ranges">
              <view 
                v-for="range in scoreRanges" 
                :key="range.key"
                class="score-range"
                :class="{active: selectedScoreRange === range.key}"
                @click="selectScoreRange(range.key)"
              >
                <text class="range-text">{{ range.name }}</text>
                <text v-if="selectedScoreRange === range.key" class="check-icon">✓</text>
              </view>
            </view>
          </view>
          
          <!-- 排序方式 -->
          <view class="filter-section">
            <text class="filter-title">排序方式</text>
            <view class="sort-options">
              <view 
                v-for="option in sortOptions" 
                :key="option.key"
                class="sort-option"
                :class="{active: selectedSort === option.key}"
                @click="selectSort(option.key)"
              >
                <text class="option-text">{{ option.name }}</text>
                <text v-if="selectedSort === option.key" class="check-icon">✓</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="filter-actions">
          <view class="filter-btn secondary" @click="resetFilters">
            <text class="btn-text">重置</text>
          </view>
          <view class="filter-btn primary" @click="applyFilters">
            <text class="btn-text">应用</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 练习详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @click="hideDetailModal">
      <view class="detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">练习详情</text>
          <view class="close-btn" @click="hideDetailModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view v-if="selectedSession" class="detail-content">
          <!-- 基本信息 -->
          <view class="detail-section">
            <view class="section-header">
              <view class="section-icon" :style="{backgroundColor: getTypeColor(selectedSession.type)}">
                <text class="section-emoji">{{ getTypeIcon(selectedSession.type) }}</text>
              </view>
              <view class="section-info">
                <text class="section-title">{{ getTypeName(selectedSession.type) }}</text>
                <text class="section-subtitle">{{ formatDateTime(selectedSession.startTime) }}</text>
              </view>
            </view>
          </view>
          
          <!-- 成绩统计 -->
          <view class="detail-section">
            <text class="detail-label">成绩统计</text>
            <view class="score-details">
              <view class="score-item">
                <text class="score-label">总分</text>
                <text class="score-value" :class="getScoreClass(selectedSession.score)">{{ selectedSession.score }}%</text>
              </view>
              <view class="score-item">
                <text class="score-label">用时</text>
                <text class="score-value">{{ formatDuration(selectedSession.duration) }}</text>
              </view>
              <view class="score-item">
                <text class="score-label">题目数</text>
                <text class="score-value">{{ selectedSession.totalQuestions }}</text>
              </view>
              <view class="score-item">
                <text class="score-label">正确率</text>
                <text class="score-value">{{ Math.round((selectedSession.correctAnswers / selectedSession.totalQuestions) * 100) }}%</text>
              </view>
            </view>
          </view>
          
          <!-- 答题分析 -->
          <view class="detail-section">
            <text class="detail-label">答题分析</text>
            <view class="answer-analysis">
              <view class="analysis-item correct">
                <view class="analysis-icon">✓</view>
                <text class="analysis-text">正确 {{ selectedSession.correctAnswers }} 题</text>
                <text class="analysis-percent">{{ Math.round((selectedSession.correctAnswers / selectedSession.totalQuestions) * 100) }}%</text>
              </view>
              <view class="analysis-item wrong">
                <view class="analysis-icon">✗</view>
                <text class="analysis-text">错误 {{ selectedSession.wrongAnswers }} 题</text>
                <text class="analysis-percent">{{ Math.round((selectedSession.wrongAnswers / selectedSession.totalQuestions) * 100) }}%</text>
              </view>
            </view>
          </view>
          
          <!-- 知识点分析 -->
          <view v-if="selectedSession.knowledgePoints" class="detail-section">
            <text class="detail-label">知识点掌握情况</text>
            <view class="knowledge-points">
              <view 
                v-for="point in selectedSession.knowledgePoints" 
                :key="point.name"
                class="knowledge-item"
              >
                <text class="knowledge-name">{{ point.name }}</text>
                <view class="knowledge-progress">
                  <view class="knowledge-bar">
                    <view class="knowledge-fill" :style="{width: point.mastery + '%'}"></view>
                  </view>
                  <text class="knowledge-percent">{{ point.mastery }}%</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 获得成就 -->
          <view v-if="selectedSession.achievements && selectedSession.achievements.length > 0" class="detail-section">
            <text class="detail-label">获得成就</text>
            <view class="detail-achievements">
              <view 
                v-for="achievement in selectedSession.achievements" 
                :key="achievement.id"
                class="detail-achievement"
              >
                <view class="achievement-icon-large">{{ achievement.icon }}</view>
                <view class="achievement-info">
                  <text class="achievement-name-large">{{ achievement.name }}</text>
                  <text class="achievement-desc">{{ achievement.description }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="detail-actions">
          <view class="detail-btn secondary" @click="shareSession">
            <text class="btn-text">分享成绩</text>
          </view>
          <view class="detail-btn primary" @click="retrySession">
            <text class="btn-text">再次练习</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { analyticsApi, studyApi } from '@/api/index.js'

export default {
  name: 'History',
  data() {
    return {
      activeTimeFilter: 'all',
      showFilter: false,
      showDetailModal: false,
      selectedSession: null,
      selectedTypes: [],
      selectedScoreRange: 'all',
      selectedSort: 'time',
      
      timeTabs: [
        { key: 'all', name: '全部' },
        { key: 'today', name: '今天' },
        { key: 'week', name: '本周' },
        { key: 'month', name: '本月' }
      ],
      
      typeOptions: [
        { key: 'listening', name: '听力理解', icon: '🎧', color: '#4facfe' },
        { key: 'speaking', name: '口语表达', icon: '🗣️', color: '#43e97b' },
        { key: 'vocabulary', name: '词汇学习', icon: '📚', color: '#fa709a' },
        { key: 'grammar', name: '语法练习', icon: '📝', color: '#feca57' },
        { key: 'reading', name: '阅读理解', icon: '📖', color: '#ff6b6b' },
        { key: 'exam', name: '模拟考试', icon: '🎯', color: '#a55eea' }
      ],
      
      scoreRanges: [
        { key: 'all', name: '全部分数' },
        { key: 'excellent', name: '优秀 (90-100%)' },
        { key: 'good', name: '良好 (80-89%)' },
        { key: 'average', name: '一般 (70-79%)' },
        { key: 'poor', name: '较差 (60-69%)' },
        { key: 'fail', name: '不及格 (<60%)' }
      ],
      
      sortOptions: [
        { key: 'time', name: '按时间排序' },
        { key: 'score', name: '按分数排序' },
        { key: 'duration', name: '按用时排序' },
        { key: 'type', name: '按类型排序' }
      ],
      
      practiceHistory: [],
      loading: false
    }
  },
  
  computed: {
    totalSessions() {
      return this.practiceHistory.length
    },
    
    totalTime() {
      const total = this.practiceHistory.reduce((sum, session) => sum + session.duration, 0)
      return this.formatDuration(total)
    },
    
    averageScore() {
      if (this.practiceHistory.length === 0) return 0
      const total = this.practiceHistory.reduce((sum, session) => sum + session.score, 0)
      return Math.round(total / this.practiceHistory.length)
    },
    
    bestScore() {
      if (this.practiceHistory.length === 0) return 0
      return Math.max(...this.practiceHistory.map(session => session.score))
    },
    
    filteredHistory() {
      let filtered = [...this.practiceHistory]
      
      // 时间筛选
      const now = new Date()
      switch (this.activeTimeFilter) {
        case 'today':
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate.toDateString() === now.toDateString()
          })
          break
        case 'week':
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= weekStart
          })
          break
        case 'month':
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear()
          })
          break
      }
      
      // 类型筛选
      if (this.selectedTypes.length > 0) {
        filtered = filtered.filter(session => this.selectedTypes.includes(session.type))
      }
      
      // 分数筛选
      switch (this.selectedScoreRange) {
        case 'excellent':
          filtered = filtered.filter(session => session.score >= 90)
          break
        case 'good':
          filtered = filtered.filter(session => session.score >= 80 && session.score < 90)
          break
        case 'average':
          filtered = filtered.filter(session => session.score >= 70 && session.score < 80)
          break
        case 'poor':
          filtered = filtered.filter(session => session.score >= 60 && session.score < 70)
          break
        case 'fail':
          filtered = filtered.filter(session => session.score < 60)
          break
      }
      
      // 排序
      switch (this.selectedSort) {
        case 'time':
          filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          break
        case 'score':
          filtered.sort((a, b) => b.score - a.score)
          break
        case 'duration':
          filtered.sort((a, b) => b.duration - a.duration)
          break
        case 'type':
          filtered.sort((a, b) => a.type.localeCompare(b.type))
          break
      }
      
      return filtered
    },
    
    groupedHistory() {
      const groups = {}
      
      this.filteredHistory.forEach(session => {
        const date = new Date(session.startTime).toDateString()
        if (!groups[date]) {
          groups[date] = {
            date,
            sessions: []
          }
        }
        groups[date].sessions.push(session)
      })
      
      return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  },
  onLoad() {
    this.loadPracticeHistory()
  },
  methods: {
    async loadPracticeHistory() {
      this.loading = true
      try {
        const params = {
          timeRange: this.activeTimeFilter,
          types: this.selectedTypes.length > 0 ? this.selectedTypes : undefined,
          scoreRange: this.selectedScoreRange !== 'all' ? this.selectedScoreRange : undefined,
          sort: this.selectedSort
        }
        
        const response = await analyticsApi.getPracticeHistory(params)
        
        if (response.code === 200) {
          this.practiceHistory = response.data || []
        } else {
          uni.showToast({
            title: '获取历史记录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取练习历史失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    goBack() {
      uni.navigateBack()
    },
    
    async switchTimeFilter(filter) {
      if (this.activeTimeFilter === filter) return
      
      this.activeTimeFilter = filter
      await this.loadPracticeHistory()
    },
    
    showFilterModal() {
      this.showFilter = true
    },
    
    hideFilterModal() {
      this.showFilter = false
    },
    
    toggleType(type) {
      const index = this.selectedTypes.indexOf(type)
      if (index > -1) {
        this.selectedTypes.splice(index, 1)
      } else {
        this.selectedTypes.push(type)
      }
    },
    
    selectScoreRange(range) {
      this.selectedScoreRange = range
    },
    
    selectSort(sort) {
      this.selectedSort = sort
    },
    
    resetFilters() {
      this.selectedTypes = []
      this.selectedScoreRange = 'all'
      this.selectedSort = 'time'
    },
    
    async applyFilters() {
      this.hideFilterModal()
      await this.loadPracticeHistory()
    },
    
    async viewSessionDetail(session) {
      try {
        uni.showLoading({
          title: '加载中...'
        })
        
        // 获取练习详情
        const response = await analyticsApi.getPracticeDetail(session.id)
        
        if (response.code === 200) {
          this.selectedSession = response.data || session
        } else {
          this.selectedSession = session
          uni.showToast({
            title: '获取详情失败',
            icon: 'none'
          })
        }
        
        uni.hideLoading()
        this.showDetailModal = true
      } catch (error) {
        console.error('获取练习详情失败:', error)
        this.selectedSession = session
        uni.hideLoading()
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
        this.showDetailModal = true
      }
    },
    
    hideDetailModal() {
      this.showDetailModal = false
      this.selectedSession = null
    },
    
    shareSession() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    
    retrySession() {
      if (!this.selectedSession) return
      
      const typeRoutes = {
        listening: '/pages/training/listening-comprehension',
        speaking: '/pages/training/oral-interview',
        vocabulary: '/pages/training/vocabulary-meaning',
        grammar: '/pages/training/basic-listening',
        reading: '/pages/training/simple-listening',
        exam: '/pages/exams/primary'
      }
      
      const route = typeRoutes[this.selectedSession.type]
      if (route) {
        uni.navigateTo({
          url: route
        })
      }
      
      this.hideDetailModal()
    },
    
    getTypeIcon(type) {
      const icons = {
        listening: '🎧',
        speaking: '🗣️',
        vocabulary: '📚',
        grammar: '📝',
        reading: '📖',
        exam: '🎯'
      }
      return icons[type] || '📄'
    },
    
    getTypeColor(type) {
      const colors = {
        listening: '#4facfe',
        speaking: '#43e97b',
        vocabulary: '#fa709a',
        grammar: '#feca57',
        reading: '#ff6b6b',
        exam: '#a55eea'
      }
      return colors[type] || '#999999'
    },
    
    getTypeName(type) {
      const names = {
        listening: '听力理解',
        speaking: '口语表达',
        vocabulary: '词汇学习',
        grammar: '语法练习',
        reading: '阅读理解',
        exam: '模拟考试'
      }
      return names[type] || '其他'
    },
    
    getScoreClass(score) {
      if (score >= 90) return 'excellent'
      if (score >= 80) return 'good'
      if (score >= 70) return 'average'
      if (score >= 60) return 'poor'
      return 'fail'
    },
    
    formatTime(dateString) {
      const date = new Date(dateString)
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    },
    
    formatGroupDate(dateString) {
      const date = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return '今天'
      }
      if (date.toDateString() === yesterday.toDateString()) {
        return '昨天'
      }
      
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }
}
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 100rpx;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-left, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon, .filter-icon {
  font-size: 48rpx;
  color: #007AFF;
  font-weight: 300;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

/* 统计概览 */
.stats-overview {
  padding: 32rpx;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  color: #ffffff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.9;
}

/* 时间筛选 */
.time-filter {
  padding: 0 32rpx 24rpx;
}

.filter-scroll {
  width: 100%;
}

.time-tabs {
  display: flex;
  gap: 16rpx;
  white-space: nowrap;
}

.time-tab {
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 32rpx;
  border: 2rpx solid #f0f0f0;
  flex-shrink: 0;
}

.time-tab.active {
  background: #007AFF;
  border-color: #007AFF;
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
  white-space: nowrap;
}

.time-tab.active .tab-text {
  color: #ffffff;
}

/* 历史记录列表 */
.history-list {
  padding: 0 32rpx;
}

.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

/* 日期分组 */
.date-group {
  margin-bottom: 40rpx;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16rpx 16rpx;
}

.date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.date-count {
  font-size: 24rpx;
  color: #666666;
}

/* 练习记录项 */
.history-item {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid #f0f0f0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.session-type {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.type-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-emoji {
  font-size: 28rpx;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.type-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.session-time {
  font-size: 24rpx;
  color: #666666;
}

.session-score {
  text-align: right;
}

.score-text {
  font-size: 36rpx;
  font-weight: 700;
}

.score-text.excellent {
  color: #52c41a;
}

.score-text.good {
  color: #1890ff;
}

.score-text.average {
  color: #faad14;
}

.score-text.poor {
  color: #fa8c16;
}

.score-text.fail {
  color: #f5222d;
}

/* 练习统计 */
.session-stats {
  margin-bottom: 24rpx;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.stat-item-small {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  padding: 12rpx 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.stat-icon {
  font-size: 20rpx;
}

.stat-text {
  font-size: 22rpx;
  color: #666666;
}

/* 成就展示 */
.session-achievements {
  margin-bottom: 20rpx;
}

.achievement-label {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.achievement-list {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #fff7e6;
  border: 1rpx solid #ffd591;
  border-radius: 16rpx;
}

.achievement-icon {
  font-size: 20rpx;
}

.achievement-name {
  font-size: 22rpx;
  color: #fa8c16;
}

/* 进度条 */
.session-progress {
  margin-top: 16rpx;
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
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 弹窗样式 */
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

.filter-modal, .detail-modal {
  background: #ffffff;
  border-radius: 24rpx;
  width: 90vw;
  max-width: 700rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
}

.close-icon {
  font-size: 32rpx;
  color: #666666;
}

/* 筛选内容 */
.filter-content {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 40rpx;
}

.filter-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.filter-options, .score-ranges, .sort-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.filter-option, .score-range, .sort-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
}

.filter-option.active, .score-range.active, .sort-option.active {
  background: #e6f7ff;
  border-color: #1890ff;
}

.option-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.option-emoji {
  font-size: 20rpx;
}

.option-text, .range-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.check-icon {
  font-size: 24rpx;
  color: #1890ff;
}

/* 筛选操作 */
.filter-actions {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.filter-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 24rpx;
  text-align: center;
  font-size: 30rpx;
}

.filter-btn.secondary {
  background: #f8f9fa;
  color: #666666;
}

.filter-btn.primary {
  background: #007AFF;
  color: #ffffff;
}

/* 详情内容 */
.detail-content {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.section-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-emoji {
  font-size: 28rpx;
}

.section-info {
  flex: 1;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 4rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #666666;
}

.detail-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

/* 成绩详情 */
.score-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.score-label {
  font-size: 26rpx;
  color: #666666;
}

.score-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

/* 答题分析 */
.answer-analysis {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 12rpx;
}

.analysis-item.correct {
  background: #f6ffed;
}

.analysis-item.wrong {
  background: #fff2f0;
}

.analysis-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #ffffff;
}

.analysis-item.correct .analysis-icon {
  background: #52c41a;
}

.analysis-item.wrong .analysis-icon {
  background: #f5222d;
}

.analysis-text {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
}

.analysis-percent {
  font-size: 24rpx;
  font-weight: 600;
}

.analysis-item.correct .analysis-percent {
  color: #52c41a;
}

.analysis-item.wrong .analysis-percent {
  color: #f5222d;
}

/* 知识点分析 */
.knowledge-points {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.knowledge-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.knowledge-name {
  width: 120rpx;
  font-size: 24rpx;
  color: #333333;
  flex-shrink: 0;
}

.knowledge-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.knowledge-bar {
  flex: 1;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.knowledge-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4rpx;
}

.knowledge-percent {
  font-size: 22rpx;
  color: #666666;
  min-width: 60rpx;
  text-align: right;
}

/* 详情成就 */
.detail-achievements {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-achievement {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #fff7e6;
  border: 1rpx solid #ffd591;
  border-radius: 16rpx;
}

.achievement-icon-large {
  font-size: 40rpx;
}

.achievement-info {
  flex: 1;
}

.achievement-name-large {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #fa8c16;
  margin-bottom: 4rpx;
}

.achievement-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
}

/* 详情操作 */
.detail-actions {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.detail-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 24rpx;
  text-align: center;
  font-size: 30rpx;
}

.detail-btn.secondary {
  background: #f8f9fa;
  color: #666666;
}

.detail-btn.primary {
  background: #007AFF;
  color: #ffffff;
}

.btn-text {
  font-size: 30rpx;
}
</style>