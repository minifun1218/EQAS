<template>
  <view class="notfound-page">
    <!-- 顶部栏 -->
    <cus-navbar >

    </cus-navbar>

    <!-- 中间内容 -->
    <view class="content">
      <text class="error-code">404</text>
      <text class="error-text">页面走丢啦~</text>
      <button class="back-btn" @tap="goHome">返回首页</button>
    </view>
  </view>
</template>

<script setup>
import CusNavbar from "../../components/cus-navbar.vue";

function goHome() {
  uni.switchTab({
    url: '/pages/index/index' // 你的首页路径
  })
}
</script>

<style scoped>
.notfound-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #74ebd5, #9face6); /* 和主页类似的渐变背景 */
  color: #fff;
}

.header {
  position: absolute;
  top: 40rpx;
  left: 0;
  width: 100%;
  text-align: center;
}

.app-title {
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-code {
  font-size: 140rpx;
  font-weight: 900;
  margin-bottom: 20rpx;
}

.error-text {
  font-size: 32rpx;
  margin-bottom: 60rpx;
}

.back-btn {
  width: 300rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #ffffff;
  color: #333;
  border-radius: 40rpx;
  text-align: center;
  font-size: 30rpx;
}
</style>
