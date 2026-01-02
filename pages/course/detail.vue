<template>
  <view class="page" v-if="course">
    <view class="hero">
      <image v-if="cover" class="hero__cover" :src="cover" mode="aspectFill" />
      <view class="hero__body">
        <text class="hero__title">{{ course.title }}</text>
        <text class="hero__sub">{{ subtitle }}</text>

        <view class="meta">
          <view class="meta__chip">
            <text class="meta__label">单词</text>
            <text class="meta__value">{{ wordsCount }}</text>
          </view>
          <view class="meta__chip">
            <text class="meta__label">流程</text>
            <text class="meta__value">{{ flowText }}</text>
          </view>
          <view class="meta__chip">
            <text class="meta__label">建议</text>
            <text class="meta__value">5-10 分钟</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card__title">本课单词</view>
      <view class="word-list">
        <view class="word-item" v-for="w in wordsPreview" :key="w.id">
          <image v-if="w.cover" class="word-item__img" :src="w.cover" mode="aspectFill" />
          <view class="word-item__body">
            <text class="word-item__en">{{ w.text }}</text>
            <text class="word-item__cn">{{ w.meaningCn }}</text>
          </view>
        </view>
      </view>

      <view class="tip">
        <text class="tip__text">提示：复习会在学习过程中自动混入（后续）。</text>
      </view>
    </view>

    <view class="footer">
      <button class="btn-primary" type="primary" @click="start">
        开始学习
      </button>
      <button class="btn-secondary" @click="back">
        返回课程列表
      </button>
    </view>
  </view>

  <view v-else class="empty">
    <text class="empty__text">课程不存在</text>
    <button class="btn-primary" type="primary" @click="back">返回</button>
  </view>
</template>

<script>
import { getCourseById, getCourseMeta, getCourseOutline } from '@/pages/learn/course-repo'

export default {
  name: 'CourseDetail',
  data() {
    return {
      courseId: '',
      course: null,
      cover: '',
      subtitle: '',
      wordsCount: 0,
      flowText: '',
      wordsPreview: []
    }
  },
  onLoad(options) {
    this.courseId = options && options.courseId ? decodeURIComponent(options.courseId) : ''
    this.load()
  },
  methods: {
    load() {
      const course = getCourseById(this.courseId)
      if (!course) {
        this.course = null
        return
      }
      this.course = course

      const meta = getCourseMeta(course.id)
      this.cover = meta.cover
      this.subtitle = meta.subtitle

      const outline = getCourseOutline(course.id)
      this.wordsCount = outline.wordsCount
      this.flowText = outline.flowText
      this.wordsPreview = outline.wordsPreview
    },

    start() {
      if (!this.courseId) return
      uni.navigateTo({
        url: `/pages/learn/index?courseId=${encodeURIComponent(this.courseId)}`
      })
    },

    back() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
  padding-bottom: 170rpx;
}

.hero {
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}

.hero__cover {
  width: 100%;
  height: 320rpx;
}

.hero__body {
  padding: 20rpx 20rpx 22rpx;
}

.hero__title {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.hero__sub {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.meta {
  margin-top: 16rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.meta__chip {
  background: #f7f8fa;
  border-radius: 999rpx;
  padding: 10rpx 14rpx;
  display: flex;
  gap: 8rpx;
  align-items: center;
}

.meta__label {
  font-size: 22rpx;
  color: #666;
}

.meta__value {
  font-size: 24rpx;
  font-weight: 800;
  color: #1f1f1f;
}

/* 单词卡片 */
.card {
  margin-top: 16rpx;
  background: #fff;
  border-radius: 18rpx;
  padding: 18rpx;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
}

.card__title {
  font-size: 30rpx;
  font-weight: 900;
  color: #1f1f1f;
  margin-bottom: 12rpx;
}

.word-list {
  display: grid;
  gap: 12rpx;
}

.word-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 12rpx;
}

.word-item__img {
  width: 92rpx;
  height: 92rpx;
  border-radius: 14rpx;
  flex-shrink: 0;
}

.word-item__body {
  min-width: 0;
}

.word-item__en {
  display: block;
  font-size: 30rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.word-item__cn {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #666;
}

.tip {
  margin-top: 14rpx;
  text-align: center;
}

.tip__text {
  font-size: 24rpx;
  color: #888;
}

/* 底部按钮 */
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 32rpx 28rpx;
  background: rgba(245,246,248,0.96);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 14rpx;
}

.btn-primary {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  font-weight: 900;
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

/* 空态 */
.empty {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18rpx;
  align-items: center;
}
.empty__text {
  font-size: 28rpx;
  color: #666;
}
</style>
