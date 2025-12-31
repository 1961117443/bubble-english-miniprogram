<template>
	<view class="drawer-mask" :class="maskState===0 ? 'none' : maskState===1 ? 'show' : ''" @click="toggle">
		<view class="drawer-content" :style="'float:'+mode+';transform:'+transform" @click.stop.prevent="stopPrevent" @touchmove.stop.prevent="stopPrevent">
			<scroll-view scroll-y class="content-box">
				<slot></slot>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'dt-drawer',
		props: {
			mode: {
				type: String,
				default: "right"
			}
		},
		data() {
			return {
				maskState: 0, //面板展开状态
				transform: "translateX(100%)"
			};
		},
		methods:{
			//显示面板
			toggle(type){
				let timer = type === 'show' ? 10 : 300;
				let	state = type === 'show' ? 1 : 0;
				this.maskState = 2;
				this.mode === "right"? this.transform="translateX(100%)" : this.transform="translateX(-100%)";
				setTimeout(()=>{
					this.maskState = state;
					this.transform="translateX(0)";
				}, timer)
			},
			stopPrevent(){}
		}
	}
</script>

<style lang="scss">
	.drawer-mask{
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0,0,0,0);
		z-index: 99;
		transition: .3s;
		
		.drawer-content{
			min-width: 450rpx;
			max-width: 80%;
			height: 100%;
			background: #f5f5f5;
			/*float: left;*/
			/*transform: translateX(-100%);*/
			transition: .3s;
			.content-box{
				height: 100%;
			}
		}
		&.none{
			display: none;
		}
		&.show{
			background: rgba(0,0,0,.4);
			/*.drawer-content{
				transform: translateX(0);
			}*/
		}
	}
</style>