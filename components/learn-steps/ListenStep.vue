<template>
  <view class="step">
    <view class="title">听一听</view>

    <image v-if="wordImage" class="img" :src="wordImage" mode="aspectFill"></image>
    <view class="word">{{ wordText }}</view>
    <view class="meaning" v-if="wordMeaning">{{ wordMeaning }}</view>

    <view class="actions">
      <button size="mini" @click="replay">重听</button>
      <button type="primary" @click="done">下一步</button>
    </view>
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
      audioCtx: null
    }
  },
  computed: {
    wordText() {
      return this.word && this.word.text ? this.word.text : ''
    },
    wordMeaning() {
      return this.word && this.word.meaningCn ? this.word.meaningCn : ''
    },
    wordImage() {
      return this.word && this.word.assets ? this.word.assets.image : ''
    },
    wordAudio() {
      return this.word && this.word.assets ? this.word.assets.audio : ''
    },
    autoPlay() {
      return !!(this.step && this.step.payload && this.step.payload.autoPlay)
    }
  },
  mounted() {
    // 真机/小程序推荐使用 innerAudioContext
    this.audioCtx = uni.createInnerAudioContext()
    this.audioCtx.autoplay = false

    if (this.autoPlay) {
      this.replay()
    }
  },
  beforeDestroy() {
    this.destroyAudio()
  },
  methods: {
    destroyAudio() {
      if (this.audioCtx) {
        try { this.audioCtx.stop() } catch (e) {}
        try { this.audioCtx.destroy() } catch (e) {}
        this.audioCtx = null
      }
    },
    replay() {
      if (!this.wordAudio) {
        uni.showToast({ title: '缺少音频资源', icon: 'none' })
        return
      }
      try {
        this.audioCtx.stop()
        this.audioCtx.src = this.wordAudio
        this.audioCtx.play()
      } catch (e) {
        uni.showToast({ title: '播放失败', icon: 'none' })
      }
      this.$emit('replay') // 可选：给父页面统计
    },
    done() {
      this.$emit('done')
    }
  }
}
</script>

<style scoped>
.step { padding: 24rpx; }
.title { font-size: 36rpx; font-weight: 600; margin-bottom: 16rpx; }
.img { width: 100%; height: 320rpx; border-radius: 16rpx; margin-bottom: 16rpx; }
.word { font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.meaning { color: #666; margin-top: 8rpx; }
.actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
</style>
