import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const SESSION_COOKIE_NAME = 'account_session'
const MFA_COOKIE_NAME = 'account_mfa_token'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? ''
  const storedMfaToken = cookieStore.get(MFA_COOKIE_NAME)?.value ?? ''

  const url = new URL(request.url)
  const queryToken = String(url.searchParams.get('token') ?? '').trim()
  const token = queryToken || storedMfaToken

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`
  }

  const endpoint = token
    ? `${ACCOUNT_SERVICE_URL}/api/auth/mfa/status?token=${encodeURIComponent(token)}`
    : `${ACCOUNT_SERVICE_URL}/api/auth/mfa/status`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))
  return NextResponse.json(payload, { status: response.status })
}
