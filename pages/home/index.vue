<template>
  <view class="home">
    <view class="hero">
      <image class="hero__bg" src="/static/demo/bg-home.png" mode="aspectFill" />
      <view class="hero__overlay">
        <text class="hero__title">英语启蒙</text>
        <text class="hero__sub">每天一节小课，轻松学英语</text>
      </view>
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

      <button class="btn-secondary" @click="goParentCenter">家长中心</button>

      <!-- 免登录体验入口：家长先体验，满意再注册/建档 -->
      <view class="exp">
        <text class="exp__title">立即体验（免登录）</text>
        <view class="exp__grid">
          <button class="btn-ghost" @click="startGuest('3-4')">体验 3–4 岁</button>
          <button class="btn-ghost" @click="startGuest('5-6')">体验 5–6 岁</button>
          <button class="btn-ghost" @click="startGuest('7-8')">体验 7–8 岁</button>
        </view>
        <text class="exp__tip">提示：体验模式不会保存记录。注册后可添加多个孩子、生成学习报告。</text>
      </view>

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
    goParentCenter() {
      uni.navigateTo({ url: '/pages/parent/index' })
    },
    goContent() {
      uni.navigateTo({ url: '/pages/content/index' })
    },

    startGuest(ageBand) {
      // 体验模式：不登录、不建档，直接按年龄段体验课程
      // 这里只挑一个代表课程（熊猫），后续可按主题/推荐扩展
      const courseId = 'course-panda-01'
      const childAge = ageBand === '3-4' ? 4 : ageBand === '5-6' ? 5 : 7
      uni.navigateTo({
        url: `/pages/learn/index?mode=guest&ageBand=${encodeURIComponent(ageBand)}&childAge=${childAge}&courseId=${encodeURIComponent(courseId)}`
      })
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
  position: relative;
  overflow: hidden;
  border-radius: 22rpx;
  margin-top: 12rpx;
  margin-bottom: 22rpx;
  height: 240rpx;
  background: #fff;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}
.hero__bg{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.hero__overlay{
  position: relative;
  z-index: 1;
  padding: 28rpx;
}
.hero__title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #1f1f1f;
}
.hero__sub {
  display: block;
  margin-top: 50rpx;
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

.exp {
  background: #fff;
  border-radius: 18rpx;
  padding: 18rpx;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}

.exp__title {
  display: block;
  font-size: 26rpx;
  color: #1f1f1f;
  font-weight: 900;
  margin-bottom: 12rpx;
}

.exp__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.btn-ghost {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 800;
  background: #f7f8fa;
  color: #1f1f1f;
  border: 2rpx solid #e6e6e6;
}

.exp__tip {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #888;
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
