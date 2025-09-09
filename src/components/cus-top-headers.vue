<template>
  <view class="header" :style="{'padding-top': statusBarPx + 'px'}">
    <!-- 顶部工具行：搜索框 + 右侧按钮 -->
    <view class="tool-row">
      <!-- 搜索框 -->
      <view class="search" @click="onSearch">
        <image class="search-icon" src="/static/icons/search.png" mode="widthFix"/>
        <text class="search-placeholder">{{ placeholder }}</text>
      </view>

      <!-- 右侧按钮 -->
      <view class="tool-right">
        <image class="icon-btn" src="/static/icons/scan.png" mode="widthFix" @click.stop="emit('scan')"/>
        <image class="icon-btn" src="/static/icons/service.png" mode="widthFix" @click.stop="emit('service')"/>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  gradient?: string
}>(), {
  placeholder: '题目搜索',
  gradient: 'linear-gradient(180deg, #E0F7FA 0%, #B2EBF2 100%)' // 淡蓝色渐变
})

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'scan'): void
  (e: 'service'): void
}>()

function onSearch() {
  emit('search')
}

const statusBarPx = ref(20)
onMounted(() => {
  const info = uni.getSystemInfoSync()
  statusBarPx.value = info.statusBarHeight || 20
})
</script>
<style scoped lang="scss">
.header {
  background: v-bind('gradient');
  padding: 12rpx 24rpx 18rpx;
  box-sizing: border-box;
  min-height: 120rpx;
}

.tool-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.tool-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.icon-btn {
  width: 40rpx;
  height: 40rpx;
}

.search {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10rpx); /* 半透明毛玻璃效果 */
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  color: #888;
  font-size: 28rpx;
}
</style>