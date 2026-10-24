import crypto from 'node:crypto'
import { getCookie, setCookie } from 'h3'

export const SESSION_COOKIE = 'gco_session'

function readRuntimeConfig() {
  if (typeof useRuntimeConfig === 'function') {
    try {
      return useRuntimeConfig()
    } catch {
      return {}
    }
  }

  return {}
}

export function normalizeAllowedDomains(rawDomains = '') {
  return [...new Set(
    String(rawDomains)
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean)
  )]
}

export function isAllowedEmail(email, rawDomains = '') {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return false
  }

  const runtimeConfig = readRuntimeConfig()
  const resolvedDomains = rawDomains || runtimeConfig.google?.allowedDomains || process.env.NUXT_ALLOWED_EMAIL_DOMAINS || 'school.edu.ph'
  const allowedDomains = normalizeAllowedDomains(resolvedDomains)

  if (allowedDomains.length === 0) {
    return false
  }

  const domain = normalizedEmail.split('@')[1]

  return allowedDomains.some((allowedDomain) => {
    return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  })
}

export function getSessionSecret() {
  const runtimeConfig = readRuntimeConfig()
  return process.env.NUXT_SESSION_SECRET || runtimeConfig.sessionSecret || 'gco-dev-session-secret'
}

export function encodeSessionValue(payload) {
  const raw = JSON.stringify(payload)
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(raw)
    .digest('hex')

  return `${Buffer.from(raw).toString('base64url')}.${signature}`
}

export function decodeSessionValue(value) {
  if (!value || typeof value !== 'string') {
    return null
  }

  const [encoded, signature] = value.split('.')
  if (!encoded || !signature) {
    return null
  }

  const raw = Buffer.from(encoded, 'base64url').toString('utf8')
  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(raw)
    .digest('hex')

  if (expectedSignature !== signature) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSessionUser(event, user) {
  setCookie(event, SESSION_COOKIE, encodeSessionValue(user), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7
  })
}

export function getSessionUser(event) {
  const value = getCookie(event, SESSION_COOKIE)
  if (!value) {
    return null
  }

  return decodeSessionValue(value)
}
