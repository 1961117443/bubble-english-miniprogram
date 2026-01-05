<template>
  <view v-if="visible" class="mask" @touchmove.stop.prevent>
    <view class="panel" @click.stop>
      <view class="hd">
        <text class="title">完成啦 🎉</text>
        <text class="close" @click="$emit('close')">✕</text>
      </view>

      <view class="bd">
        <view class="stat">
          <text class="num">{{ summary.unitsDone || 0 }}</text>
          <text class="label">学习单元</text>
        </view>
        <view class="stat">
          <text class="num">{{ summary.stars || 0 }}</text>
          <text class="label">星星</text>
        </view>
      </view>

      <view class="tips" v-if="guest">
        <text class="tips__text">体验模式不会保存记录。注册后可添加多个孩子、生成学习报告。</text>
      </view>

      <view class="ft">
        <button class="btn" type="primary" @click="$emit('restart')">再学一次</button>
        <button class="btn-ghost" @click="$emit('change')">换个主题</button>
        <button v-if="guest" class="btn-ghost" @click="onRegister">注册保存</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LearnFinishModal',
  props: {
    visible: { type: Boolean, default: false },
    guest: { type: Boolean, default: false },
    summary: { type: Object, default: () => ({}) }
  },
  methods: {
    onRegister() {
      console.log('[Register TODO] user wants to register')
      uni.showToast({ title: '占位：后续接注册/后端', icon: 'none' })
      this.$emit('register')
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
  padding: 6rpx 6rpx 8rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.close {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.bd {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
  padding: 10rpx 8rpx;
}

.stat {
  background: #f7f8fa;
  border-radius: 18rpx;
  padding: 16rpx;
  text-align: center;
}

.num {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.label {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #666;
}

.tips {
  padding: 0 8rpx;
}

.tips__text {
  display: block;
  font-size: 24rpx;
  color: #888;
  line-height: 1.5;
}

.ft {
  margin-top: 14rpx;
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
