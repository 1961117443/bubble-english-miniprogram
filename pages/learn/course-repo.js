// pages/learn/course-repo.js

import { getLearnMockCourse } from './mock'

function courseAnimals() {
  return getLearnMockCourse()
}

function courseFarm() {
  const c = getLearnMockCourse()
  c.id = 'course-farm-01'
  c.title = '农场日常'
  if (c.flow) c.flow.reward = { stars: 2, coin: 8, stickerId: 'farm-01' }
  // 示例：换一张封面
  if (c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets) {
    c.targets.words[0].assets.image = '/static/banner/2.jpg'
  }
  return c
}

function courseBody() {
  const c = getLearnMockCourse()
  c.id = 'course-body-01'
  c.title = '我的身体'
  if (c.flow) c.flow.reward = { stars: 3, coin: 12, stickerId: 'body-01' }
  if (c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets) {
    c.targets.words[0].assets.image = '/static/banner/3.jpg'
  }
  return c
}

const COURSE_REGISTRY = {
  'course-animals-01': courseAnimals,
  'course-farm-01': courseFarm,
  'course-body-01': courseBody
}

export function getTodayCourseId() {
  return 'course-animals-01'
}

export function getCourseById(courseId) {
  const id = courseId || getTodayCourseId()
  const factory = COURSE_REGISTRY[id]
  if (!factory) return COURSE_REGISTRY[getTodayCourseId()]()
  return factory()
}

export function listCourses() {
  return Object.keys(COURSE_REGISTRY).map(id => {
    const c = COURSE_REGISTRY[id]()
    const meta = getCourseMeta(c.id)
    const outline = getCourseOutline(c.id)
    return {
      id: c.id,
      title: c.title,
      cover: meta.cover,
      subtitle: meta.subtitle,
      wordsCount: outline.wordsCount
    }
  })
}

export function getCourseTitle(courseId) {
  const c = getCourseById(courseId)
  return (c && c.title) ? c.title : '今日课程'
}

/** 课程展示信息（不影响学习引擎） */
export function getCourseMeta(courseId) {
  const c = getCourseById(courseId)
  const cover =
    (c && c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets && c.targets.words[0].assets.image) ||
    ''

  const subtitleMap = {
    'course-animals-01': '认识三种可爱的动物朋友',
    'course-farm-01': '在农场里学会常见单词',
    'course-body-01': '用英语说说身体部位'
  }

  return {
    cover,
    subtitle: subtitleMap[courseId] || '轻松完成一节小课'
  }
}

/** 课程大纲：给详情页展示用 */
export function getCourseOutline(courseId) {
  const c = getCourseById(courseId)
  const items = (c && c.flow && c.flow.items) || []
  const words = (c && c.targets && c.targets.words) || []
  const wordMap = new Map(words.map(w => [w.id, w]))

  const wordsPreview = items.slice(0, 6).map(it => {
    const w = wordMap.get(it.wordId) || {}
    return {
      id: it.wordId,
      text: w.text || it.wordId,
      meaningCn: w.meaningCn || '',
      cover: w.assets && w.assets.image
    }
  })

  // flowText：用默认模板描述（更“产品”）
  const def = (c && c.flow && c.flow.defaultStepTemplate) || ['listen', 'play', 'speak']
  const map = { listen: '听', play: '玩', speak: '说', reward: '奖励' }
  const flowText = def.map(x => map[x] || x).join(' → ') + ' → 奖励'

  return {
    wordsCount: items.length || words.length,
    flowText,
    wordsPreview
  }
}
