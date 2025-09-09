<template>
  <!-- 顶部导航 -->

  <cus-navbar
      title="标准术语表"
      :fixed="true"
      :placeholder="true"
      :bordered="true"
      background="#ffffff"
      color="#111">

  </cus-navbar>
  <view class="standard-terms">
    <cus-header @goBack="goBack" title="标准通话用语"></cus-header>

    <!-- 分类筛选 -->
    <view class="category-filter">
      <scroll-view class="category-scroll" scroll-x="true">
        <view class="category-list">
          <view 
            v-for="category in categories" 
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >

            <text class="category-name">{{ category.name }}<template v-if="category.name !== '全部'">({{ category.count }})</template>
            </text>

          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 术语列表 -->
    <view class="terms-content">
      <view class="terms-list">
        <view 
          v-for="term in filteredTerms" 
          :key="term.id"
          class="term-item"
          @click="selectTerm(term)"
        >
          <view class="term-main">
            <view class="term-header">
              <text class="term-chinese">{{ term.chinese }}</text>
              <view class="term-badges">
                <text class="difficulty-badge" :class="term.difficulty">{{ getDifficultyText(term.difficulty) }}</text>
                <image 
                  v-if="term.isFavorite" 
                  class="favorite-icon" 
                  src="/static/icons/heart-filled.png" 
                  mode="aspectFit"
                ></image>
              </view>
            </view>
            <text class="term-english">{{ term.english }}</text>
            <text class="term-phonetic">{{ term.phonetic }}</text>
            <text class="term-definition">{{ term.definition }}</text>
          </view>
          <view class="term-status">
            <image 
              v-if="term.isLearned" 
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
import { termsData, termCategories } from '@/data/terms.js'
import CusHeader from "../../components/cus-header.vue";

export default {
  name: 'StandardTerms',
  components: {CusHeader},
  data() {
    return {
      terms: termsData,
      categories: termCategories,
      selectedCategory: 'all',
      selectedTerms: []
    }
  },
  computed: {
    filteredTerms() {
      if (this.selectedCategory === 'all') {
        return this.terms
      }
      return this.terms.filter(term => term.category === this.selectedCategory)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    selectTerm(term) {
      // 切换术语选中状态
      const index = this.selectedTerms.findIndex(t => t.id === term.id)
      if (index > -1) {
        this.selectedTerms.splice(index, 1)
      } else {
        this.selectedTerms.push(term)
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
      if (this.selectedTerms.length === 0) {
        // 如果没有选中术语，使用当前筛选的所有术语
        this.selectedTerms = [...this.filteredTerms]
      }
      
      if (this.selectedTerms.length === 0) {
        uni.showToast({
          title: '请选择要学习的术语',
          icon: 'none'
        })
        return
      }
      
      // 跳转到卡片式学习页面
      uni.navigateTo({
        url: `/pages/study/card-study?terms=${encodeURIComponent(JSON.stringify(this.selectedTerms))}`
      })
    }
  }
}
</script>

<style scoped>
.standard-terms {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
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

.nav-left, .nav-right {
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

.category-filter {
  background-color: #ffffff;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: flex;
  padding: 0 32rpx;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */
  padding: 16rpx 24rpx;
  margin-right: 16rpx;
  background-color: #f8f9fa;
  border-radius: 32rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap; /* 防止换行 */
  text-align: center;
  min-width: 120rpx; /* 比固定宽度更灵活 */
}

.category-item.active {
  background-color: #667eea;
  border-color: #667eea;
  justify-content: center; /* 水平居中 */
  white-space: nowrap;
  min-width: 120rpx; /* 比固定宽度更灵活 */
}

.category-name {
  font-size: 28rpx;
  color: #666666;
  margin-right: 8rpx;
}

.category-item.active .category-name {
  color: #ffffff;
}

.category-count {
  font-size: 24rpx;
  color: #999999;
}

.category-item.active .category-count {
  color: #ffffff;
}

.terms-content {
  flex: 1;
  padding: 24rpx 32rpx;
}

.term-item {
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

.term-item:active {
  transform: scale(0.98);
  border-color: #667eea;
}

.term-main {
  flex: 1;
}

.term-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.term-chinese {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.term-badges {
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

.term-english {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.term-phonetic {
  font-size: 24rpx;
  color: #999999;
  font-style: italic;
  margin-bottom: 16rpx;
}

.term-definition {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.term-status {
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