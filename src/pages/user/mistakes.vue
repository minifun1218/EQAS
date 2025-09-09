<template>
  <view class="mistakes-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">错题本</text>
      <view class="nav-right" @click="clearAll">
        <text class="clear-text">清空</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-number">{{ totalMistakes }}</text>
        <text class="stats-label">总错题</text>
      </view>
      <view class="stats-item">
        <text class="stats-number">{{ reviewedCount }}</text>
        <text class="stats-label">已复习</text>
      </view>
      <view class="stats-item">
        <text class="stats-number">{{ masteredCount }}</text>
        <text class="stats-label">已掌握</text>
      </view>
      <view class="stats-item">
        <text class="stats-number">{{ accuracyRate }}%</text>
        <text class="stats-label">正确率</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-section">
      <scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
        <view class="filter-tabs">
          <view 
            v-for="filter in filterTabs" 
            :key="filter.key"
            class="filter-tab"
            :class="{active: activeFilter === filter.key}"
            @click="switchFilter(filter.key)"
          >
            <text class="filter-text">{{ filter.name }}</text>
            <text v-if="filter.count" class="filter-count">{{ filter.count }}</text>
          </view>
        </view>
      </scroll-view>
      
      <view class="sort-section">
        <view class="sort-btn" @click="showSortOptions">
          <text class="sort-text">{{ currentSort.name }}</text>
          <text class="sort-icon">▼</text>
        </view>
      </view>
    </view>

    <!-- 错题列表 -->
    <view class="mistakes-list">
      <view v-if="filteredMistakes.length === 0" class="empty-state">
        <view class="empty-icon">📝</view>
        <text class="empty-title">暂无错题</text>
        <text class="empty-desc">继续学习，遇到错题会自动收录到这里</text>
      </view>
      
      <view 
        v-for="mistake in filteredMistakes" 
        :key="mistake.id"
        class="mistake-item"
        @click="viewMistakeDetail(mistake)"
      >
        <view class="mistake-header">
          <view class="mistake-type">
            <view class="type-icon" :style="{backgroundColor: getTypeColor(mistake.type)}">
              <text class="type-emoji">{{ getTypeIcon(mistake.type) }}</text>
            </view>
            <view class="type-info">
              <text class="type-name">{{ getTypeName(mistake.type) }}</text>
              <text class="mistake-date">{{ formatDate(mistake.createdAt) }}</text>
            </view>
          </view>
          
          <view class="mistake-status">
            <view 
              class="status-badge"
              :class="mistake.status"
            >
              <text class="status-text">{{ getStatusText(mistake.status) }}</text>
            </view>
          </view>
        </view>
        
        <view class="mistake-content">
          <text class="question-text">{{ mistake.question }}</text>
          
          <view class="answer-section">
            <view class="answer-row">
              <text class="answer-label">我的答案:</text>
              <text class="my-answer wrong">{{ mistake.myAnswer }}</text>
            </view>
            <view class="answer-row">
              <text class="answer-label">正确答案:</text>
              <text class="correct-answer">{{ mistake.correctAnswer }}</text>
            </view>
          </view>
          
          <view v-if="mistake.explanation" class="explanation">
            <text class="explanation-label">解析:</text>
            <text class="explanation-text">{{ mistake.explanation }}</text>
          </view>
        </view>
        
        <view class="mistake-actions">
          <view class="action-info">
            <text class="review-count">复习 {{ mistake.reviewCount }} 次</text>
            <text v-if="mistake.lastReviewAt" class="last-review">上次复习: {{ formatDate(mistake.lastReviewAt) }}</text>
          </view>
          
          <view class="action-buttons">
            <view 
              class="action-btn secondary"
              @click.stop="removeMistake(mistake.id)"
            >
              <text class="btn-text">移除</text>
            </view>
            <view 
              class="action-btn primary"
              @click.stop="reviewMistake(mistake)"
            >
              <text class="btn-text">重做</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="filteredMistakes.length > 0" class="bottom-actions">
      <view class="batch-actions">
        <view class="select-all" @click="toggleSelectAll">
          <view class="checkbox" :class="{checked: isAllSelected}">
            <text v-if="isAllSelected" class="check-icon">✓</text>
          </view>
          <text class="select-text">全选</text>
        </view>
        
        <view class="selected-count">
          <text class="count-text">已选择 {{ selectedMistakes.length }} 题</text>
        </view>
      </view>
      
      <view class="action-buttons-bottom">
        <view 
          class="bottom-btn secondary"
          :class="{disabled: selectedMistakes.length === 0}"
          @click="batchRemove"
        >
          <text class="btn-text">批量移除</text>
        </view>
        <view 
          class="bottom-btn primary"
          :class="{disabled: selectedMistakes.length === 0}"
          @click="batchReview"
        >
          <text class="btn-text">批量重做</text>
        </view>
      </view>
    </view>

    <!-- 排序选项弹窗 -->
    <view v-if="showSortModal" class="modal-overlay" @click="hideSortOptions">
      <view class="sort-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">排序方式</text>
          <view class="close-btn" @click="hideSortOptions">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="sort-options">
          <view 
            v-for="option in sortOptions" 
            :key="option.key"
            class="sort-option"
            :class="{active: currentSort.key === option.key}"
            @click="selectSort(option)"
          >
            <text class="option-text">{{ option.name }}</text>
            <text v-if="currentSort.key === option.key" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 错题详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @click="hideDetailModal">
      <view class="detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">错题详情</text>
          <view class="close-btn" @click="hideDetailModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <view v-if="selectedMistake" class="detail-content">
          <view class="detail-section">
            <text class="detail-label">题目类型</text>
            <text class="detail-value">{{ getTypeName(selectedMistake.type) }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">题目内容</text>
            <text class="detail-value question">{{ selectedMistake.question }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">我的答案</text>
            <text class="detail-value wrong">{{ selectedMistake.myAnswer }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">正确答案</text>
            <text class="detail-value correct">{{ selectedMistake.correctAnswer }}</text>
          </view>
          
          <view v-if="selectedMistake.explanation" class="detail-section">
            <text class="detail-label">详细解析</text>
            <text class="detail-value explanation">{{ selectedMistake.explanation }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">错误时间</text>
            <text class="detail-value">{{ formatDateTime(selectedMistake.createdAt) }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">复习次数</text>
            <text class="detail-value">{{ selectedMistake.reviewCount }} 次</text>
          </view>
          
          <view v-if="selectedMistake.lastReviewAt" class="detail-section">
            <text class="detail-label">上次复习</text>
            <text class="detail-value">{{ formatDateTime(selectedMistake.lastReviewAt) }}</text>
          </view>
        </view>
        
        <view class="detail-actions">
          <view class="detail-btn secondary" @click="removeMistake(selectedMistake.id)">
            <text class="btn-text">移除错题</text>
          </view>
          <view class="detail-btn primary" @click="reviewMistake(selectedMistake)">
            <text class="btn-text">立即重做</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Mistakes',
  data() {
    return {
      activeFilter: 'all',
      selectedMistakes: [],
      showSortModal: false,
      showDetailModal: false,
      selectedMistake: null,
      currentSort: { key: 'time', name: '按时间' },
      
      filterTabs: [
        { key: 'all', name: '全部', count: 0 },
        { key: 'listening', name: '听力', count: 0 },
        { key: 'speaking', name: '口语', count: 0 },
        { key: 'vocabulary', name: '词汇', count: 0 },
        { key: 'grammar', name: '语法', count: 0 },
        { key: 'reading', name: '阅读', count: 0 }
      ],
      
      sortOptions: [
        { key: 'time', name: '按时间' },
        { key: 'type', name: '按类型' },
        { key: 'review', name: '按复习次数' },
        { key: 'difficulty', name: '按难度' }
      ],
      
      mistakes: [
        {
          id: 1,
          type: 'listening',
          question: 'What is the departure time for Flight CA1234?',
          myAnswer: 'A. 14:30',
          correctAnswer: 'B. 15:30',
          explanation: '根据广播内容，CA1234航班的起飞时间是15:30，不是14:30。注意听清楚时间表达。',
          status: 'new',
          reviewCount: 0,
          createdAt: '2024-01-15T10:30:00Z',
          lastReviewAt: null,
          difficulty: 'medium'
        },
        {
          id: 2,
          type: 'vocabulary',
          question: 'The aircraft is experiencing severe _______.',
          myAnswer: 'weather',
          correctAnswer: 'turbulence',
          explanation: 'turbulence指的是飞机遇到的气流颠簸，是航空领域的专业词汇。weather太宽泛，不够准确。',
          status: 'reviewing',
          reviewCount: 2,
          createdAt: '2024-01-14T16:20:00Z',
          lastReviewAt: '2024-01-16T09:15:00Z',
          difficulty: 'hard'
        },
        {
          id: 3,
          type: 'speaking',
          question: 'How would you handle a passenger complaint about delayed baggage?',
          myAnswer: '我会告诉乘客等待',
          correctAnswer: 'I would apologize sincerely, explain the situation, provide compensation options, and ensure follow-up tracking.',
          explanation: '处理乘客投诉需要专业的服务态度和完整的解决方案，包括道歉、解释、补偿和跟进。',
          status: 'mastered',
          reviewCount: 5,
          createdAt: '2024-01-13T14:45:00Z',
          lastReviewAt: '2024-01-17T11:30:00Z',
          difficulty: 'hard'
        },
        {
          id: 4,
          type: 'grammar',
          question: 'The pilot _______ the passengers about the weather conditions.',
          myAnswer: 'told',
          correctAnswer: 'informed',
          explanation: 'inform是更正式和专业的表达，在航空服务中更常用。told过于口语化。',
          status: 'new',
          reviewCount: 0,
          createdAt: '2024-01-16T08:15:00Z',
          lastReviewAt: null,
          difficulty: 'easy'
        },
        {
          id: 5,
          type: 'listening',
          question: 'What gate number was announced for the boarding?',
          myAnswer: 'Gate 12',
          correctAnswer: 'Gate 21',
          explanation: '注意听清楚数字的发音，12和21在英语中发音相似，需要仔细区分。',
          status: 'reviewing',
          reviewCount: 1,
          createdAt: '2024-01-15T13:20:00Z',
          lastReviewAt: '2024-01-16T15:45:00Z',
          difficulty: 'medium'
        },
        {
          id: 6,
          type: 'reading',
          question: 'According to the safety manual, what should passengers do during turbulence?',
          myAnswer: 'Stand up and move around',
          correctAnswer: 'Remain seated with seatbelts fastened',
          explanation: '根据安全手册，遇到颠簸时乘客应该保持坐姿并系好安全带，绝不能站立走动。',
          status: 'new',
          reviewCount: 0,
          createdAt: '2024-01-16T12:00:00Z',
          lastReviewAt: null,
          difficulty: 'easy'
        }
      ]
    }
  },
  
  computed: {
    totalMistakes() {
      return this.mistakes.length
    },
    
    reviewedCount() {
      return this.mistakes.filter(m => m.reviewCount > 0).length
    },
    
    masteredCount() {
      return this.mistakes.filter(m => m.status === 'mastered').length
    },
    
    accuracyRate() {
      if (this.totalMistakes === 0) return 0
      return Math.round((this.masteredCount / this.totalMistakes) * 100)
    },
    
    filteredMistakes() {
      let filtered = this.mistakes
      
      // 按类型筛选
      if (this.activeFilter !== 'all') {
        filtered = filtered.filter(m => m.type === this.activeFilter)
      }
      
      // 排序
      switch (this.currentSort.key) {
        case 'time':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          break
        case 'type':
          filtered.sort((a, b) => a.type.localeCompare(b.type))
          break
        case 'review':
          filtered.sort((a, b) => b.reviewCount - a.reviewCount)
          break
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }
          filtered.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty])
          break
      }
      
      return filtered
    },
    
    isAllSelected() {
      return this.filteredMistakes.length > 0 && 
             this.selectedMistakes.length === this.filteredMistakes.length
    }
  },
  
  onLoad() {
    this.updateFilterCounts()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    clearAll() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有错题吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            this.mistakes = []
            this.selectedMistakes = []
            this.updateFilterCounts()
            uni.showToast({
              title: '已清空错题本',
              icon: 'success'
            })
          }
        }
      })
    },
    
    switchFilter(filter) {
      this.activeFilter = filter
      this.selectedMistakes = []
    },
    
    showSortOptions() {
      this.showSortModal = true
    },
    
    hideSortOptions() {
      this.showSortModal = false
    },
    
    selectSort(option) {
      this.currentSort = option
      this.showSortModal = false
    },
    
    viewMistakeDetail(mistake) {
      this.selectedMistake = mistake
      this.showDetailModal = true
    },
    
    hideDetailModal() {
      this.showDetailModal = false
      this.selectedMistake = null
    },
    
    removeMistake(id) {
      uni.showModal({
        title: '确认移除',
        content: '确定要移除这道错题吗？',
        success: (res) => {
          if (res.confirm) {
            this.mistakes = this.mistakes.filter(m => m.id !== id)
            this.selectedMistakes = this.selectedMistakes.filter(sid => sid !== id)
            this.updateFilterCounts()
            this.hideDetailModal()
            uni.showToast({
              title: '已移除错题',
              icon: 'success'
            })
          }
        }
      })
    },
    
    reviewMistake(mistake) {
      // 更新复习次数和时间
      const mistakeIndex = this.mistakes.findIndex(m => m.id === mistake.id)
      if (mistakeIndex !== -1) {
        this.mistakes[mistakeIndex].reviewCount++
        this.mistakes[mistakeIndex].lastReviewAt = new Date().toISOString()
        
        // 根据复习次数更新状态
        if (this.mistakes[mistakeIndex].reviewCount >= 3) {
          this.mistakes[mistakeIndex].status = 'mastered'
        } else {
          this.mistakes[mistakeIndex].status = 'reviewing'
        }
      }
      
      this.hideDetailModal()
      
      // 跳转到对应的练习页面
      const typeRoutes = {
        listening: '/pages/training/listening-comprehension',
        speaking: '/pages/training/oral-interview',
        vocabulary: '/pages/training/vocabulary-meaning',
        grammar: '/pages/training/basic-listening',
        reading: '/pages/training/simple-listening'
      }
      
      const route = typeRoutes[mistake.type]
      if (route) {
        uni.navigateTo({
          url: `${route}?mistakeId=${mistake.id}`
        })
      } else {
        uni.showToast({
          title: '开始重做练习',
          icon: 'success'
        })
      }
    },
    
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedMistakes = []
      } else {
        this.selectedMistakes = this.filteredMistakes.map(m => m.id)
      }
    },
    
    batchRemove() {
      if (this.selectedMistakes.length === 0) return
      
      uni.showModal({
        title: '批量移除',
        content: `确定要移除选中的 ${this.selectedMistakes.length} 道错题吗？`,
        success: (res) => {
          if (res.confirm) {
            this.mistakes = this.mistakes.filter(m => !this.selectedMistakes.includes(m.id))
            this.selectedMistakes = []
            this.updateFilterCounts()
            uni.showToast({
              title: '批量移除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    batchReview() {
      if (this.selectedMistakes.length === 0) return
      
      // 更新所有选中错题的复习状态
      this.selectedMistakes.forEach(id => {
        const mistakeIndex = this.mistakes.findIndex(m => m.id === id)
        if (mistakeIndex !== -1) {
          this.mistakes[mistakeIndex].reviewCount++
          this.mistakes[mistakeIndex].lastReviewAt = new Date().toISOString()
          
          if (this.mistakes[mistakeIndex].reviewCount >= 3) {
            this.mistakes[mistakeIndex].status = 'mastered'
          } else {
            this.mistakes[mistakeIndex].status = 'reviewing'
          }
        }
      })
      
      uni.showToast({
        title: `开始批量重做 ${this.selectedMistakes.length} 题`,
        icon: 'success'
      })
      
      this.selectedMistakes = []
    },
    
    updateFilterCounts() {
      this.filterTabs.forEach(tab => {
        if (tab.key === 'all') {
          tab.count = this.mistakes.length
        } else {
          tab.count = this.mistakes.filter(m => m.type === tab.key).length
        }
      })
    },
    
    getTypeIcon(type) {
      const icons = {
        listening: '🎧',
        speaking: '🗣️',
        vocabulary: '📚',
        grammar: '📝',
        reading: '📖'
      }
      return icons[type] || '📄'
    },
    
    getTypeColor(type) {
      const colors = {
        listening: '#4facfe',
        speaking: '#43e97b',
        vocabulary: '#fa709a',
        grammar: '#feca57',
        reading: '#ff6b6b'
      }
      return colors[type] || '#999999'
    },
    
    getTypeName(type) {
      const names = {
        listening: '听力理解',
        speaking: '口语表达',
        vocabulary: '词汇学习',
        grammar: '语法练习',
        reading: '阅读理解'
      }
      return names[type] || '其他'
    },
    
    getStatusText(status) {
      const texts = {
        new: '新错题',
        reviewing: '复习中',
        mastered: '已掌握'
      }
      return texts[status] || '未知'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      
      return `${date.getMonth() + 1}-${date.getDate()}`
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.mistakes-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-text {
  font-size: 28rpx;
  color: #ff4757;
}

/* 统计卡片 */
.stats-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rpx;
  margin: 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.stats-item {
  padding: 32rpx 16rpx;
  text-align: center;
  background: #ffffff;
}

.stats-number {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #666666;
}

/* 筛选栏 */
.filter-section {
  display: flex;
  align-items: center;
  padding: 0 32rpx 24rpx;
  gap: 24rpx;
}

.filter-scroll {
  flex: 1;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  white-space: nowrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: #ffffff;
  border-radius: 32rpx;
  border: 2rpx solid #f0f0f0;
}

.filter-tab.active {
  background: #007AFF;
  border-color: #007AFF;
}

.filter-text {
  font-size: 28rpx;
  color: #666666;
  white-space: nowrap;
}

.filter-tab.active .filter-text {
  color: #ffffff;
}

.filter-count {
  font-size: 20rpx;
  color: #999999;
  background: #f8f9fa;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  min-width: 32rpx;
  text-align: center;
}

.filter-tab.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.sort-section {
  flex-shrink: 0;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  background: #ffffff;
  border-radius: 32rpx;
  border: 2rpx solid #f0f0f0;
}

.sort-text {
  font-size: 28rpx;
  color: #666666;
}

.sort-icon {
  font-size: 20rpx;
  color: #999999;
}

/* 错题列表 */
.mistakes-list {
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

.mistake-item {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #f0f0f0;
}

.mistake-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.mistake-type {
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
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.mistake-date {
  font-size: 24rpx;
  color: #666666;
}

.mistake-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
}

.status-badge.new {
  background: #fff2e8;
  color: #fa8c16;
}

.status-badge.reviewing {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.mastered {
  background: #f6ffed;
  color: #52c41a;
}

.status-text {
  font-size: 20rpx;
}

/* 错题内容 */
.mistake-content {
  margin-bottom: 24rpx;
}

.question-text {
  display: block;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.answer-section {
  margin-bottom: 20rpx;
}

.answer-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.answer-label {
  font-size: 26rpx;
  color: #666666;
  min-width: 120rpx;
  flex-shrink: 0;
}

.my-answer {
  font-size: 26rpx;
  flex: 1;
}

.my-answer.wrong {
  color: #ff4757;
  text-decoration: line-through;
}

.correct-answer {
  font-size: 26rpx;
  color: #52c41a;
  flex: 1;
}

.explanation {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.explanation-label {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 8rpx;
}

.explanation-text {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.6;
}

/* 错题操作 */
.mistake-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.review-count {
  font-size: 24rpx;
  color: #666666;
}

.last-review {
  font-size: 22rpx;
  color: #999999;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #666666;
}

.action-btn.primary {
  background: #007AFF;
  color: #ffffff;
}

.btn-text {
  font-size: 24rpx;
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #007AFF;
  border-color: #007AFF;
}

.check-icon {
  font-size: 20rpx;
  color: #ffffff;
}

.select-text {
  font-size: 28rpx;
  color: #333333;
}

.selected-count {
  font-size: 24rpx;
  color: #666666;
}

.action-buttons-bottom {
  display: flex;
  gap: 16rpx;
}

.bottom-btn {
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
}

.bottom-btn.secondary {
  background: #f8f9fa;
  color: #666666;
}

.bottom-btn.primary {
  background: #007AFF;
  color: #ffffff;
}

.bottom-btn.disabled {
  opacity: 0.5;
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

.sort-modal {
  background: #ffffff;
  border-radius: 24rpx;
  width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.detail-modal {
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

/* 排序选项 */
.sort-options {
  padding: 16rpx 0;
}

.sort-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
}

.sort-option.active {
  background: #f0f8ff;
}

.option-text {
  font-size: 30rpx;
  color: #333333;
}

.sort-option.active .option-text {
  color: #007AFF;
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

.detail-label {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.detail-value {
  display: block;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
}

.detail-value.question {
  font-weight: 500;
}

.detail-value.wrong {
  color: #ff4757;
}

.detail-value.correct {
  color: #52c41a;
}

.detail-value.explanation {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
  line-height: 1.8;
}

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
</style>