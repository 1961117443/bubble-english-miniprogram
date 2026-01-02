<template>
	<view class="step">
		<view class="step__title">说一说</view>
		<view class="step__hint">{{ promptText }}</view>

		<image v-if="wordImage" class="media-img" :src="wordImage" mode="aspectFill"></image>
		<view class="word">{{ wordText }}</view>
		<view class="meaning" v-if="wordMeaning">{{ wordMeaning }}</view>

		<view class="mt-2">
			<view class="text-sub">
				<text v-if="recording">录音中：{{ seconds }}s / {{ maxDurationSec }}s</text>
				<text v-else-if="audioPath">已录音：{{ seconds }}s（可回听）</text>
				<text v-else>按住按钮开始说话</text>
			</view>

			<view class="hold-btn mt-2" :class="{ 'is-on': recording }" @touchstart.prevent="startRecord"
				@touchend.prevent="stopRecord" @touchcancel.prevent="stopRecord">
				<text v-if="recording">松开结束</text>
				<text v-else>按住录音</text>
			</view>

			<view class="actions">
				<view class="btn btn--md btn--secondary" :class="{ 'is-disabled': !audioPath || recording }"
					@click="!audioPath || recording ? null : replay">
					回听
				</view>

				<view class="btn btn--md btn--secondary" :class="{ 'is-disabled': recording }"
					@click="recording ? null : reset">
					重录
				</view>

				<view class="btn btn--md btn--primary"
					:class="{ 'is-disabled': (!audioPath && !allowSkip) || recording }"
					@click="(!audioPath && !allowSkip) || recording ? null : done">
					下一步
				</view>

				<view v-if="allowSkip && !audioPath" class="actions actions--end">
					<view class="btn btn--sm btn--ghost" @click="skip">跳过（调试用）</view>
				</view>
			</view>




		</view>
	</view>
</template>

<script>
	export default {
		name: 'SpeakStep',
		props: {
			step: {
				type: Object,
				default: () => ({})
			},
			word: {
				type: Object,
				default: () => ({})
			}
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
			this.player.onEnded(() => {
				this.playing = false
			})
			this.player.onStop(() => {
				this.playing = false
			})
			this.player.onError(() => {
				this.playing = false
			})
		},
		beforeDestroy() {
			this.clearTimer()
			if (this.player) {
				try {
					this.player.stop()
				} catch (e) {}
				try {
					this.player.destroy()
				} catch (e) {}
				this.player = null
			}
			if (this.recorder) {
				try {
					this.recorder.stop()
				} catch (e) {}
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
					uni.showToast({
						title: '录音失败，请重试',
						icon: 'none'
					})
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
					clearInterval(this.timer);
					this.timer = null
				}
			},

			startRecord() {
				if (this.recording) return
				this.stopPlay()
				this.playing = false
				this.audioPath = ''

				try {
					this.recorder.start({
						duration: this.maxDurationSec * 1000,
						sampleRate: 16000,
						numberOfChannels: 1,
						encodeBitRate: 96000,
						format: 'mp3' // 不支持就改 aac
					})
				} catch (e) {
					uni.showToast({
						title: '无法开始录音',
						icon: 'none'
					})
				}
			},

			stopRecord() {
				if (!this.recording) return
				try {
					this.recorder.stop()
				} catch (e) {}
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
					uni.showToast({
						title: '播放失败',
						icon: 'none'
					})
				}
			},

			stopPlay() {
				if (!this.player) return
				try {
					this.player.stop()
				} catch (e) {}
				this.playing = false
			},

			reset() {
				if (this.recording) return
				this.stopPlay()
				this.audioPath = ''
				this.seconds = 0
			},

			done() {
				if (!this.audioPath && !this.allowSkip) {
					uni.showToast({
						title: '先录一段再下一步～',
						icon: 'none'
					})
					return
				}
				this.$emit('done', {
					audioPath: this.audioPath,
					recorded: !!this.audioPath,
					durationSec: this.seconds
				})
			},

			skip() {
				this.$emit('done', {
					recorded: false,
					durationSec: 0,
					skipped: true
				})
			}
		}
	}
</script>