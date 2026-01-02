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

import { buildLearnReport } from './report-builder'
import { reportSink } from './report-sink'

const STEP_COMPONENT_MAP = {
  listen: 'ListenStep',
  play: 'PlayStep',
  speak: 'SpeakStep',
  reward: 'RewardStep'
}

function uid() {
  return 'r_' + Date.now() + '_' + Math.random().toString(16).slice(2)
}

export default {
  name: 'LearnPage',
  components: { ListenStep, PlayStep, SpeakStep, RewardStep },
  data() {
    return Object.assign({}, LearnPageModel, {
      course: null,

      // 课程级调度
      wordIndex: 0,
      stepIndex: 0,
      inReward: false,

      // 过程数据
      reportId: '',
      startedAt: 0,
      stepStartedAt: 0,
      stepResults: [],

      isFinished: false
    })
  },

  onLoad() {
    this.course = getLearnMockCourse()
    this.resetRun()
  },

  watch: {
    currentStepType: {
      immediate: true,
      handler() {
        this.stepStartedAt = Date.now()
        this.$nextTick(() => this.ensurePlayableOrSkip())
      }
    }
  },

  computed: {
    flowItems() {
      return (this.course && this.course.flow && this.course.flow.items) || []
    },

    // 单词顺序：items 即顺序来源
    wordOrder() {
      return this.flowItems.map(x => x.wordId)
    },

    currentItem() {
      const wordId = this.wordOrder[this.wordIndex]
      return this.flowItems.find(x => x.wordId === wordId) || { wordId }
    },

    currentWord() {
      if (!this.course || !this.course.targets || !this.course.targets.words) return null
      const wordId = this.wordOrder[this.wordIndex]
      return this.course.targets.words.find(w => w.id === wordId) || null
    },

    // 单词级 steps 覆盖 > defaultStepTemplate
    stepTemplate() {
      const def = (this.course && this.course.flow && this.course.flow.defaultStepTemplate) || ['listen', 'play', 'speak']
      return (this.currentItem && this.currentItem.steps && this.currentItem.steps.length) ? this.currentItem.steps : def
    },

    currentStepType() {
      if (this.inReward) return 'reward'
      return this.stepTemplate[this.stepIndex] || ''
    },

    currentComponent() {
      return STEP_COMPONENT_MAP[this.currentStepType] || ''
    },

    currentStep() {
      if (!this.course) return null

      if (this.inReward) {
        return {
          type: 'reward',
          id: 'reward',
          payload: {
            reward: (this.course.flow && this.course.flow.reward) || {}
          }
        }
      }

      const type = this.currentStepType
      const wid = this.currentWord && this.currentWord.id

      if (type === 'listen') {
        return { type: 'listen', id: `listen_${wid}`, payload: { autoPlay: true, repeat: 1 } }
      }

      if (type === 'play') {
        const cfg = (this.currentItem && this.currentItem.play) || {}
        const options = (cfg.options && cfg.options.length) ? cfg.options : this.buildPlayOptions(wid)
        return {
          type: 'play',
          id: `play_${wid}`,
          payload: {
            gameType: cfg.gameType || 'tap',
            promptText: cfg.promptText || 'Touch it!',
            options,
            maxTry: cfg.maxTry || 3
          }
        }
      }

      if (type === 'speak') {
        const cfg = (this.currentItem && this.currentItem.speak) || {}
        return {
          type: 'speak',
          id: `speak_${wid}`,
          payload: {
            promptText: cfg.promptText || '',
            maxDurationSec: Number(cfg.maxDurationSec || 8),
            allowSkip: cfg.allowSkip !== false
          }
        }
      }

      return { type, id: `${type}_${Date.now()}`, payload: {} }
    },

    progressText() {
      if (!this.course) return ''
      if (this.inReward) return '奖励 / 完成'

      const wTotal = this.wordOrder.length || 0
      const sTotal = this.stepTemplate.length || 0
      return `单词 ${this.wordIndex + 1}/${wTotal} · 步骤 ${this.stepIndex + 1}/${sTotal}`
    }
  },

  methods: {
    resetRun() {
      this.reportId = uid()
      this.startedAt = Date.now()
      this.stepResults = []

      this.wordIndex = 0
      this.stepIndex = 0
      this.inReward = false
      this.isFinished = false
    },

    buildPlayOptions(answerWordId) {
      const words = (this.course && this.course.targets && this.course.targets.words) || []
      const answer = words.find(w => w.id === answerWordId) || words[0]
      const others = words.filter(w => w.id !== (answer && answer.id)).slice(0, 2)

      const mk = (w, isAnswer) => ({
        wordId: w.id,
        label: w.text,
        image: w.assets && w.assets.image,
        isAnswer: !!isAnswer
      })

      const list = [mk(answer, true), ...others.map(w => mk(w, false))]

      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = list[i]; list[i] = list[j]; list[j] = t
      }

      return list
    },

    ensurePlayableOrSkip() {
      if (this.inReward) return
      if (this.currentStepType !== 'listen') return

      const audio = this.currentWord && this.currentWord.assets && this.currentWord.assets.audio
      if (!audio) {
        this.handleStepDone({ skipped: true, reason: 'missing_audio' })
      }
    },

    async submitLearnReport() {
      const report = buildLearnReport({
        course: this.course,
        reportId: this.reportId,
        startedAt: this.startedAt,
        stepResults: this.stepResults
      })
      await reportSink.submit(report)
      return report
    },

    async handleStepDone(payload) {
      if (!this.course) return

      const now = Date.now()
      const wid = this.currentWord && this.currentWord.id
      const durationMs = this.stepStartedAt ? (now - this.stepStartedAt) : 0

      // 记录 StepResult
      this.stepResults.push({
        version: 1,
        reportId: this.reportId,
        courseId: this.course.id,
        wordId: this.inReward ? null : wid,
        wordIndex: this.inReward ? null : this.wordIndex,
        stepIndex: this.inReward ? null : this.stepIndex,
        stepType: this.currentStepType,
        stepId: this.currentStep && this.currentStep.id,
        ts: now,
        durationMs,
        payload: payload || {}
      })

      // reward done -> 生成 LearnReport 并 submit（不落地本地）
      if (this.inReward) {
        try {
          const report = await this.submitLearnReport()
          console.log('[LearnReport done]', report)
        } catch (e) {
          console.error('[LearnReport submit failed]', e)
          // v1：不阻断用户完成体验
          uni.showToast({ title: '上报失败（调试）', icon: 'none' })
        }

        this.isFinished = true
        return
      }

      // 推进 step
      this.stepIndex++

      // 当前单词完成 -> 下一个单词
      if (this.stepIndex >= this.stepTemplate.length) {
        this.stepIndex = 0
        this.wordIndex++
      }

      // 所有单词完成 -> 进入 Reward
      if (this.wordIndex >= this.wordOrder.length) {
        this.inReward = true
      }
    },

    goHome() {
      const pages = getCurrentPages()
      if (pages && pages.length > 1) uni.navigateBack()
      else uni.switchTab({ url: '/pages/home/index' })
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
