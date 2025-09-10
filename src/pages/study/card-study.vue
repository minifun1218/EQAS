<template>
  <cus-navbar
      title="卡片学习"
      :fixed="true"
      :placeholder="true"
      :bordered="true"
      background="#ffffff"
      color="#111">
  </cus-navbar>
  <view class="card-study">
    <!-- 顶部导航 -->
    <cus-header title="卡片学习">
    </cus-header>
    
    <!-- 学习进度 -->
    <view class="progress-section">
      <view class="progress-info">
        <text class="progress-text">{{ currentIndex + 1 }} / {{ studyItems.length }}</text>
        <text class="progress-label">{{ studyType === 'terms' ? '术语' : '词汇' }}</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 学习卡片 -->
    <view class="card-container" v-if="!loading && currentItem">
      <view class="study-card" :class="{ flipped: isFlipped }" @click="flipCard">
        <!-- 正面 -->
        <view class="card-front">
          <view class="card-content">
            <view class="main-text">
              <text class="chinese-text">{{ currentItem.chinese }}</text>
              <text v-if="studyType === 'terms'" class="category-badge">{{ getCategoryName(currentItem.category) }}</text>
              <text v-else class="topic-badge">{{ getTopicName(currentItem.topicId) }}</text>
            </view>
            <view class="difficulty-info">
              <text class="difficulty-badge" :class="currentItem.difficulty">
                {{ getDifficultyText(currentItem.difficulty) }}
              </text>
            </view>
          </view>
          <view class="card-hint">
            <text class="hint-text">点击查看答案</text>
          </view>
        </view>

        <!-- 背面 -->
        <view class="card-back">
          <view class="card-content">
            <view class="answer-section">
              <text class="english-text">{{ currentItem.english }}</text>
              <text class="phonetic-text">{{ currentItem.phonetic }}</text>
              <text class="definition-text">{{ currentItem.definition }}</text>
            </view>
            
            <!-- 术语对话示例 -->
            <view v-if="studyType === 'terms' && currentItem.dialogues" class="dialogue-section">
              <text class="section-title">对话示例</text>
              <view v-for="(dialogue, index) in currentItem.dialogues" :key="index" class="dialogue-item">
                <text class="speaker">{{ dialogue.speaker }}:</text>
                <text class="message">{{ dialogue.message }}</text>
                <text class="translation">{{ dialogue.translation }}</text>
              </view>
            </view>
            
            <!-- 词汇例句 -->
            <view v-if="studyType === 'words' && currentItem.examples" class="examples-section">
              <text class="section-title">例句</text>
              <view v-for="(example, index) in currentItem.examples.slice(0, 2)" :key="index" class="example-item">
                <text class="example-english">{{ example.english }}</text>
                <text class="example-chinese">{{ example.chinese }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="action-btn difficult-btn" @click="markDifficult">
        <text class="btn-text">困难</text>
      </button>
      <button class="action-btn easy-btn" @click="markEasy">
        <text class="btn-text">简单</text>
      </button>
      <button class="action-btn favorite-btn" @click="toggleFavorite">
        <text class="btn-text">{{ currentItem.isFavorite ? '已收藏' : '收藏' }}</text>
      </button>
    </view>

    <!-- 导航按钮 -->
    <view class="nav-buttons">
      <button class="nav-btn prev-btn" :disabled="currentIndex === 0" @click="previousCard">
        <text class="nav-text">上一个</text>
      </button>
      <button class="nav-btn next-btn" @click="nextCard">
        <text class="nav-text">{{ currentIndex === studyItems.length - 1 ? '完成学习' : '下一个' }}</text>
      </button>
    </view>

    <!-- 学习完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
      <view class="complete-modal" @click.stop>
        <view class="modal-content">
          <text class="modal-title">学习完成！</text>
          <text class="modal-desc">恭喜你完成了 {{ studyItems.length }} 个{{ studyType === 'terms' ? '术语' : '词汇' }}的学习</text>
          <view class="modal-stats">
            <view class="stat-item">
              <text class="stat-number">{{ learnedCount }}</text>
              <text class="stat-label">已掌握</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ difficultCount }}</text>
              <text class="stat-label">需复习</text>
            </view>
          </view>
          <view class="modal-buttons">
            <button class="modal-btn secondary-btn" @click="reviewDifficult">复习困难项</button>
            <button class="modal-btn primary-btn" @click="finishStudy">完成学习</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>

import { studyApi } from '@/api/index.js'
import CusNavbar from "../../components/cus-navbar.vue";
import CusHeader from "../../components/cus-header.vue";

export default {

  name: 'CardStudy',
  components: {CusHeader, CusNavbar},
  data() {
    return {
      loading: false,
      studyItems: [],
      studyType: 'terms', // 'terms' 或 'words'
      currentIndex: 0,
      isFlipped: false,
      showCompleteModal: false,
      difficultItems: [],
      learnedItems: [],
      studyId: null
    }
  },
  computed: {
    currentItem() {
      return this.studyItems[this.currentIndex] || null
    },
    progressPercent() {
      return this.studyItems.length > 0 ? ((this.currentIndex + 1) / this.studyItems.length) * 100 : 0
    },
    learnedCount() {
      return this.learnedItems.length
    },
    difficultCount() {
      return this.difficultItems.length
    }
  },
  onLoad(options) {
    this.studyType = options.type || 'terms'
    this.studyId = options.id
    this.loadStudyData()
  },
  
  mounted() {
    // 组件挂载后的初始化逻辑
  },
  methods: {
    async loadStudyData() {
      try {
        this.loading = true
        let response
        
        if (this.studyType === 'terms') {
          response = await studyApi.getTermsData(this.studyId)
        } else {
          response = await studyApi.getVocabularyData(this.studyId)
        }
        
        if (response.code === 200) {
          this.studyItems = response.data.items || []
          // 打乱学习顺序
          this.shuffleArray(this.studyItems)
        } else {
          uni.showToast({
            title: response.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载学习数据失败:', error)
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
    showSettings() {
      // 显示设置选项
      uni.showActionSheet({
        itemList: ['重新开始', '打乱顺序', '只学习未掌握'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.restartStudy()
              break
            case 1:
              this.shuffleArray(this.studyItems)
              this.currentIndex = 0
              this.isFlipped = false
              break
            case 2:
              this.studyUnlearnedOnly()
              break
          }
        }
      })
    },
    flipCard() {
      this.isFlipped = !this.isFlipped
    },
    nextCard() {
      if (this.currentIndex === this.studyItems.length - 1) {
        this.completeStudy()
      } else {
        this.currentIndex++
        this.isFlipped = false
      }
    },
    previousCard() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.isFlipped = false
      }
    },
    markDifficult() {
      const item = this.currentItem
      if (!this.difficultItems.find(i => i.id === item.id)) {
        this.difficultItems.push(item)
      }
      this.nextCard()
    },
    markEasy() {
      const item = this.currentItem
      if (!this.learnedItems.find(i => i.id === item.id)) {
        this.learnedItems.push(item)
        item.isLearned = true
      }
      this.nextCard()
    },
    toggleFavorite() {
      this.currentItem.isFavorite = !this.currentItem.isFavorite
      // 这里可以添加保存到本地存储的逻辑
    },
    completeStudy() {
      this.showCompleteModal = true
    },
    closeCompleteModal() {
      this.showCompleteModal = false
    },
    reviewDifficult() {
      if (this.difficultItems.length > 0) {
        this.studyItems = [...this.difficultItems]
        this.currentIndex = 0
        this.isFlipped = false
        this.difficultItems = []
        this.showCompleteModal = false
      } else {
        uni.showToast({
          title: '没有困难项需要复习',
          icon: 'none'
        })
      }
    },
    finishStudy() {
      this.showCompleteModal = false
      uni.navigateBack()
    },
    restartStudy() {
      this.currentIndex = 0
      this.isFlipped = false
      this.difficultItems = []
      this.learnedItems = []
    },
    studyUnlearnedOnly() {
      const unlearnedItems = this.studyItems.filter(item => !item.isLearned)
      if (unlearnedItems.length > 0) {
        this.studyItems = unlearnedItems
        this.currentIndex = 0
        this.isFlipped = false
      } else {
        uni.showToast({
          title: '所有项目都已学习',
          icon: 'none'
        })
      }
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    },
    getDifficultyText(difficulty) {
      const difficultyMap = {
        'basic': '基础',
        'intermediate': '中级',
        'advanced': '高级'
      }
      return difficultyMap[difficulty] || '基础'
    },
    getCategoryName(categoryId) {
      const category = termCategories.find(c => c.id === categoryId)
      return category ? category.name : '未知'
    },
    getTopicName(topicId) {
      const topic = vocabularyTopics.find(t => t.id === topicId)
      return topic ? topic.name : '未知'
    }
  }
}

</script>

<style scoped>
/* Updated to light color scheme with soft grays and blues */
.card-study {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.header {
  padding-top: var(--status-bar-height);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.nav-left, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #334155;
}

.progress-section {
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.progress-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8rpx;
}

.progress-label {
  font-size: 24rpx;
  color: #64748b;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background-color: #e2e8f0;
  border-radius: 4rpx;
  margin-left: 32rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #64748b;
}

.card-container {
  padding: 0 32rpx;
  margin-bottom: 250rpx;
}

.study-card {
  position: relative;
  width: 100%;
  height: 800rpx;
  perspective: 1000rpx;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(148, 163, 184, 0.15);
  border: 1rpx solid #e2e8f0;
  backface-visibility: hidden;
  transition: transform 0.6s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-back {
  transform: rotateY(180deg);
}

.study-card.flipped .card-front {
  transform: rotateY(-180deg);
}

.study-card.flipped .card-back {
  transform: rotateY(0deg);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.main-text {
  text-align: center;
  margin-bottom: 32rpx;
}

.chinese-text {
  font-size: 48rpx;
  font-weight: 600;
  color: #1e293b;
  display: block;
  margin-bottom: 16rpx;
}

.category-badge, .topic-badge {
  font-size: 24rpx;
  color: #3b82f6;
  background-color: #eff6ff;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  display: inline-block;
  border: 1rpx solid #dbeafe;
}

.difficulty-info {
  text-align: center;
}

.difficulty-badge {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  color: #ffffff;
  display: inline-block;
  font-weight: 500;
}

.difficulty-badge.basic {
  background-color: #10b981;
}

.difficulty-badge.intermediate {
  background-color: #f59e0b;
}

.difficulty-badge.advanced {
  background-color: #ef4444;
}

.card-hint {
  text-align: center;
  padding: 24rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #94a3b8;
}

.answer-section {
  text-align: center;
  margin-bottom: 32rpx;
  padding: 0 24rpx;
}

.english-text {
  font-size: 40rpx;
  font-weight: 600;
  color: #3b82f6;
  display: block;
  margin-bottom: 16rpx;
}

.phonetic-text {
  font-size: 28rpx;
  color: #64748b;
  font-style: italic;
  display: block;
  margin-bottom: 24rpx;
}

.definition-text {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.6;
  display: block;
}

.dialogue-section, .examples-section {
  margin-top: 32rpx;
  padding: 0 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16rpx;
  display: block;
}

.dialogue-item {
  margin-bottom: 16rpx;
  padding: 16rpx;
  background-color: #f1f5f9;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
}

.speaker {
  font-size: 24rpx;
  font-weight: 600;
  color: #3b82f6;
  display: block;
  margin-bottom: 8rpx;
}

.message {
  font-size: 26rpx;
  color: #334155;
  display: block;
  margin-bottom: 8rpx;
}

.translation {
  font-size: 24rpx;
  color: #64748b;
  display: block;
}

.example-item {
  margin-bottom: 16rpx;
  padding: 16rpx;
  background-color: #f8fafc;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
}

.example-english {
  font-size: 26rpx;
  color: #334155;
  display: block;
  margin-bottom: 8rpx;
}

.example-chinese {
  font-size: 24rpx;
  color: #64748b;
  display: block;
}

/* Updated action buttons to remove icons and use light colors */
.action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 80rpx;
  background-color: #ffffff;
  border: 2rpx solid #e2e8f0;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(148, 163, 184, 0.1);
}

.action-btn:active {
  transform: scale(0.95);
  background-color: #f8fafc;
}

.difficult-btn {
  border-color: #fecaca;
  background-color: #fef2f2;
}

.difficult-btn .btn-text {
  color: #dc2626;
}

.easy-btn {
  border-color: #bbf7d0;
  background-color: #f0fdf4;
}

.easy-btn .btn-text {
  color: #16a34a;
}

.favorite-btn {
  border-color: #fde68a;
  background-color: #fffbeb;
}

.favorite-btn .btn-text {
  color: #d97706;
}

.btn-text {
  font-size: 24rpx;
  font-weight: 500;
}

/* Updated navigation buttons to remove icons and use light colors */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  padding: 0 32rpx;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 32rpx;
  background-color: #ffffff;
  border-radius: 40rpx;
  border: 2rpx solid #e2e8f0;
  box-shadow: 0 2rpx 12rpx rgba(148, 163, 184, 0.15);
  transition: all 0.3s ease;
}

.nav-btn:disabled {
  opacity: 0.5;
  background-color: #f8fafc;
}

.nav-btn:active:not(:disabled) {
  transform: scale(0.95);
  background-color: #f1f5f9;
}

.prev-btn {
  border-color: #cbd5e1;
}

.next-btn {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.nav-text {
  font-size: 28rpx;
  font-weight: 600;
}

.prev-btn .nav-text {
  color: #64748b;
}

.next-btn .nav-text {
  color: #ffffff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.complete-modal {
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 8rpx 32rpx rgba(148, 163, 184, 0.2);
}

.modal-content {
  text-align: center;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16rpx;
  display: block;
}

.modal-desc {
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 32rpx;
  display: block;
  line-height: 1.5;
}

.modal-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 8rpx;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #94a3b8;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 600;
  margin: 0 8rpx;
}

.secondary-btn {
  background-color: #f1f5f9;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
}

.primary-btn {
  background-color: #3b82f6;
  color: #ffffff;
}
</style>
