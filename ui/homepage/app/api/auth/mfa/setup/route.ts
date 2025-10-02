import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { applyMfaCookie, MFA_COOKIE_NAME } from '@lib/authGateway'
import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()

type SetupPayload = {
  token?: string
  issuer?: string
  account?: string
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  let payload: SetupPayload
  try {
    payload = (await request.json()) as SetupPayload
  } catch (error) {
    console.error('Failed to decode MFA setup payload', error)
    return NextResponse.json({ success: false, error: 'invalid_request', needMfa: true }, { status: 400 })
  }

  const cookieToken = cookieStore.get(MFA_COOKIE_NAME)?.value ?? ''
  const token = normalizeString(payload?.token || cookieToken)

  if (!token) {
    return NextResponse.json({ success: false, error: 'mfa_token_required', needMfa: true }, { status: 400 })
  }

  const issuer = normalizeString(payload?.issuer)
  const account = normalizeString(payload?.account)

  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/account/mfa/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, issuer: issuer || undefined, account: account || undefined }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const errorCode = typeof (data as { error?: string })?.error === 'string' ? data.error : 'mfa_setup_failed'
      return NextResponse.json({ success: false, error: errorCode, needMfa: true }, { status: response.status || 400 })
    }

    const result = NextResponse.json({ success: true, error: null, needMfa: true, data })
    applyMfaCookie(result, token)
    return result
  } catch (error) {
    console.error('Account service MFA setup proxy failed', error)
    return NextResponse.json({ success: false, error: 'account_service_unreachable', needMfa: true }, { status: 502 })
  }
}

export function GET() {
  return NextResponse.json(
    { success: false, error: 'method_not_allowed', needMfa: true },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    },
  )
}
