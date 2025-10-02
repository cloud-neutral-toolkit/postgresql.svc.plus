import { NextResponse } from 'next/server'

export const SESSION_COOKIE_NAME = 'xc_session'
export const MFA_COOKIE_NAME = 'xc_mfa_challenge'

const SESSION_DEFAULT_MAX_AGE = 60 * 60 * 24 // 24 hours
const MFA_DEFAULT_MAX_AGE = 60 * 10 // 10 minutes

const secureCookieBase = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
}

export function applySessionCookie(response: NextResponse, token: string, maxAge?: number) {
  const resolvedMaxAge = Number.isFinite(maxAge) && maxAge && maxAge > 0 ? Math.floor(maxAge) : SESSION_DEFAULT_MAX_AGE
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    ...secureCookieBase,
    maxAge: resolvedMaxAge,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    ...secureCookieBase,
    maxAge: 0,
  })
}

export function applyMfaCookie(response: NextResponse, token: string, maxAge?: number) {
  const resolvedMaxAge = Number.isFinite(maxAge) && maxAge && maxAge > 0 ? Math.floor(maxAge) : MFA_DEFAULT_MAX_AGE
  response.cookies.set({
    name: MFA_COOKIE_NAME,
    value: token,
    ...secureCookieBase,
    maxAge: resolvedMaxAge,
  })
}

export function clearMfaCookie(response: NextResponse) {
  response.cookies.set({
    name: MFA_COOKIE_NAME,
    value: '',
    ...secureCookieBase,
    maxAge: 0,
  })
}

export function deriveMaxAgeFromExpires(expiresAt?: string | number | Date | null, fallback = SESSION_DEFAULT_MAX_AGE) {
  if (!expiresAt) {
    return fallback
  }

  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
  const msUntilExpiry = date.getTime() - Date.now()
  if (!Number.isFinite(msUntilExpiry) || msUntilExpiry <= 0) {
    return fallback
  }
  return Math.floor(msUntilExpiry / 1000)
}
