<template>
	<view class="dt-numbox">
		<view @click="_calcValue('minus')" class="dt-numbox__minus">
			<text class="dt-numbox--text iconfont icon-open" :class="{ 'dt-numbox--disabled': inputValue <= min || disabled }"></text>
		</view>
		<input :disabled="disabled" @blur="_onBlur" class="dt-numbox__value" type="number" v-model="inputValue" />
		<view @click="_calcValue('plus')" class="dt-numbox__plus">
			<text class="dt-numbox--text iconfont icon-add" :class="{ 'dt-numbox--disabled': inputValue >= max || disabled }"></text>
		</view>
	</view>
</template>
<script>

	/**
	 * NumberBox 数字输入框
	 * @description 带加减按钮的数字输入框
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=31
	 * @property {Number} value 输入框当前值
	 * @property {Number} min 最小值
	 * @property {Number} max 最大值
	 * @property {Number} step 每次点击改变的间隔大小
	 * @property {Boolean} disabled = [true|false] 是否为禁用状态
	 * @event {Function} change 输入框值改变时触发的事件，参数为输入框当前的 value
	 */

	export default {
		name: "DtNumBox",
		props: {
			index: {
				type: Number,
				default: 0
			},
			value: {
				type: [Number, String],
				default: 1
			},
			min: {
				type: Number,
				default: 0
			},
			max: {
				type: Number,
				default: 100
			},
			step: {
				type: Number,
				default: 1
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				inputValue: 0
			};
		},
		watch: {
			value(val) {
				this.inputValue = +val;
			},
			inputValue(newVal, oldVal) {
				if (+newVal !== +oldVal) {
					const data = {
						number: newVal,
						index: this.index
					}
					this.$emit("change", data);
				}
			}
		},
		created() {
			this.inputValue = +this.value;
		},
		methods: {
			_calcValue(type) {
				if (this.disabled) {
					return;
				}
				const scale = this._getDecimalScale();
				let value = this.inputValue * scale;
				let step = this.step * scale;
				if (type === "minus") {
					value -= step;
					if (value < (this.min * scale)) {
						return;
					}
					if (value > (this.max * scale)) {
						value = this.max * scale
					}
				} else if (type === "plus") {
					value += step;
					if (value > (this.max * scale)) {
						return;
					}
					if (value < (this.min * scale)) {
						value = this.min * scale
					}
				}

				this.inputValue = String(value / scale);
			},
			_getDecimalScale() {
				let scale = 1;
				// 浮点型
				if (~~this.step !== this.step) {
					scale = Math.pow(10, (this.step + "").split(".")[1].length);
				}
				return scale;
			},
			_onBlur(event) {
				let value = event.detail.value;
				if (!value) {
					// this.inputValue = 0;
					return;
				}
				value = +value;
				if (value > this.max) {
					value = this.max;
				} else if (value < this.min) {
					value = this.min;
				}
				this.inputValue = value;
			}
		}
	};
</script>
<style lang="scss" scoped>
	$box-width: 50rpx;
	$box-height: 50rpx;
	$box-line-height: 50rpx;
	$box-font-size: 24rpx;
	$text-color: #666;
	$text-color-disable: #d6d6d6;
	$border-color: #f0f0f0;

	.dt-numbox {
		display: flex;
		justify-content: space-around;
		border-radius: 10rpx;
		border: 2rpx solid $border-color;
	}
	.dt-numbox__value {
		color: $text-color;
		font-size: $box-font-size;
		width: $box-width * 1.5;
		height: $box-height;
		line-height: $box-line-height;
		text-align: center;
	}
	.dt-numbox__minus {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: $box-width;
		height: $box-height;
		font-size: $box-font-size;
		border-right: 2rpx solid $border-color;
	}
	.dt-numbox__plus {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: $box-width;
		height: $box-height;
		border-left: 2rpx solid $border-color;
	}
	.dt-numbox--text {
		font-size: $box-font-size;
		color: $text-color;
	}
	.dt-numbox--disabled {
		color: $text-color-disable;
	}
</style>