<template>
	<view class="step">
			<view class="step__title">{{ titleText }}</view>
			<view class="step__hint" v-if="missingAudioHint">{{ missingAudioHint }}</view>

		<!-- compact：句子回合由外层 Shell 展示文本，这里仅保留控件 -->
		<view v-if="!compact">
			<image v-if="wordImage" class="media-img" :src="wordImage" mode="aspectFill"></image>
			<view class="word">{{ wordText }}</view>
			<view class="meaning" v-if="wordMeaning">{{ wordMeaning }}</view>
		</view>


			<!-- 3-4 岁：lite 模式，减少按钮负担，把“重听”变为主操作 -->
			<view v-if="ageMode === 'lite' && !compact" class="actions-lite">
				<view class="btn btn--lg btn--primary" @click="replay">点我听</view>
				<view class="btn btn--lg btn--secondary" @click="done">我听好了</view>
			</view>
			<view v-else class="actions">
				<view class="btn btn--md btn--secondary" :class="{ 'is-disabled': isReplayDisabled }" @click="isReplayDisabled ? null : replay">
					{{ replayText }}
				</view>
				<view class="btn btn--md btn--primary" @click="done">{{ nextText }}</view>
			</view>

	</view>
</template>

<script>
	import audioHub from "../../common/learn/audio-hub.js"

	export default {
		props: {
			step: {
				type: Object,
				default: () => ({})
			},
			word: {
				type: Object,
				default: () => ({})
			},
			unitType: {
				type: String,
				default: ''
			},
			compact: {
				type: Boolean,
				default: false
			},
			ageMode: {
				type: String,
				default: 'standard'
			}
		},
		data() {
			return {
				audioCtx: null,
				replayCount: 0
			}
		},
		computed: {
			isSentence() {
				return this.unitType === 'sentence'
			},
			isMissingAudio() {
				return this.isSentence && !this.wordAudio
			},
			titleText() {
				// 句子无音频：不强跳过，改为提示 + 进入跟读
				if (this.isMissingAudio) return '看看句子'
				return this.isSentence ? '听一句' : '听一听'
			},
			missingAudioHint() {
				if (!this.isMissingAudio) return ''
				return '这句暂时没有配音，可以直接进入跟读。'
			},
			replayText() {
				return this.isMissingAudio ? '无音频' : '重听'
			},
			nextText() {
				return this.isMissingAudio ? '进入跟读' : '下一步'
			},
			isReplayDisabled() {
				return this.isMissingAudio
			},
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
			audioHub.register(this.audioCtx)
			// sentence 缺音频时不要强行 replay
			if (this.autoPlay && !this.isMissingAudio) this.replay()
			// 3-4 岁：进入页面就播一次，减少“要点什么”的认知负担
			if (this.ageMode === 'lite' && !this.isMissingAudio && this.wordAudio) {
				setTimeout(() => this.replay(), 100)
			}
		},
		beforeDestroy() {
			this.destroyAudio()
		},
		methods: {
			destroyAudio() {
				if (this.audioCtx) {
				audioHub.unregister(this.audioCtx)
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

<style scoped>
.actions-lite{
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 28rpx;
}
</style>