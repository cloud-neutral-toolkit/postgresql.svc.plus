import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const SESSION_COOKIE_NAME = 'account_session'

async function authenticateWithAccountService(username: string, password: string) {
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
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

  if (!credentials.username || !credentials.password) {
    return handleErrorResponse(request, 'missing_credentials')
  }

  const { response, data } = await authenticateWithAccountService(
    credentials.username,
    credentials.password,
  )
  if (!response || !response.ok || !data?.token) {
    const message = typeof data?.error === 'string' ? data.error : 'invalid_credentials'
    return handleErrorResponse(request, message)
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

  return successResponse
}

type CredentialPayload = {
  username: string
  password: string
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
        username: String(body?.username ?? '').trim(),
        password: String(body?.password ?? ''),
      },
      remember: Boolean(body?.remember),
    }
  }

  const formData = await request.formData()
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const remember = formData.get('remember') === 'on'
  return {
    credentials: { username, password },
    remember,
  }
}

function handleErrorResponse(request: NextRequest, errorCode: string) {
  if (prefersJson(request)) {
    const statusMap: Record<string, number> = {
      user_not_found: 404,
      invalid_credentials: 401,
      missing_credentials: 400,
      credentials_in_query: 400,
    }
    return NextResponse.json(
      {
        error: errorCode,
      },
      { status: statusMap[errorCode] ?? 400 },
    )
  }

  const redirectURL = new URL('/login', request.url)
  redirectURL.searchParams.set('error', errorCode)
  return NextResponse.redirect(redirectURL, { status: 303 })
}
