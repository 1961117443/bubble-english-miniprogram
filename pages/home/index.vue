<template>
	<view class="page">
		<view class="title">首页（临时入口）</view>
		<button class="start-btn" type="primary" @click="goLearn">开始学习</button>
	</view>
</template>

<script>
export default {
	methods: {
		goLearn() {
			uni.navigateTo({
				url: "/pages/learn/index"
			});
		}
	}
};
</script>

<style scoped>
.page {
	padding: 32rpx;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	margin-bottom: 24rpx;
}

.start-btn {
	width: 100%;
}
</style>
