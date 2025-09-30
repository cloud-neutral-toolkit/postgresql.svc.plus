import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()

async function registerWithAccountService(body: Record<string, string>) {
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    return { response, data }
  } catch (error) {
    console.error('Registration request failed', error)
    return { response: null, data: { error: 'registration_failed' } }
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!email || !password) {
    const redirectURL = new URL('/register', request.url)
    redirectURL.searchParams.set('error', 'missing_fields')
    return NextResponse.redirect(redirectURL, { status: 303 })
  }

  if (password !== confirmPassword) {
    const redirectURL = new URL('/register', request.url)
    redirectURL.searchParams.set('error', 'password_mismatch')
    return NextResponse.redirect(redirectURL, { status: 303 })
  }

  const { response, data } = await registerWithAccountService({ name, email, password })
  if (!response || !response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'registration_failed'
    const redirectURL = new URL('/register', request.url)
    redirectURL.searchParams.set('error', message)
    return NextResponse.redirect(redirectURL, { status: 303 })
  }

  const redirectURL = new URL('/login', request.url)
  redirectURL.searchParams.set('registered', '1')
  return NextResponse.redirect(redirectURL, { status: 303 })
}
