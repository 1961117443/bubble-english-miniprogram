<template>
  <view class="learn-page">
    <view class="header" v-if="course">
      <text class="title">{{ course.title }}</text>
      <text class="progress">{{ progressText }}</text>
    </view>

    <view v-if="isFinished" class="finish">
      <text class="finish-title">课程完成</text>
      <button class="finish-btn" type="primary" @tap="goHome">返回</button>
    </view>

    <view v-else class="step-container">
      <view v-if="currentComponent" class="step-anim" :class="animClass">
        <component
          :key="stepRenderKey"
          :is="currentComponent"
          :step="currentStep"
          :word="currentWord"
          @done="handleStepDone"
          @replay="handleReplay"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { getCourseById, getDefaultChildAge } from './course-repo'
import { buildLearnReport } from './report-builder'
import { reportSink } from './report-sink'

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

function uid() {
  return 'r_' + Date.now() + '_' + Math.random().toString(16).slice(2)
}

export default {
  name: 'LearnPage',
  components: { ListenStep, PlayStep, SpeakStep, RewardStep },

  data() {
    return {
      course: null,

      // v2：unit 调度
      unitIndex: 0,
      stepIndex: 0,
      inReward: false,

      // v1：兼容老 steps
      v1StepIndex: 0,

      // report
      reportId: '',
      startedAt: 0,
      stepStartedAt: 0,
      stepResults: [],

      isFinished: false,

      // 动画/节奏
      animPhase: 'enter',
      stepRenderKey: 1,
      transitioning: false,

      // 年龄（默认 5，可由 query 传 childAge）
      childAge: 5
    }
  },

  onLoad(options) {
    const courseId = options && options.courseId ? decodeURIComponent(options.courseId) : ''
    const childAge = options && options.childAge ? Number(options.childAge) : getDefaultChildAge()

    this.childAge = Number.isFinite(childAge) ? childAge : 5
    this.course = getCourseById(courseId)

    this.resetRun()
  },

  computed: {
    animClass() {
      return {
        'is-enter': this.animPhase === 'enter',
        'is-leave': this.animPhase === 'leaving'
      }
    },

    // ===== 判断课程版本 =====
    isV2() {
      return !!(this.course && Array.isArray(this.course.units))
    },
    isV1() {
      return !!(this.course && Array.isArray(this.course.steps))
    },

    // ===== v2：unit 列表（按年龄过滤）=====
    unitsAll() {
      return (this.course && this.course.units) || []
    },
    unitsFiltered() {
      if (!this.isV2) return []
      const age = Number(this.childAge || 5)
      // minAge <= age 才解锁
      return this.unitsAll.filter(u => (u && (u.minAge == null || Number(u.minAge) <= age)))
    },
    currentUnit() {
      if (!this.isV2) return null
      return this.unitsFiltered[this.unitIndex] || null
    },

    // ===== v2：根据 unit.type 选择 stepTemplate =====
    stepTemplateV2() {
      if (!this.isV2 || !this.currentUnit) return []
      const byUnitType = (this.course.flow && this.course.flow.byUnitType) || {}
      const defWord = ['listen', 'play']
      const defSentence = ['listen', 'speak']
      const t = this.currentUnit.type

      if (byUnitType && byUnitType[t] && byUnitType[t].length) return byUnitType[t]
      if (t === 'sentence') return defSentence
      return defWord
    },

    // ===== v1：兼容旧 steps =====
    currentStepV1() {
      if (!this.isV1) return null
      return this.course.steps[this.v1StepIndex] || null
    },

    // ===== 当前 stepType =====
    currentStepType() {
      if (this.inReward) return 'reward'

      if (this.isV2) {
        return this.stepTemplateV2[this.stepIndex] || ''
      }
      if (this.isV1) {
        return (this.currentStepV1 && this.currentStepV1.type) || ''
      }
      return ''
    },

    currentComponent() {
      return STEP_COMPONENT_MAP[this.currentStepType] || ''
    },

    // ===== currentWord：为了复用 Listen/Play/SpeakStep 的 UI =====
    // v2：unit=word 才映射成 word；unit=sentence 时，给一个“伪 word”把 sentence 放进 text
    currentWord() {
      if (this.isV2) {
        const u = this.currentUnit
        if (!u) return null
        if (u.type === 'word') {
          return {
            id: u.id,
            text: u.text,
            meaningCn: u.meaning || '',
            assets: u.assets || {}
          }
        }
        if (u.type === 'sentence') {
          return {
            id: u.id,
            text: u.text,         // sentence 放这里
            meaningCn: u.meaning || '', // 可选：句子中文
            assets: u.assets || {}
          }
        }
        // 其他类型先当 text 展示（预留）
        return { id: u.id, text: u.text || '', meaningCn: u.meaning || '', assets: u.assets || {} }
      }

      // v1：老结构
      if (this.course && this.course.targets && this.course.targets.words) {
        return this.course.targets.words[0] || null
      }
      return null
    },

    // ===== currentStep：统一对 Step 组件输出 step payload =====
    currentStep() {
      if (!this.course) return null

      // reward
      if (this.inReward) {
        const rw = (this.course.reward) || (this.course.flow && this.course.flow.reward) || {}
        return { type: 'reward', id: 'reward', payload: { reward: rw } }
      }

      // v2：按 unit + stepType 生成 payload
      if (this.isV2) {
        const u = this.currentUnit
        const type = this.currentStepType
        const uid = u ? u.id : 'u'

        // listen：如果 unit 有专属音频，用它；否则用 word.assets.audio（ListenStep 自己会取 word.assets.audio）
        if (type === 'listen') {
          return { type: 'listen', id: `listen_${uid}`, payload: { autoPlay: true, repeat: 1 } }
        }

        // play：word 默认 tap 识别；sentence 默认不出 play（除非你以后扩展）
        if (type === 'play') {
          const cfg = (u && u.play) || {}
          const options = (cfg.options && cfg.options.length) ? cfg.options : this.buildPlayOptionsForUnit(u)
          return {
            type: 'play',
            id: `play_${uid}`,
            payload: {
              gameType: cfg.gameType || 'tap',
              promptText: cfg.promptText || (u && u.type === 'word' ? `Touch the ${u.text}` : 'Try it!'),
              options,
              maxTry: cfg.maxTry || 3
            }
          }
        }

        // speak：word 跟读、sentence 跟读（不接 AI）
        if (type === 'speak') {
          const cfg = (u && u.speak) || {}
          return {
            type: 'speak',
            id: `speak_${uid}`,
            payload: {
              promptText: cfg.promptText || '',
              maxDurationSec: Number(cfg.maxDurationSec || 8),
              allowSkip: cfg.allowSkip !== false
            }
          }
        }

        return { type, id: `${type}_${Date.now()}`, payload: {} }
      }

      // v1：老 step 直接返回
      if (this.isV1) return this.currentStepV1

      return null
    },

    progressText() {
      if (!this.course) return ''
      if (this.inReward) return '奖励 / 完成'

      if (this.isV2) {
        const uTotal = this.unitsFiltered.length || 0
        const sTotal = this.stepTemplateV2.length || 0
        return `单元 ${this.unitIndex + 1}/${uTotal} · 步骤 ${this.stepIndex + 1}/${sTotal}`
      }

      if (this.isV1) {
        return `${this.v1StepIndex + 1} / ${this.course.steps.length}`
      }

      return ''
    }
  },

  watch: {
    currentStepType: {
      immediate: true,
      handler() {
        this.stepStartedAt = Date.now()
        this.animPhase = 'enter'
        this.$nextTick(() => this.ensurePlayableOrSkip())
      }
    }
  },

  methods: {
    resetRun() {
      this.reportId = uid()
      this.startedAt = Date.now()
      this.stepResults = []

      // v2
      this.unitIndex = 0
      this.stepIndex = 0
      this.inReward = false

      // v1
      this.v1StepIndex = 0

      this.isFinished = false
      this.transitioning = false

      this.stepStartedAt = Date.now()
      this.stepRenderKey++
      this.animPhase = 'enter'
    },

    handleReplay() {
      try { uni.vibrateShort && uni.vibrateShort() } catch (e) {}
      this.resetRun()
    },

    // v2：给 word unit 构造 tap 选项（默认 1 正确 + 2 干扰）
    buildPlayOptionsForUnit(unit) {
      if (!unit || unit.type !== 'word') return []
      const words = this.unitsFiltered.filter(x => x && x.type === 'word')
      const answer = unit
      const others = words.filter(w => w.id !== answer.id).slice(0, 2)

      const mk = (u, isAnswer) => ({
        wordId: u.id,
        label: u.text,
        image: u.assets && u.assets.image,
        isAnswer: !!isAnswer
      })

      const list = [mk(answer, true), ...others.map(x => mk(x, false))]
      // shuffle
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = list[i]; list[i] = list[j]; list[j] = t
      }
      return list
    },

    ensurePlayableOrSkip() {
      // 仅对 listen 做一个兜底：如果缺音频，可自动放行
      if (this.inReward) return
      if (this.currentStepType !== 'listen') return

      // ListenStep 播放依赖 currentWord.assets.audio
      const audio = this.currentWord && this.currentWord.assets && this.currentWord.assets.audio
      if (!audio) {
        this.handleStepDone({ skipped: true, reason: 'missing_audio' })
      }
    },

    // ===== 上报（不做后端，只走 reportSink）=====
    async submitLearnReport() {
      const report = buildLearnReport({
        course: this.course,
        reportId: this.reportId,
        startedAt: this.startedAt,
        stepResults: this.stepResults,
        meta: {
          childAge: this.childAge,
          version: this.isV2 ? 'v2' : 'v1'
        }
      })
      await reportSink.submit(report)
      return report
    },

    // ===== 切换到下一个（v2/v1）=====
    commitNext() {
      if (this.inReward) return

      if (this.isV2) {
        this.stepIndex++
        if (this.stepIndex >= this.stepTemplateV2.length) {
          this.stepIndex = 0
          this.unitIndex++
        }
        if (this.unitIndex >= this.unitsFiltered.length) {
          this.inReward = true
        }
        return
      }

      if (this.isV1) {
        this.v1StepIndex++
        if (this.v1StepIndex >= this.course.steps.length) {
          this.inReward = true // v1 末尾也走 reward
        }
      }
    },

    // ===== 核心：统一动画节奏 + done 记录 + 切换 =====
    async handleStepDone(payload) {
      if (!this.course) return
      if (this.transitioning) return
      this.transitioning = true

      const now = Date.now()
      const durationMs = this.stepStartedAt ? (now - this.stepStartedAt) : 0

      // 记录 stepResult（v2 多记录 unit 信息）
      const unit = this.isV2 ? this.currentUnit : null

      this.stepResults.push({
        version: 1,
        reportId: this.reportId,
        courseId: this.course.id,

        // v2：unit
        unitId: unit ? unit.id : null,
        unitType: unit ? unit.type : null,
        unitIndex: this.isV2 ? this.unitIndex : null,

        // step
        stepType: this.currentStepType,
        stepId: this.currentStep && this.currentStep.id,
        stepIndex: this.isV2 ? this.stepIndex : (this.isV1 ? this.v1StepIndex : null),

        ts: now,
        durationMs,
        payload: payload || {}
      })

      // reward：提交 + 完成（仍走离场动画）
      if (this.inReward) {
        this.animPhase = 'leaving'
        setTimeout(async () => {
          try {
            const report = await this.submitLearnReport()
            console.log('[LearnReport done]', report)
          } catch (e) {
            console.error('[LearnReport submit failed]', e)
            uni.showToast({ title: '上报失败（调试）', icon: 'none' })
          }
          this.isFinished = true
          this.transitioning = false
        }, 180)
        return
      }

      // 统一节奏：离场 → 切换 → 入场
      this.animPhase = 'leaving'
      setTimeout(() => {
        this.commitNext()
        this.stepRenderKey++
        this.animPhase = 'enter'
        this.transitioning = false
      }, 180)
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
.header { margin-bottom: 24rpx; }
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
.step-container { margin-top: 16rpx; }

/* 统一 Step 动画节奏 */
.step-anim { transform: translateY(10rpx); opacity: 0; }
.step-anim.is-enter { animation: stepIn 220ms ease-out forwards; }
.step-anim.is-leave { animation: stepOut 180ms ease-in forwards; }
@keyframes stepIn {
  0% { transform: translateY(10rpx); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes stepOut {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-8rpx); opacity: 0; }
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
.finish-btn { width: 100%; }
</style>
