import { isLoggedIn } from './auth-store'

/**
 * Guard helper: if not logged in, navigate to login with redirect.
 * @param {string} redirect - page path (e.g. '/pages/parent/index')
 * @returns {boolean} true if already logged in
 */
export function requireLogin(redirect) {
  if (isLoggedIn()) return true
  const url = '/pages/auth/login' + (redirect ? ('?redirect=' + encodeURIComponent(redirect)) : '')
  uni.navigateTo({ url })
  return false
}
