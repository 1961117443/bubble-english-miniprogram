<template>
	<view class="dt-picker" @touchmove.stop.prevent="preventTouchMove">
		<view :class="{popMask: popFlag}" @click="hide"></view>
		<view class="pop-bottom" :class="{'pop-round': popFlag}">
			<view class="head">
				<text class="t1" @click="hide">关闭</text>
				<text class="t2" @click="confirm">确认</text>
			</view>
			<picker-view :value="pcaIndex" @change="pcaChange">
				<picker-view-column v-if="data">
					<block v-for="(item,index) in data" :key="index">
						<view>{{item.title}}</view>
					</block>
				</picker-view-column>
				<picker-view-column v-if="data[pcaIndex[0]]&&data[pcaIndex[0]].children">
					<block v-for="(item,index) in data[pcaIndex[0]].children" :key="index">
						<view>{{item.title}}</view>
					</block>
				</picker-view-column>
				<picker-view-column v-if="data[pcaIndex[0]]&&data[pcaIndex[0]].children&&data[pcaIndex[0]].children[pcaIndex[1]]">
					<block v-for="(item,index) in data[pcaIndex[0]].children[pcaIndex[1]].children" :key="index">
						<view>{{item.title}}</view>
					</block>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'dt-picker',
		props: {
			data: {
				type: Array,
				default: function() {
					return [];
				}
			}
		},
		data() {
			return {
				popFlag:false,
				pcaIndex:[0,0,0],
			}
		},
		methods: {
			// 防穿透
			preventTouchMove(){},
			// 滚动切换
			pcaChange(e){
			  let currentIndex=e.detail.value;
			  if(currentIndex[0]!=this.pcaIndex[0]){
			    this.pcaIndex.splice(0,3,currentIndex[0],0,0);
			    return;
			  }
			  if(currentIndex[1]!=this.pcaIndex[1]){
			    this.pcaIndex.splice(1,2,currentIndex[1],0);
			    return;
			  }
			  if(currentIndex[2]!=this.pcaIndex[2]){
			    this.pcaIndex.splice(2,1,currentIndex[2]);       
			    return;
			  }
			},
			// 显示
			show(e){
			  this.popFlag=true;
			},
			// 隐藏
			hide(e){
			  this.popFlag=false;
			},
			// 确认
			confirm(e){
				let selectNode=[];
				if(typeof(this.data[this.pcaIndex[0]])!='undefined'){
					let node=this.data[this.pcaIndex[0]];
					selectNode.push({
						id: node.id,
						title: node.title
					})
				}
				if(typeof(this.data[this.pcaIndex[0]].children[this.pcaIndex[1]])!='undefined'){
					let node=this.data[this.pcaIndex[0]].children[this.pcaIndex[1]];
					selectNode.push({
						id: node.id,
						title: node.title
					})
				}
				if(typeof(this.data[this.pcaIndex[0]].children[this.pcaIndex[1]].children[this.pcaIndex[2]])!='undefined'){
					let node=this.data[this.pcaIndex[0]].children[this.pcaIndex[1]].children[this.pcaIndex[2]];
					selectNode.push({
						id: node.id,
						title: node.title
					})
				}
				this.$emit('confirm',selectNode);
				this.hide();
			}
		}
	}
</script>

<style lang="scss">
	.dt-picker{
		.popMask {
			position: fixed;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
			z-index: 10;
		}
		.pop-bottom{
			width: 100vw;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0 0;
			font-size: 32rpx;
			position: fixed;
			bottom:0;
			left:0;
			transition: all 0.3s ease;
			transform: translateY(100%);
			opacity: 0;
			z-index: 11;
			.head{
				width: 100%;
				height: 84rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				box-sizing: border-box;
				padding: 0 30rpx 0 30rpx;
				border-bottom: 1px solid #f0f0f0;
				text{
					display: block;
					width: 100rpx;
					height: 100%;
					text-align: center;
					line-height: 84rpx;
					font-weight: bold;
				}
				.t1{
					color: #888888;
				}
				.t2{
					color: #8DDBE6;
				}
			}
			picker-view{
				height: 500rpx;
				view{
					text-align: center;
					line-height: 68rpx;
				}
			}
		}
		.pop-round{
			transition: all 0.3s ease;
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>