<template>
  <view class="wr">
    <view class="wr__top">
      <text class="wr__title">{{ title }}</text>
      <view class="wr__dots" v-if="total > 0">
        <view
          v-for="i in total"
          :key="i"
          class="wr__dot"
          :class="{ 'is-done': i <= done }"
        />
      </view>
    </view>

    <view class="wr__card">
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'WordRoundShell',
  props: {
    title: { type: String, default: '学单词' },
    total: { type: Number, default: 0 },
    done: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
.wr { }
.wr__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12rpx 0 16rpx;
}
.wr__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}
.wr__dots { display: flex; gap: 10rpx; }
.wr__dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 7rpx;
  background: #d9dde3;
}
.wr__dot.is-done { background: #1a73e8; }
.wr__card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.06);
}
</style>
