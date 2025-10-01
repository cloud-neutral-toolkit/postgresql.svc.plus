import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const SESSION_COOKIE_NAME = 'account_session'

type AccountUser = {
  id?: string
  uuid?: string
  name?: string
  username?: string
  email: string
}

async function fetchSession(token: string) {
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    return { response, data }
  } catch (error) {
    console.error('Session lookup failed', error)
    return { response: null, data: null }
  }
}

export async function GET(request: NextRequest) {
  void request
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ user: null })
  }

  const { response, data } = await fetchSession(token)
  if (!response || !response.ok || !data?.user) {
    const res = NextResponse.json({ user: null })
    res.cookies.set({ name: SESSION_COOKIE_NAME, value: '', maxAge: 0, path: '/' })
    return res
  }

  const rawUser = data.user as AccountUser
  const identifier =
    typeof rawUser.uuid === 'string' && rawUser.uuid.trim().length > 0
      ? rawUser.uuid.trim()
      : typeof rawUser.id === 'string'
        ? rawUser.id.trim()
        : undefined

  const normalizedUser = identifier
    ? { ...rawUser, id: identifier, uuid: identifier }
    : rawUser

  return NextResponse.json({ user: normalizedUser })
}

export async function DELETE(request: NextRequest) {
  void request
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    await fetch(`${ACCOUNT_SERVICE_URL}/api/auth/session`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }).catch(() => null)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set({ name: SESSION_COOKIE_NAME, value: '', maxAge: 0, path: '/' })
  return response
}
