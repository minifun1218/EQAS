<script setup lang="ts">
  const props = withDefaults(defineProps<{ title?: string }>(), {
    title: '首页'
  });
  const emit = defineEmits(['goBack'])
  function handleBack() {
    emit('goBack')
  }
</script>

<template>
  <view class="header">
    <view class="nav-bar">
      <view class="nav-left" @click="handleBack">
        <image class="back-icon" src="/static/icons/back.png" mode="aspectFit"></image>
      </view>
      <view class="nav-title">{{title}}</view>
      <view class="nav-right"></view>
    </view>
  </view>
</template>

<style scoped>
.header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  border-bottom: 1rpx solid rgba(203, 213, 225, 0.3);
  backdrop-filter: blur(20rpx);
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.03) 100%);
  pointer-events: none;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 40rpx;
  position: relative;
  z-index: 1;
}

.nav-left {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.1);
  cursor: pointer;
}

.nav-left:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-1rpx);
  box-shadow: 0 6rpx 20rpx rgba(99, 102, 241, 0.15);
}

.nav-left:active {
  transform: translateY(1rpx) scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.2);
}

.back-icon {
  width: 44rpx;
  height: 44rpx;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(104%) contrast(97%);
  transition: all 0.3s ease;
}

.nav-left:hover .back-icon {
  filter: brightness(0) saturate(100%) invert(20%) sepia(77%) saturate(7482%) hue-rotate(246deg) brightness(89%) contrast(143%);
}

.nav-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5rpx;
  text-shadow: 0 2rpx 4rpx rgba(30, 41, 59, 0.1);
}

.nav-right {
  width: 72rpx;
}
</style>