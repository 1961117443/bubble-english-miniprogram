/**
 * In-memory auth store (front-end placeholder).
 * NOTE: No persistence; backend should provide real session/token.
 */
const state = {
  isLoggedIn: false,
  parentId: null,
  token: null
}

export function getAuthState() {
  return state
}

export function setAuth(payload = {}) {
  state.isLoggedIn = !!payload.isLoggedIn
  state.parentId = payload.parentId || null
  state.token = payload.token || null
}

export function clearAuth() {
  setAuth({ isLoggedIn: false, parentId: null, token: null })
}

export function isLoggedIn() {
  return !!state.isLoggedIn
}
