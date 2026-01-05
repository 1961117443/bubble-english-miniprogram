// services/entitlement-store.js
// 权益运行时存储（仅前端占位）
// ✅ 不做持久化；后端接入后应以接口返回为准

import { defaultEntitlements } from '@/models/UserEntitlements'

let _ent = defaultEntitlements()

export const entitlementStore = {
  get() {
    return _ent
  },
  set(patch) {
    _ent = { ..._ent, ...(patch || {}) }
    return _ent
  },
  reset() {
    _ent = defaultEntitlements()
    return _ent
  }
}
