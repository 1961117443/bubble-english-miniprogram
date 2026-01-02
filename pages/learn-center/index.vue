<template>
  <view class="page">
    <view class="hero">
      <text class="hero__title">学习中心</text>
      <text class="hero__sub">今天也来完成一节小课吧～</text>
    </view>

    <view class="today-card">
      <view class="today-card__left">
        <text class="today-card__label">今日课程</text>
        <text class="today-card__title">{{ today.title }}</text>
        <text class="today-card__desc">{{ today.subtitle }}</text>

        <view class="today-meta">
          <view class="chip">
            <text class="chip__label">单词</text>
            <text class="chip__value">{{ today.wordsCount }}</text>
          </view>
          <view class="chip">
            <text class="chip__label">流程</text>
            <text class="chip__value">{{ today.flowText }}</text>
          </view>
        </view>
      </view>

      <image v-if="today.cover" class="today-card__cover" :src="today.cover" mode="aspectFill" />
    </view>

    <view class="actions">
      <button class="btn-primary" type="primary" @click="startToday">
        开始学习
      </button>

      <view class="actions-row">
        <button class="btn-secondary" @click="goCourseList">选课（半自由）</button>
        <button class="btn-secondary" @click="goTodayDetail">课程详情</button>
      </view>
    </view>

    <view class="panel">
      <view class="panel__title">成长记录（占位）</view>
      <view class="panel__grid">
        <view class="stat">
          <text class="stat__num">0</text>
          <text class="stat__label">连续学习</text>
        </view>
        <view class="stat">
          <text class="stat__num">0</text>
          <text class="stat__label">星星</text>
        </view>
        <view class="stat">
          <text class="stat__num">0</text>
          <text class="stat__label">贴纸</text>
        </view>
      </view>
      <view class="panel__tip">
        <text class="tip-text">提示：后续接后端/本地数据后，这里会自动显示真实记录。</text>
      </view>
    </view>

    <view class="tip">
      <text class="tip__text">复习会在学习流程中自动混入（后续）。</text>
    </view>
  </view>
</template>

<script>
import { getTodayCourseId, getCourseMeta, getCourseOutline, getCourseById } from '@/pages/learn/course-repo'

export default {
  name: 'LearnCenter',
  data() {
    return {
      todayCourseId: '',
      today: {
        id: '',
        title: '',
        subtitle: '',
        cover: '',
        wordsCount: 0,
        flowText: ''
      }
    }
  },
  onShow() {
    this.todayCourseId = getTodayCourseId()
    const c = getCourseById(this.todayCourseId) || {}
    const meta = getCourseMeta(this.todayCourseId)
    const outline = getCourseOutline(this.todayCourseId)

    this.today = {
      id: this.todayCourseId,
      title: c.title || '今日课程',
      subtitle: meta.subtitle || '轻松完成一节小课',
      cover: meta.cover || '',
      wordsCount: outline.wordsCount || 0,
      flowText: outline.flowText || ''
    }
  },
  methods: {
    startToday() {
      uni.navigateTo({
        url: `/pages/learn/index?courseId=${encodeURIComponent(this.todayCourseId)}`
      })
    },
    goCourseList() {
      uni.navigateTo({ url: '/pages/content/index' })
    },
    goTodayDetail() {
      uni.navigateTo({
        url: `/pages/course/detail?courseId=${encodeURIComponent(this.todayCourseId)}`
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
}

.hero {
  margin-top: 8rpx;
  margin-bottom: 18rpx;
}
.hero__title {
  display: block;
  font-size: 42rpx;
  font-weight: 900;
  color: #1f1f1f;
}
.hero__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666;
}

/* 今日课程卡片 */
.today-card {
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.today-card__left {
  flex: 1;
  padding: 18rpx;
  min-width: 0;
}

.today-card__label {
  display: block;
  font-size: 24rpx;
  color: #2f6bff;
  font-weight: 800;
}

.today-card__title {
  display: block;
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.today-card__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.today-card__cover {
  width: 220rpx;
  height: 220rpx;
  flex-shrink: 0;
}

.today-meta {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.chip {
  background: #f7f8fa;
  border-radius: 999rpx;
  padding: 10rpx 14rpx;
  display: flex;
  gap: 8rpx;
  align-items: center;
}

.chip__label {
  font-size: 22rpx;
  color: #666;
}

.chip__value {
  font-size: 24rpx;
  font-weight: 900;
  color: #1f1f1f;
}

/* 按钮区 */
.actions {
  margin-top: 18rpx;
  display: grid;
  gap: 14rpx;
}

.btn-primary {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 34rpx;
  font-weight: 900;
}

.actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
}

.btn-secondary {
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

/* 成长面板 */
.panel {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 18rpx;
  padding: 18rpx;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}

.panel__title {
  font-size: 30rpx;
  font-weight: 900;
  color: #1f1f1f;
  margin-bottom: 12rpx;
}

.panel__grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12rpx;
}

.stat {
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 14rpx 10rpx;
  text-align: center;
}

.stat__num {
  display: block;
  font-size: 34rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.stat__label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #666;
}

.panel__tip {
  margin-top: 12rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #888;
}

.tip {
  margin-top: 16rpx;
  text-align: center;
}

.tip__text {
  font-size: 24rpx;
  color: #888;
}
</style>
