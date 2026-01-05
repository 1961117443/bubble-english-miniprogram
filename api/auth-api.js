/**
 * Auth API placeholder.
 * Only logs payload and throws, so front-end can wire flows now.
 */
export async function loginByWechat() {
  console.log('[AUTH TODO] loginByWechat')
  throw new Error('TODO backend: POST /api/auth/wechat')
}

export async function loginByPhone() {
  console.log('[AUTH TODO] loginByPhone')
  throw new Error('TODO backend: POST /api/auth/phone')
}

export async function logout() {
  console.log('[AUTH TODO] logout')
  // optional: POST /api/auth/logout
  return true
}
