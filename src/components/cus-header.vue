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
</style>