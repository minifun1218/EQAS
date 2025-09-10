<template>
  <cus-navbar :title="pageTitle">

  </cus-navbar>
  
  <!-- 加载状态 -->
  <view v-if="loading" class="loading-container">
    <text class="loading-text">正在加载考试配置...</text>
  </view>
  
  <!-- 考试配置 -->
  <cus-preexam-card
      v-if="!loading"
      :title="pageTitle"
      v-model:difficulty="difficulty"
      v-model:duration="duration"
      v-model:quality="quality"
      v-model:backgroundNoise="backgroundNoise"
      @showDifficultyPicker="openDifficultyPicker"
      @showDurationPicker="openDurationPicker"
      @showQualityPicker="openQualityPicker"
      @goBack="handleGoBack"
      @startExam="handleStartExam"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import CusNavbar from "../../components/cus-navbar.vue";
  import { examsApi } from '@/api/index.js'

  const pageTitle = ref('初试模拟')
  const examType  = ref<'primary' | 'secondary'>('primary')

  const difficulty = ref('')
  const duration   = ref('')
  const quality    = ref('')
  const backgroundNoise = ref(true)
  const examConfig = ref({})
  const loading = ref(false)
  const difficultyOptions = ref([])
  const durationOptions = ref([])
  const qualityOptions = ref([])

  onLoad((options) => {
    // 读取入口传来的 type，兜底为 primary
    const t = String(options?.type || '').toLowerCase()
    examType.value = t === 'secondary' ? 'secondary' : 'primary'

    // 根据 type 动态改标题（可选）
    pageTitle.value = examType.value === 'primary' ? '初试模拟' : '复试模拟'
    loadExamConfig()
  })

  async function loadExamConfig() {
    try {
      loading.value = true
      const response = await examsApi.getExamConfig(examType.value)
      if (response.code === 200) {
        examConfig.value = response.data.examConfig || response.data
        const config = examConfig.value
        
        // 设置选项数组
        difficultyOptions.value = config.difficultyOptions || ['Level 4', 'Level 4-5', 'Level 5']
        durationOptions.value = config.durationOptions || ['30分钟', '45分钟', '60分钟']
        qualityOptions.value = config.qualityOptions || ['标准', '高保真']
        
        // 设置默认值
        difficulty.value = config.defaultDifficulty || difficultyOptions.value[1] || 'Level 4-5'
        duration.value = config.defaultDuration ? `${config.defaultDuration}分钟` : durationOptions.value[1] || '45分钟'
        quality.value = config.defaultQuality || qualityOptions.value[0] || '标准'
      }
    } catch (error) {
      console.error('加载考试配置失败:', error)
      uni.showToast({
        title: '加载配置失败',
        icon: 'error'
      })
      // 使用默认配置
      setDefaultConfig()
    } finally {
      loading.value = false
    }
  }
  
  function setDefaultConfig() {
    difficultyOptions.value = ['Level 4', 'Level 4-5', 'Level 5']
    durationOptions.value = ['30分钟', '45分钟', '60分钟']
    qualityOptions.value = ['标准', '高保真']
    difficulty.value = 'Level 4-5'
    duration.value = '45分钟'
    quality.value = '标准'
  }

  // —— 选择器示例（略，与你原来相同）——
  function openDifficultyPicker() {
    uni.showActionSheet({
      itemList: difficultyOptions.value,
      success(res) {
        difficulty.value = difficultyOptions.value[res.tapIndex]
      }
    })
  }
  function openDurationPicker() {
    uni.showActionSheet({
      itemList: durationOptions.value,
      success(res) {
        duration.value = durationOptions.value[res.tapIndex]
      }
    })
  }
  function openQualityPicker() {
    uni.showActionSheet({
      itemList: qualityOptions.value,
      success(res) {
        quality.value = qualityOptions.value[res.tapIndex]
      }
    })
  }

  function handleGoBack() {
    uni.navigateBack()
  }

  // 小工具：把对象序列化成 query string
  function buildQuery(params: Record<string, any>) {
    return Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
  }

  // 点击“开始考试”后的分流跳转
  function handleStartExam() {
    const query = buildQuery({
      difficulty: difficulty.value,
      duration: duration.value,
      quality: quality.value,
      noise: backgroundNoise.value
    })

    const target =
        examType.value === 'secondary'
            ? `/pages/exams/secondary?${query}`
            : `/pages/exams/primary?${query}`

    uni.navigateTo({ url: target })
  }
</script>

<style scoped>
/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  background: #ffffff;
  border-radius: 16rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(148, 163, 184, 0.1);
}

.loading-text {
  font-size: 28rpx;
  color: #64748b;
  text-align: center;
}
</style>
