<template>
  <view class="page">
    <view class="card">
      <view class="title">登录后可保存孩子学习记录</view>
      <view class="sub">支持多孩子管理、学习统计与进阶内容解锁</view>

      <view class="tabs">
        <view class="tab" :class="{on: tab==='wechat'}" @tap="tab='wechat'">微信登录</view>
        <view class="tab" :class="{on: tab==='phone'}" @tap="tab='phone'">手机登录</view>
      </view>

      <view v-if="tab==='wechat'" class="btns">
        <button class="btn primary" @tap="onWechatLogin">微信一键登录</button>
        <view class="minor">提示：首次体验可不登录；需要保存数据时再登录即可。</view>
      </view>

      <view v-else class="phoneBox">
        <view class="field">
          <text class="label">手机号</text>
          <input class="input" type="number" v-model="phone" maxlength="11" placeholder="请输入手机号" />
        </view>

        <view class="modeSwitch">
          <view class="mode" :class="{on: phoneMode==='password'}" @tap="phoneMode='password'">密码</view>
          <view class="mode" :class="{on: phoneMode==='code'}" @tap="phoneMode='code'">验证码</view>
        </view>

        <view v-if="phoneMode==='password'" class="field">
          <text class="label">密码</text>
          <input class="input" password v-model="password" placeholder="测试用：任意填写" />
        </view>

        <view v-else class="field codeField">
          <text class="label">验证码</text>
          <input class="input" type="number" v-model="code" maxlength="6" placeholder="输入验证码" />
          <button class="codeBtn" :disabled="smsCountdown>0" @tap="requestSms">{{ smsCountdown>0 ? smsCountdown+'s' : '获取验证码' }}</button>
        </view>

        <button class="btn primary" @tap="onPhoneSubmit">登录</button>
        <view class="minor">测试登录：当前为前端占位流程，后端接入后将改为真实短信/密码校验。</view>
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
import {
  loginByWechat,
  requestSmsCode,
  loginByPhonePassword,
  loginByPhoneCode
} from '@/api/auth-api'
import { setAuth } from '@/common/auth/auth-store'

export default {
  data() {
    return {
      agree: false,
      redirect: '',
      debug: false,
      tab: 'wechat',
      phoneMode: 'password',
      phone: '',
      password: '',
      code: '',
      smsCountdown: 0,
      smsTimer: null
    }
  },
  onLoad(query) {
    this.redirect = (query && query.redirect) || ''
    this.debug = !!(query && (query.debug === '1' || query.debug === 'true'))
    if (query && (query.tab === 'phone')) this.tab = 'phone'
  },
  onUnload() {
    if (this.smsTimer) clearInterval(this.smsTimer)
    this.smsTimer = null
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
    normalizeRedirect() {
      return this.redirect ? decodeURIComponent(this.redirect) : '/pages/home/index'
    },
    validatePhone() {
      const p = (this.phone || '').trim()
      // 简单校验：大陆 11 位手机号；若你后续要支持更多地区，可放宽规则
      if (!/^1\d{10}$/.test(p)) {
        uni.showToast({ title: '请输入 11 位手机号', icon: 'none' })
        return false
      }
      this.phone = p
      return true
    },
    async requestSms() {
      if (!this.ensureAgree()) return
      if (!this.validatePhone()) return
      if (this.smsCountdown > 0) return
      try {
        await requestSmsCode(this.phone)
      } catch (e) {
        console.log(e)
        // 前端占位：没有后端也让流程能跑起来
        uni.showToast({ title: '验证码已发送（测试占位）', icon: 'none' })
      }
      this.smsCountdown = 60
      this.smsTimer = setInterval(() => {
        this.smsCountdown -= 1
        if (this.smsCountdown <= 0) {
          this.smsCountdown = 0
          clearInterval(this.smsTimer)
          this.smsTimer = null
        }
      }, 1000)
    },
    async onPhoneSubmit() {
      if (!this.ensureAgree()) return
      if (!this.validatePhone()) return

      if (this.phoneMode === 'password') {
        if (!this.password) {
          uni.showToast({ title: '请输入密码（测试可任意）', icon: 'none' })
          return
        }
        try {
          await loginByPhonePassword(this.phone, this.password)
        } catch (e) {
          console.log(e)
          // 测试模式：本地模拟登录成功（便于你联调后续页面）
          setAuth({ isLoggedIn: true, parentId: 'parent_' + this.phone, token: 'token_mock_' + this.phone })
          uni.showToast({ title: '测试登录成功', icon: 'none' })
          uni.reLaunch({ url: this.normalizeRedirect() })
          return
        }
      } else {
        if (!this.code) {
          uni.showToast({ title: '请输入验证码', icon: 'none' })
          return
        }
        try {
          await loginByPhoneCode(this.phone, this.code)
        } catch (e) {
          console.log(e)
          // 测试模式：本地模拟登录成功
          setAuth({ isLoggedIn: true, parentId: 'parent_' + this.phone, token: 'token_mock_' + this.phone })
          uni.showToast({ title: '测试登录成功', icon: 'none' })
          uni.reLaunch({ url: this.normalizeRedirect() })
          return
        }
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
      uni.reLaunch({ url: this.normalizeRedirect() })
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
.tabs{
  margin-top: 22rpx;
  display: flex;
  background: #f2f3f5;
  border-radius: 18rpx;
  padding: 8rpx;
}
.tab{
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  padding: 18rpx 0;
  border-radius: 14rpx;
  color: #666;
}
.tab.on{
  background: #fff;
  color: #222;
  font-weight: 600;
  box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.06);
}
.minor{
  margin-top: 14rpx;
  font-size: 22rpx;
  color: #999;
}
.phoneBox{
  margin-top: 22rpx;
}
.field{
  margin-top: 16rpx;
  background: #fafafa;
  border: 1rpx solid #eee;
  border-radius: 18rpx;
  padding: 18rpx 18rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}
.label{
  width: 110rpx;
  font-size: 26rpx;
  color: #666;
}
.input{
  flex: 1;
  font-size: 28rpx;
  color: #222;
}
.modeSwitch{
  margin-top: 16rpx;
  display: flex;
  gap: 12rpx;
}
.mode{
  flex: 1;
  background: #f2f3f5;
  border-radius: 16rpx;
  text-align: center;
  padding: 18rpx 0;
  font-size: 26rpx;
  color: #666;
}
.mode.on{
  background: #e8f5ee;
  color: #07c160;
  font-weight: 600;
}
.codeField{
  padding-right: 10rpx;
}
.codeBtn{
  height: 64rpx;
  line-height: 64rpx;
  font-size: 24rpx;
  padding: 0 18rpx;
  border-radius: 14rpx;
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
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
