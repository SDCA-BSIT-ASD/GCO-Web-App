export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const clientId = runtimeConfig.google?.clientId

  if (!clientId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google OAuth client ID is not configured.'
    })
  }

  const redirectUri = new URL('/api/auth/google/callback', getRequestURL(event)).toString()
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')

  googleAuthUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  }).toString()

  return sendRedirect(event, googleAuthUrl.toString())
})
