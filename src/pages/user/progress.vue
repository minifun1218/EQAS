<template>
  <view class="progress-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">学习进度</text>
      <view class="nav-right"></view>
    </view>

    <!-- 总体统计卡片 -->
    <view class="stats-overview">
      <view class="overview-card">
        <view class="overview-header">
          <text class="overview-title">学习概览</text>
          <text class="overview-period">本月</text>
        </view>
        <view class="overview-stats">
          <view class="stat-item">
            <text class="stat-number">{{ overviewStats.studyDays }}</text>
            <text class="stat-label">学习天数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ overviewStats.studyHours }}</text>
            <text class="stat-label">学习时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ overviewStats.completedLessons }}</text>
            <text class="stat-label">完成课程</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ overviewStats.averageScore }}%</text>
            <text class="stat-label">平均分数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习进度 -->
    <view class="progress-section">
      <text class="section-title">课程进度</text>
      <view class="progress-list">
        <view 
          v-for="course in courseProgress" 
          :key="course.id"
          class="progress-item"
          @click="viewCourseDetail(course)"
        >
          <view class="progress-info">
            <view class="course-icon" :style="{backgroundColor: course.color}">
              <text class="course-emoji">{{ course.icon }}</text>
            </view>
            <view class="course-details">
              <text class="course-name">{{ course.name }}</text>
              <text class="course-desc">{{ course.completedLessons }}/{{ course.totalLessons }} 课程</text>
            </view>
            <view class="progress-percent">
              <text class="percent-text">{{ course.progress }}%</text>
            </view>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{width: course.progress + '%', backgroundColor: course.color}"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习日历 -->
    <view class="calendar-section">
      <view class="calendar-header">
        <text class="section-title">学习日历</text>
        <view class="calendar-nav">
          <text class="nav-btn" @click="prevMonth">‹</text>
          <text class="calendar-month">{{ currentMonth }}</text>
          <text class="nav-btn" @click="nextMonth">›</text>
        </view>
      </view>
      <view class="calendar-grid">
        <view class="calendar-weekdays">
          <text v-for="day in weekdays" :key="day" class="weekday">{{ day }}</text>
        </view>
        <view class="calendar-days">
          <view 
            v-for="day in calendarDays" 
            :key="day.date"
            class="calendar-day"
            :class="{
              'other-month': day.otherMonth,
              'today': day.isToday,
              'studied': day.studied,
              'streak': day.streak
            }"
          >
            <text class="day-number">{{ day.day }}</text>
            <view v-if="day.studied" class="study-indicator"></view>
          </view>
        </view>
      </view>
      <view class="calendar-legend">
        <view class="legend-item">
          <view class="legend-dot studied"></view>
          <text class="legend-text">已学习</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot streak"></view>
          <text class="legend-text">连续学习</text>
        </view>
      </view>
    </view>

    <!-- 成就展示 -->
    <view class="achievements-section">
      <text class="section-title">学习成就</text>
      <view class="achievements-grid">
        <view 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{unlocked: achievement.unlocked}"
          @click="viewAchievement(achievement)"
        >
          <view class="achievement-icon">
            <text class="achievement-emoji">{{ achievement.icon }}</text>
          </view>
          <text class="achievement-name">{{ achievement.name }}</text>
          <text class="achievement-desc">{{ achievement.description }}</text>
          <view v-if="achievement.unlocked" class="achievement-date">
            <text class="date-text">{{ achievement.unlockedDate }}</text>
          </view>
          <view v-else class="achievement-progress">
            <view class="progress-bar-small">
              <view class="progress-fill-small" :style="{width: achievement.progress + '%'}"></view>
            </view>
            <text class="progress-text-small">{{ achievement.current }}/{{ achievement.target }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习统计图表 -->
    <view class="charts-section">
      <text class="section-title">学习统计</text>
      <view class="chart-tabs">
        <view 
          v-for="tab in chartTabs" 
          :key="tab.key"
          class="chart-tab"
          :class="{active: activeTab === tab.key}"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.name }}</text>
        </view>
      </view>
      
      <!-- 学习时长图表 -->
      <view v-if="activeTab === 'time'" class="chart-container">
        <view class="chart-header">
          <text class="chart-title">每日学习时长</text>
          <text class="chart-subtitle">最近7天</text>
        </view>
        <view class="time-chart">
          <view 
            v-for="(item, index) in timeChartData" 
            :key="index"
            class="chart-bar"
          >
            <view class="bar-container">
              <view class="bar-fill" :style="{height: (item.minutes / 120) * 200 + 'rpx'}"></view>
            </view>
            <text class="bar-label">{{ item.day }}</text>
            <text class="bar-value">{{ item.minutes }}min</text>
          </view>
        </view>
      </view>
      
      <!-- 正确率图表 -->
      <view v-if="activeTab === 'accuracy'" class="chart-container">
        <view class="chart-header">
          <text class="chart-title">练习正确率</text>
          <text class="chart-subtitle">最近7天</text>
        </view>
        <view class="accuracy-chart">
          <view 
            v-for="(item, index) in accuracyChartData" 
            :key="index"
            class="accuracy-item"
          >
            <view class="accuracy-info">
              <text class="accuracy-day">{{ item.day }}</text>
              <text class="accuracy-percent">{{ item.accuracy }}%</text>
            </view>
            <view class="accuracy-bar">
              <view class="accuracy-fill" :style="{width: item.accuracy + '%'}"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 学习分布图表 -->
      <view v-if="activeTab === 'distribution'" class="chart-container">
        <view class="chart-header">
          <text class="chart-title">学习内容分布</text>
          <text class="chart-subtitle">本月</text>
        </view>
        <view class="distribution-chart">
          <view 
            v-for="item in distributionData" 
            :key="item.type"
            class="distribution-item"
          >
            <view class="distribution-info">
              <view class="distribution-color" :style="{backgroundColor: item.color}"></view>
              <text class="distribution-name">{{ item.name }}</text>
              <text class="distribution-percent">{{ item.percent }}%</text>
            </view>
            <view class="distribution-bar">
              <view class="distribution-fill" :style="{width: item.percent + '%', backgroundColor: item.color}"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习目标 -->
    <view class="goals-section">
      <view class="goals-header">
        <text class="section-title">学习目标</text>
        <text class="edit-btn" @click="editGoals">编辑</text>
      </view>
      <view class="goals-list">
        <view 
          v-for="goal in learningGoals" 
          :key="goal.id"
          class="goal-item"
        >
          <view class="goal-info">
            <text class="goal-name">{{ goal.name }}</text>
            <text class="goal-progress">{{ goal.current }}/{{ goal.target }} {{ goal.unit }}</text>
          </view>
          <view class="goal-bar">
            <view class="goal-fill" :style="{width: (goal.current / goal.target * 100) + '%'}"></view>
          </view>
          <text class="goal-percent">{{ Math.round(goal.current / goal.target * 100) }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { studyApi, analyticsApi } from '@/api/index.js'

export default {
  name: 'Progress',
  data() {
    return {
      overviewStats: {
        studyDays: 0,
        studyHours: 0,
        completedLessons: 0,
        averageScore: 0
      },
      courseProgress: [],
      loading: true,
      currentMonth: '',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      achievements: [],
      chartTabs: [
        { key: 'time', name: '学习时长' },
        { key: 'accuracy', name: '正确率' },
        { key: 'distribution', name: '内容分布' }
      ],
      activeTab: 'time',
      timeChartData: [],
      accuracyChartData: [],
      distributionData: [],
      learningGoals: []
    }
  },
  
  onLoad() {
    this.loading = true
    this.initCurrentMonth()
    Promise.all([
      this.loadOverviewStats(),
      this.loadCourseProgress(),
      this.loadAchievements(),
      this.loadChartData(),
      this.loadLearningGoals(),
      this.generateCalendar()
    ]).then(() => {
      this.loading = false
    }).catch(error => {
      console.error('加载数据失败:', error)
      this.loading = false
      uni.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    })
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    viewCourseDetail(course) {
      uni.showToast({
        title: `查看${course.name}详情`,
        icon: 'none'
      })
    },
    
    async prevMonth() {
      try {
        const [year, month] = this.currentMonth.replace('年', '-').replace('月', '').split('-')
        let newYear = parseInt(year)
        let newMonth = parseInt(month) - 1
        
        if (newMonth < 1) {
          newMonth = 12
          newYear -= 1
        }
        
        this.currentMonth = `${newYear}年${newMonth}月`
        await this.generateCalendar()
      } catch (error) {
        console.error('切换月份失败:', error)
      }
    },
    
    async nextMonth() {
      try {
        const [year, month] = this.currentMonth.replace('年', '-').replace('月', '').split('-')
        let newYear = parseInt(year)
        let newMonth = parseInt(month) + 1
        
        if (newMonth > 12) {
          newMonth = 1
          newYear += 1
        }
        
        this.currentMonth = `${newYear}年${newMonth}月`
        await this.generateCalendar()
      } catch (error) {
        console.error('切换月份失败:', error)
      }
    },
    
    async generateCalendar() {
      try {
        // 生成日历数据
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())
        
        // 获取学习日期数据
        const response = await analyticsApi.getStudyCalendar({
          year: year,
          month: month + 1 // API需要1-12的月份
        })
        
        let studiedDates = []
        let streakDates = []
        
        if (response.code === 200) {
          studiedDates = response.data.studiedDates || []
          streakDates = response.data.streakDates || []
        }
        
        const days = []
        
        for (let i = 0; i < 42; i++) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          const dateStr = date.getDate()
          
          const day = {
            date: date.toISOString().split('T')[0],
            day: date.getDate(),
            otherMonth: date.getMonth() !== month,
            isToday: date.toDateString() === today.toDateString(),
            studied: studiedDates.includes(dateStr) && date.getMonth() === month,
            streak: streakDates.includes(dateStr) && date.getMonth() === month
          }
          
          days.push(day)
        }
        
        this.calendarDays = days
      } catch (error) {
        console.error('获取日历数据失败:', error)
        // 生成空日历
        this.generateEmptyCalendar()
      }
    },
    
    generateEmptyCalendar() {
      // 生成空日历数据作为降级方案
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const day = {
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          otherMonth: date.getMonth() !== month,
          isToday: date.toDateString() === today.toDateString(),
          studied: false,
          streak: false
        }
        
        days.push(day)
      }
      
      this.calendarDays = days
    },
    
    async loadOverviewStats() {
      try {
        const response = await analyticsApi.getStudyOverview()
        if (response.code === 200) {
          this.overviewStats = response.data || {
            studyDays: 0,
            studyHours: 0,
            completedLessons: 0,
            averageScore: 0
          }
        }
      } catch (error) {
        console.error('获取学习概览失败:', error)
      }
    },
    
    async loadCourseProgress() {
      try {
        const response = await studyApi.getCourseProgress()
        if (response.code === 200) {
          this.courseProgress = response.data || []
        }
      } catch (error) {
        console.error('获取课程进度失败:', error)
      }
    },
    
    async loadAchievements() {
      try {
        const response = await analyticsApi.getAchievements()
        if (response.code === 200) {
          this.achievements = response.data || []
        }
      } catch (error) {
        console.error('获取成就数据失败:', error)
      }
    },
    
    async loadChartData() {
      try {
        // 获取图表数据
        const timeResponse = await analyticsApi.getStudyTimeChart()
        if (timeResponse.code === 200) {
          this.timeChartData = timeResponse.data || []
        }
        
        const accuracyResponse = await analyticsApi.getAccuracyChart()
        if (accuracyResponse.code === 200) {
          this.accuracyChartData = accuracyResponse.data || []
        }
        
        const distributionResponse = await analyticsApi.getStudyDistribution()
        if (distributionResponse.code === 200) {
          this.distributionData = distributionResponse.data || []
        }
      } catch (error) {
        console.error('获取图表数据失败:', error)
      }
    },
    
    async loadLearningGoals() {
      try {
        const response = await studyApi.getLearningGoals()
        if (response.code === 200) {
          this.learningGoals = response.data || []
        }
      } catch (error) {
        console.error('获取学习目标失败:', error)
      }
    },
    
    viewAchievement(achievement) {
      const status = achievement.unlocked ? '已解锁' : '未解锁'
      const message = achievement.unlocked 
        ? `${achievement.name}\n${achievement.description}\n解锁时间: ${achievement.unlockedDate}`
        : `${achievement.name}\n${achievement.description}\n进度: ${achievement.current}/${achievement.target}`
      
      uni.showModal({
        title: status,
        content: message,
        showCancel: false
      })
    },
    
    switchTab(tab) {
      this.activeTab = tab
    },
    
    editGoals() {
      uni.navigateTo({
        url: '/pages/study/goals'
      })
    },
    
    initCurrentMonth() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      this.currentMonth = `${year}年${month}月`
    },
    
    async refreshData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadOverviewStats(),
          this.loadCourseProgress(),
          this.loadAchievements(),
          this.loadChartData(),
          this.loadLearningGoals(),
          this.generateCalendar()
        ])
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('刷新数据失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.progress-container {
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

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #007AFF;
  font-weight: 300;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.nav-right {
  width: 60rpx;
}

/* 总体统计 */
.stats-overview {
  padding: 32rpx;
}

.overview-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  color: #ffffff;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.overview-title {
  font-size: 36rpx;
  font-weight: 600;
}

.overview-period {
  font-size: 24rpx;
  opacity: 0.8;
}

.overview-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

/* 课程进度 */
.progress-section {
  margin: 0 32rpx 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
}

.progress-list {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.progress-item {
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f8f9fa;
}

.progress-item:last-child {
  border-bottom: none;
}

.progress-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.course-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.course-emoji {
  font-size: 32rpx;
}

.course-details {
  flex: 1;
}

.course-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.course-desc {
  font-size: 24rpx;
  color: #666666;
}

.progress-percent {
  text-align: right;
}

.percent-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #007AFF;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 学习日历 */
.calendar-section {
  margin: 0 32rpx 40rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.nav-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #666666;
}

.calendar-month {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.calendar-grid {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.weekday {
  text-align: center;
  font-size: 24rpx;
  color: #666666;
  padding: 8rpx 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}

.calendar-day {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.calendar-day.other-month .day-number {
  color: #cccccc;
}

.calendar-day.today {
  background: #007AFF;
}

.calendar-day.today .day-number {
  color: #ffffff;
}

.calendar-day.studied {
  background: #e8f5e8;
}

.calendar-day.streak {
  background: #ffe8e8;
}

.day-number {
  font-size: 24rpx;
  color: #333333;
}

.study-indicator {
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 8rpx;
  height: 8rpx;
  background: #52c41a;
  border-radius: 50%;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 32rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.legend-dot.studied {
  background: #52c41a;
}

.legend-dot.streak {
  background: #ff4757;
}

.legend-text {
  font-size: 24rpx;
  color: #666666;
}

/* 成就展示 */
.achievements-section {
  margin: 0 32rpx 40rpx;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.achievement-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  border: 2rpx solid #f0f0f0;
}

.achievement-card.unlocked {
  border-color: #52c41a;
  background: #f6ffed;
}

.achievement-icon {
  width: 60rpx;
  height: 60rpx;
  margin: 0 auto 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
}

.achievement-card.unlocked .achievement-icon {
  background: #e8f5e8;
}

.achievement-emoji {
  font-size: 32rpx;
}

.achievement-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.achievement-desc {
  display: block;
  font-size: 22rpx;
  color: #666666;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.achievement-date {
  font-size: 20rpx;
  color: #52c41a;
}

.achievement-progress {
  margin-top: 12rpx;
}

.progress-bar-small {
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill-small {
  height: 100%;
  background: #007AFF;
  border-radius: 3rpx;
}

.progress-text-small {
  font-size: 20rpx;
  color: #666666;
}

/* 图表区域 */
.charts-section {
  margin: 0 32rpx 40rpx;
}

.chart-tabs {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.chart-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border-radius: 12rpx;
}

.chart-tab.active {
  background: #007AFF;
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
}

.chart-tab.active .tab-text {
  color: #ffffff;
}

.chart-container {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.chart-header {
  margin-bottom: 32rpx;
}

.chart-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.chart-subtitle {
  font-size: 24rpx;
  color: #666666;
}

/* 时长图表 */
.time-chart {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 240rpx;
  padding: 0 16rpx;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8rpx;
}

.bar-container {
  height: 200rpx;
  width: 32rpx;
  display: flex;
  align-items: end;
  margin-bottom: 16rpx;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4rpx;
  min-height: 8rpx;
}

.bar-label {
  font-size: 20rpx;
  color: #666666;
  margin-bottom: 4rpx;
}

.bar-value {
  font-size: 18rpx;
  color: #999999;
}

/* 正确率图表 */
.accuracy-chart {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.accuracy-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.accuracy-info {
  width: 120rpx;
  display: flex;
  justify-content: space-between;
}

.accuracy-day {
  font-size: 24rpx;
  color: #333333;
}

.accuracy-percent {
  font-size: 24rpx;
  font-weight: 600;
  color: #007AFF;
}

.accuracy-bar {
  flex: 1;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.accuracy-fill {
  height: 100%;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 8rpx;
}

/* 分布图表 */
.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.distribution-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.distribution-color {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.distribution-name {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.distribution-percent {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.distribution-bar {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  border-radius: 6rpx;
}

/* 学习目标 */
.goals-section {
  margin: 0 32rpx 40rpx;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.edit-btn {
  font-size: 28rpx;
  color: #007AFF;
}

.goals-list {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
}

.goal-item {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.goal-item:last-child {
  margin-bottom: 0;
}

.goal-info {
  width: 200rpx;
  margin-right: 24rpx;
}

.goal-name {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.goal-progress {
  font-size: 24rpx;
  color: #666666;
}

.goal-bar {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.goal-fill {
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 6rpx;
}

.goal-percent {
  font-size: 24rpx;
  font-weight: 600;
  color: #007AFF;
  min-width: 60rpx;
  text-align: right;
}
</style>