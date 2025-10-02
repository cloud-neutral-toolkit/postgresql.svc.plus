import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const MFA_COOKIE_NAME = 'account_mfa_token'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const currentToken = cookieStore.get(MFA_COOKIE_NAME)?.value ?? ''
  const body = (await request.json().catch(() => ({}))) as {
    token?: string
    issuer?: string
    account?: string
  }

  const token = String(body?.token ?? currentToken ?? '').trim()
  if (!token) {
    return NextResponse.json({ error: 'mfa_token_required' }, { status: 400 })
  }

  const response = await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/mfa/totp/provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, issuer: body?.issuer, account: body?.account }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status })
  }

  const res = NextResponse.json(payload)
  if (!currentToken || currentToken !== token) {
    res.cookies.set({
      name: MFA_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    })
  }

  return res
}
