// api/child-api.js
// ✅ 仅占位：前端不实现后端逻辑（后端接入后替换为真实请求）

export const ChildApi = {
  /**
   * 获取家长名下的孩子列表
   * @returns {Promise<Array<{id:string,name:string,birthYearMonth?:string,ageBand?:string,avatarId?:string}>>}
   */
  async list() {
    console.log('[API TODO] ChildApi.list')
    throw new Error('TODO backend: ChildApi.list')
  },

  /**
   * 创建孩子档案
   * @param {{name:string,birthYearMonth?:string,ageBand?:string,avatarId?:string}} payload
   */
  async create(payload) {
    console.log('[API TODO] ChildApi.create', payload)
    throw new Error('TODO backend: ChildApi.create')
  },

  /**
   * 设置当前孩子（用于记住上次使用的孩子）
   * @param {string} childId
   */
  async setCurrent(childId) {
    console.log('[API TODO] ChildApi.setCurrent', childId)
    throw new Error('TODO backend: ChildApi.setCurrent')
  }
}
