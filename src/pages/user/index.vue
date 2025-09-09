<template>
  <cus-navbar title="个人中心"></cus-navbar>
  <view class="user-container">

    <view class="user-card">
      <view class="user-avatar">
        <image class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.name }}</text>
        <text class="user-role">{{ userInfo.role }}</text>
        <text class="user-school">{{ userInfo.school }}</text>
      </view>
      <view class="user-stats">
        <view class="stat-item">
          <text class="stat-number">{{ userInfo.studyDays }}</text>
          <text class="stat-label">学习天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ userInfo.studyHours }}</text>
          <text class="stat-label">学习时长</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <text class="section-title">快捷操作</text>
      <view class="action-list">
        <view class="action-item" @click="goToProfile">

          <view class="action-content">
            <text class="action-title">个人中心</text>
            <text class="action-desc">管理个人信息</text>
          </view>
          <text class="action-arrow">></text>
        </view>

        <view class="action-item" @click="goToSettings">

          <view class="action-content">
            <text class="action-title">设置</text>
            <text class="action-desc">个性化应用体验</text>
          </view>
          <text class="action-arrow">></text>
        </view>

        <view class="action-item" @click="goToProgress">

          <view class="action-content">
            <text class="action-title">学习进度</text>
            <text class="action-desc">查看学习统计</text>
          </view>
          <text class="action-arrow">></text>
        </view>

        <view class="action-item" @click="goToErrorBook">

          <view class="action-content">
            <text class="action-title">错题本</text>
            <text class="action-desc">复习错误题目</text>
          </view>
          <text class="action-arrow">></text>
        </view>

        <view class="action-item" @click="goToHistory">

          <view class="action-content">
            <text class="action-title">练习历史</text>
            <text class="action-desc">查看历史记录</text>
          </view>
          <text class="action-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 最近成就 -->
    <view class="achievements">
      <text class="section-title">最近成就</text>
      <view class="achievement-list">
        <view
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-item"
        >
          <view class="achievement-icon">
            <text class="achievement-emoji">{{ achievement.icon }}</text>
          </view>
          <view class="achievement-content">
            <text class="achievement-title">{{ achievement.title }}</text>
            <text class="achievement-desc">{{ achievement.description }}</text>
            <text class="achievement-date">{{ achievement.date }}</text>
          </view>
        </view>
      </view>

      <!-- 应用信息 -->
      <view class="app-info">
        <view class="info-row">
          <text class="info-label">应用版本</text>
          <text class="info-value">v1.0.0</text>
        </view>
        <view class="info-row">
          <text class="info-label">最后登录</text>
          <text class="info-value">2025/09/05</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CusNavbar from "../../components/cus-navbar.vue";

export default {
  name: 'UserIndex',
  components: {CusNavbar},
  data() {
    return {
      userInfo: {
        name: '张三',
        role: '航空学员',
        school: '中国民航大学',
        avatar: '/static/icons/user-avatar.png',
        studyDays: 45,
        studyHours: 128
      },
      achievements: [
        {
          id: 1,
          title: '连续学习7天',
          description: '坚持每日学习，养成良好习惯',
          date: '2024/01/15',
          icon: '🏆'
        },
        {
          id: 2,
          title: '听力训练达人',
          description: '完成100道听力练习题',
          date: '2024/01/10',
          icon: '🎯'
        },
        {
          id: 3,
          title: '首次满分',
          description: '在模拟考试中获得满分',
          date: '2024/01/05',
          icon: '⭐'
        }
      ]
    }
  },
  methods: {
    goToProfile() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },
    
    goToSettings() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    goToProgress() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    goToErrorBook() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    goToHistory() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  padding-bottom: 100px;
}

/* 用户信息卡片 */
.user-card {
  background: white;
  margin: 20px;
  border-radius: 16px;
  padding: 30px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid #e8f4fd;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.user-info {
  margin-bottom: 30px;
}

.user-name {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-role {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
}

.user-school {
  display: block;
  font-size: 14px;
  color: #999;
}

.user-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 快捷操作 */
.quick-actions {
  margin: 20px;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.action-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.action-item:last-child {
  border-bottom: none;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.profile-icon {
  background: #e8f4fd;
}

.settings-icon {
  background: #f0f9ff;
}

.progress-icon {
  background: #f0fdf4;
}

.error-icon {
  background: #fef2f2;
}

.history-icon {
  background: #fefce8;
}

.icon {
  width: 24px;
  height: 24px;
}

.action-content {
  flex: 1;
}

.action-title {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  color: #666;
}

.action-arrow {
  font-size: 18px;
  color: #ccc;
}

/* 最近成就 */
.achievements {
  margin: 20px;
}

.achievement-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.achievement-item:last-child {
  border-bottom: none;
}

.achievement-icon {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: #fff7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.achievement-emoji {
  font-size: 24px;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.achievement-desc {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.achievement-date {
  font-size: 12px;
  color: #999;
}

/* 应用信息 */
.app-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 16px;
  color: #333;
}

.info-value {
  font-size: 16px;
  color: #666;
}
</style>