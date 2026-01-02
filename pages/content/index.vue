<template>
  <view class="content">
    <view class="header">
      <text class="header__title">课程列表</text>
      <text class="header__sub">建议每天完成 1 节小课</text>
    </view>

    <view class="list">
      <view
        v-for="c in courses"
        :key="c.id"
        class="card"
        @click="openDetail(c.id)"
      >
        <image v-if="c.cover" class="card__cover" :src="c.cover" mode="aspectFill" />
        <view class="card__body">
          <view class="card__title">{{ c.title }}</view>
          <view class="card__sub">{{ c.subtitle }}</view>
          <view class="card__meta">
            <text class="tag">课程</text>
            <text class="meta">{{ c.wordsCount }} 个单词</text>
          </view>
        </view>
        <view class="card__arrow">›</view>
      </view>
    </view>

    <view class="footer">
      <button class="btn-primary" type="primary" @click="startToday">
        回到今日课程
      </button>
    </view>
  </view>
</template>

<script>
import { listCourses, getTodayCourseId } from '@/pages/learn/course-repo'

export default {
  name: 'ContentIndex',
  data() {
    return {
      courses: []
    }
  },
  onShow() {
    this.courses = listCourses()
  },
  methods: {
    openDetail(courseId) {
      uni.navigateTo({
        url: `/pages/course/detail?courseId=${encodeURIComponent(courseId)}`
      })
    },
    startToday() {
      const id = getTodayCourseId()
      this.openDetail(id)
    }
  }
}
</script>

<style scoped>
.content {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
}

.header {
  margin-top: 8rpx;
  margin-bottom: 18rpx;
}
.header__title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #1f1f1f;
}
.header__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.list {
  display: grid;
  gap: 16rpx;
  padding-bottom: 140rpx;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}

.card__cover {
  width: 168rpx;
  height: 168rpx;
  flex-shrink: 0;
}

.card__body {
  padding: 16rpx 16rpx;
  flex: 1;
  min-width: 0;
}

.card__title {
  font-size: 32rpx;
  font-weight: 800;
  color: #1f1f1f;
}

.card__sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.card__meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tag {
  font-size: 22rpx;
  color: #2f6bff;
  background: rgba(47,107,255,0.10);
  padding: 6rpx 10rpx;
  border-radius: 999rpx;
  font-weight: 700;
}

.meta {
  font-size: 24rpx;
  color: #666;
}

.card__arrow {
  width: 64rpx;
  text-align: center;
  font-size: 44rpx;
  color: #bbb;
  padding-right: 12rpx;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 32rpx 28rpx;
  background: rgba(245,246,248,0.96);
  backdrop-filter: blur(10px);
}

.btn-primary {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  font-weight: 800;
}
</style>
