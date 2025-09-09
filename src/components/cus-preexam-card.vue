<template>
  <view class="preexam-container">


    <!-- 考试配置区域 -->
    <view class="config-section">
      <!-- 考试难度 -->
      <view class="config-item">
        <text class="config-label">考试难度</text>
        <view class="select-box" @click="emit('showDifficultyPicker')">
          <text class="select-text">{{ difficulty }}</text>
          <text class="select-arrow">></text>
        </view>
      </view>

      <!-- 考试时长 -->
      <view class="config-item">
        <text class="config-label">考试时长</text>
        <view class="select-box" @click="emit('showDurationPicker')">
          <text class="select-text">{{ duration }}</text>
          <text class="select-arrow">></text>
        </view>
      </view>

      <!-- 音频质量 -->
      <view class="config-item">
        <text class="config-label">音频质量</text>
        <view class="select-box" @click="emit('showQualityPicker')">
          <text class="select-text">{{ quality }}</text>
          <text class="select-arrow">></text>
        </view>
      </view>

      <!-- 背景噪音 -->
      <view class="config-item">
        <text class="config-label">背景噪音</text>
        <view class="switch-container">
          <text class="switch-text off" :class="{ active: !backgroundNoise }">关闭</text>
          <!-- uni-app 的 switch 事件为 e.detail.value -->
          <switch class="switch"
                  :checked="backgroundNoise"
                  @change="onToggleBackgroundNoise" />
          <text class="switch-text on" :class="{ active: backgroundNoise }">开启</text>
        </view>
      </view>
    </view>

    <!-- 考试说明（略） -->

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button class="return-btn" @click="emit('goBack')">返回</button>
      <button class="start-btn" @click="onStart">开始考试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    title?: string
    difficulty: string
    duration: string
    quality: string
    backgroundNoise: boolean
  }>(), {
    title: '初试模拟',
    difficulty: 'Level 4-5',
    duration: '45分钟',
    quality: '标准',
    backgroundNoise: true,
  })

/**
 * 事件设计：
 * - showXxxPicker：让父组件弹出对应选择器
 * - update:xxx：父组件用 v-model:xxx 双向绑定
 * - goBack / startExam：页面跳转或提交
 */
const emit = defineEmits<{
  (e: 'showDifficultyPicker'): void
  (e: 'showDurationPicker'): void
  (e: 'showQualityPicker'): void

  (e: 'update:difficulty', val: string): void
  (e: 'update:duration',   val: string): void
  (e: 'update:quality',    val: string): void
  (e: 'update:backgroundNoise', val: boolean): void

  (e: 'goBack'): void
  (e: 'startExam', payload: {
    difficulty: string
    duration: string
    quality: string
    backgroundNoise: boolean
  }): void
}>()

function onToggleBackgroundNoise(e: any) {
  // uni-app：e.detail.value 为布尔值
  emit('update:backgroundNoise', !!e.detail.value)
}

function onStart() {
  emit('startExam', {
    difficulty: props.difficulty,
    duration: props.duration,
    quality: props.quality,
    backgroundNoise: props.backgroundNoise
  })
}
</script>

<style scoped>
.preexam-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 顶部标题栏 */
.header {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx 20rpx 30rpx;
  background-color: #ffffff;
  position: relative;
}

.title {
  font-size: 44rpx;
  font-weight: 600;
  color: #4285f4;
  margin-right: 15rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666666;
  font-weight: 400;
}

.user-avatar {
  position: absolute;
  right: 30rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100%;
  height: 100%;
}

/* 配置区域 */
.config-section {
  background-color: #ffffff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.config-item:last-child {
  border-bottom: none;
}

.config-label {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.select-box {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  min-width: 200rpx;
  justify-content: space-between;
}

.select-text {
  font-size: 28rpx;
  color: #666666;
}

.select-arrow {
  font-size: 24rpx;
  color: #999999;
  margin-left: 16rpx;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.switch-text {
  font-size: 28rpx;
  color: #999999;
  transition: color 0.3s;
}

.switch-text.active {
  color: #4285f4;
  font-weight: 500;
}

.switch {
  transform: scale(0.8);
}

/* 考试说明 */
.exam-instructions {
  background-color: #ffffff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
}

.instructions-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 32rpx;
}

.instruction-item {
  display: flex;
  margin-bottom: 20rpx;
}

.instruction-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
  min-width: 160rpx;
}

.instruction-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

.instruction-note {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-top: 24rpx;
  display: block;
}

.warning-item {
  display: flex;
  align-items: flex-start;
  margin-top: 24rpx;
  padding: 20rpx;
  background-color: #fff3cd;
  border-radius: 8rpx;
  border-left: 4rpx solid #ffc107;
}

.warning-icon {
  width: 32rpx;
  height: 32rpx;
  background-color: #ffc107;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.warning-text {
  font-size: 26rpx;
  color: #856404;
  line-height: 1.5;
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 24rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.1);
}

.return-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: 2rpx solid #e0e0e0;
  background-color: #ffffff;
  color: #666666;
}

.return-btn:active {
  background-color: #f5f5f5;
}

.start-btn {
  flex: 2;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(66, 133, 244, 0.3);
}

.start-btn:active {
  opacity: 0.9;
  transform: translateY(1rpx);
}
</style>