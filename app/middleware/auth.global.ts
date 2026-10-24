import { getCookie } from 'h3'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/api') || to.path === '/login') {
    return
  }

  const event = useRequestEvent()
  const requestCookie = event ? getCookie(event, 'gco_session') : null

  if (requestCookie) {
    return
  }

  if (import.meta.client) {
    try {
      await $fetch('/api/auth/session')
      return
    } catch {
      // fall through to login redirect below
    }
  }

  return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
