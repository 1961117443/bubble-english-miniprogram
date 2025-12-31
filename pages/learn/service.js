import http from '@/common/request/http'

export function getCourseContent(courseId) {
  return http.request({
    url: '/course/content',
    method: 'GET',
    data: {
      courseId: courseId
    }
  })
}

export function getTodayLearnCourse() {
  return http.request({
    url: '/learn/today',
    method: 'GET'
  })
}