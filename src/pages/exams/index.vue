<template>
  <cus-navbar title="考试中心">
  </cus-navbar>
  <view class="exam-container">
    <!-- 顶部标题栏 -->
    <cus-header title="考试中心" @goBack="goBack"></cus-header>

    <!-- 初试仿真 -->
    <cus-exam-card
        :title="primeTitle"
        :desc="primeDesc"
        :label-list="primeLabelList"
        @start-primary-exam="startPrimaryExam">
    </cus-exam-card>

    <!-- 复试仿真 -->
    <cus-exam-card
        :title="reExamTitle"
        :desc="reExamDesc"
        :label-list="reExamLabelList"
        @start-secondary-exam="startSecondaryExam">
    </cus-exam-card>
  </view>
</template>

<script>

export default {
  name: 'ExamIndex',
  components: {},
  data() {
    return {
      primeTitle: '初试模拟',
      primeDesc: 'ICAO4初级考试模拟，包含听力理解、故事复述、听力简答三个模块',
      primeLabelList: [
        {key: '考试时长:', value: '45分钟'},
        {key: '题目数量:', value: '约15-20题'},
        {key: '难度等级:', value: 'Level 4-5'},
      ],
      reExamTitle: '复试模拟',
      reExamDesc: 'ICAO4复试考试模拟，包含听力理解、故事复述、听力简答三个模块',
      reExamLabelList: [
        {key: '考试时长:', value: '45分钟'},
        {key: '题目数量:', value: '约15-20题'},
        {key: '难度等级:', value: 'Level 4-5'},
      ],
    }
  },
  methods: {

    goBack() {
      uni.navigateBack();
    },

    // 开始初试仿真
    startPrimaryExam() {
      uni.navigateTo({
        url: '/pages/exams/preexam?type=primary'
      })
    },

    // 开始复试仿真
    startSecondaryExam() {
      uni.navigateTo({
        url: '/pages/exams/preexam?type=secondary'
      })
    }
  }
}
</script>

<style scoped>
/* Added light theme styling while maintaining layout structure */
.exam-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20rpx;
}

/* Global card styling for cus-exam-card components */
:deep(.cus-exam-card) {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(148, 163, 184, 0.1);
  margin-bottom: 24rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.cus-exam-card:hover) {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 30rpx rgba(148, 163, 184, 0.15);
}

/* Card title styling */
:deep(.cus-exam-card .card-title) {
  font-size: 36rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

/* Card description styling */
:deep(.cus-exam-card .card-desc) {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

/* Label list styling */
:deep(.cus-exam-card .label-list) {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

:deep(.cus-exam-card .label-item) {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #475569;
}

:deep(.cus-exam-card .label-key) {
  color: #64748b;
  margin-right: 16rpx;
  min-width: 140rpx;
}

:deep(.cus-exam-card .label-value) {
  color: #1e293b;
  font-weight: 500;
}

/* Button styling */
:deep(.cus-exam-card .start-btn) {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  width: 100%;
  transition: all 0.3s ease;
}

:deep(.cus-exam-card .start-btn:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1rpx);
}

/* Header styling */
:deep(.cus-header) {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(148, 163, 184, 0.08);
  margin-bottom: 24rpx;
  border: 1rpx solid #f1f5f9;
}

:deep(.cus-header .header-title) {
  color: #1e293b;
  font-weight: 600;
}

/* Navbar styling */
:deep(.cus-navbar) {
  background: #ffffff;
  border-bottom: 1rpx solid #e2e8f0;
}

:deep(.cus-navbar .navbar-title) {
  color: #1e293b;
  font-weight: 600;
}
</style>
