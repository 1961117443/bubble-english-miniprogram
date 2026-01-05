// models/ChildProfile.js
// 孩子档案模型（仅前端占位；数据来自后端，不做本地存储）

/**
 * @typedef {'3-4'|'5-6'|'7-8'} AgeBand
 */

/**
 * @typedef {Object} ChildProfile
 * @property {string} id
 * @property {string} name
 * @property {string} birthYearMonth - 出生年月，例如 '2022-08'（推荐，比生日更轻、更隐私）
 * @property {AgeBand} ageBand - 运行时计算（前端可本地算用于展示，但最终以后端为准）
 * @property {string} avatar - 头像资源 id 或 url（可选）
 */

export function calcAgeBandByBirthYearMonth(bym, nowDate = new Date()) {
  if (!bym) return '5-6'
  const [y, m] = String(bym).split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m)) return '5-6'

  const nowY = nowDate.getFullYear()
  const nowM = nowDate.getMonth() + 1
  let age = nowY - y
  if (nowM < m) age -= 1

  if (age <= 4) return '3-4'
  if (age <= 6) return '5-6'
  return '7-8'
}
