import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const SESSION_COOKIE_NAME = 'account_session'
const MFA_COOKIE_NAME = 'account_mfa_token'

type AccountLoginResponse = {
  token?: string
  error?: string
  mfaToken?: string
  message?: string
}

async function authenticateWithAccountService(payload: Record<string, unknown>) {
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = (await response.json().catch(() => ({}))) as AccountLoginResponse
    return { response, data }
  } catch (error) {
    console.error('Login request failed', error)
    return { response: null, data: { error: 'request_failed' } }
  }
}

export async function POST(request: NextRequest) {
  const sensitiveKeys = ['username', 'password', 'token']
  const url = new URL(request.url)
  const hasSensitiveQuery = sensitiveKeys.some((key) => url.searchParams.has(key))

  if (hasSensitiveQuery) {
    sensitiveKeys.forEach((key) => url.searchParams.delete(key))

    if (prefersJson(request)) {
      return NextResponse.json({ error: 'credentials_in_query' }, { status: 400 })
    }

    url.pathname = '/login'
    url.searchParams.set('error', 'credentials_in_query')
    return NextResponse.redirect(url, { status: 303 })
  }

  const { credentials, remember } = await extractCredentials(request)

  if (!credentials.identifier) {
    return handleErrorResponse(request, 'missing_credentials')
  }

  const { response, data } = await authenticateWithAccountService(credentials)
  if (!response || !response.ok || !data?.token) {
    const message = typeof data?.error === 'string' ? data.error : 'invalid_credentials'
    const errorResponse = handleErrorResponse(request, message, data)
    if (message === 'mfa_setup_required' && typeof data?.mfaToken === 'string') {
      errorResponse.cookies.set({
        name: MFA_COOKIE_NAME,
        value: data.mfaToken,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10,
      })
    } else {
      errorResponse.cookies.set({ name: MFA_COOKIE_NAME, value: '', maxAge: 0, path: '/' })
    }
    return errorResponse
  }

  const cookieMaxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
  const wantsJSON = prefersJson(request)
  const successResponse = wantsJSON
    ? NextResponse.json({
        success: true,
        message: data?.message ?? 'login_success',
        redirectTo: '/',
      })
    : NextResponse.redirect(new URL('/', request.url), { status: 303 })

  successResponse.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: String(data.token),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: cookieMaxAge,
    path: '/',
  })
  successResponse.cookies.set({ name: MFA_COOKIE_NAME, value: '', maxAge: 0, path: '/' })

  return successResponse
}

function prefersJson(request: NextRequest) {
  const accept = request.headers.get('accept')?.toLowerCase() ?? ''
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  return accept.includes('application/json') || contentType.includes('application/json')
}

async function extractCredentials(request: NextRequest) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as Partial<CredentialPayload> & {
      remember?: boolean
    }
    return {
      credentials: {
        identifier: normalizeIdentifier(body),
        password: String(body?.password ?? ''),
        totpCode: String(body?.totpCode ?? '').trim(),
      },
      remember: Boolean(body?.remember),
    }
  }

  const formData = await request.formData()
  const identifier = normalizeIdentifier({
    identifier: formData.get('identifier'),
    username: formData.get('username'),
    email: formData.get('email'),
  })
  const password = String(formData.get('password') ?? '')
  const totpCode = String(formData.get('totpCode') ?? '').trim()
  const remember = formData.get('remember') === 'on'
  return {
    credentials: { identifier, password, totpCode },
    remember,
  }
}

function handleErrorResponse(
  request: NextRequest,
  errorCode: string,
  data?: AccountLoginResponse,
) {
  if (prefersJson(request)) {
    const statusMap: Record<string, number> = {
      user_not_found: 404,
      invalid_credentials: 401,
      missing_credentials: 400,
      credentials_in_query: 400,
      mfa_setup_required: 401,
      mfa_code_required: 400,
    }
    return NextResponse.json(
      {
        error: errorCode,
        mfaToken: data?.mfaToken,
      },
      { status: statusMap[errorCode] ?? 400 },
    )
  }

  const redirectURL = new URL('/login', request.url)
  redirectURL.searchParams.set('error', errorCode)
  return NextResponse.redirect(redirectURL, { status: 303 })
}

type CredentialPayload = {
  identifier?: string
  username?: string
  email?: string
  password?: string
  totpCode?: string
  remember?: boolean
}

function normalizeIdentifier(payload: Partial<CredentialPayload>) {
  const candidate =
    String(payload?.identifier ?? '').trim() ||
    String(payload?.username ?? '').trim() ||
    String(payload?.email ?? '').trim()
  return candidate
}
