import { SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler((event) => {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })

  return {
    success: true
  }
})
