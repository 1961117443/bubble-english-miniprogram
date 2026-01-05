<template>
  <view class="page">
    <view class="hd">
      <text class="title">学习统计</text>
      <text class="sub">按孩子查看：每天 / 每周 / 每月（后续接后端）</text>
    </view>

    <view class="notice">
      <text class="notice__text">
        当前为前端占位页面：真实数据将由后端统计返回。下面展示的是示例结构与展示样式。
      </text>
    </view>

    <view class="child-bar">
      <view class="child-chip" v-for="c in children" :key="c.id" :class="{on: c.id===childId}" @click="selectChild(c.id)">
        <text class="child-name">{{ c.name }}</text>
        <text class="child-age">{{ c.ageBand }}</text>
      </view>
    </view>

    <view class="tabs">
      <view class="tab" :class="{on: period==='day'}" @click="period='day'">今天</view>
      <view class="tab" :class="{on: period==='week'}" @click="period='week'">本周</view>
      <view class="tab" :class="{on: period==='month'}" @click="period='month'">本月</view>
    </view>

    <view class="card">
      <text class="card__title">概览</text>
      <view class="kpis">
        <view class="kpi">
          <text class="kpi__num">{{ viewData.learnDays }}</text>
          <text class="kpi__lab">学习天数</text>
        </view>
        <view class="kpi">
          <text class="kpi__num">{{ viewData.newWords }}</text>
          <text class="kpi__lab">新词</text>
        </view>
        <view class="kpi">
          <text class="kpi__num">{{ viewData.sentences }}</text>
          <text class="kpi__lab">句子</text>
        </view>
        <view class="kpi">
          <text class="kpi__num">{{ viewData.speak }}</text>
          <text class="kpi__lab">跟读次数</text>
        </view>
      </view>
      <view class="tip">{{ viewData.tip }}</view>
    </view>

    <view class="card">
      <text class="card__title">学习趋势（示例）</text>
      <view class="bars">
        <view class="bar" v-for="(b,i) in viewData.bars" :key="i">
          <view class="bar__col" :style="{height: (18 + b.value*8) + 'rpx'}" />
          <text class="bar__lab">{{ b.label }}</text>
        </view>
      </view>
      <text class="muted">注：这里只展示“学习强度”趋势（不强调分钟数），避免造成家长与孩子压力。</text>
    </view>

    <view class="card">
      <text class="card__title">学过的主题</text>
      <view class="chips">
        <view class="chip" v-for="t in viewData.themes" :key="t">{{ t }}</view>
        <view class="chip chip-empty" v-if="!viewData.themes || viewData.themes.length===0">暂无</view>
      </view>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/common/auth/require-login'
import { ChildApi } from '@/api/child-api'
import { ReportApi } from '@/api/report-api'

function sampleChildren() {
  return [
    { id: 'c1', name: '小明', ageBand: '5-6' },
    { id: 'c2', name: '小红', ageBand: '3-4' }
  ]
}

function sampleStats(period) {
  if (period === 'day') {
    return {
      learnDays: 1,
      newWords: 3,
      sentences: 1,
      speak: 2,
      tip: '今天完成一次学习就很棒了，建议保持轻量节奏（5–10 分钟）。',
      bars: [
        { label: '今', value: 2 },
        { label: '昨', value: 1 },
        { label: '前', value: 0 },
        { label: '三', value: 1 },
        { label: '四', value: 0 },
        { label: '五', value: 1 },
        { label: '六', value: 0 }
      ],
      themes: ['动物']
    }
  }
  if (period === 'week') {
    return {
      learnDays: 4,
      newWords: 12,
      sentences: 4,
      speak: 9,
      tip: '本周学习节奏不错：保持“少量多次”，比一次学很久更有效。',
      bars: [
        { label: '一', value: 1 },
        { label: '二', value: 2 },
        { label: '三', value: 0 },
        { label: '四', value: 2 },
        { label: '五', value: 1 },
        { label: '六', value: 0 },
        { label: '日', value: 1 }
      ],
      themes: ['动物', '身体']
    }
  }
  return {
    learnDays: 16,
    newWords: 38,
    sentences: 12,
    speak: 27,
    tip: '本月已形成学习习惯：如果孩子愿意，可以逐步增加“跟读”比例。',
    bars: [
      { label: 'W1', value: 2 },
      { label: 'W2', value: 3 },
      { label: 'W3', value: 2 },
      { label: 'W4', value: 3 }
    ],
    themes: ['动物', '身体', '农场']
  }
}

export default {
  name: 'ChildStats',
  data() {
    return {
      children: [],
      childId: '',
      period: 'week',
      viewData: sampleStats('week')
    }
  },
  async onShow() {
    const redirect = '/pages/parent/stats'
    if (!requireLogin(redirect)) return

    // ✅ 后端接入后：这里拉取孩子列表 + 统计数据
    try {
      const list = await ChildApi.list()
      this.children = list || []
      this.childId = (this.children[0] && this.children[0].id) || ''
    } catch (e) {
      // 占位：后端未接入时，用示例数据保证 UI 可看
      console.log('[ChildStats] backend not ready', e)
      this.children = sampleChildren()
      this.childId = this.children[0].id
    }

    this.refresh()
  },
  watch: {
    period() {
      this.refresh()
    },
    childId() {
      this.refresh()
    }
  },
  methods: {
    selectChild(id) {
      this.childId = id
    },
    async refresh() {
      if (!this.childId) {
        this.viewData = sampleStats(this.period)
        return
      }
      try {
        const res = await ReportApi.getChildStats({ childId: this.childId, period: this.period })
        console.log('[Stats] backend data', res)
        // 后端返回结构未定，先做占位映射
        this.viewData = sampleStats(this.period)
      } catch (e) {
        console.log('[Stats] use sample', e)
        this.viewData = sampleStats(this.period)
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; padding: 32rpx; background: #f5f6f8; }
.hd { margin-top: 6rpx; margin-bottom: 14rpx; }
.title { display:block; font-size: 40rpx; font-weight: 900; color:#1f1f1f; }
.sub { display:block; margin-top: 8rpx; font-size: 24rpx; color:#666; }

.notice { background:#fff; border-radius: 18rpx; padding: 16rpx 18rpx; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 14rpx; }
.notice__text { font-size: 24rpx; color:#666; line-height: 1.5; }

.child-bar { display:flex; gap: 12rpx; flex-wrap: wrap; margin-bottom: 14rpx; }
.child-chip { padding: 12rpx 16rpx; border-radius: 999rpx; border: 2rpx solid #e6e6e6; background:#fff; }
.child-chip.on { border-color:#2f6bff; background: rgba(47,107,255,0.10); }
.child-name { font-size: 24rpx; font-weight: 900; color:#1f1f1f; }
.child-age { font-size: 22rpx; margin-left: 10rpx; color:#666; }

.tabs { display:flex; gap: 12rpx; margin-bottom: 14rpx; }
.tab { flex:1; text-align:center; padding: 18rpx 0; background:#fff; border-radius: 16rpx; border:2rpx solid #e6e6e6; font-size: 26rpx; font-weight: 900; color:#1f1f1f; }
.tab.on { border-color:#2f6bff; color:#2f6bff; background: rgba(47,107,255,0.10); }

.card { background:#fff; border-radius: 18rpx; padding: 20rpx; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 16rpx; }
.card__title { display:block; font-size: 28rpx; font-weight: 900; color:#1f1f1f; margin-bottom: 12rpx; }

.kpis { display:flex; gap: 10rpx; flex-wrap: wrap; }
.kpi { flex:1; min-width: 150rpx; background:#f7f8fa; border-radius: 16rpx; padding: 14rpx 12rpx; }
.kpi__num { display:block; font-size: 34rpx; font-weight: 900; color:#1f1f1f; }
.kpi__lab { display:block; margin-top: 6rpx; font-size: 22rpx; font-weight: 800; color:#666; }

.tip { margin-top: 12rpx; font-size: 24rpx; color:#444; line-height: 1.5; }

.bars { display:flex; align-items:flex-end; justify-content: space-between; gap: 10rpx; padding: 10rpx 6rpx 0; }
.bar { width: 60rpx; display:flex; flex-direction: column; align-items: center; gap: 10rpx; }
.bar__col { width: 24rpx; border-radius: 999rpx; background:#2f6bff; }
.bar__lab { font-size: 20rpx; color:#666; font-weight: 800; }

.muted { display:block; margin-top: 12rpx; font-size: 22rpx; color:#888; line-height: 1.4; }

.chips { display:flex; gap: 10rpx; flex-wrap: wrap; }
.chip { padding: 10rpx 14rpx; border-radius: 999rpx; background:#f7f8fa; font-size: 22rpx; font-weight: 900; color:#1f1f1f; }
.chip-empty { color:#999; }
</style>
