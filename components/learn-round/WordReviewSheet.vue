<template>
  <view v-if="visible" class="sheet">
    <view class="sheet__mask" @tap="$emit('close')" />

    <view class="sheet__panel">
      <view class="sheet__header">
        <text class="sheet__title">复习一下单词</text>
        <text class="sheet__close" @tap="$emit('close')">✕</text>
      </view>

      <view class="sheet__list">
        <view v-for="w in safeWords" :key="w.id" class="item">
          <image v-if="w.assets && w.assets.image" class="item__img" :src="w.assets.image" mode="aspectFill" />
          <view class="item__main">
            <text class="item__text">{{ w.text }}</text>
            <text class="item__meaning" v-if="w.meaningCn">{{ w.meaningCn }}</text>
          </view>
          <view class="item__btn" :class="{ 'is-disabled': !getAudio(w) }" @tap="playWord(w)">
            👂 听
          </view>
        </view>

        <view v-if="safeWords.length === 0" class="empty">没有可复习的单词</view>
      </view>

      <view class="sheet__footer">
        <view class="btn btn--md btn--primary" @tap="$emit('close')">完成复习 ✓</view>
      </view>
    </view>
  </view>
</template>

<script>
import audioHub from "../../common/learn/audio-hub.js"

export default {
  name: 'WordReviewSheet',
  props: {
    visible: { type: Boolean, default: false },
    words: { type: Array, default: () => [] }
  },
  data() {
    return {
      audioCtx: null
    }
  },
  computed: {
    safeWords() {
      return Array.isArray(this.words) ? this.words : []
    }
  },
  watch: {
    visible(val) {
      // 打开时初始化，关闭时释放
      if (val) this.ensureAudio()
      else this.destroyAudio()
    }
  },
  beforeDestroy() {
    this.destroyAudio()
  },
  methods: {
    ensureAudio() {
      if (this.audioCtx) return
      this.audioCtx = uni.createInnerAudioContext()
      this.audioCtx.autoplay = false
		audioHub.register(this.audioCtx)
    },
    destroyAudio() {
      if (!this.audioCtx) return
		audioHub.unregister(this.audioCtx)
      try { this.audioCtx.stop() } catch (e) {}
      try { this.audioCtx.destroy() } catch (e) {}
      this.audioCtx = null
    },
    getAudio(w) {
      return w && w.assets ? w.assets.audio : ''
    },
    playWord(w) {
      const audio = this.getAudio(w)
      if (!audio) {
        uni.showToast({ title: '缺少音频资源', icon: 'none' })
        return
      }
      this.ensureAudio()
      try {
        this.audioCtx.stop()
        this.audioCtx.src = audio
        this.audioCtx.play()
      } catch (e) {
        uni.showToast({ title: '播放失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
}

.sheet__mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
}

.sheet__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 24rpx;
}

.sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.sheet__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}

.sheet__close {
  font-size: 30rpx;
  color: #999;
  padding: 6rpx 10rpx;
}

.sheet__list {
  max-height: 520rpx;
  overflow: auto;
}

.item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.item__img {
  width: 84rpx;
  height: 84rpx;
  border-radius: 16rpx;
  background: #f3f5f7;
}

.item__main {
  flex: 1;
  margin-left: 16rpx;
}

.item__text {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}

.item__meaning {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #666;
}

.item__btn {
  min-width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 16rpx;
  text-align: center;
  background: #f3f5f7;
  color: #111;
  font-size: 26rpx;
}

.item__btn.is-disabled {
  opacity: 0.45;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.sheet__footer {
  margin-top: 16rpx;
}
</style>
