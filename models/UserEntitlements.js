// models/UserEntitlements.js
// 用户权益模型（仅前端占位，不实现后端逻辑）

/**
 * @typedef {Object} UserEntitlements
 * @property {boolean} isVip - 会员是否生效（会员仅解锁“进阶内容/服务能力”，不自动解锁主题包）
 * @property {string[]} themes - 已购买主题包，例如 ['zoo','farm']
 */

export function defaultEntitlements() {
  return {
    isVip: false,
    themes: []
  }
}
