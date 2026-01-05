<template>
  <view class="learn-page">
    <!-- ============ Phase: VIDEO（内容源，不属于 step） ============ -->
    <view v-if="phase === 'video'" class="video-wrap">
      <view class="video-header">
        <text class="video-title">{{ courseTitle }}</text>
        <text class="video-sub">先看一段小视频</text>
      </view>

      <video
        class="video-player"
        :src="videoUrl"
        autoplay
        controls
        show-fullscreen-btn
        @ended="onVideoEnded"
      />

      <view class="video-actions">
        <view class="btn btn--md btn--ghost" @tap="skipVideo">跳过</view>
        <view class="btn btn--md btn--primary" @tap="enterLearn">开始学习</view>
      </view>
    </view>

    <!-- ============ Phase: LEARN ============ -->
    <view v-else>
      <view class="header" v-if="course">
        <view class="header-row">
          <text class="title">{{ course.title }}</text>

          <!-- 全局视频入口：不跳页，用弹层播放，不打断 step 状态 -->
          <view v-if="videoUrl" class="video-entry" @tap="openVideoModal">
            <text class="video-entry__icon">🎬</text>
            <text class="video-entry__text">视频</text>
          </view>
        </view>

        <!-- 3-4 岁：不强调“步骤”，只给轻量进度；5-6 岁：强调“句子回合”；7-8 岁：预留增强（先用标准） -->
        <text class="progress" v-if="ageMode !== 'lite'">{{ progressText }}</text>
      </view>

      <view class="step-container" v-if="!isFinished">
        <!-- 3-4 岁：lite 模式（单词回合壳），弱化“步骤”，强化“这一关” -->
        <WordRoundShell
          v-if="useWordLiteRound"
          :title="wordRoundTitle"
          :total="wordTotal"
          :done="wordDone"
        >
          <view v-if="currentComponent" class="step-anim" :class="animClass">
            <component
              :key="stepRenderKey"
              :is="currentComponent"
              :step="currentStep"
              :word="currentWord"
              :unitType="currentUnit && currentUnit.type"
              :compact="false"
              :ageMode="ageMode"
              @done="handleStepDone"
              @replay="handleReplay"
            />
          </view>
        </WordRoundShell>

        <!-- 句子回合（5-6 岁标准模式） -->
        <SentenceRoundShell
          v-else-if="useSentenceRound"
          :sentenceText="currentWord && currentWord.text"
          :sentenceMeaning="currentWord && currentWord.meaningCn"
          :roundTitle="roundTitle"
          :starsTotal="sentenceTotal"
          :starsDone="sentenceDone"
          :showWordReview="true"
          @openReview="openWordReview"
        >
          <view v-if="currentComponent" class="step-anim" :class="animClass">
            <component
              :key="stepRenderKey"
              :is="currentComponent"
              :step="currentStep"
              :word="currentWord"
              :unitType="currentUnit && currentUnit.type"
              :compact="true"
              :ageMode="ageMode"
              @done="handleStepDone"
              @replay="handleReplay"
            />
          </view>
        </SentenceRoundShell>

        <!-- 默认：原 step 卡片模式（3-4 岁 / 词 / reward / v1） -->
        <view v-else>
          <view v-if="currentComponent" class="step-anim" :class="animClass">
            <component
              :key="stepRenderKey"
              :is="currentComponent"
              :step="currentStep"
              :word="currentWord"
              :unitType="currentUnit && currentUnit.type"
              :compact="false"
              :ageMode="ageMode"
              @done="handleStepDone"
              @replay="handleReplay"
            />
          </view>
        </view>
      </view>

      <!-- 单词复习浮层（仅 UI，不进 step） -->
      <WordReviewSheet
        :visible="wordReviewVisible"
        :words="wordReviewWords"
        @close="wordReviewVisible = false"
      />

      <!-- 全局视频弹层（仅 UI，不进 step） -->
      <VideoModal
        :visible="videoModalVisible"
        :src="videoUrl"
        :title="courseTitle"
        @close="videoModalVisible = false"
      />

      <LearnFinishModal
        :visible="finishModalVisible"
        :guest="mode==='guest'"
        :summary="finishSummary"
        @close="finishModalVisible=false"
        @restart="onRestart"
        @change="onChangeTheme"
        @register="onRegister"
      />
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

import SentenceRoundShell from '@/components/learn-round/SentenceRoundShell.vue'
import WordReviewSheet from '@/components/learn-round/WordReviewSheet.vue'
import WordRoundShell from '@/components/learn-round/WordRoundShell.vue'
import VideoModal from '@/components/learn-common/VideoModal.vue'
import LearnFinishModal from '@/components/learn-common/LearnFinishModal.vue'

import { entitlementStore } from '@/services/entitlement-store'
import { EntitlementApi } from '@/services/api/entitlement-api'
import { ChildApi } from '@/services/api/child-api'

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
  components: {
    ListenStep,
    PlayStep,
    SpeakStep,
    RewardStep,
    SentenceRoundShell,
    WordReviewSheet
    ,WordRoundShell
    ,VideoModal
    ,LearnFinishModal
  },

  data() {
    return {
      course: null,

      // 进入模式：normal / guest
      mode: 'normal',
      ageBand: '',

      // UI：完成弹层
      finishModalVisible: false,
      finishSummary: { unitsDone: 0, stars: 0 },

      // phase
      phase: 'learn',
      videoUrl: '',
      videoStartedAt: 0,

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
      childAge: 5,

      // 进入模式：guest（免登录体验）/normal（后续接后端）
      mode: 'normal',
      ageBand: '',

      // UI：单词复习
      wordReviewVisible: false,

      // UI：全局视频弹层
      videoModalVisible: false
    }
  },

  onLoad(options) {
    const courseId = options && options.courseId ? decodeURIComponent(options.courseId) : ''
    const childAge = options && options.childAge ? Number(options.childAge) : getDefaultChildAge()

    // 进入模式：体验/正常
    this.mode = options && options.mode ? String(options.mode) : 'normal'
    this.ageBand = options && options.ageBand ? String(options.ageBand) : ''

    // 调试：允许通过 query 模拟权益（不做持久化）
    // e.g. /pages/learn/index?vip=1&themes=zoo,farm
    try {
      if (options && (options.vip || options.themes)) {
        const isVip = String(options.vip || '') === '1' || String(options.vip || '') === 'true'
        const themes = String(options.themes || '').split(',').filter(Boolean)
        entitlementStore.set({ isVip, themes })
      }
    } catch (e) {}

    this.childAge = Number.isFinite(childAge) ? childAge : 5
    this.course = getCourseById(courseId)

    // 进入学习时才做“孩子/权益”判断（你已决定：不在首页判断）
    this.prepareEntry()
  },

  computed: {
    courseTitle() {
      return (this.course && this.course.title) || '学习中'
    },

    ageMode() {
      const a = Number(this.childAge || 5)
      if (a <= 4) return 'lite'
      if (a <= 6) return 'standard'
      return 'advanced'
    },

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

    // ===== v2：unit 列表（按年龄过滤） =====
    unitsAll() {
      return (this.course && this.course.units) || []
    },
    unitsFiltered() {
      if (!this.isV2) return []
      const age = Number(this.childAge || 5)
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

    // ===== currentWord：复用 Listen/Play/SpeakStep 的 UI =====
    currentWord() {
      if (this.isV2) {
        const u = this.currentUnit
        if (!u) return null

        // word
        if (u.type === 'word') {
          return {
            id: u.id,
            text: u.text,
            meaningCn: u.meaning || '',
            assets: u.assets || {}
          }
        }

        // sentence / other
        return {
          id: u.id,
          text: u.text,
          meaningCn: u.meaning || '',
          assets: u.assets || {}
        }
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

      // v2
      if (this.isV2) {
        const u = this.currentUnit
        const type = this.currentStepType
        const uid2 = u ? u.id : 'u'

        if (type === 'listen') {
          return { type: 'listen', id: `listen_${uid2}`, payload: { autoPlay: true, repeat: 1 } }
        }

        if (type === 'play') {
          const cfg = (u && u.play) || {}
          const options = (cfg.options && cfg.options.length) ? cfg.options : this.buildPlayOptionsForUnit(u)
          return {
            type: 'play',
            id: `play_${uid2}`,
            payload: {
              gameType: cfg.gameType || 'tap',
              promptText: cfg.promptText || (u && u.type === 'word' ? `Touch the ${u.text}` : 'Try it!'),
              options,
              maxTry: cfg.maxTry || 3
            }
          }
        }

        if (type === 'speak') {
          const cfg = (u && u.speak) || {}
          return {
            type: 'speak',
            id: `speak_${uid2}`,
            payload: {
              promptText: cfg.promptText || '',
              maxDurationSec: Number(cfg.maxDurationSec || 8),
              allowSkip: cfg.allowSkip !== false
            }
          }
        }

        return { type, id: `${type}_${Date.now()}`, payload: {} }
      }

      // v1
      if (this.isV1) return this.currentStepV1

      return null
    },

    // ===== UI：句子回合是否启用 =====
    useSentenceRound() {
      if (this.phase !== 'learn') return false
      if (this.inReward) return false
      if (!this.isV2) return false
      if (!this.currentUnit || this.currentUnit.type !== 'sentence') return false
      if (this.ageMode !== 'standard') return false
      // 句子回合只覆盖 listen/speak 两个 step
      return this.currentStepType === 'listen' || this.currentStepType === 'speak'
    },

    // 3-4 岁：lite 单词回合壳（只覆盖 word 的 listen/play）
    useWordLiteRound() {
      if (this.phase !== 'learn') return false
      if (this.inReward) return false
      if (!this.isV2) return false
      if (this.ageMode !== 'lite') return false
      if (!this.currentUnit || this.currentUnit.type !== 'word') return false
      return this.currentStepType === 'listen' || this.currentStepType === 'play'
    },

    wordUnits() {
      if (!this.isV2) return []
      return this.unitsFiltered.filter(u => u && u.type === 'word')
    },
    wordTotal() {
      return this.wordUnits.length
    },
    wordIndex() {
      const cu = this.currentUnit
      if (!cu || cu.type !== 'word') return 0
      const idx = this.wordUnits.findIndex(x => x && x.id === cu.id)
      return idx >= 0 ? idx : 0
    },
    wordDone() {
      const idx = this.wordIndex
      return Math.max(0, Math.min(idx, this.wordTotal))
    },
    wordRoundTitle() {
      const w = this.currentWord
      const t = (w && w.text) ? w.text : '单词'
      return `认识：${t}`
    },

    roundTitle() {
      // 只在 sentence round 使用
      const idx = this.sentenceIndex + 1
      const total = this.sentenceTotal
      if (total <= 0) return '学一句话'
      return `学一句话（${idx}/${total}）`
    },

    sentenceUnits() {
      if (!this.isV2) return []
      return this.unitsFiltered.filter(u => u && u.type === 'sentence')
    },

    sentenceTotal() {
      return this.sentenceUnits.length
    },

    sentenceIndex() {
      if (!this.useSentenceRound) {
        // 如果当前不是句子回合，尽量不要显示（用 0）
        const cu = this.currentUnit
        if (!cu || cu.type !== 'sentence') return 0
      }
      const cu2 = this.currentUnit
      if (!cu2) return 0
      const idx = this.sentenceUnits.findIndex(x => x && x.id === cu2.id)
      return idx >= 0 ? idx : 0
    },

    // 已完成多少句：以当前 unitIndex 为准（进入下一句时自然 +1）
    sentenceDone() {
      const idx = this.sentenceIndex
      return Math.max(0, Math.min(idx, this.sentenceTotal))
    },

    // ===== 单词复习：词列表（当前句子相关） =====
    wordReviewWords() {
      if (!this.isV2) return []
      const cu = this.currentUnit
      if (!cu || cu.type !== 'sentence') return []

      const sentence = (cu.text || '').toLowerCase()
      const words = this.unitsFiltered.filter(u => u && u.type === 'word')

      // 简单匹配：如果单词文本（或其首词）出现在句子里就算相关
      const picked = []
      const pushOnce = (u) => {
        if (!u || !u.id) return
        if (picked.some(x => x.id === u.id)) return
        picked.push({
          id: u.id,
          text: u.text,
          meaningCn: u.meaning || '',
          assets: u.assets || {}
        })
      }

      for (const w of words) {
        const t = (w.text || '').toLowerCase().trim()
        if (!t) continue

        // 优先完整匹配
        if (sentence.indexOf(t) >= 0) {
          pushOnce(w)
          continue
        }

        // 再尝试首词
        const head = t.split(' ')[0]
        if (head && head.length >= 3 && sentence.indexOf(head) >= 0) {
          pushOnce(w)
        }
      }

      // 为防太多，最多 6 个
      return picked.slice(0, 6)
    },

    progressText() {
      if (!this.course) return ''
      if (this.inReward) return '奖励 / 完成'

      // 5-6 岁 sentence：用“句子回合”
      if (this.isV2 && this.ageMode === 'standard' && this.currentUnit && this.currentUnit.type === 'sentence') {
        const total = this.sentenceTotal
        const idx = this.sentenceIndex + 1
        return total > 0 ? `句子 ${idx}/${total}` : '句子'
      }

      // 其他：保留原进度（调试友好）
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
        if (this.phase !== 'learn') return
        this.stepStartedAt = Date.now()
        this.animPhase = 'enter'
      }
    }
  },

  methods: {
    async prepareEntry() {
      // 正常模式：后续会要求登录 + 选择孩子
      // 当前阶段不接后端，所以这里仅做占位调用 + 失败后自动回退到体验模式
      if (this.mode === 'guest') {
        this.boot()
        return
      }

      try {
        // 1) 拉取权益（占位）
        const ent = await EntitlementApi.getMyEntitlements()
        console.log('[Entitlements fetched]', ent)
      } catch (e) {
        console.log('[Entitlements TODO]', e && e.message)
      }

      try {
        // 2) 拉取孩子列表（占位）
        const children = await ChildApi.list()
        console.log('[Children fetched]', children)
        // 后续逻辑：
        // - 0 个：提示去添加
        // - 1 个：直进学习（并用动态年龄）
        // - 多个：弹出选择器
      } catch (e) {
        // 当前没有后端：不阻断体验
        uni.showToast({ title: '后端未接入：先以体验模式进入', icon: 'none' })
        this.mode = 'guest'
      }

      this.boot()
    },

    boot() {
      const v = (this.course && this.course.video) || null
      this.videoUrl = v && v.url ? v.url : ''

      if (this.videoUrl) {
        this.phase = 'video'
        this.videoStartedAt = Date.now()
        return
      }

      this.enterLearn()
    },

    onVideoEnded() {
      this.enterLearn()
    },

    skipVideo() {
      this.enterLearn()
    },

    enterLearn() {
      // 已经在 learn 就不要重复初始化
      if (this.phase === 'learn' && this.reportId) return

      this.phase = 'learn'

      // init report
      this.reportId = uid()
      this.startedAt = Date.now()
      this.stepStartedAt = Date.now()
      this.stepResults = []

      // v2
      this.unitIndex = 0
      this.stepIndex = 0
      this.inReward = false

      // v1
      this.v1StepIndex = 0

      this.isFinished = false
      this.finishModalVisible = false
      this.finishSummary = { unitsDone: 0, stars: 0 }
      this.transitioning = false

      this.stepRenderKey++
      this.animPhase = 'enter'
    },

    openWordReview() {
      if (!this.wordReviewWords || this.wordReviewWords.length === 0) {
        uni.showToast({ title: '没有可复习的单词', icon: 'none' })
        return
      }
      this.wordReviewVisible = true
    },

    openVideoModal() {
      if (!this.videoUrl) {
        uni.showToast({ title: '没有视频资源', icon: 'none' })
        return
      }
      this.videoModalVisible = true
    },

    handleReplay() {
      try { uni.vibrateShort && uni.vibrateShort() } catch (e) {}
      this.enterLearn()
    },

    // v2：给 word unit 构造 tap 选项（默认 1 正确 + 2 干扰）
    buildPlayOptionsForUnit(unit) {
      if (!unit || unit.type !== 'word') return []
      const words = this.unitsFiltered.filter(x => x && x.type === 'word')
      const answer = unit
      // 3-4 岁：降低选择负担（1 个干扰）；其他：2 个干扰
      const distractorCount = this.ageMode === 'lite' ? 1 : 2
      const others = words.filter(w => w.id !== answer.id).slice(0, distractorCount)

      const mk = (u, isAnswer) => ({
        wordId: u.id,
        label: u.text,
        image: u.assets && u.assets.image,
        isAnswer: !!isAnswer
      })

      const list = [mk(answer, true), ...others.map(x => mk(x, false))]
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = list[i]; list[i] = list[j]; list[j] = t
      }
      return list
    },

    // ===== 上报（不做后端，只走 reportSink） =====
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

    // ===== 切换到下一个（v2/v1） =====
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
          this.inReward = true
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
          this.finishSummary = this.buildFinishSummary()
          this.finishModalVisible = true
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

    buildFinishSummary() {
      const sr = this.stepResults || []
      const unitSet = new Set()
      for (const r of sr) {
        if (r && r.unitId) unitSet.add(r.unitId)
      }

      const unitsDone = unitSet.size || (Array.isArray(sr) ? sr.length : 0)
      const reward = (this.course && (this.course.reward || (this.course.flow && this.course.flow.reward))) || {}
      const stars = Number(reward.stars || 0)
      return { unitsDone, stars }
    },

    onRestart() {
      this.finishModalVisible = false
      this.enterLearn()
    },

    onChangeTheme() {
      this.finishModalVisible = false
      uni.navigateTo({ url: '/pages/content/index' })
    },

    onRegister() {
      // 占位：后续引导去登录/注册 + 建孩子档案
      console.log('[Register TODO] from LearnFinishModal')
      uni.showToast({ title: '占位：后续接注册/后端', icon: 'none' })
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

.header-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 16rpx;
}

.video-entry{
  display:flex;
  align-items:center;
  gap: 6rpx;
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.06);
}
.video-entry__icon{ font-size: 30rpx; }
.video-entry__text{ font-size: 24rpx; color: #444; }

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

/* 统一 Step 动画节奏 */
.step-anim {
  transform: translateY(10rpx);
  opacity: 0;
}
.step-anim.is-enter {
  animation: stepIn 220ms ease-out forwards;
}
.step-anim.is-leave {
  animation: stepOut 180ms ease-in forwards;
}

@keyframes stepIn {
  0% { transform: translateY(10rpx); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes stepOut {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-8rpx); opacity: 0; }
}

/* video */
.video-wrap {
  padding-top: 12rpx;
}

.video-header {
  margin-bottom: 16rpx;
}

.video-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.video-sub {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-top: 8rpx;
}

.video-player {
  width: 100%;
  height: 420rpx;
  border-radius: 18rpx;
  background: #000;
  overflow: hidden;
}

.video-actions {
  margin-top: 20rpx;
  display: flex;
  gap: 16rpx;
}

/* 复用现有按钮体系（learn-steps 里已定义 btn 类） */
</style>
