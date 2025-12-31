<template>
  <view class="learn-page">
    <view class="header" v-if="course">
      <text class="title">{{ course.title }}</text>
      <text class="progress">{{ progressText }}</text>
    </view>

    <view v-if="isFinished" class="finish">
      <text class="finish-title">课程完成</text>
      <button class="finish-btn" type="primary" @click="goHome">返回</button>
    </view>

    <view v-else class="step-container">
      <component
        v-if="currentComponent"
        :is="currentComponent"
        :step="currentStep"
        :word="currentWord"
        @done="handleStepDone"
      />
    </view>
  </view>
</template>

<script>
import { LearnPageModel } from './model'
import { getLearnMockCourse } from './mock'
import ListenStep from '@/components/learn-steps/ListenStep.vue'
import PlayStep from '@/components/learn-steps/PlayStep.vue'
import SpeakStep from '@/components/learn-steps/SpeakStep.vue'
import RewardStep from '@/components/learn-steps/RewardStep.vue'

const STEP_COMPONENT_MAP = {
  listen: 'ListenStep',
  play: 'PlayStep',
  speak: 'SpeakStep',
  reward: 'RewardStep'
}

export default {
  name: 'LearnPage',
  components: {
    ListenStep,
    PlayStep,
    SpeakStep,
    RewardStep
  },
  data() {
    return Object.assign({}, LearnPageModel)
  },
  onLoad() {
    this.course = getLearnMockCourse()
    this.currentStepIndex = 0
    this.isFinished = false
  },
  computed: {
    currentStep() {
      if (!this.course || !this.course.steps) return null
      return this.course.steps[this.currentStepIndex] || null
    },
    currentWord() {
      if (!this.course || !this.course.targets || !this.course.targets.words) return null
      return this.course.targets.words[0] || null
    },
    currentComponent() {
      if (!this.currentStep) return ''
      return STEP_COMPONENT_MAP[this.currentStep.type] || ''
    },
    progressText() {
      if (!this.course || !this.course.steps) return ''
      return (this.currentStepIndex + 1) + ' / ' + this.course.steps.length
    }
  },
  methods: {
    handleStepDone() {
      if (!this.course || !this.course.steps) return
      const nextIndex = this.currentStepIndex + 1
      if (nextIndex >= this.course.steps.length) {
        this.isFinished = true
        return
      }
      this.currentStepIndex = nextIndex
    },
    goHome() {
      const pages = getCurrentPages()
      if (pages && pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/home/index'
        })
      }
    }
  }
}
</script>

<style scoped>
.learn-page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
}
.header {
  margin-bottom: 24rpx;
}
.title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 8rpx;
}
.progress {
  display: block;
  font-size: 26rpx;
  color: #666666;
}
.step-container {
  margin-top: 16rpx;
}
.finish {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx 24rpx;
  text-align: center;
}
.finish-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}
.finish-btn {
  width: 100%;
}
</style>