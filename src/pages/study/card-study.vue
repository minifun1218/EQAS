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

    <!-- 学习卡片 -->
    <view class="card-container" v-if="currentItem">
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
        <image class="btn-icon" src="/static/icons/hard.png" mode="aspectFit"></image>
        <text class="btn-text">困难</text>
      </button>
      <button class="action-btn easy-btn" @click="markEasy">
        <image class="btn-icon" src="/static/icons/easy.png" mode="aspectFit"></image>
        <text class="btn-text">简单</text>
      </button>
      <button class="action-btn favorite-btn" @click="toggleFavorite">
        <image class="btn-icon" :src="currentItem.isFavorite ? '/static/icons/like.png' : '/static/icons/like_fill.png'" mode="aspectFit"></image>
        <text class="btn-text">{{ currentItem.isFavorite ? '已收藏' : '收藏' }}</text>
      </button>
    </view>

    <!-- 导航按钮 -->
    <view class="nav-buttons">
      <button class="nav-btn prev-btn" :disabled="currentIndex === 0" @click="previousCard">
        <image class="nav-icon" src="/static/icons/last.png" mode="aspectFit"></image>
        <text class="nav-text">上一个</text>
      </button>
      <button class="nav-btn next-btn" @click="nextCard">
        <text class="nav-text">{{ currentIndex === studyItems.length - 1 ? '完成学习' : '下一个' }}</text>
        <image class="nav-icon" src="/static/icons/next.png" mode="aspectFit"></image>
      </button>
    </view>

    <!-- 学习完成弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
      <view class="complete-modal" @click.stop>
        <view class="modal-content">
          <image class="success-icon" src="/static/icons/success.png" mode="aspectFit"></image>
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

import { termCategories } from '@/data/terms.js'
import { vocabularyTopics } from '@/data/vocabulary.js'
import CusNavbar from "../../components/cus-navbar.vue";
import CusHeader from "../../components/cus-header.vue";

export default {

  name: 'CardStudy',
  components: {CusHeader, CusNavbar},
  data() {
    return {
      studyItems: [],
      studyType: 'terms', // 'terms' 或 'words'
      currentIndex: 0,
      isFlipped: false,
      showCompleteModal: false,
      difficultItems: [],
      learnedItems: []
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

    if (options.terms) {
      this.studyItems = JSON.parse(decodeURIComponent(options.terms))
      this.studyType = 'terms'
    } else if (options.words) {
      this.studyItems = JSON.parse(decodeURIComponent(options.words))
      this.studyType = 'words'
    }
    
    // 打乱学习顺序
    this.shuffleArray(this.studyItems)
  },
  methods: {
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
.card-study {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.back-icon, .settings-icon {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
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
  color: #ffffff;
  margin-bottom: 8rpx;
}

.progress-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  margin-left: 32rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #ffffff;
  border-radius: 4rpx;
  transition: width 0.3s ease;
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
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
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
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.category-badge, .topic-badge {
  font-size: 24rpx;
  color: #667eea;
  background-color: #f0f2ff;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  display: inline-block;
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
}

.difficulty-badge.basic {
  background-color: #52c41a;
}

.difficulty-badge.intermediate {
  background-color: #faad14;
}

.difficulty-badge.advanced {
  background-color: #f5222d;
}

.card-hint {
  text-align: center;
}

.hint-text {
  font-size: 28rpx;
  color: #999999;
}

.answer-section {
  text-align: center;
  margin-bottom: 32rpx;
}

.english-text {
  font-size: 40rpx;
  font-weight: 600;
  color: #667eea;
  display: block;
  margin-bottom: 16rpx;
}

.phonetic-text {
  font-size: 28rpx;
  color: #999999;
  font-style: italic;
  display: block;
  margin-bottom: 24rpx;
}

.definition-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  display: block;
}

.dialogue-section, .examples-section {
  margin-top: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  margin-left: 10rpx;
  display: block;
}

.dialogue-item {
  margin-bottom: 16rpx;
  margin-left: 10rpx;
  padding: 16rpx;
  background-color:#e9ecef;
  border-radius: 42rpx;
}

.speaker {
  font-size: 24rpx;
  font-weight: 600;
  color: #667eea;
  display: block;
  margin-bottom: 8rpx;
}

.message {
  font-size: 26rpx;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.translation {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.example-item {
  margin-bottom: 16rpx;
  padding: 16rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.example-english {
  font-size: 26rpx;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.example-chinese {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

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
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background-color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 8rpx;
  filter: brightness(0) invert(1);
}

.btn-text {
  font-size: 24rpx;
  color: #ffffff;
}

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
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.nav-btn:disabled {
  opacity: 0.5;
}

.nav-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.prev-btn {
  background-color: #667eea;
}

.next-btn {
  background-color: #667eea;
}

.nav-icon {
  width: 32rpx;
  height: 32rpx;
}

.prev-btn .nav-icon {
  margin-right: 12rpx;
}

.next-btn .nav-icon {
  margin-left: 12rpx;
  filter: brightness(0) invert(1);
}

.nav-text {
  font-size: 28rpx;
  font-weight: 600;
}

.prev-btn .nav-text {
  color: #ffffff;
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
  background-color: rgba(0, 0, 0, 0.5);
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
}

.modal-content {
  text-align: center;
}

.success-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 32rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
  display: block;
}

.modal-desc {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 32rpx;
  display: block;
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
  color: #667eea;
  margin-bottom: 8rpx;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
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
  background-color: #f5f5f5;
  color: #666666;
}

.primary-btn {
  background-color: #667eea;
  color: #ffffff;
}
</style>