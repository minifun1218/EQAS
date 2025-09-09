<template>
  <view class="settings-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">设置</text>
      <view class="nav-right"></view>
    </view>

    <!-- 个人设置 -->
    <view class="settings-section">
      <text class="section-title">个人设置</text>
      <view class="settings-list">
        <view class="setting-item" @click="editProfile">
          <view class="setting-left">
            <text class="setting-icon">👤</text>
            <text class="setting-label">个人资料</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">修改个人信息</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item" @click="changePassword">
          <view class="setting-left">
            <text class="setting-icon">🔒</text>
            <text class="setting-label">修改密码</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">更改登录密码</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item" @click="bindAccount">
          <view class="setting-left">
            <text class="setting-icon">🔗</text>
            <text class="setting-label">账号绑定</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">绑定第三方账号</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 学习设置 -->
    <view class="settings-section">
      <text class="section-title">学习设置</text>
      <view class="settings-list">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🎯</text>
            <text class="setting-label">每日学习目标</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ studySettings.dailyGoal }}分钟</text>
            <text class="setting-arrow" @click="setDailyGoal">></text>
          </view>
        </view>
        
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">⏰</text>
            <text class="setting-label">学习提醒</text>
          </view>
          <switch 
            :checked="studySettings.studyReminder" 
            @change="onStudyReminderChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item" @click="setReminderTime" v-if="studySettings.studyReminder">
          <view class="setting-left">
            <text class="setting-icon">🕐</text>
            <text class="setting-label">提醒时间</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ studySettings.reminderTime }}</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">📊</text>
            <text class="setting-label">自动保存进度</text>
          </view>
          <switch 
            :checked="studySettings.autoSave" 
            @change="onAutoSaveChange"
            color="#007AFF"
          />
        </view>
      </view>
    </view>

    <!-- 系统设置 -->
    <view class="settings-section">
      <text class="section-title">系统设置</text>
      <view class="settings-list">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🔔</text>
            <text class="setting-label">推送通知</text>
          </view>
          <switch 
            :checked="systemSettings.pushNotification" 
            @change="onPushNotificationChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🔊</text>
            <text class="setting-label">音效</text>
          </view>
          <switch 
            :checked="systemSettings.soundEffect" 
            @change="onSoundEffectChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">📳</text>
            <text class="setting-label">震动反馈</text>
          </view>
          <switch 
            :checked="systemSettings.vibration" 
            @change="onVibrationChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item" @click="selectLanguage">
          <view class="setting-left">
            <text class="setting-icon">🌐</text>
            <text class="setting-label">语言</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ systemSettings.language }}</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item" @click="selectTheme">
          <view class="setting-left">
            <text class="setting-icon">🎨</text>
            <text class="setting-label">主题模式</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ systemSettings.theme }}</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 隐私设置 -->
    <view class="settings-section">
      <text class="section-title">隐私设置</text>
      <view class="settings-list">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">📊</text>
            <text class="setting-label">数据统计</text>
          </view>
          <switch 
            :checked="privacySettings.dataAnalytics" 
            @change="onDataAnalyticsChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🔍</text>
            <text class="setting-label">个性化推荐</text>
          </view>
          <switch 
            :checked="privacySettings.personalization" 
            @change="onPersonalizationChange"
            color="#007AFF"
          />
        </view>
        
        <view class="setting-item" @click="showPrivacyPolicy">
          <view class="setting-left">
            <text class="setting-icon">📋</text>
            <text class="setting-label">隐私政策</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">查看隐私条款</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 存储管理 -->
    <view class="settings-section">
      <text class="section-title">存储管理</text>
      <view class="settings-list">
        <view class="setting-item" @click="showStorageInfo">
          <view class="setting-left">
            <text class="setting-icon">💾</text>
            <text class="setting-label">存储空间</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">{{ storageInfo.used }}/{{ storageInfo.total }}</text>
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
        
        <view class="setting-item" @click="exportData">
          <view class="setting-left">
            <text class="setting-icon">📤</text>
            <text class="setting-label">导出数据</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">备份学习数据</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他设置 -->
    <view class="settings-section">
      <text class="section-title">其他</text>
      <view class="settings-list">
        <view class="setting-item" @click="checkUpdate">
          <view class="setting-left">
            <text class="setting-icon">🔄</text>
            <text class="setting-label">检查更新</text>
          </view>
          <view class="setting-right">
            <text class="setting-value">v1.0.0</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item" @click="showAbout">
          <view class="setting-left">
            <text class="setting-icon">ℹ️</text>
            <text class="setting-label">关于我们</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">应用信息</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
        
        <view class="setting-item" @click="showHelp">
          <view class="setting-left">
            <text class="setting-icon">❓</text>
            <text class="setting-label">帮助与反馈</text>
          </view>
          <view class="setting-right">
            <text class="setting-desc">使用帮助</text>
            <text class="setting-arrow">></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>

    <!-- 设置弹窗 -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ modalTitle }}</text>
        </view>
        <view class="modal-body">
          <!-- 每日目标设置 -->
          <view v-if="modalType === 'dailyGoal'" class="goal-setting">
            <text class="goal-label">设置每日学习目标（分钟）</text>
            <slider 
              :value="tempDailyGoal" 
              @change="onGoalChange" 
              min="10" 
              max="180" 
              step="10"
              show-value
              activeColor="#007AFF"
            />
            <text class="goal-desc">建议每日学习30-60分钟</text>
          </view>
          
          <!-- 提醒时间设置 -->
          <view v-if="modalType === 'reminderTime'" class="time-setting">
            <picker 
              mode="time" 
              :value="tempReminderTime" 
              @change="onTimeChange"
            >
              <view class="time-picker">
                <text class="time-label">选择提醒时间</text>
                <text class="time-value">{{ tempReminderTime }}</text>
              </view>
            </picker>
          </view>
          
          <!-- 语言选择 -->
          <view v-if="modalType === 'language'" class="language-setting">
            <view 
              v-for="lang in languages" 
              :key="lang.code"
              class="language-item"
              :class="{selected: tempLanguage === lang.code}"
              @click="selectLang(lang.code)"
            >
              <text class="language-name">{{ lang.name }}</text>
              <text v-if="tempLanguage === lang.code" class="language-check">✓</text>
            </view>
          </view>
          
          <!-- 主题选择 -->
          <view v-if="modalType === 'theme'" class="theme-setting">
            <view 
              v-for="theme in themes" 
              :key="theme.code"
              class="theme-item"
              :class="{selected: tempTheme === theme.code}"
              @click="selectThemeOption(theme.code)"
            >
              <view class="theme-preview" :style="{backgroundColor: theme.color}"></view>
              <text class="theme-name">{{ theme.name }}</text>
              <text v-if="tempTheme === theme.code" class="theme-check">✓</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeModal">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmSetting">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      studySettings: {
        dailyGoal: 30,
        studyReminder: true,
        reminderTime: '20:00',
        autoSave: true
      },
      systemSettings: {
        pushNotification: true,
        soundEffect: true,
        vibration: false,
        language: '中文',
        theme: '浅色模式'
      },
      privacySettings: {
        dataAnalytics: true,
        personalization: true
      },
      storageInfo: {
        used: '128MB',
        total: '1GB'
      },
      cacheSize: '45MB',
      showModal: false,
      modalType: '',
      modalTitle: '',
      tempDailyGoal: 30,
      tempReminderTime: '20:00',
      tempLanguage: 'zh',
      tempTheme: 'light',
      languages: [
        { code: 'zh', name: '中文' },
        { code: 'en', name: 'English' },
        { code: 'ja', name: '日本語' }
      ],
      themes: [
        { code: 'light', name: '浅色模式', color: '#ffffff' },
        { code: 'dark', name: '深色模式', color: '#1a1a1a' },
        { code: 'auto', name: '跟随系统', color: '#007AFF' }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    // 个人设置
    editProfile() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },
    
    changePassword() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    bindAccount() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 学习设置
    setDailyGoal() {
      this.modalType = 'dailyGoal'
      this.modalTitle = '每日学习目标'
      this.tempDailyGoal = this.studySettings.dailyGoal
      this.showModal = true
    },
    
    onStudyReminderChange(e) {
      this.studySettings.studyReminder = e.detail.value
      this.saveSettings()
    },
    
    setReminderTime() {
      this.modalType = 'reminderTime'
      this.modalTitle = '设置提醒时间'
      this.tempReminderTime = this.studySettings.reminderTime
      this.showModal = true
    },
    
    onAutoSaveChange(e) {
      this.studySettings.autoSave = e.detail.value
      this.saveSettings()
    },
    
    // 系统设置
    onPushNotificationChange(e) {
      this.systemSettings.pushNotification = e.detail.value
      this.saveSettings()
    },
    
    onSoundEffectChange(e) {
      this.systemSettings.soundEffect = e.detail.value
      this.saveSettings()
    },
    
    onVibrationChange(e) {
      this.systemSettings.vibration = e.detail.value
      this.saveSettings()
    },
    
    selectLanguage() {
      this.modalType = 'language'
      this.modalTitle = '选择语言'
      this.tempLanguage = this.languages.find(lang => lang.name === this.systemSettings.language)?.code || 'zh'
      this.showModal = true
    },
    
    selectTheme() {
      this.modalType = 'theme'
      this.modalTitle = '选择主题'
      this.tempTheme = this.themes.find(theme => theme.name === this.systemSettings.theme)?.code || 'light'
      this.showModal = true
    },
    
    // 隐私设置
    onDataAnalyticsChange(e) {
      this.privacySettings.dataAnalytics = e.detail.value
      this.saveSettings()
    },
    
    onPersonalizationChange(e) {
      this.privacySettings.personalization = e.detail.value
      this.saveSettings()
    },
    
    showPrivacyPolicy() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 存储管理
    showStorageInfo() {
      uni.showModal({
        title: '存储信息',
        content: `已使用: ${this.storageInfo.used}\n总容量: ${this.storageInfo.total}`,
        showCancel: false
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
    
    exportData() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 其他设置
    checkUpdate() {
      uni.showLoading({
        title: '检查更新中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }, 2000)
    },
    
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: 'EQAS航空英语学习系统\n版本: v1.0.0\n开发团队: EQAS Team',
        showCancel: false
      })
    },
    
    showHelp() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 退出登录
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        }
      })
    },
    
    // 弹窗相关
    closeModal() {
      this.showModal = false
    },
    
    onGoalChange(e) {
      this.tempDailyGoal = e.detail.value
    },
    
    onTimeChange(e) {
      this.tempReminderTime = e.detail.value
    },
    
    selectLang(code) {
      this.tempLanguage = code
    },
    
    selectThemeOption(code) {
      this.tempTheme = code
    },
    
    confirmSetting() {
      if (this.modalType === 'dailyGoal') {
        this.studySettings.dailyGoal = this.tempDailyGoal
      } else if (this.modalType === 'reminderTime') {
        this.studySettings.reminderTime = this.tempReminderTime
      } else if (this.modalType === 'language') {
        const lang = this.languages.find(l => l.code === this.tempLanguage)
        this.systemSettings.language = lang ? lang.name : '中文'
      } else if (this.modalType === 'theme') {
        const theme = this.themes.find(t => t.code === this.tempTheme)
        this.systemSettings.theme = theme ? theme.name : '浅色模式'
      }
      
      this.saveSettings()
      this.closeModal()
      
      uni.showToast({
        title: '设置已保存',
        icon: 'success'
      })
    },
    
    saveSettings() {
      // 保存设置到本地存储
      uni.setStorageSync('studySettings', this.studySettings)
      uni.setStorageSync('systemSettings', this.systemSettings)
      uni.setStorageSync('privacySettings', this.privacySettings)
    },
    
    loadSettings() {
      // 从本地存储加载设置
      const studySettings = uni.getStorageSync('studySettings')
      const systemSettings = uni.getStorageSync('systemSettings')
      const privacySettings = uni.getStorageSync('privacySettings')
      
      if (studySettings) {
        this.studySettings = { ...this.studySettings, ...studySettings }
      }
      if (systemSettings) {
        this.systemSettings = { ...this.systemSettings, ...systemSettings }
      }
      if (privacySettings) {
        this.privacySettings = { ...this.privacySettings, ...privacySettings }
      }
    }
  },
  
  onLoad() {
    this.loadSettings()
  }
}
</script>

<style scoped>
.settings-container {
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

/* 设置区域 */
.settings-section {
  margin: 40rpx 32rpx 0;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
}

.settings-list {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f8f9fa;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.setting-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.setting-label {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.setting-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.setting-value {
  font-size: 28rpx;
  color: #666666;
}

.setting-desc {
  font-size: 24rpx;
  color: #999999;
}

.setting-arrow {
  font-size: 32rpx;
  color: #cccccc;
}

/* 退出登录 */
.logout-section {
  margin: 60rpx 32rpx 0;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #ff4757;
  color: #ffffff;
  border: none;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.logout-btn:active {
  background: #ff3742;
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

.modal-content {
  background: #ffffff;
  border-radius: 24rpx;
  margin: 32rpx;
  max-width: 600rpx;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  padding: 48rpx 32rpx 24rpx;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.modal-body {
  padding: 32rpx;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666666;
}

.confirm-btn {
  background: #007AFF;
  color: #ffffff;
}

/* 目标设置 */
.goal-setting {
  text-align: center;
}

.goal-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 40rpx;
}

.goal-desc {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-top: 24rpx;
}

/* 时间设置 */
.time-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.time-label {
  font-size: 28rpx;
  color: #333333;
}

.time-value {
  font-size: 28rpx;
  color: #007AFF;
  font-weight: 600;
}

/* 语言设置 */
.language-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.language-item:last-child {
  border-bottom: none;
}

.language-item.selected {
  background: #f0f9ff;
}

.language-name {
  font-size: 28rpx;
  color: #333333;
}

.language-check {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: 600;
}

/* 主题设置 */
.theme-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.theme-item:last-child {
  border-bottom: none;
}

.theme-item.selected {
  background: #f0f9ff;
}

.theme-preview {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  margin-right: 24rpx;
  border: 2rpx solid #e8e8e8;
}

.theme-name {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.theme-check {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: 600;
}
</style>