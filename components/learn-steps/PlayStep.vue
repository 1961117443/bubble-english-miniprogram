<template>
  <view class="step">
    <view class="title">玩一玩</view>
    <view class="hint">{{ promptText }}</view>

    <view class="grid">
      <view
        v-for="(op, idx) in options"
        :key="idx"
        class="card"
        @click="choose(op)"
      >
        <image v-if="op.image" class="img" :src="op.image" mode="aspectFill"></image>
        <view class="label">{{ op.label || op.wordId }}</view>
      </view>
    </view>

    <view class="tips">{{ tips }}</view>
  </view>
</template>

<script>
export default {
  props: {
    step: { type: Object, default: () => ({}) },
    word: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      tries: 0,
      tips: ''
    }
  },
  computed: {
    payload() {
      return (this.step && this.step.payload) ? this.step.payload : {}
    },
    options() {
      return this.payload.options || []
    },
    maxTry() {
      return this.payload.maxTry || 3
    },
    promptText() {
      return this.payload.promptText || 'Try it!'
    }
  },
  methods: {
    choose(op) {
      if (!op) return

      const isCorrect = !!op.isAnswer
      if (isCorrect) {
        this.tips = '太棒了！'
        uni.vibrateShort && uni.vibrateShort()
        // 稍微停顿一下再过关，体验更像“通关”
        setTimeout(() => this.$emit('done'), 300)
        return
      }

      this.tries++
      this.tips = '再试试～'

      // 给轻量反馈，不要“错了”
      uni.vibrateShort && uni.vibrateShort()

      if (this.tries >= this.maxTry) {
        // 达到次数：直接放行（不制造失败感）
        this.tips = '我们继续下一关吧～'
        setTimeout(() => this.$emit('done'), 400)
      }
    }
  }
}
</script>

<style scoped>
.step { padding: 24rpx; }
.title { font-size: 36rpx; font-weight: 600; margin-bottom: 8rpx; }
.hint { color: #666; margin-bottom: 16rpx; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 16rpx; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06); }
.img { width: 100%; height: 220rpx; border-radius: 12rpx; }
.label { margin-top: 12rpx; font-size: 32rpx; font-weight: 600; text-align: center; }
.tips { margin-top: 16rpx; color: #333; }
</style>
