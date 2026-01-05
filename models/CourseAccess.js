// models/CourseAccess.js
// 课程访问控制（仅前端占位）

/**
 * @typedef {'free'|'advanced'} CourseLevel
 * free：所有人可学（用于体验/引流）
 * advanced：会员解锁（会员仅解锁进阶，不解锁主题包）
 */

/**
 * @typedef {'zoo'|'farm'|'body'|'misc'} CourseTheme
 */

/**
 * @typedef {Object} CourseAccess
 * @property {CourseLevel} level
 * @property {CourseTheme} theme
 */

export function normalizeAccess(access) {
  const a = access || {}
  return {
    level: a.level === 'advanced' ? 'advanced' : 'free',
    theme: a.theme || 'misc'
  }
}
