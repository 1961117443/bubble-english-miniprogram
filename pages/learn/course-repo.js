// pages/learn/course-repo.js
// 课程仓库（纯前端 v1）
// 后续对接后端：把这里改成请求/缓存即可，LearnPage 不动

import { getLearnMockCourse } from './mock'

// v1：先只注册一个课程
const COURSE_REGISTRY = {
  'course-animals-01': getLearnMockCourse
}

// 今日课程策略（v1：固定）
export function getTodayCourseId() {
  return 'course-animals-01'
}

export function getCourseTitle(courseId) {
  const course = getCourseById(courseId)
  return (course && course.title) ? course.title : '今日课程'
}

export function getCourseById(courseId) {
  const id = courseId || getTodayCourseId()
  const factory = COURSE_REGISTRY[id]
  if (!factory) {
    // 找不到就回退今日课程
    return COURSE_REGISTRY[getTodayCourseId()]()
  }
  return factory()
}

// 未来：可扩展课程列表
export function listCourses() {
  const ids = Object.keys(COURSE_REGISTRY)
  return ids.map(id => {
    const c = COURSE_REGISTRY[id]()
    return { id: c.id, title: c.title }
  })
}
