import { NextRequest, NextResponse } from 'next/server'

const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:8080'
const SESSION_COOKIE_NAME = 'account_session'

async function authenticateWithAccountService(email: string, password: string) {
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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
  const formData = await request.formData()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const remember = formData.get('remember') === 'on'

  if (!email || !password) {
    const redirectURL = new URL('/login', request.url)
    redirectURL.searchParams.set('error', 'missing_credentials')
    return NextResponse.redirect(redirectURL, { status: 303 })
  }

  const { response, data } = await authenticateWithAccountService(email, password)
  if (!response || !response.ok || !data?.token) {
    const message = typeof data?.error === 'string' ? data.error : 'invalid_credentials'
    const redirectURL = new URL('/login', request.url)
    redirectURL.searchParams.set('error', message)
    return NextResponse.redirect(redirectURL, { status: 303 })
  }

  const redirectURL = new URL('/', request.url)
  const redirectResponse = NextResponse.redirect(redirectURL, { status: 303 })
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
  redirectResponse.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })

  return redirectResponse
}
