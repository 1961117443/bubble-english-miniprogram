<template>
  <view v-if="visible" class="mask" @touchmove.stop.prevent>
    <view class="panel" @click.stop>
      <view class="hd">
        <text class="title">需要解锁</text>
        <text class="close" @click="$emit('close')">✕</text>
      </view>

      <view class="bd">
        <text class="desc" v-if="reason==='need_theme'">
          本课程属于「{{ themeText }}」，解锁主题包后即可学习。
        </text>
        <text class="desc" v-else-if="reason==='need_vip'">
          这是进阶内容，开通会员可解锁更多更深入的学习。
        </text>
        <text class="desc" v-else>
          这是「{{ themeText }} · 进阶内容」，需要解锁主题包并开通会员。
        </text>

        <view class="chips">
          <view v-if="needTheme" class="chip chip-theme">{{ themeText }}</view>
          <view v-if="needVip" class="chip chip-vip">进阶会员</view>
        </view>
      </view>

      <view class="ft">
        <button class="btn" @click="onAction">
          {{ actionText }}
        </button>
        <button class="btn-ghost" @click="onContinueGuest">先体验</button>
      </view>
    </view>
  </view>
</template>

<script>
import { themeLabel } from '@/services/access-control'

export default {
  name: 'PaywallPromptModal',
  props: {
    visible: { type: Boolean, default: false },
    reason: { type: String, default: 'need_theme' },
    needVip: { type: Boolean, default: false },
    needTheme: { type: String, default: '' }
  },
  computed: {
    themeText() {
      return themeLabel(this.needTheme || 'misc')
    },
    actionText() {
      if (this.reason === 'need_theme') return '解锁主题包'
      if (this.reason === 'need_vip') return '开通会员'
      return '查看解锁方式'
    }
  },
  methods: {
    onAction() {
      // ✅ 后续接后端/支付时替换
      console.log('[Paywall action]', {
        reason: this.reason,
        needVip: this.needVip,
        needTheme: this.needTheme
      })
      uni.showToast({ title: '占位：后续接支付/后端', icon: 'none' })
      this.$emit('action')
    },
    onContinueGuest() {
      // 体验优先：不打断
      this.$emit('continue-guest')
    }
  }
}
</script>

<style scoped>
.mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.panel {
  width: 100%;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 18rpx 18rpx 26rpx;
}

.hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rpx 6rpx 12rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.close {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.bd {
  padding: 0 8rpx;
}

.desc {
  display: block;
  font-size: 26rpx;
  color: #444;
  line-height: 1.5;
}

.chips {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 14rpx;
}

.chip {
  font-size: 22rpx;
  font-weight: 800;
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: #f7f8fa;
  color: #1f1f1f;
}

.chip-theme {
  background: rgba(47,107,255,0.10);
  color: #2f6bff;
}

.chip-vip {
  background: rgba(255,153,0,0.12);
  color: #d47b00;
}

.ft {
  margin-top: 18rpx;
  display: grid;
  gap: 12rpx;
  padding: 0 8rpx;
}

.btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  font-weight: 900;
  background: #2f6bff;
  color: #fff;
}

.btn-ghost {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 800;
  background: #fff;
  border: 2rpx solid #e6e6e6;
  color: #1f1f1f;
}
</style>
