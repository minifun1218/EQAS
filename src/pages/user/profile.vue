<template>
  <cus-navbar title="个人中心"></cus-navbar>
  <view class="profile-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">个人中心</text>
      <view class="nav-right"></view>
    </view>

    <!-- 用户头像区域 -->
    <view class="profile-header">
      <view class="avatar-section" @click="changeAvatar">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
        <view class="camera-icon">
          <text class="camera-text">📷</text>
        </view>
      </view>
      <text class="username">{{ userInfo.name }}</text>
      <text class="user-id">ID: {{ userInfo.id }}</text>
    </view>

    <!-- 个人信息 -->
    <view class="info-section">
      <text class="section-title">个人信息</text>
      <view class="info-list">
        <view class="info-item" @click="editName">
          <text class="info-label">姓名</text>
          <text class="info-value">{{ userInfo.name }}</text>
          <text class="info-arrow">></text>
        </view>
        
        <view class="info-item" @click="editRole">
          <text class="info-label">身份</text>
          <text class="info-value">{{ userInfo.role }}</text>
          <text class="info-arrow">></text>
        </view>
        
        <view class="info-item" @click="editSchool">
          <text class="info-label">学校</text>
          <text class="info-value">{{ userInfo.school }}</text>
          <text class="info-arrow">></text>
        </view>
        
        <view class="info-item" @click="editPhone">
          <text class="info-label">手机号</text>
          <text class="info-value">{{ userInfo.phone }}</text>
          <text class="info-arrow">></text>
        </view>
        
        <view class="info-item" @click="editEmail">
          <text class="info-label">邮箱</text>
          <text class="info-value">{{ userInfo.email }}</text>
          <text class="info-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 学习统计 -->
    <view class="stats-section">
      <text class="section-title">学习统计</text>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-number">{{ userInfo.studyDays }}</text>
          <text class="stat-label">学习天数</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ userInfo.studyHours }}</text>
          <text class="stat-label">学习时长</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ userInfo.completedExams }}</text>
          <text class="stat-label">完成考试</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ userInfo.averageScore }}</text>
          <text class="stat-label">平均分数</text>
        </view>
      </view>
    </view>

    <!-- 设置选项 -->
    <view class="settings-section">
      <text class="section-title">设置</text>
      <view class="settings-list">
        <view class="setting-item" @click="toggleNotification">
          <view class="setting-left">
            <text class="setting-icon">🔔</text>
            <text class="setting-label">消息通知</text>
          </view>
          <switch 
            :checked="settings.notification" 
            @change="onNotificationChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item" @click="toggleSound">
          <view class="setting-left">
            <text class="setting-icon">🔊</text>
            <text class="setting-label">音效</text>
          </view>
          <switch 
            :checked="settings.sound" 
            @change="onSoundChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item" @click="changeLanguage">
          <view class="setting-left">
            <text class="setting-icon">🌐</text>
            <text class="setting-label">语言设置</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ settings.language }}</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item" @click="clearCache">
          <view class="setting-left">
            <text class="setting-icon">🗑️</text>
            <text class="setting-label">清除缓存</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ cacheSize }}</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他选项 -->
    <view class="other-section">
      <view class="other-list">
        <view class="other-item" @click="showAbout">
          <text class="other-label">关于我们</text>
          <text class="other-arrow">></text>
        </view>
        
        <view class="other-item" @click="showPrivacy">
          <text class="other-label">隐私政策</text>
          <text class="other-arrow">></text>
        </view>
        
        <view class="other-item" @click="showHelp">
          <text class="other-label">帮助与反馈</text>
          <text class="other-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
import CusNavbar from "../../components/cus-navbar.vue";

export default {
  name: 'UserProfile',
  components: {CusNavbar},
  data() {
    return {
      userInfo: {
        id: '20240001',
        name: '张三',
        role: '航空学员',
        school: '中国民航大学',
        phone: '138****8888',
        email: 'zhangsan@example.com',
        avatar: '/static/icons/user-avatar.png',
        studyDays: 45,
        studyHours: 128,
        completedExams: 12,
        averageScore: 85
      },
      settings: {
        notification: true,
        sound: true,
        language: '中文'
      },
      cacheSize: '12.5MB'
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        }
      })
    },
    
    editName() {
      this.showEditDialog('姓名', this.userInfo.name, (value) => {
        this.userInfo.name = value
      })
    },
    
    editRole() {
      uni.showActionSheet({
        itemList: ['航空学员', '飞行员', '空管员', '机务人员'],
        success: (res) => {
          const roles = ['航空学员', '飞行员', '空管员', '机务人员']
          this.userInfo.role = roles[res.tapIndex]
        }
      })
    },
    
    editSchool() {
      this.showEditDialog('学校', this.userInfo.school, (value) => {
        this.userInfo.school = value
      })
    },
    
    editPhone() {
      this.showEditDialog('手机号', this.userInfo.phone, (value) => {
        this.userInfo.phone = value
      })
    },
    
    editEmail() {
      this.showEditDialog('邮箱', this.userInfo.email, (value) => {
        this.userInfo.email = value
      })
    },
    
    showEditDialog(title, currentValue, callback) {
      uni.showModal({
        title: `编辑${title}`,
        editable: true,
        placeholderText: `请输入${title}`,
        success: (res) => {
          if (res.confirm && res.content) {
            callback(res.content)
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    onNotificationChange(e) {
      this.settings.notification = e.detail.value
    },
    
    onSoundChange(e) {
      this.settings.sound = e.detail.value
    },
    
    changeLanguage() {
      uni.showActionSheet({
        itemList: ['中文', 'English'],
        success: (res) => {
          const languages = ['中文', 'English']
          this.settings.language = languages[res.tapIndex]
        }
      })
    },
    
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            this.cacheSize = '0MB'
            uni.showToast({
              title: '缓存已清除',
              icon: 'success'
            })
          }
        }
      })
    },
    
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: 'EQAS - 民航英语能力评估系统\n版本：v1.0.0\n开发团队：民航英语教学团队',
        showCancel: false
      })
    },
    
    showPrivacy() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    showHelp() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            // 这里可以添加退出登录的逻辑
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.nav-left {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 24px;
  color: #007AFF;
}

.nav-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.nav-right {
  width: 44px;
}

/* 用户头像区域 */
.profile-header {
  background: white;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-section {
  position: relative;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border: 3px solid #e8f4fd;
}

.camera-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: #007AFF;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.camera-text {
  font-size: 16px;
}

.username {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-id {
  font-size: 14px;
  color: #999;
}

/* 通用区域样式 */
.info-section,
.stats-section,
.settings-section {
  margin: 20px;
}

.section-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

/* 个人信息 */
.info-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 16px;
  color: #333;
  width: 80px;
}

.info-value {
  flex: 1;
  font-size: 16px;
  color: #666;
  text-align: right;
  margin-right: 10px;
}

.info-arrow {
  font-size: 18px;
  color: #ccc;
}

/* 学习统计 */
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.stat-card {
  flex: 1;
  min-width: calc(50% - 7.5px);
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 设置选项 */
.settings-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-left {
  display: flex;
  align-items: center;
}

.setting-icon {
  font-size: 20px;
  margin-right: 12px;
}

.setting-label {
  font-size: 16px;
  color: #333;
}

.setting-right {
  display: flex;
  align-items: center;
}

.setting-value {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}

.setting-arrow {
  font-size: 18px;
  color: #ccc;
}

/* 其他选项 */
.other-section {
  margin: 20px;
}

.other-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.other-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.other-item:last-child {
  border-bottom: none;
}

.other-label {
  font-size: 16px;
  color: #333;
}

.other-arrow {
  font-size: 18px;
  color: #ccc;
}

/* 退出登录 */
.logout-section {
  margin: 20px;
  padding-bottom: 40px;
}

.logout-btn {
  width: 100%;
  height: 50px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

.logout-btn:active {
  background: #ff3742;
}
</style>