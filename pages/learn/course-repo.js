// pages/learn/course-repo.js
// 课程仓库（纯前端 v1）
// 后续对接后端：把这里改成请求/缓存即可，LearnPage 与列表页不动

import { getLearnMockCourse } from './mock'

// v1：先注册 3 门课程（都走同一套结构，便于你先跑通产品形态）
function courseAnimals() {
  return getLearnMockCourse()
}

function courseFarm() {
  const c = getLearnMockCourse()
  c.id = 'course-farm-01'
  c.title = '农场日常'
  // 换封面/图片（示例占位，你按真实资源替换）
  if (c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets) {
    c.targets.words[0].assets.image = '/static/banner/2.jpg'
  }
  // 改奖励示例
  if (c.flow) c.flow.reward = { stars: 2, coin: 8, stickerId: 'farm-01' }
  return c
}

function courseBody() {
  const c = getLearnMockCourse()
  c.id = 'course-body-01'
  c.title = '我的身体'
  if (c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets) {
    c.targets.words[0].assets.image = '/static/banner/3.jpg'
  }
  if (c.flow) c.flow.reward = { stars: 3, coin: 12, stickerId: 'body-01' }
  return c
}

const COURSE_REGISTRY = {
  'course-animals-01': courseAnimals,
  'course-farm-01': courseFarm,
  'course-body-01': courseBody
}

// 今日课程策略（v1：固定为动物朋友；后面可按日期轮换）
export function getTodayCourseId() {
  return 'course-animals-01'
}

export function getCourseById(courseId) {
  const id = courseId || getTodayCourseId()
  const factory = COURSE_REGISTRY[id]
  if (!factory) return COURSE_REGISTRY[getTodayCourseId()]()
  return factory()
}

export function getCourseTitle(courseId) {
  const c = getCourseById(courseId)
  return (c && c.title) ? c.title : '今日课程'
}

export function listCourses() {
  const ids = Object.keys(COURSE_REGISTRY)
  return ids.map(id => {
    const c = COURSE_REGISTRY[id]()
    const cover =
      (c && c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets && c.targets.words[0].assets.image) ||
      ''
    const wordsCount = (c && c.flow && c.flow.items && c.flow.items.length) ? c.flow.items.length :
      (c && c.targets && c.targets.words ? c.targets.words.length : 0)

    return {
      id: c.id,
      title: c.title,
      cover,
      wordsCount
    }
  })
}
