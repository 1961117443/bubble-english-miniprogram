// api/learn-api.js
// ✅ 仅占位：后端接入后用来拉取课程内容/今日推荐等

import http from '@/common/request/http'

export function getCourseContent(courseId) {
  return http.request({
    url: '/course/content',
    method: 'GET',
    data: { courseId }
  })
}

export function getTodayLearnCourse() {
  return http.request({
    url: '/learn/today',
    method: 'GET'
  })
}
