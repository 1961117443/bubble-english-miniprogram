<template>
  <view class="step reward">
    <view class="reward__top">
      <view class="reward__badge" :class="{ 'is-in': entered }">
        <view class="badge__icon" :class="{ 'is-pop': entered }">🏆</view>
        <view class="badge__title">通关啦！</view>
        <view class="badge__sub">你做得很棒～</view>
      </view>

      <view class="confetti" v-if="entered">
        <view v-for="n in 12" :key="n" class="confetti__dot" :class="'c' + n"></view>
      </view>
    </view>

    <view class="reward__card">
      <view class="reward__row">
        <view class="reward__item">
          <view class="reward__icon star" :class="{ 'is-bounce': entered }">⭐</view>
          <view class="reward__label">星星</view>
          <view class="reward__value">+{{ showStars }}</view>
        </view>

        <view class="reward__item">
          <view class="reward__icon coin" :class="{ 'is-bounce': entered }">🪙</view>
          <view class="reward__label">金币</view>
          <view class="reward__value">+{{ showCoin }}</view>
        </view>

        <view class="reward__item">
          <view class="reward__icon gift" :class="{ 'is-bounce': entered }">🎁</view>
          <view class="reward__label">贴纸</view>
          <view class="reward__value">{{ stickerText }}</view>
        </view>
      </view>

      <view v-if="stickerId" class="reward__sticker">
        <view class="sticker__left">
          <view class="sticker__tag">已解锁</view>
          <view class="sticker__name">{{ stickerId }}</view>
        </view>
        <view class="sticker__right">
          <view class="sticker__emoji" :class="{ 'is-wiggle': entered }">✨</view>
        </view>
      </view>

      <view class="reward__hint">
        <text class="text-sub">提示：奖励将用于“成长记录/家长端”（后续接入）。</text>
      </view>
    </view>

    <view class="actions mt-2">
      <view class="btn btn--md btn--secondary" @click="replay">
        再来一遍
      </view>
      <view class="btn btn--md btn--primary" @click="done">
        完成
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RewardStep',
  props: {
    step: { type: Object, default: () => ({}) },
    word: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      entered: false,
      showStars: 0,
      showCoin: 0,
      timer: null
    }
  },
  computed: {
    reward() {
      return (this.step && this.step.payload && this.step.payload.reward) ? this.step.payload.reward : {}
    },
    stars() {
      return Number(this.reward.stars || 0)
    },
    coin() {
      return Number(this.reward.coin || 0)
    },
    stickerId() {
      return this.reward.stickerId || ''
    },
    stickerText() {
      return this.stickerId ? '解锁' : '无'
    }
  },
  mounted() {
    // 进入动效
    this.entered = true

    // 轻微触觉反馈（可选）
    try { uni.vibrateShort && uni.vibrateShort() } catch (e) {}

    // 数字增长动画（200~600ms 内完成）
    this.animateCounts()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    animateCounts() {
      const targetStars = this.stars
      const targetCoin = this.coin

      const dur = 520
      const tick = 30
      const steps = Math.max(1, Math.floor(dur / tick))
      let i = 0

      this.showStars = 0
      this.showCoin = 0

      if (this.timer) clearInterval(this.timer)

      this.timer = setInterval(() => {
        i++
        const p = Math.min(1, i / steps)
        this.showStars = Math.round(targetStars * p)
        this.showCoin = Math.round(targetCoin * p)

        if (p >= 1) {
          clearInterval(this.timer)
          this.timer = null
          this.showStars = targetStars
          this.showCoin = targetCoin
        }
      }, tick)
    },

    done() {
      this.$emit('done', { reward: this.reward })
    },

    replay() {
      // 先占位：由 LearnPage 未来决定是否“重学本课/再来一节”
      this.$emit('replay', { action: 'replay_course' })
      uni.showToast({ title: '后续将支持一键重学～', icon: 'none' })
    }
  }
}
</script>

<style scoped>
/* ========= 基础结构（与其他 Step 对齐） ========= */
.step {
  padding: 24rpx;
}

.mt-2 {
  margin-top: 16rpx;
}

.text-sub {
  font-size: 24rpx;
  color: #888;
}

/* ========= Reward 顶部徽章 + 彩纸 ========= */
.reward__top {
  position: relative;
  margin-bottom: 16rpx;
}

.reward__badge {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 22rpx 18rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
  transform: translateY(10rpx) scale(0.98);
  opacity: 0;
  transition: all 260ms ease;
  text-align: center;
}

.reward__badge.is-in {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.badge__icon {
  font-size: 56rpx;
  line-height: 1;
  transform: scale(0.9);
  transition: transform 220ms ease;
}

.badge__icon.is-pop {
  transform: scale(1);
}

.badge__title {
  margin-top: 8rpx;
  font-size: 38rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.badge__sub {
  margin-top: 6rpx;
  font-size: 26rpx;
  color: #666;
}

/* 彩纸（纯 CSS） */
.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 18rpx;
}

.confetti__dot {
  position: absolute;
  width: 12rpx;
  height: 20rpx;
  border-radius: 8rpx;
  opacity: 0.9;
  top: -20rpx;
  animation: confettiFall 900ms ease-out forwards;
}

@keyframes confettiFall {
  0% { transform: translateY(-20rpx) rotate(0deg); opacity: 0; }
  25% { opacity: 1; }
  100% { transform: translateY(240rpx) rotate(240deg); opacity: 0; }
}

/* 12 个彩纸点：用不同位置/延迟营造丰富感 */
.confetti__dot.c1 { left: 6%;  animation-delay: 0ms;  background: #ff6b6b; }
.confetti__dot.c2 { left: 14%; animation-delay: 40ms; background: #ffd93d; }
.confetti__dot.c3 { left: 22%; animation-delay: 80ms; background: #6bcB77; }
.confetti__dot.c4 { left: 30%; animation-delay: 120ms;background: #4d96ff; }
.confetti__dot.c5 { left: 38%; animation-delay: 160ms;background: #a66bff; }
.confetti__dot.c6 { left: 46%; animation-delay: 200ms;background: #ff9f1c; }
.confetti__dot.c7 { left: 54%; animation-delay: 70ms; background: #2ec4b6; }
.confetti__dot.c8 { left: 62%; animation-delay: 110ms;background: #ff5d8f; }
.confetti__dot.c9 { left: 70%; animation-delay: 150ms;background: #00bbf9; }
.confetti__dot.c10{ left: 78%; animation-delay: 190ms;background: #f15bb5; }
.confetti__dot.c11{ left: 86%; animation-delay: 230ms;background: #9bdeac; }
.confetti__dot.c12{ left: 94%; animation-delay: 270ms;background: #ffbd59; }

/* ========= 奖励卡 ========= */
.reward__card {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 22rpx 18rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
}

.reward__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14rpx;
}

.reward__item {
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 18rpx 12rpx;
  text-align: center;
}

.reward__icon {
  font-size: 44rpx;
  line-height: 1;
  transform: translateY(0);
}

.reward__icon.is-bounce {
  animation: bounce 520ms ease-out 1;
}

@keyframes bounce {
  0% { transform: translateY(0) scale(1); }
  35% { transform: translateY(-10rpx) scale(1.08); }
  70% { transform: translateY(0) scale(0.98); }
  100% { transform: translateY(0) scale(1); }
}

.reward__label {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.reward__value {
  margin-top: 6rpx;
  font-size: 30rpx;
  font-weight: 900;
  color: #1f1f1f;
}

/* 贴纸区域 */
.reward__sticker {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sticker__tag {
  display: inline-block;
  background: rgba(47, 107, 255, 0.10);
  color: #2f6bff;
  font-size: 22rpx;
  font-weight: 900;
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
}

.sticker__name {
  margin-top: 10rpx;
  font-size: 26rpx;
  font-weight: 800;
  color: #1f1f1f;
}

.sticker__emoji {
  font-size: 40rpx;
  transform: rotate(0deg);
}

.sticker__emoji.is-wiggle {
  animation: wiggle 800ms ease-in-out 1;
}

@keyframes wiggle {
  0% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(-12deg) scale(1.05); }
  40% { transform: rotate(12deg) scale(1.05); }
  60% { transform: rotate(-8deg) scale(1.02); }
  80% { transform: rotate(8deg) scale(1.02); }
  100% { transform: rotate(0deg) scale(1); }
}

.reward__hint {
  margin-top: 14rpx;
  text-align: center;
}

/* ========= Actions：按钮统一（和 SpeakStep 一致） ========= */
.actions {
  display: flex;
  gap: 16rpx;
}

.btn {
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 800;
  box-sizing: border-box;
}

.btn--md {
  flex: 1;
}

.btn--primary {
  background: #2f6bff;
  color: #fff;
}

.btn--secondary {
  background: #ffffff;
  color: #1f1f1f;
  border: 2rpx solid #e6e6e6;
}

.btn.is-disabled {
  opacity: 0.5;
}
</style>
