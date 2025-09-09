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

    <!-- 主题筛选 -->
    <view class="topic-filter">
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
    <view class="vocabulary-content">
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
                <image 
                  v-if="word.isFavorite" 
                  class="favorite-icon" 
                  src="/static/icons/heart-filled.png" 
                  mode="aspectFit"
                ></image>
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
            <image 
              v-if="word.isLearned" 
              class="learned-icon" 
              src="/static/icons/check-circle.png" 
              mode="aspectFit"
            ></image>
            <text v-else class="unlearned-text">未学习</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 开始学习按钮 -->
    <view class="study-button-container">
      <button class="study-button" @click="startStudy">
        <image class="study-icon" src="/static/icons/play.png" mode="aspectFit"></image>
        <text class="study-text">开始学习</text>
      </button>
    </view>
  </view>
</template>

<script>
import { vocabularyData, vocabularyTopics } from '@/data/vocabulary.js'
import CusHeader from "../../components/cus-header.vue";

export default {
  name: 'Vocabulary',
  components: {CusHeader},
  data() {
    return {
      vocabularyData: vocabularyData,
      topics: vocabularyTopics,
      selectedTopic: 'all',
      selectedWords: []
    }
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
    goBack() {
      uni.navigateBack()
    },
    selectTopic(topicId) {
      this.selectedTopic = topicId
    },
    selectWord(word) {
      // 切换词汇选中状态
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
        // 如果没有选中词汇，使用当前筛选的所有词汇
        this.selectedWords = [...this.filteredWords]
      }
      
      if (this.selectedWords.length === 0) {
        uni.showToast({
          title: '请选择要学习的词汇',
          icon: 'none'
        })
        return
      }
      
      // 跳转到卡片式学习页面
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
  background-color: #f5f7fa;
  padding-bottom: 100rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%);

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

.back-icon {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.nav-right {
  width: 60rpx;
}

.topic-filter {
  background-color: #ffffff;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.topic-scroll {
  white-space: nowrap;
}

.topic-list {
  display: flex;
  padding: 0 32rpx;
  gap: 16rpx; /* 添加间距，避免拥挤 */
}


.topic-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 24rpx;
  background-color: #f8f9fa;
  border-radius: 32rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80rpx; /* 防止过窄 */
  flex-shrink: 0; /* 防止被压缩 */
}
.topic-item.active {
  background-color: #667eea;
  border-color: #667eea;
  color: #ffffff;
}

.topic-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.topic-name {
  font-size: 28rpx;
  color: #666666;
  margin-right: 8rpx;
}

.topic-item.active .topic-name {
  color: #ffffff;
}

.topic-count {
  font-size: 24rpx;
  color: #999999;
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
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.word-item:active {
  transform: scale(0.98);
  border-color: #667eea;
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
  color: #333333;
}

.word-badges {
  display: flex;
  align-items: center;
}

.difficulty-badge {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  color: #ffffff;
  margin-right: 12rpx;
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

.favorite-icon {
  width: 32rpx;
  height: 32rpx;
}

.word-english {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.word-phonetic {
  font-size: 24rpx;
  color: #999999;
  font-style: italic;
  margin-bottom: 16rpx;
}

.word-definition {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.example-preview {
  background-color: #f8f9fa;
  padding: 16rpx;
  border-radius: 8rpx;
  border-left: 4rpx solid #667eea;
}

.example-label {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
  margin-right: 8rpx;
}

.example-text {
  font-size: 24rpx;
  color: #666666;
  font-style: italic;
}

.word-status {
  display: flex;
  align-items: center;
  margin-left: 24rpx;
}

.learned-icon {
  width: 40rpx;
  height: 40rpx;
}

.unlearned-text {
  font-size: 24rpx;
  color: #cccccc;
}

.study-button-container {
  position: fixed;
  bottom: 120rpx;
  right: 32rpx;
  z-index: 100;
}

.study-button {
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
  width: 200rpx;
  height: 60rpx;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 10rpx rgba(118, 75, 162, 0.3);
}

.study-button:active {
  transform: scale(0.95);
}

.study-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  filter: brightness(0) invert(1);
}

.study-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 600;
}
</style>