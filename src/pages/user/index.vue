<template>
  <cus-navbar title="个人中心"></cus-navbar>
  <view class="user-container">

    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-card">
      <view class="login-avatar">
        <image class="avatar-img" src="/static/icons/user-avatar.png" mode="aspectFill"></image>
      </view>
      <view class="login-info">
        <text class="login-title">请登录</text>
        <text class="login-desc">登录后可查看个人信息和学习数据</text>
      </view>
      <button class="login-btn" @click="wxLogin">微信授权登录</button>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="user-card">
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
    <view v-if="isLoggedIn" class="quick-actions">
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
    <view v-if="isLoggedIn" class="achievements">
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
    </view>

    <!-- 应用信息 -->
    <view class="app-info">
      <view class="info-row">
        <text class="info-label">应用版本</text>
        <text class="info-value">v1.0.0</text>
      </view>
      <view v-if="isLoggedIn" class="info-row">
        <text class="info-label">最后登录</text>
        <text class="info-value">2025/09/05</text>
      </view>
    </view>
  </view>
</template>

<script>
import CusNavbar from "../../components/cus-navbar.vue";
import { userApi, studyApi } from '@/api/index.js';

export default {
  name: 'UserIndex',
  components: {CusNavbar},
  data() {
    return {
      isLoggedIn: false,
      userInfo: {
        name: '',
        role: '',
        school: '',
        avatar: '/static/icons/user-avatar.png',
        studyDays: 0,
        studyHours: 0
      },
      achievements: [],
      loading: true
    }
  },
  async onLoad() {
    await this.checkLoginStatus();
  },
  methods: {
    async checkLoginStatus() {
      try {
        // 检查本地存储的token
        const token = uni.getStorageSync('token');
        if (!token) {
          this.isLoggedIn = false;
          this.loading = false;
          return;
        }

        // 验证token有效性
        const userInfoRes = await userApi.getUserInfo();
        if (userInfoRes.code === 200) {
          this.isLoggedIn = true;
          await this.loadUserData();
        } else {
          this.isLoggedIn = false;
          // 清除无效token
          uni.removeStorageSync('token');
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        this.isLoggedIn = false;
        uni.removeStorageSync('token');
      } finally {
        this.loading = false;
      }
    },

    async loadUserData() {
      try {
        this.loading = true;

        // 获取用户基本信息
        const userInfoRes = await userApi.getUserInfo();
        if (userInfoRes.code === 200) {
          this.userInfo = {
            name: userInfoRes.data.name || '',
            role: userInfoRes.data.role || '',
            school: userInfoRes.data.school || '',
            avatar: userInfoRes.data.avatar || '/static/icons/user-avatar.png',
            studyDays: userInfoRes.data.studyDays || 0,
            studyHours: userInfoRes.data.studyHours || 0
          };
        }

        // 获取学习统计数据
        const statsRes = await studyApi.getStudyStats();
        if (statsRes.code === 200) {
          this.userInfo.studyDays = statsRes.data.studyDays || 0;
          this.userInfo.studyHours = statsRes.data.studyHours || 0;
        }

        // 获取最近成就
        await this.loadAchievements();

      } catch (error) {
        console.error('加载用户数据失败:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    async loadAchievements() {
      try {
        // 这里需要后台提供获取用户成就的API
        // 暂时使用学习统计API的扩展数据
        const res = await studyApi.getStudyStats();
        if (res.code === 200 && res.data.achievements) {
          this.achievements = res.data.achievements;
        }
      } catch (error) {
        console.error('加载成就数据失败:', error);
      }
    },

    goToProfile() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },

    goToSettings() {
      uni.navigateTo({
        url: '/pages/user/settings'
      })
    },

    goToProgress() {
      uni.navigateTo({
        url: '/pages/user/progress'
      })
    },

    goToErrorBook() {
      uni.navigateTo({
        url: '/pages/user/mistakes'
      })
    },

    goToHistory() {
      uni.navigateTo({
        url: '/pages/user/history'
      })
    },

    async wxLogin() {
      try {
        uni.showLoading({ title: '登录中...' });
        
        // 获取微信授权
        const loginRes = await uni.login({
          provider: 'weixin'
        });
        
        if (loginRes[1].code) {
          // 调用后台登录接口
          const authRes = await userApi.wxLogin({
            code: loginRes[1].code
          });
          
          if (authRes.code === 200) {
            // 保存token
            uni.setStorageSync('token', authRes.data.token);
            
            // 更新登录状态
            this.isLoggedIn = true;
            
            // 加载用户数据
            await this.loadUserData();
            
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
          } else {
            uni.showToast({
              title: authRes.message || '登录失败',
              icon: 'none'
            });
          }
        } else {
          uni.showToast({
            title: '获取授权失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('微信登录失败:', error);
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    }
  }
}
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  padding-bottom: 100px;
}

/* 登录卡片 */
.login-card {
  background: white;
  margin: 20px;
  border-radius: 16px;
  padding: 40px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-avatar {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid #e8f4fd;
}

.login-info {
  margin-bottom: 30px;
}

.login-title {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.login-desc {
  display: block;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.login-btn {
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
}

.login-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
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