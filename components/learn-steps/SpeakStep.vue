<template>
  <view class="step">
    <view class="title">说一说</view>
    <view class="hint">{{ promptText }}</view>

    <image v-if="wordImage" class="img" :src="wordImage" mode="aspectFill"></image>
    <view class="word">{{ wordText }}</view>
    <view class="meaning" v-if="wordMeaning">{{ wordMeaning }}</view>

    <view class="record-box">
      <view class="status">
        <text v-if="recording">录音中：{{ seconds }}s / {{ maxDurationSec }}s</text>
        <text v-else-if="audioPath">已录音：{{ seconds }}s（可回听）</text>
        <text v-else>按住下方按钮开始说话</text>
      </view>

      <view
        class="hold-btn"
        :class="{ on: recording }"
        @touchstart.prevent="startRecord"
        @touchend.prevent="stopRecord"
        @touchcancel.prevent="stopRecord"
      >
        <text v-if="recording">松开结束</text>
        <text v-else>按住录音</text>
      </view>

      <view class="actions">
        <button size="mini" :disabled="!audioPath || recording" @click="replay">回听</button>
        <button size="mini" :disabled="recording" @click="reset">重录</button>
        <button type="primary" :disabled="(!audioPath && !allowSkip) || recording" @click="done">
          下一步
        </button>
      </view>

      <view v-if="allowSkip && !audioPath" class="skip">
        <text @click="skip">跳过（调试用）</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SpeakStep',
  props: {
    step: { type: Object, default: () => ({}) },
    word: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      recorder: null,
      player: null,
      recording: false,
      seconds: 0,
      timer: null,
      audioPath: '',
      playing: false
    }
  },
  computed: {
    payload() {
      return (this.step && this.step.payload) ? this.step.payload : {}
    },
    promptText() {
      // 和 PlayStep 保持同名字段：promptText
      // 默认用 word 拼一句
      const wt = this.wordText || ''
      return this.payload.promptText || (wt ? `跟读：${wt}` : '跟读一遍～')
    },
    maxDurationSec() {
      return Number(this.payload.maxDurationSec || 8)
    },
    allowSkip() {
      return this.payload.allowSkip !== false
    },

    wordText() {
      return this.word && this.word.text ? this.word.text : ''
    },
    wordMeaning() {
      return this.word && this.word.meaningCn ? this.word.meaningCn : ''
    },
    wordImage() {
      return this.word && this.word.assets ? this.word.assets.image : ''
    }
  },
  mounted() {
    this.recorder = uni.getRecorderManager()
    this.bindRecorderEvents()

    this.player = uni.createInnerAudioContext()
    this.player.autoplay = false
    this.player.onEnded(() => { this.playing = false })
    this.player.onStop(() => { this.playing = false })
    this.player.onError(() => { this.playing = false })
  },
  beforeDestroy() {
    this.clearTimer()
    if (this.player) {
      try { this.player.stop() } catch (e) {}
      try { this.player.destroy() } catch (e) {}
      this.player = null
    }
    if (this.recorder) {
      try { this.recorder.stop() } catch (e) {}
    }
  },
  methods: {
    bindRecorderEvents() {
      this.recorder.onStart(() => {
        this.recording = true
        this.seconds = 0
        this.startTimer()
      })

      this.recorder.onStop((res) => {
        this.recording = false
        this.clearTimer()

        if (res && res.tempFilePath) {
          this.audioPath = res.tempFilePath
          if (res.duration) this.seconds = Math.max(1, Math.round(res.duration / 1000))
          else this.seconds = Math.max(1, this.seconds || 1)
        }
      })

      this.recorder.onError(() => {
        this.recording = false
        this.clearTimer()
        uni.showToast({ title: '录音失败，请重试', icon: 'none' })
      })
    },

    startTimer() {
      this.clearTimer()
      this.timer = setInterval(() => {
        this.seconds++
        if (this.seconds >= this.maxDurationSec) this.stopRecord()
      }, 1000)
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    startRecord() {
      if (this.recording) return

      // 停止回听
      this.stopPlay()
      this.playing = false

      // 新录音清空旧文件
      this.audioPath = ''

      try {
        this.recorder.start({
          duration: this.maxDurationSec * 1000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 96000,
          format: 'mp3' // 若某端不支持，改 'aac'
        })
      } catch (e) {
        uni.showToast({ title: '无法开始录音', icon: 'none' })
      }
    },

    stopRecord() {
      if (!this.recording) return
      try { this.recorder.stop() } catch (e) {}
    },

    replay() {
      if (!this.audioPath) return
      try {
        this.player.stop()
        this.player.src = this.audioPath
        this.playing = true
        this.player.play()
      } catch (e) {
        this.playing = false
        uni.showToast({ title: '播放失败', icon: 'none' })
      }
    },

    stopPlay() {
      if (!this.player) return
      try { this.player.stop() } catch (e) {}
      this.playing = false
    },

    reset() {
      if (this.recording) return
      this.stopPlay()
      this.audioPath = ''
      this.seconds = 0
    },

    done() {
      // 不接AI，不评分：只要录过就过
      if (!this.audioPath && !this.allowSkip) {
        uni.showToast({ title: '先录一段再下一步～', icon: 'none' })
        return
      }
      this.$emit('done', {
        audioPath: this.audioPath,
        durationSec: this.seconds
      })
    },

    skip() {
      this.$emit('done', { skipped: true })
    }
  }
}
</script>

<style scoped>
.step { padding: 24rpx; }
.title { font-size: 36rpx; font-weight: 600; margin-bottom: 8rpx; }
.hint { color: #666; margin-bottom: 16rpx; }

.img { width: 100%; height: 320rpx; border-radius: 16rpx; margin-bottom: 16rpx; }
.word { font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.meaning { color: #666; margin-top: 8rpx; }

.record-box { margin-top: 16rpx; }
.status { color: #333; margin-bottom: 12rpx; }

.hold-btn{
  width: 100%;
  height: 120rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
  display:flex; align-items:center; justify-content:center;
  font-size: 34rpx; font-weight: 600;
}
.hold-btn.on{ background: #ffe4e6; }

.actions { display: flex; gap: 16rpx; margin-top: 16rpx; }
.skip { margin-top: 10rpx; text-align: right; color: #888; font-size: 24rpx; }
</style>
