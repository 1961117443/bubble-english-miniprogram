<template>
  <view class="step">
    <view class="step__title">奖励时间</view>
    <view class="step__hint">太棒了！你完成了这一课～</view>

    <view class="reward-card">
      <view class="reward-row">
        <view class="reward-item">
          <view class="reward-icon">⭐</view>
          <view class="reward-label">星星</view>
          <view class="reward-value">+{{ stars }}</view>
        </view>

        <view class="reward-item">
          <view class="reward-icon">🪙</view>
          <view class="reward-label">金币</view>
          <view class="reward-value">+{{ coin }}</view>
        </view>

        <view class="reward-item">
          <view class="reward-icon">🎁</view>
          <view class="reward-label">贴纸</view>
          <view class="reward-value">{{ stickerText }}</view>
        </view>
      </view>

      <view v-if="stickerId" class="sticker-preview">
        <view class="sticker-badge">
          <text class="sticker-badge__text">已解锁</text>
        </view>
        <view class="sticker-name">{{ stickerId }}</view>
      </view>

      <view class="reward-tip text-sub mt-2">
        <text>提示：奖励会累计到“收藏/成长”里（后续模块）。</text>
      </view>
    </view>

    <view class="actions actions--center mt-2">
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
    word: { type: Object, default: () => ({}) } // 保持签名一致（虽然 reward 不需要 word）
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
  methods: {
    done() {
      this.$emit('done', { reward: this.reward })
    },
    replay() {
      // 课程级“再来一遍”目前只做提示/占位
      // 后续可以由 LearnPage 接收事件做“重新开始课程”
      this.$emit('replay', { action: 'replay_course' })
      uni.showToast({ title: '后续将支持一键重学～', icon: 'none' })
    }
  }
}
</script>

<style scoped>
/* Step 基础结构：与其他 Step 对齐 */
.step {
  padding: 24rpx;
}

.step__title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  color: #1f1f1f;
}

.step__hint {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

/* 奖励卡片 */
.reward-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
}

.reward-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16rpx;
}

.reward-item {
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 18rpx 12rpx;
  text-align: center;
}

.reward-icon {
  font-size: 40rpx;
  margin-bottom: 6rpx;
}

.reward-label {
  font-size: 24rpx;
  color: #666;
}

.reward-value {
  margin-top: 6rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f1f1f;
}

/* 贴纸预览（占位） */
.sticker-preview {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sticker-badge {
  background: #e9f8ef;
  border-radius: 999rpx;
  padding: 8rpx 14rpx;
}

.sticker-badge__text {
  font-size: 22rpx;
  color: #2a7a3b;
  font-weight: 600;
}

.sticker-name {
  font-size: 24rpx;
  color: #666;
}

.reward-tip {
  margin-top: 16rpx;
}

/* 通用小字（如果你已有全局类，可删这里） */
.text-sub {
  font-size: 24rpx;
  color: #888;
}

/* 间距工具类（如果你已有全局类，可删这里） */
.mt-2 {
  margin-top: 16rpx;
}

/* Actions：按钮统一 */
.actions {
  display: flex;
  gap: 16rpx;
}

.actions--center {
  justify-content: center;
}

/* 按钮风格：与 SpeakStep 统一 */
.btn {
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
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
