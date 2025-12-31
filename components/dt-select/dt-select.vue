<template>
	<view class="dt-select">
		<picker @change="handleChange" :value="inputIndex" :range="data" :range-key="dataKey">
			<view class="title">{{inputTitle}}</view>
		</picker>
	</view>
</template>

<script>
	export default {
		name: 'dt-select',
		props: {
			placeholder: {
				type: String,
				default: "请选择"
			},
			dataKey: {
				type: String,
				default: "title"
			},
			dataValue:{
				type: String,
				default: "id"
			},
			value: {
				type: [Number, String],
				default: 0
			},
			data: {
				type: Array,
				default: function() {
					return [];
				}
			}
		},
		data() {
			return {
				inputIndex: 0,
				inputTitle: "",
				inputValue: 0,
			};
		},
		watch: {
			value(newVal) {
				this.inputValue = newVal;
				//查找索引
				let item = this.data.find(val => val[this.dataValue] == newVal);
				if(item){
					this.inputIndex = this.data.indexOf(item);
					this.inputTitle = item[this.dataKey];
				}
			},
			inputValue(newVal, oldVal) {
				if (newVal !== oldVal) {
					this.$emit("input", newVal);
				}
			},
		},
		created() {
			this.inputValue = this.value;
			this.inputTitle = this.placeholder;
		},
		methods: {
			handleChange(e){
				let _this = this;
				let index = e.target.value;
				_this.inputTitle = _this.data[index][_this.dataKey];
				_this.inputValue = _this.data[index][_this.dataValue];
				_this.$emit("change",_this.inputValue);
			},
		}
		
	}
</script>

<style lang="scss">
	.dt-select{
		.title{
			color: #666;
			line-height: 72rpx;
		}
	}
</style>
