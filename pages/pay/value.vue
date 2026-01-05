<template>
  <view class="page">
    <view class="hd">
      <text class="title">解锁说明</text>
      <text class="sub">会员只解锁进阶，主题包单独购买</text>
    </view>

    <view class="card">
      <text class="card__title">🟢 免费体验（VIP0）</text>
      <view class="list">
        <text class="li">• 体验基础学习流程（听 / 认 / 说）</text>
        <text class="li">• 每个主题都有少量免费内容</text>
        <text class="li">• 无需登录也可先体验</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">🟡 主题包（单主题解锁）</text>
      <text class="desc">适合：孩子只对某一类内容特别感兴趣（如动物、身体、农场）。</text>
      <view class="chips">
        <view class="chip" :class="{on: theme==='zoo'}" @click="theme='zoo'">动物</view>
        <view class="chip" :class="{on: theme==='farm'}" @click="theme='farm'">农场</view>
        <view class="chip" :class="{on: theme==='body'}" @click="theme='body'">身体</view>
      </view>
      <view class="list">
        <text class="li">• 解锁该主题下所有基础课程（覆盖不同年龄段）</text>
        <text class="li">• 主题内容可持续更新</text>
      </view>
      <button class="btn" @click="buyTheme">解锁「{{ themeText }}」主题包（占位）</button>
    </view>

    <view class="card">
      <text class="card__title">🔵 会员（进阶）</text>
      <text class="desc">适合：希望长期系统学习、需要更深入内容与学习服务的家庭。</text>
      <view class="list">
        <text class="li">• 解锁进阶内容（更深入的句子/表达）</text>
        <text class="li">• 学习统计与报告（按孩子）</text>
        <text class="li">• 多孩子管理（家庭场景更省心）</text>
      </view>
      <button class="btn btn-primary" @click="buyVip">开通进阶会员（占位）</button>
    </view>

    <view class="card" v-if="needHint">
      <text class="card__title">你当前遇到的锁定</text>
      <text class="desc" v-if="needTheme && needVip">这是「{{ themeText }} · 进阶内容」：需要解锁主题包并开通会员。</text>
      <text class="desc" v-else-if="needTheme">需要解锁「{{ themeText }}」主题包。</text>
      <text class="desc" v-else-if="needVip">需要开通会员解锁进阶内容。</text>
    </view>

    <view class="ft">
      <button class="btn-ghost" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script>
import { requireLogin } from '@/common/auth/require-login'
import { themeLabel } from '@/services/access-control'

export default {
  name: 'PayValueExplain',
  data() {
    return {
      theme: 'zoo',
      needTheme: '',
      needVip: false
    }
  },
  computed: {
    themeText() {
      return themeLabel(this.theme || 'misc')
    },
    needHint() {
      return !!(this.needTheme || this.needVip)
    }
  },
  onLoad(q) {
    // 来自 PaywallPromptModal 的参数
    if (q && q.needTheme) {
      this.needTheme = q.needTheme
      this.theme = q.needTheme
    }
    if (q && (q.needVip === '1' || q.needVip === 'true')) {
      this.needVip = true
    }
  },
  methods: {
    buyTheme() {
      const redirect = `/pages/pay/value?needTheme=${encodeURIComponent(this.theme)}&needVip=${this.needVip ? 1 : 0}`
      if (!requireLogin(redirect)) return
      console.log('[PAY TODO] buy theme pack', this.theme)
      uni.showToast({ title: '占位：后续接支付/后端', icon: 'none' })
    },
    buyVip() {
      const redirect = `/pages/pay/value?needTheme=${encodeURIComponent(this.theme)}&needVip=${this.needVip ? 1 : 0}`
      if (!requireLogin(redirect)) return
      console.log('[PAY TODO] buy vip')
      uni.showToast({ title: '占位：后续接支付/后端', icon: 'none' })
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; padding: 32rpx; background:#f5f6f8; }
.hd { margin-top: 6rpx; margin-bottom: 14rpx; }
.title { display:block; font-size: 40rpx; font-weight: 900; color:#1f1f1f; }
.sub { display:block; margin-top: 8rpx; font-size: 24rpx; color:#666; }

.card { background:#fff; border-radius: 18rpx; padding: 20rpx; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 16rpx; }
.card__title { display:block; font-size: 28rpx; font-weight: 900; color:#1f1f1f; }
.desc { display:block; margin-top: 10rpx; font-size: 24rpx; color:#444; line-height: 1.5; }
.list { margin-top: 10rpx; }
.li { display:block; font-size: 24rpx; color:#444; line-height: 1.6; }

.chips { display:flex; gap: 10rpx; flex-wrap: wrap; margin-top: 12rpx; }
.chip { padding: 10rpx 14rpx; border-radius: 999rpx; border: 2rpx solid #e6e6e6; background:#fff; font-size: 22rpx; font-weight: 900; color:#1f1f1f; }
.chip.on { border-color:#2f6bff; background: rgba(47,107,255,0.10); color:#2f6bff; }

.btn { width: 100%; height: 92rpx; line-height: 92rpx; border-radius: 18rpx; font-size: 30rpx; font-weight: 900; margin-top: 14rpx; background:#fff; border: 2rpx solid #e6e6e6; color:#1f1f1f; }
.btn-primary { background:#2f6bff; border-color:#2f6bff; color:#fff; }

.ft { margin-top: 10rpx; }
.btn-ghost { width: 100%; height: 92rpx; line-height: 92rpx; border-radius: 18rpx; font-size: 30rpx; font-weight: 900; background:#fff; border: 2rpx solid #e6e6e6; color:#1f1f1f; }
</style>
