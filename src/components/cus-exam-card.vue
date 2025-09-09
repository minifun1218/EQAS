<template>
  <view class="exam-wrap">
    <view class="card">
      <!-- 顶部小图标 -->
      <view class="star">
        <svg viewBox="0 0 24 24">
          <path d="M11 3a1 1 0 0 1 2 0v8h8a1 1 0 1 1 0 2h-8v8a1 1 0 1 1-2 0v-8H3a1 1 0 1 1 0-2h8V3z" fill="currentColor"/>
        </svg>
      </view>

      <!-- 标题与描述 -->
      <view class="head">
        <text class="title">{{ props.title }}</text>
        <text class="desc">
          {{props.desc}}
        </text>
      </view>

      <!-- 信息区 -->
      <view class="meta">
        <view class="row" v-for="(item, index) in props.labelList" :key="index">
          <text class="label">{{ item.key }}：</text>
          <text class="val">{{ item.value }}</text>
        </view>
      </view>

      <!-- 标签 -->
      <view class="chips">
        <text class="chip chip--blue">听力理解</text>
        <text class="chip chip--green">故事复述</text>
        <text class="chip chip--orange">听力简答</text>
      </view>

      <!-- 主按钮 -->
      <button class="btn" @click="handleStartPrimaryExam()">开始考试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  type LabelItem = { key: string; value: string }

  const props = withDefaults(defineProps<{
    title?: string
    desc: string
    labelList: LabelItem[]
  }>(), {
    title: '初试模拟',
    desc: 'ICAO4初级考试模拟，包含听力理解、故事复述、听力简答三个模块',
  })

  const emit = defineEmits(['startPrimaryExam'])
    function handleStartPrimaryExam() {
      emit('startPrimaryExam')
    }
</script>

<style scoped>
/* 页面背景 */
.exam-wrap {

  background: #f6f7fb;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40rpx 24rpx;
  box-sizing: border-box;
}

/* 卡片主体 */
.card {
  width: 670rpx;
  max-width: 92vw;
  background: #ffffff;
  border-radius: 28rpx;
  border: 2rpx solid #eef2ff;
  box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.08);
  padding: 36rpx 34rpx 34rpx;
  text-align: center;
  box-sizing: border-box;
}

/* 顶部蓝色加号 */
.star {
  width: 76rpx;
  height: 76rpx;
  margin: -6rpx auto 12rpx;
  color: #2f6efb;
  background: #eef4ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.star svg {
  width: 40rpx;
  height: 40rpx;
}

/* 标题与描述 */
.title {
  font-size: 40rpx;
  font-weight: 800;
  color: #0f172a;
}
.desc {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #64748b;
}

/* 信息区 */
.meta {
  margin: 28rpx 0 20rpx;
}
.row {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
  font-size: 28rpx;
}
.label {
  color: #6b7280;
}
.val {
  color: #2f6efb;
  font-weight: 700;
}

/* 标签组 */
.chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14rpx;
  margin: 12rpx 0 32rpx;
}
.chip {
  padding: 12rpx 22rpx;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 999rpx;
  border: 1rpx solid transparent;
}
.chip--blue {
  color: #2f6efb;
  background: #eef4ff;
  border-color: #dbe4ff;
}
.chip--green {
  color: #2eaf6f;
  background: #eaf8f1;
  border-color: #cdeedc;
}
.chip--orange {
  color: #d88316;
  background: #fff5e8;
  border-color: #ffe5c6;
}

/* 主按钮 */
.btn {
  width: 100%;
  height: 92rpx;
  border: 0;
  color: #fff;
  background: #2f6efb;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  box-shadow: 0 10rpx 24rpx rgba(47, 110, 251, 0.28);
}
.btn:active {
  background: #2254d7;
  transform: translateY(2rpx);
}
</style>
