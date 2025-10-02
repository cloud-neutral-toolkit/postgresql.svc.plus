import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import {
  applyMfaCookie,
  applySessionCookie,
  clearMfaCookie,
  clearSessionCookie,
  deriveMaxAgeFromExpires,
  MFA_COOKIE_NAME,
} from '@lib/authGateway'
import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()

type VerifyPayload = {
  token?: string
  code?: string
  totp?: string
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeCode(value: unknown) {
  return typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 6) : ''
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  let payload: VerifyPayload
  try {
    payload = (await request.json()) as VerifyPayload
  } catch (error) {
    console.error('Failed to decode MFA verification payload', error)
    return NextResponse.json({ success: false, error: 'invalid_request', needMfa: true }, { status: 400 })
  }

  const cookieToken = cookieStore.get(MFA_COOKIE_NAME)?.value ?? ''
  const token = normalizeString(payload?.token || cookieToken)
  const code = normalizeCode(payload?.code ?? payload?.totp)

  if (!token) {
    return NextResponse.json({ success: false, error: 'mfa_token_required', needMfa: true }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'mfa_code_required', needMfa: true }, { status: 400 })
  }

  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/account/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, code }),
      cache: 'no-store',
    })

    const data = (await response.json().catch(() => ({}))) as { token?: string; expiresAt?: string; mfaToken?: string; error?: string }

    if (response.ok && typeof data?.token === 'string' && data.token.length > 0) {
      const result = NextResponse.json({ success: true, error: null, needMfa: false })
      applySessionCookie(result, data.token, deriveMaxAgeFromExpires(data?.expiresAt))
      clearMfaCookie(result)
      return result
    }

    const errorCode = typeof data?.error === 'string' ? data.error : 'mfa_verification_failed'
    const result = NextResponse.json({ success: false, error: errorCode, needMfa: true }, { status: response.status || 400 })

    if (typeof data?.mfaToken === 'string' && data.mfaToken.trim()) {
      applyMfaCookie(result, data.mfaToken)
    } else {
      applyMfaCookie(result, token)
    }

    clearSessionCookie(result)
    return result
  } catch (error) {
    console.error('Account service MFA verification proxy failed', error)
    const result = NextResponse.json({ success: false, error: 'account_service_unreachable', needMfa: true }, { status: 502 })
    applyMfaCookie(result, token)
    clearSessionCookie(result)
    return result
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
