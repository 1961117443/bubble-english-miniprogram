<template>
  <view class="page">
    <view class="box">
      <view class="title">正在登录…</view>
      <view class="sub">请稍候</view>
    </view>
  </view>
</template>

<script>
export default {
  onLoad(query) {
    console.log('[AUTH TODO] callback query', query)
    // Backend should redirect here with code/state; then exchange for token.
    // For now, just go back.
    setTimeout(() => {
      if (getCurrentPages().length > 1) uni.navigateBack()
      else uni.reLaunch({ url: '/pages/home/index' })
    }, 600)
  }
}
</script>

<style>
.page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f7f7;}
.box{background:#fff;padding:40rpx 30rpx;border-radius:24rpx;box-shadow:0 10rpx 30rpx rgba(0,0,0,0.06);}
.title{font-size:34rpx;font-weight:700;color:#222;}
.sub{margin-top:10rpx;font-size:24rpx;color:#666;}
</style>
