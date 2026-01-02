<template>
	<view class="step">
		<view class="step__title">听一听</view>

		<image v-if="wordImage" class="media-img" :src="wordImage" mode="aspectFill"></image>
		<view class="word">{{ wordText }}</view>
		<view class="meaning" v-if="wordMeaning">{{ wordMeaning }}</view>

		<view class="actions">
			<view class="btn btn--md btn--secondary" @click="replay">重听</view>
			<view class="btn btn--md btn--primary" @click="done">下一步</view>
		</view>

	</view>
</template>

<script>
	export default {
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
				audioCtx: null,
				replayCount: 0
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
			this.audioCtx = uni.createInnerAudioContext()
			this.audioCtx.autoplay = false
			if (this.autoPlay) this.replay()
		},
		beforeDestroy() {
			this.destroyAudio()
		},
		methods: {
			destroyAudio() {
				if (this.audioCtx) {
					try {
						this.audioCtx.stop()
					} catch (e) {}
					try {
						this.audioCtx.destroy()
					} catch (e) {}
					this.audioCtx = null
				}
			},
			replay() {
				if (!this.wordAudio) {
					uni.showToast({
						title: '缺少音频资源',
						icon: 'none'
					})
					return
				}
				this.replayCount++
				try {
					this.audioCtx.stop()
					this.audioCtx.src = this.wordAudio
					this.audioCtx.play()
				} catch (e) {
					uni.showToast({
						title: '播放失败',
						icon: 'none'
					})
				}
				this.$emit('replay')
			},
			done() {
				this.$emit('done', {
					replayCount: this.replayCount,
					autoPlay: this.autoPlay
				})
			}
		}
	}
</script>