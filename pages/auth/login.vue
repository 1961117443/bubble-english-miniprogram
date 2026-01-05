<template>
  <view class="page">
    <view class="card">
      <view class="title">登录后可保存孩子学习记录</view>
      <view class="sub">支持多孩子管理、学习统计与进阶内容解锁</view>

      <view class="btns">
        <button class="btn primary" @tap="onWechatLogin">微信一键登录</button>
        <button class="btn" @tap="onPhoneLogin">本机号码一键登录</button>
      </view>

      <view class="agree">
        <view class="checkbox" @tap="agree = !agree">
          <view class="box" :class="{on: agree}"></view>
          <text class="agreeText">我已阅读并同意</text>
        </view>
        <view class="links">
          <text class="link" @tap="openDoc('terms')">《用户协议》</text>
          <text class="link" @tap="openDoc('privacy')">《隐私政策》</text>
        </view>
        <view class="hint">我们仅用于保存学习数据，不会向孩子展示任何广告</view>
      </view>

      <view class="footer">
        <text class="skip" @tap="skip">暂不登录，继续体验</text>
      </view>

      <!-- debug helper: show only when ?debug=1 -->
      <view v-if="debug" class="debug">
        <view class="debugTitle">开发调试</view>
        <button class="btn ghost" @tap="mockSuccess">模拟登录成功</button>
        <view class="debugTip">仅用于前端联调：设置内存态 isLoggedIn=true 并跳转回 redirect</view>
      </view>
    </view>
  </view>
</template>

<script>
import { loginByWechat, loginByPhone } from '@/api/auth-api'
import { setAuth } from '@/common/auth/auth-store'

export default {
  data() {
    return {
      agree: false,
      redirect: '',
      debug: false
    }
  },
  onLoad(query) {
    this.redirect = (query && query.redirect) || ''
    this.debug = !!(query && (query.debug === '1' || query.debug === 'true'))
  },
  methods: {
    ensureAgree() {
      if (this.agree) return true
      uni.showToast({ title: '请先同意协议', icon: 'none' })
      return false
    },
    async onWechatLogin() {
      if (!this.ensureAgree()) return
      try {
        await loginByWechat()
      } catch (e) {
        console.log(e)
        uni.showToast({ title: '登录服务未接入（占位）', icon: 'none' })
      }
    },
    async onPhoneLogin() {
      if (!this.ensureAgree()) return
      try {
        await loginByPhone()
      } catch (e) {
        console.log(e)
        uni.showToast({ title: '号码登录未接入（占位）', icon: 'none' })
      }
    },
    openDoc(type) {
      // Placeholder: you can navigate to a webview/static page later
      uni.showToast({ title: type === 'privacy' ? '隐私政策（占位）' : '用户协议（占位）', icon: 'none' })
    },
    skip() {
      // Keep user in guest mode; just go back.
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab ? uni.switchTab({ url: '/pages/home/index' }) : uni.reLaunch({ url: '/pages/home/index' })
      }
    },
    mockSuccess() {
      if (!this.ensureAgree()) return
      setAuth({ isLoggedIn: true, parentId: 'parent_mock', token: 'token_mock' })
      uni.showToast({ title: '已模拟登录', icon: 'none' })
      const url = this.redirect ? decodeURIComponent(this.redirect) : '/pages/home/index'
      uni.reLaunch({ url })
    }
  }
}
</script>

<style>
.page{
  min-height: 100vh;
  background: #f7f7f7;
  padding: 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card{
  width: 100%;
  max-width: 680rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 36rpx 28rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.06);
}
.title{
  font-size: 40rpx;
  font-weight: 700;
  color: #222;
  line-height: 1.3;
}
.sub{
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666;
}
.btns{
  margin-top: 28rpx;
}
.btn{
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 30rpx;
  margin-top: 18rpx;
}
.primary{
  background: #07c160;
  color: #fff;
}
.agree{
  margin-top: 24rpx;
}
.checkbox{
  display: flex;
  align-items: center;
}
.box{
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid #bbb;
  margin-right: 12rpx;
  box-sizing: border-box;
  background: #fff;
}
.box.on{
  border-color: #07c160;
  background: #07c160;
}
.agreeText{
  font-size: 24rpx;
  color: #666;
}
.links{
  margin-left: 44rpx;
  margin-top: 8rpx;
}
.link{
  font-size: 24rpx;
  color: #3a7afe;
  margin-right: 14rpx;
}
.hint{
  margin-left: 44rpx;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #999;
}
.footer{
  margin-top: 22rpx;
  text-align: center;
}
.skip{
  font-size: 26rpx;
  color: #666;
  text-decoration: underline;
}
.debug{
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 1rpx dashed #eee;
}
.debugTitle{
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}
.ghost{
  background: #f3f3f3;
  color: #333;
}
.debugTip{
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #999;
}
</style>
