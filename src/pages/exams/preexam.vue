<template>
  <cus-navbar title="初试模拟">

  </cus-navbar>
  <cus-preexam-card
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

  const pageTitle = ref('初试模拟')
  const examType  = ref<'primary' | 'secondary'>('primary')

  const difficulty = ref('Level 4-5')
  const duration   = ref('45分钟')
  const quality    = ref('标准')
  const backgroundNoise = ref(true)

  onLoad((options) => {
    // 读取入口传来的 type，兜底为 primary
    const t = String(options?.type || '').toLowerCase()
    examType.value = t === 'secondary' ? 'secondary' : 'primary'

    // 根据 type 动态改标题（可选）
    pageTitle.value = examType.value === 'primary' ? '初试模拟' : '复试模拟'
  })

  // —— 选择器示例（略，与你原来相同）——
  function openDifficultyPicker() {
    uni.showActionSheet({
      itemList: ['Level 4', 'Level 4-5', 'Level 5'],
      success(res) {
        difficulty.value = ['Level 4', 'Level 4-5', 'Level 5'][res.tapIndex]
      }
    })
  }
  function openDurationPicker() {
    uni.showActionSheet({
      itemList: ['30分钟', '45分钟', '60分钟'],
      success(res) {
        duration.value = ['30分钟', '45分钟', '60分钟'][res.tapIndex]
      }
    })
  }
  function openQualityPicker() {
    uni.showActionSheet({
      itemList: ['标准', '高保真'],
      success(res) {
        quality.value = ['标准', '高保真'][res.tapIndex]
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
