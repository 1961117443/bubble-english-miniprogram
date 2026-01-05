/**
 * Auth API placeholder.
 * Only logs payload and throws, so front-end can wire flows now.
 */
export async function loginByWechat() {
  console.log('[AUTH TODO] loginByWechat')
  throw new Error('TODO backend: POST /api/auth/wechat')
}

// Phone login (test-first). You can implement either password or SMS code later.
export async function requestSmsCode(phone) {
  console.log('[AUTH TODO] requestSmsCode', { phone })
  throw new Error('TODO backend: POST /api/auth/phone/sms')
}

export async function loginByPhonePassword(phone, password) {
  console.log('[AUTH TODO] loginByPhonePassword', { phone, password: String(password || '').replace(/./g, '*') })
  throw new Error('TODO backend: POST /api/auth/phone/password')
}

export async function loginByPhoneCode(phone, code) {
  console.log('[AUTH TODO] loginByPhoneCode', { phone, code })
  throw new Error('TODO backend: POST /api/auth/phone/code')
}

// Backward compatible placeholder
export async function loginByPhone() {
  console.log('[AUTH TODO] loginByPhone (deprecated)')
  throw new Error('TODO backend: POST /api/auth/phone')
}

export async function logout() {
  console.log('[AUTH TODO] logout')
  // optional: POST /api/auth/logout
  return true
}
