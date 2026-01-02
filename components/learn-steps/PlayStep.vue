<template>
	<view class="step">
		<view class="step__title">玩一玩</view>
		<view class="step__hint">{{ promptText }}</view>

		<view class="grid-2">
			<view v-for="(op, idx) in options" :key="idx" class="option-card" @click="choose(op)">
				<image v-if="op.image" class="option-card__img" :src="op.image" mode="aspectFill"></image>
				<view class="option-card__label">{{ op.label || op.wordId }}</view>
			</view>
		</view>

		<view class="mt-2">{{ tips }}</view>
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
				tries: 0,
				tips: '',
				startedAt: 0
			}
		},
		mounted() {
			this.startedAt = Date.now()
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
					const durationMs = Date.now() - this.startedAt
					setTimeout(() => this.$emit('done', {
						tries: this.tries + 1,
						correct: true,
						maxTry: this.maxTry,
						durationMs,
						optionId: op.wordId || op.label
					}), 300)
					return
				}

				this.tries++
				this.tips = '再试试～'
				uni.vibrateShort && uni.vibrateShort()

				if (this.tries >= this.maxTry) {
					this.tips = '我们继续下一关吧～'
					setTimeout(() => this.$emit('done', {
						tries: this.tries,
						correct: false,
						maxTry: this.maxTry,
						durationMs,
						optionId: op.wordId || op.label
					}), 400)
				}
			}
		}
	}
</script>