<template>
  <view class="reward-step">
    <view class="panel">
      <view class="title">太棒啦！</view>
      <view class="sub">你完成了这一关 🎉</view>

      <view class="stars">
        <text
          v-for="i in 3"
          :key="i"
          class="star"
          :class="{ on: i <= stars }"
        >
          ★
        </text>
      </view>

      <view class="reward-row">
        <view class="item">
          <view class="num">+{{ coin }}</view>
          <view class="label">金币</view>
        </view>
        <view class="item">
          <view class="num">{{ stickerName }}</view>
          <view class="label">贴纸</view>
        </view>
      </view>

      <view class="tip">每天坚持一点点，英语就会变简单～</view>

      <button class="primary" @click="done">继续</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RewardStep',
  props: {
    step: { type: Object, required: true }
  },
  data() {
    return {
      stars: 1,
      coin: 5,
      stickerId: ''
    }
  },
  computed: {
    stickerName() {
      if (!this.stickerId) return '贴纸'
      // v1 简化：把 id 直接展示，后续可接 sticker 图集表
      return this.stickerId.replace('sticker-', '').replace(/-/g, ' ')
    }
  },
  created() {
    const p = (this.step && this.step.payload) || {}
    this.stars = Number(p.stars || 1)
    this.coin = Number(p.coin || 5)
    this.stickerId = p.stickerId || ''
  },
  methods: {
    done() {
      this.$emit('done', {
        type: 'reward',
        id: this.step && this.step.id,
        stars: this.stars,
        coin: this.coin,
        stickerId: this.stickerId
      })
    }
  }
}
</script>

<style scoped>
.reward-step { padding: 24rpx; }
.panel {
  background: #fff; border-radius: 24rpx; padding: 28rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,.05);
}
.title { font-size: 44rpx; font-weight: 800; margin-bottom: 6rpx; }
.sub { font-size: 28rpx; color: #666; margin-bottom: 18rpx; }

.stars { display: flex; justify-content: center; gap: 10rpx; margin: 10rpx 0 18rpx; }
.star { font-size: 54rpx; color: #e5e7eb; }
.star.on { color: #f59e0b; }

.reward-row { display: flex; gap: 18rpx; justify-content: space-between; margin-bottom: 18rpx; }
.item {
  flex: 1; background: #f8fafc; border-radius: 18rpx; padding: 18rpx;
  text-align: center;
}
.num { font-size: 36rpx; font-weight: 800; }
.label { font-size: 26rpx; color: #666; margin-top: 6rpx; }

.tip { font-size: 26rpx; color: #6b7280; text-align: center; margin: 10rpx 0 20rpx; }

.primary {
  width: 100%;
  height: 92rpx; line-height: 92rpx;
  border-radius: 18rpx;
  background: #16a34a; color: #fff; font-weight: 800;
}
</style>
