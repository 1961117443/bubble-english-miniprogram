// services/access-control.js
// 课程访问控制（仅前端 UI 判断；权益来源以后端为准）

import { normalizeAccess } from '@/models/CourseAccess'

/**
 * @param {Object} course
 * @param {{isVip:boolean,themes:string[]}} ent
 */
export function checkCourseAccess(course, ent) {
  const access = normalizeAccess(course && course.access)
  const ret = {
    ok: true,
    reason: '',
    needVip: false,
    needTheme: ''
  }

  // 主题包：如果课程属于某主题，并且不是免费课程，则需要主题包
  if (access.theme && access.theme !== 'misc' && access.level !== 'free') {
    const owns = (ent && Array.isArray(ent.themes)) ? ent.themes : []
    if (!owns.includes(access.theme)) {
      ret.ok = false
      ret.reason = 'need_theme'
      ret.needTheme = access.theme
    }
  }

  // 会员：仅解锁进阶内容
  if (ret.ok && access.level === 'advanced') {
    if (!(ent && ent.isVip)) {
      ret.ok = false
      ret.reason = 'need_vip'
      ret.needVip = true
    }
  }

  // 同时需要（极少，但做兜底）
  if (!ret.ok && access.level === 'advanced' && !(ent && ent.isVip)) {
    if (ret.needTheme) {
      ret.reason = 'need_both'
      ret.needVip = true
    }
  }

  return ret
}

export function themeLabel(theme) {
  const map = {
    zoo: '动物主题',
    farm: '农场主题',
    body: '身体主题',
    misc: '主题'
  }
  return map[theme] || '主题'
}
