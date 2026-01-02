<template>
  <view class="home">
    <view class="hero">
      <text class="hero__title">英语启蒙</text>
      <text class="hero__sub">每天一节小课，轻松学英语</text>
    </view>

    <view class="card">
      <view class="card__row">
        <text class="card__label">推荐入口</text>
        <text class="card__value">学习中心</text>
      </view>
      <view class="card__row">
        <text class="card__label">节奏</text>
        <text class="card__value">每天 5~10 分钟</text>
      </view>
    </view>

    <view class="actions">
      <button class="btn-primary" type="primary" @click="goLearnCenter">
        进入学习中心
      </button>
      <button class="btn-secondary" @click="goContent">
        课程列表（半自由）
      </button>
    </view>

    <view class="tips">
      <text class="tips__text">提示：儿童端默认走强引导；家长可在课程列表自由选课。</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    goLearnCenter() {
      uni.navigateTo({ url: '/pages/learn-center/index' })
    },
    goContent() {
      uni.navigateTo({ url: '/pages/content/index' })
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
}

.hero {
  margin-top: 12rpx;
  margin-bottom: 22rpx;
}
.hero__title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #1f1f1f;
}
.hero__sub {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  padding: 22rpx;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}
.card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
}
.card__label {
  font-size: 26rpx;
  color: #666;
}
.card__value {
  font-size: 28rpx;
  font-weight: 700;
  color: #1f1f1f;
}

.actions {
  margin-top: 22rpx;
  display: grid;
  gap: 16rpx;
}

.btn-primary {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  font-weight: 800;
}

.btn-secondary {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 700;
  background: #fff;
  border: 2rpx solid #e6e6e6;
  color: #1f1f1f;
}

.tips {
  margin-top: 18rpx;
  text-align: center;
}
.tips__text {
  font-size: 24rpx;
  color: #888;
}
</style>
