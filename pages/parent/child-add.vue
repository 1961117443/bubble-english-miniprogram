<template>
  <view class="page">
    <view class="hd">
      <text class="title">添加孩子档案</text>
      <text class="sub">占位：后端接入后保存。当前只 console.log。</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">昵称</text>
        <input class="input" v-model="form.name" placeholder="例如：小宝" />
      </view>

      <view class="field">
        <text class="label">出生年月</text>
        <picker mode="date" fields="month" :value="form.birthYearMonth" @change="onPickMonth">
          <view class="picker">{{ form.birthYearMonth || '请选择出生年月' }}</view>
        </picker>
        <text class="hint">用于动态计算年龄段（3–4 / 5–6 / 7–8）</text>
      </view>
    </view>

    <view class="footer">
      <button class="btn" @click="save">保存（占位）</button>
      <button class="btn btn-ghost" @click="back">返回</button>
    </view>
  </view>
</template>

<script>
import { ChildApi } from '@/api/child-api'
import { calcAgeBandByBirthYearMonth } from '@/models/ChildProfile'

export default {
  name: 'ChildAdd',
  data() {
    return {
      form: {
        name: '',
        birthYearMonth: ''
      }
    }
  },
  methods: {
    onPickMonth(e) {
      this.form.birthYearMonth = (e && e.detail && e.detail.value) || ''
    },
    async save() {
      const name = String(this.form.name || '').trim()
      if (!name) {
        uni.showToast({ title: '请填写昵称', icon: 'none' })
        return
      }
      if (!this.form.birthYearMonth) {
        uni.showToast({ title: '请选择出生年月', icon: 'none' })
        return
      }

      const ageBand = calcAgeBandByBirthYearMonth(this.form.birthYearMonth)
      const payload = { name, birthYearMonth: this.form.birthYearMonth, ageBand }
      console.log('[Child create payload]', payload)

      try {
        await ChildApi.create(payload)
      } catch (e) {
        uni.showToast({ title: '占位：后端未接入', icon: 'none' })
      }

      uni.navigateBack()
    },
    back() {
      uni.navigateBack()
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
}

.field {
  margin-bottom: 18rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #1f1f1f;
  font-weight: 800;
  margin-bottom: 10rpx;
}

.input {
  height: 88rpx;
  border-radius: 18rpx;
  background: #f7f8fa;
  padding: 0 18rpx;
  font-size: 28rpx;
}

.picker {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 18rpx;
  background: #f7f8fa;
  padding: 0 18rpx;
  font-size: 28rpx;
  color: #1f1f1f;
}

.hint {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #888;
}

.footer {
  margin-top: 18rpx;
  display: grid;
  gap: 12rpx;
}

.btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  font-weight: 900;
  background: #2f6bff;
  color: #fff;
}

.btn-ghost {
  background: #fff;
  border: 2rpx solid #e6e6e6;
  color: #1f1f1f;
}
</style>
