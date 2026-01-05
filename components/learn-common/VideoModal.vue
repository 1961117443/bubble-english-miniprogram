<template>
  <view v-if="visible" class="vm-mask" @touchmove.stop.prevent>
    <view class="vm-panel">
      <view class="vm-head">
        <text class="vm-title">{{ title }}</text>
        <view class="vm-close" @tap="close">×</view>
      </view>

      <!-- 说明：这里用 v-if 包裹 whole modal，关闭即销毁 video，避免后台继续播放 -->
      <video
        class="vm-video"
        :src="src"
        controls
        autoplay
        show-fullscreen-btn
      />

      <view class="vm-foot">
        <view class="btn btn--md btn--primary" @tap="close">继续学习</view>
      </view>
    </view>
  </view>
</template>

<script>
import audioHub from "../../common/learn/audio-hub.js"

export default {
  name: 'VideoModal',
  props: {
    visible: { type: Boolean, default: false },
    src: { type: String, default: '' },
    title: { type: String, default: '视频' }
  },
  watch: {
    visible(val) {
      if (val) {
        // Pause any step audio to avoid mixing with video playback
        audioHub.pauseAll()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.vm-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.55);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.vm-panel {
  width: 100%;
  max-width: 720rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.vm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 20rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.vm-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}

.vm-close {
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  border-radius: 28rpx;
  background: #f3f5f7;
  font-size: 40rpx;
  color: #333;
}

.vm-video {
  width: 100%;
  height: 420rpx;
  background: #000;
}

.vm-foot {
  padding: 20rpx;
}
</style>
