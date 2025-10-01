import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()

type RegistrationBody = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

async function registerWithAccountService(body: Record<string, string>) {
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/register`, {
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
  let fields: RegistrationBody
  try {
    fields = await extractRegistrationFields(request)
  } catch (error) {
    console.error('Failed to parse registration payload', error)
    const redirectURL = new URL('/register', request.url)
    redirectURL.searchParams.set('error', 'invalid_request_payload')
    return NextResponse.redirect(redirectURL, { status: 303 })
  }

  const name = fields.name.trim()
  const email = fields.email.trim().toLowerCase()
  const password = fields.password
  const confirmPassword = fields.confirmPassword

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

function ensureString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function extractRegistrationFields(request: NextRequest): Promise<RegistrationBody> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.includes('application/json')) {
    const body = await request.json().catch((error) => {
      console.error('Failed to decode JSON body', error)
      throw error
    })
    return {
      name: ensureString(body?.name ?? ''),
      email: ensureString(body?.email ?? ''),
      password: ensureString(body?.password ?? ''),
      confirmPassword: ensureString(body?.confirmPassword ?? body?.password ?? ''),
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    const params = new URLSearchParams(text)
    return {
      name: ensureString(params.get('name')),
      email: ensureString(params.get('email')),
      password: ensureString(params.get('password')),
      confirmPassword: ensureString(params.get('confirmPassword')),
    }
  }

  const formData = await request.formData()
  const read = (key: string) => ensureString(formData.get(key))
  return {
    name: read('name'),
    email: read('email'),
    password: read('password'),
    confirmPassword: read('confirmPassword'),
  }
}

export function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed' },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    },
  )
}
