// services/api/child-api.js
// ✅ 仅占位：前端不实现后端逻辑

export const ChildApi = {
  async list() {
    console.log('[API TODO] ChildApi.list')
    throw new Error('TODO backend: ChildApi.list')
  },
  async create(payload) {
    console.log('[API TODO] ChildApi.create', payload)
    throw new Error('TODO backend: ChildApi.create')
  },
  async setCurrent(childId) {
    console.log('[API TODO] ChildApi.setCurrent', childId)
    throw new Error('TODO backend: ChildApi.setCurrent')
  }
}
