import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const SESSION_COOKIE_NAME = 'account_session'
const MFA_COOKIE_NAME = 'account_mfa_token'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const currentToken = cookieStore.get(MFA_COOKIE_NAME)?.value ?? ''
  const body = (await request.json().catch(() => ({}))) as {
    token?: string
    code?: string
  }

  const token = String(body?.token ?? currentToken ?? '').trim()
  const code = String(body?.code ?? '').trim()

  if (!token) {
    return NextResponse.json({ error: 'mfa_token_required' }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ error: 'mfa_code_required' }, { status: 400 })
  }

  const response = await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/mfa/totp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, code }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.token) {
    return NextResponse.json(payload, { status: response.status })
  }

  const res = NextResponse.json(payload)
  const expiresAt = typeof payload?.expiresAt === 'string' ? Date.parse(payload.expiresAt) : NaN
  const ttl = Number.isFinite(expiresAt)
    ? Math.max(60, Math.floor((expiresAt - Date.now()) / 1000))
    : 60 * 60 * 24

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: String(payload.token),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttl,
  })
  res.cookies.set({ name: MFA_COOKIE_NAME, value: '', maxAge: 0, path: '/' })

  return res
}
