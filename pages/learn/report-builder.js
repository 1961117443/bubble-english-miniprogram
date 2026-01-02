// pages/learn/report-builder.js
// 课程级 LearnReport 构建器（纯前端）
// v1：规则版 summary，不依赖后端，不依赖本地存储

function safeArr(v) {
  return Array.isArray(v) ? v : []
}

function getCourseWordIds(course) {
  const items = safeArr(course && course.flow && course.flow.items)
  if (items.length) return items.map(x => x.wordId)

  const words = safeArr(course && course.targets && course.targets.words)
  return words.map(w => w.id)
}

export function buildLearnReport({ course, reportId, startedAt, stepResults }) {
  const now = Date.now()
  const durationMs = Math.max(0, now - (startedAt || now))

  const wordIds = getCourseWordIds(course)
  const reward = (course && course.flow && course.flow.reward) || {}

  const summary = buildSummary({ course, stepResults, durationMs })

  return {
    version: 1,
    reportId,
    courseId: course && course.id,
    title: course && course.title,

    createdAt: now,
    startedAt: startedAt || now,
    durationMs,

    wordIds,
    reward,

    summary,

    // 原始过程数据（后续上报/分析用）
    stepResults: safeArr(stepResults)
  }
}

export function buildSummary({ course, stepResults, durationMs }) {
  const list = safeArr(stepResults)
  const words = safeArr(course && course.targets && course.targets.words)
  const wordMap = new Map(words.map(w => [w.id, w]))

  // 统计项（v1 先做最通用的：耗时、录音次数、跳过次数、关注词）
  const wordStats = {}
  let speakCount = 0
  let speakSkipped = 0

  list.forEach(r => {
    if (!r) return
    const wid = r.wordId
    if (wid) {
      if (!wordStats[wid]) wordStats[wid] = { wordId: wid, speak: 0, speakSkipped: 0, playWrong: 0, playCorrect: 0 }
    }

    if (r.stepType === 'speak') {
      speakCount++
      if (wid) wordStats[wid].speak++
      if (r.payload && r.payload.skipped) {
        speakSkipped++
        if (wid) wordStats[wid].speakSkipped++
      }
    }

    // PlayStep 若未来回传 isCorrect/tries，可自动统计
    if (r.stepType === 'play') {
      const isCorrect = r.payload && r.payload.isCorrect
      if (isCorrect === true) {
        if (wid) wordStats[wid].playCorrect++
      } else if (isCorrect === false) {
        if (wid) wordStats[wid].playWrong++
      }
    }
  })

  const focusWords = Object.values(wordStats)
    .sort((a, b) => (b.playWrong + b.speakSkipped) - (a.playWrong + a.speakSkipped))
    .slice(0, 3)
    .map(s => {
      const w = wordMap.get(s.wordId) || {}
      return {
        wordId: s.wordId,
        text: w.text || s.wordId,
        meaningCn: w.meaningCn || '',
        metrics: {
          playCorrect: s.playCorrect,
          playWrong: s.playWrong,
          speak: s.speak,
          speakSkipped: s.speakSkipped
        }
      }
    })

  return {
    durationSec: Math.max(1, Math.round((durationMs || 0) / 1000)),
    wordsCount: getCourseWordIds(course).length,
    speak: { count: speakCount, skipped: speakSkipped },
    focusWords
  }
}
