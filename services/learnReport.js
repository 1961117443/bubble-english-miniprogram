import { ReportApi } from '@/api/report-api'

const PENDING_KEY = 'learn_pending_reports_v1'

function now() {
  return Date.now()
}

function safeGet(key, defVal) {
  try {
    const v = uni.getStorageSync(key)
    return v === undefined || v === null || v === '' ? defVal : v
  } catch (e) {
    return defVal
  }
}

function safeSet(key, val) {
  try { uni.setStorageSync(key, val) } catch (e) {}
}

function enqueueReport(report) {
  const list = safeGet(PENDING_KEY, [])
  list.push(report)
  safeSet(PENDING_KEY, list)
}

function dequeueReport(reportId) {
  const list = safeGet(PENDING_KEY, [])
  const next = list.filter(x => x && x.reportId !== reportId)
  safeSet(PENDING_KEY, next)
}

export function buildSummary(stepResults) {
  const s = {
    stars: 0,
    coin: 0,
    playCorrectCount: 0,
    playTotalCount: 0,
    speakCount: 0,
    listenReplayTotal: 0
  }

  ;(stepResults || []).forEach(r => {
    if (!r) return
    const t = r.stepType
    const p = r.payload || {}

    if (t === 'reward') {
      s.stars += Number(p.stars || 0)
      s.coin += Number(p.coin || 0)
    }
    if (t === 'play') {
      s.playTotalCount += 1
      if (p.correct) s.playCorrectCount += 1
    }
    if (t === 'speak') {
      if (p.recorded) s.speakCount += 1
    }
    if (t === 'listen') {
      s.listenReplayTotal += Number(p.replayCount || 0)
    }
  })

  return s
}

export async function submitLearnReport(report) {
  // ✅ 后续由后端实现；当前前端只占位
  try {
    const res = await ReportApi.submit(report)
    return { ok: true, res }
  } catch (err) {
    return { ok: false, err }
  }
}

/**
 * 尝试上报；失败则入队，成功则出队（幂等靠 reportId）
 */
export async function tryUploadOrQueue(report) {
  const result = await submitLearnReport(report)
  if (result.ok) {
    // 这里不强依赖后端 code=0，先认为 HTTP 成功即成功（v1）
    dequeueReport(report.reportId)
    return { uploaded: true, result }
  }

  enqueueReport(report)
  return { uploaded: false, result }
}

/**
 * 手动触发补发（可在应用启动/进入 learn 页时调用）
 */
export async function flushPendingReports() {
  const list = safeGet(PENDING_KEY, [])
  if (!Array.isArray(list) || list.length === 0) return { sent: 0, left: 0 }

  let sent = 0
  for (const r of list) {
    if (!r || !r.reportId) continue
    const ret = await submitLearnReport(r)
    if (ret.ok) {
      sent++
      dequeueReport(r.reportId)
    }
  }

  const left = safeGet(PENDING_KEY, []).length
  return { sent, left }
}

export function getPendingCount() {
  const list = safeGet(PENDING_KEY, [])
  return Array.isArray(list) ? list.length : 0
}
