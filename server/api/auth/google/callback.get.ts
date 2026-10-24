import { UserModel } from '../../../models/User'
import {
  getSessionUser,
  isAllowedEmail,
  normalizeAllowedDomains,
  setSessionUser
} from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const query = getQuery(event)
  const error = query.error ? String(query.error) : ''

  if (error) {
    return sendRedirect(event, '/login?error=google-oauth-error')
  }

  const code = query.code ? String(query.code) : ''
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing OAuth code.'
    })
  }

  const clientId = runtimeConfig.google?.clientId
  const clientSecret = runtimeConfig.google?.clientSecret
  const redirectUri = new URL('/api/auth/google/callback', getRequestURL(event)).toString()

  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google OAuth credentials are not configured.'
    })
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString()
  })

  const tokenData = await tokenResponse.json().catch(() => ({}))
  if (!tokenResponse.ok || !tokenData.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unable to exchange Google OAuth authorization code.'
    })
  }

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  })

  const googleUser = await userInfoResponse.json().catch(() => ({}))
  const emailAddress = String(googleUser.email || '').trim().toLowerCase()

  if (!emailAddress) {
    return sendRedirect(event, '/login?error=missing-email')
  }

  const allowedDomains = normalizeAllowedDomains(runtimeConfig.google?.allowedDomains || 'school.edu.ph')
  if (!isAllowedEmail(emailAddress, allowedDomains.join(','))) {
    return sendRedirect(event, '/login?error=domain-not-allowed')
  }

  const existingUser = await UserModel.findOne({ emailAddress })
  const firstName = String(googleUser.given_name || '').trim() || 'Google'
  const lastName = String(googleUser.family_name || '').trim() || 'User'

  const mappedUser = existingUser || new UserModel({
    emailAddress,
    firstName,
    lastName
  })

  mappedUser.emailAddress = emailAddress
  mappedUser.firstName = firstName
  mappedUser.lastName = lastName
  mappedUser.googleId = String(googleUser.sub || mappedUser.googleId || '')
  mappedUser.avatarUrl = String(googleUser.picture || mappedUser.avatarUrl || '')

  await mappedUser.save()

  setSessionUser(event, {
    emailAddress,
    firstName,
    lastName,
    googleId: String(googleUser.sub || ''),
    avatarUrl: String(googleUser.picture || '')
  })

  return sendRedirect(event, '/')
})
