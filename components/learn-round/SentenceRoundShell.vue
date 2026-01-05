<template>
  <view class="round">
    <view class="round__top">
      <view class="round__title">{{ roundTitle }}</view>
      <view class="round__stars" v-if="starsTotal > 0">
        <text
          v-for="i in starsTotal"
          :key="i"
          class="star"
          :class="{ 'is-on': i <= currentStarIndex }"
        >★</text>
      </view>
    </view>

    <view class="card">
      <view class="sentence">{{ sentenceText }}</view>
      <view class="meaning" v-if="sentenceMeaning">{{ sentenceMeaning }}</view>

      <view class="review" v-if="showWordReview" @tap="$emit('openReview')">
        <text class="review__icon">🔄</text>
        <text class="review__text">想先复习单词？</text>
      </view>
    </view>

    <view class="slot">
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'SentenceRoundShell',
  props: {
    roundTitle: { type: String, default: '学一句话' },
    sentenceText: { type: String, default: '' },
    sentenceMeaning: { type: String, default: '' },
    starsTotal: { type: Number, default: 0 },
    starsDone: { type: Number, default: 0 },
    showWordReview: { type: Boolean, default: true }
  },
  computed: {
    // 展示“当前正在学的那一颗星”：done + 1
    currentStarIndex() {
      const total = Number(this.starsTotal || 0)
      if (total <= 0) return 0
      const done = Number(this.starsDone || 0)
      return Math.max(1, Math.min(total, done + 1))
    }
  }
}
</script>

<style scoped>
.round {
  width: 100%;
}

.round__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.round__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.round__stars {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.star {
  font-size: 28rpx;
  opacity: 0.25;
}

.star.is-on {
  opacity: 1;
}

.card {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.06);
}

.sentence {
  font-size: 34rpx;
  font-weight: 600;
  color: #111;
  line-height: 48rpx;
}

.meaning {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 38rpx;
}

.review {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding-top: 10rpx;
}

.review__icon {
  font-size: 26rpx;
}

.review__text {
  font-size: 26rpx;
  color: #666;
}

.slot {
  margin-top: 16rpx;
}
</style>
