<template>
  <view class="page">
    <view class="hd">
      <text class="title">家长中心</text>
      <text class="sub">孩子档案 / 会员 / 主题包（后续接后端）</text>
    </view>

    <view class="card">
      <text class="card__title">当前状态</text>
      <text class="card__text">本版本不接后端：这里只提供 UI 占位与调试开关，不会保存数据。</text>
    </view>

    <view class="card">
      <text class="card__title">调试：模拟权益</text>
      <view class="row">
        <text class="row__label">会员（解锁进阶）</text>
        <switch :checked="ent.isVip" @change="onVipChange" />
      </view>
      <view class="row">
        <text class="row__label">已购主题包</text>
        <view class="chips">
          <view class="chip" :class="{on: has('zoo')}" @click="toggle('zoo')">动物</view>
          <view class="chip" :class="{on: has('farm')}" @click="toggle('farm')">农场</view>
          <view class="chip" :class="{on: has('body')}" @click="toggle('body')">身体</view>
        </view>
      </view>
      <view class="btns">
        <button class="btn" @click="reset">重置</button>
        <button class="btn btn-primary" @click="goCourses">去课程列表看看</button>
      </view>
    </view>

    <view class="card">
      <text class="card__title">孩子档案</text>
      <text class="card__text">后端接入后：支持多孩子、动态年龄计算、进入学习时选择孩子。</text>
      <view class="btns">
        <button class="btn" @click="goAddChild">添加孩子档案（占位）</button>
      </view>
    </view>
  </view>
</template>

<script>
import { entitlementStore } from '@/services/entitlement-store'

export default {
  name: 'ParentCenter',
  data() {
    return {
      ent: entitlementStore.get()
    }
  },
  onShow() {
    this.ent = entitlementStore.get()
  },
  methods: {
    onVipChange(e) {
      const isVip = !!(e && e.detail && e.detail.value)
      this.ent = entitlementStore.set({ isVip })
    },
    has(theme) {
      return (this.ent.themes || []).includes(theme)
    },
    toggle(theme) {
      const list = new Set(this.ent.themes || [])
      if (list.has(theme)) list.delete(theme)
      else list.add(theme)
      this.ent = entitlementStore.set({ themes: Array.from(list) })
    },
    reset() {
      this.ent = entitlementStore.reset()
    },
    goCourses() {
      uni.navigateTo({ url: '/pages/content/index' })
    },
    goAddChild() {
      uni.navigateTo({ url: '/pages/parent/child-add' })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6f8;
}

.hd {
  margin-top: 8rpx;
  margin-bottom: 18rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  padding: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06);
  margin-bottom: 16rpx;
}

.card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 900;
  color: #1f1f1f;
}

.card__text {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.row__label {
  font-size: 26rpx;
  color: #1f1f1f;
  font-weight: 700;
}

.chips {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chip {
  padding: 10rpx 14rpx;
  border-radius: 999rpx;
  border: 2rpx solid #e6e6e6;
  background: #fff;
  font-size: 22rpx;
  font-weight: 800;
  color: #1f1f1f;
}

.chip.on {
  border-color: #2f6bff;
  background: rgba(47,107,255,0.10);
  color: #2f6bff;
}

.btns {
  margin-top: 14rpx;
  display: grid;
  gap: 12rpx;
}

.btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 30rpx;
  font-weight: 800;
  background: #fff;
  border: 2rpx solid #e6e6e6;
  color: #1f1f1f;
}

.btn-primary {
  background: #2f6bff;
  border-color: #2f6bff;
  color: #fff;
}
</style>
