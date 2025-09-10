<template>
  <cus-navbar
      title="高频词汇表"
      :fixed="true"
      :placeholder="true"
      :bordered="true"
      background="#ffffff"
      color="#111">
  </cus-navbar>
  <view class="vocabulary">
    <!-- 顶部导航 -->
    <cus-header title="高频词汇表" @goBack="goBack">
    </cus-header>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 主题筛选 -->
    <view v-if="!loading" class="topic-filter">
      <scroll-view class="topic-scroll" scroll-x="true">
        <view class="topic-list">
          <view
              class="topic-item"
              :class="{ active: selectedTopic === 'all' }"
              @click="selectTopic('all')"
          >
            <text class="topic-name">全部</text>
            <text class="topic-count">({{ vocabularyData.length }})</text>
          </view>
          <view
              v-for="topic in topics"
              :key="topic.id"
              class="topic-item"
              :class="{ active: selectedTopic === topic.id }"
              @click="selectTopic(topic.id)"
          >
            <text class="topic-name">{{ topic.name }}</text>
            <text class="topic-count">({{ topic.count }})</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 词汇列表 -->
    <view v-if="!loading" class="vocabulary-content">
      <view class="vocabulary-list">
        <view
            v-for="word in filteredWords"
            :key="word.id"
            class="word-item"
            @click="selectWord(word)"
        >
          <view class="word-main">
            <view class="word-header">
              <text class="word-chinese">{{ word.chinese }}</text>
              <view class="word-badges">
                <text class="difficulty-badge" :class="word.difficulty">{{ getDifficultyText(word.difficulty) }}</text>
                <text v-if="word.isFavorite" class="favorite-badge">已收藏</text>
              </view>
            </view>
            <text class="word-english">{{ word.english }}</text>
            <text class="word-phonetic">{{ word.phonetic }}</text>
            <text class="word-definition">{{ word.definition }}</text>

            <!-- 例句预览 -->
            <view v-if="word.examples && word.examples.length > 0" class="example-preview">
              <text class="example-label">例句：</text>
              <text class="example-text">{{ word.examples[0].english }}</text>
            </view>
          </view>
          <view class="word-status">
            <text v-if="word.isLearned" class="learned-badge">已学习</text>
            <text v-else class="unlearned-text">未学习</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 开始学习按钮 -->
    <view v-if="!loading" class="study-button-container">
      <button class="study-button" @click="startStudy">
        <text class="study-text">开始学习</text>
      </button>
    </view>
  </view>
</template>

<script>
import { studyApi } from '@/api/index.js'
import CusHeader from "../../components/cus-header.vue";

export default {
  name: 'Vocabulary',
  components: {CusHeader},
  data() {
    return {
      vocabularyData: [],
      topics: [],
      selectedTopic: 'all',
      selectedWords: [],
      loading: true
    }
  },
  async mounted() {
    await this.loadVocabularyData()
  },
  computed: {
    filteredWords() {
      if (this.selectedTopic === 'all') {
        return this.vocabularyData
      }
      return this.vocabularyData.filter(word => word.topicId === this.selectedTopic)
    }
  },
  methods: {
    async loadVocabularyData() {
      try {
        this.loading = true
        // 获取词汇数据
        const vocabularyResponse = await studyApi.getVocabulary()
        if (vocabularyResponse.code === 200) {
          this.vocabularyData = vocabularyResponse.data.vocabulary || []
          this.topics = vocabularyResponse.data.topics || []
        } else {
          uni.showToast({
            title: '获取词汇数据失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载词汇数据失败:', error)
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
    selectTopic(topicId) {
      this.selectedTopic = topicId
    },
    selectWord(word) {
      const index = this.selectedWords.findIndex(w => w.id === word.id)
      if (index > -1) {
        this.selectedWords.splice(index, 1)
      } else {
        this.selectedWords.push(word)
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
    startStudy() {
      if (this.selectedWords.length === 0) {
        this.selectedWords = [...this.filteredWords]
      }

      if (this.selectedWords.length === 0) {
        uni.showToast({
          title: '请选择要学习的词汇',
          icon: 'none'
        })
        return
      }

      uni.navigateTo({
        url: `/pages/study/card-study?words=${encodeURIComponent(JSON.stringify(this.selectedWords))}`
      })
    }
  }
}
</script>

<style scoped>
.vocabulary {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-bottom: 100rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 32rpx;
  color: #64748b;
}

.header {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.nav-left {
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

.nav-right {
  width: 60rpx;
}

.topic-filter {
  background-color: #ffffff;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
  box-shadow: 0 2rpx 8rpx rgba(148, 163, 184, 0.1);
}

.topic-scroll {
  white-space: nowrap;
}

.topic-list {
  display: flex;
  padding: 0 32rpx;
  gap: 16rpx;
}

.topic-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 24rpx;
  background-color: #f8fafc;
  border-radius: 32rpx;
  border: 2rpx solid #e2e8f0;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 4rpx rgba(148, 163, 184, 0.1);
}

.topic-item.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
}

.topic-name {
  font-size: 28rpx;
  color: #64748b;
  margin-right: 8rpx;
  font-weight: 500;
}

.topic-item.active .topic-name {
  color: #ffffff;
}

.topic-count {
  font-size: 24rpx;
  color: #94a3b8;
}

.topic-item.active .topic-count {
  color: #ffffff;
}

.vocabulary-content {
  flex: 1;
  padding: 24rpx 32rpx;
}

.word-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(148, 163, 184, 0.1);
  border: 2rpx solid #f1f5f9;
  transition: all 0.3s ease;
}

.word-item:active {
  transform: scale(0.98);
  border-color: #3b82f6;
  box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.15);
}

.word-main {
  flex: 1;
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.word-chinese {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.word-badges {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.difficulty-badge {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  color: #ffffff;
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

.favorite-badge {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  background-color: #fef3c7;
  color: #d97706;
  font-weight: 500;
  border: 1rpx solid #fde68a;
}

.word-english {
  font-size: 28rpx;
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.word-phonetic {
  font-size: 24rpx;
  color: #94a3b8;
  font-style: italic;
  margin-bottom: 16rpx;
}

.word-definition {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.example-preview {
  background-color: #f8fafc;
  padding: 16rpx;
  border-radius: 8rpx;
  border-left: 4rpx solid #3b82f6;
  border: 1rpx solid #e2e8f0;
}

.example-label {
  font-size: 24rpx;
  color: #3b82f6;
  font-weight: 500;
  margin-right: 8rpx;
}

.example-text {
  font-size: 24rpx;
  color: #64748b;
  font-style: italic;
}

.word-status {
  display: flex;
  align-items: center;
  margin-left: 24rpx;
}

.learned-badge {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  background-color: #dcfce7;
  color: #16a34a;
  font-weight: 500;
  border: 1rpx solid #bbf7d0;
}

.unlearned-text {
  font-size: 24rpx;
  color: #cbd5e1;
}

.study-button-container {
  position: fixed;
  bottom: 120rpx;
  right: 32rpx;
  z-index: 100;
}

.study-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
  border: none;
}

.study-button:active {
  transform: scale(0.95);
}

.study-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}
</style>
