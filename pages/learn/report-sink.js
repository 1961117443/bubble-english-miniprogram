// pages/learn/report-sink.js
// LearnReport 提交出口（占位）
// v1：不写本地存储、不请求后端，只 console。
// 后续接后端时，只改这里，不动学习引擎。

export const reportSink = {
  submit(report) {
    // ✅ 这里未来替换为：uni.request(...) 上报到后端
    console.log('[LearnReport submit]', report)

    // 返回 Promise，便于未来统一处理“提交成功/失败”
    return Promise.resolve({ ok: true })
  }
}
