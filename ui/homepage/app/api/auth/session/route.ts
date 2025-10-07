import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { SESSION_COOKIE_NAME, clearSessionCookie } from '@lib/authGateway'
import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

const ACCOUNT_SERVICE_URL = getAccountServiceBaseUrl()
const ACCOUNT_API_BASE = `${ACCOUNT_SERVICE_URL}/api/auth`

type AccountUser = {
  id?: string
  uuid?: string
  name?: string
  username?: string
  email: string
  mfaEnabled?: boolean
  mfaPending?: boolean
  mfa?: {
    totpEnabled?: boolean
    totpPending?: boolean
    totpSecretIssuedAt?: string
    totpConfirmedAt?: string
    totpLockedUntil?: string
  }
  role?: string
  groups?: string[]
  permissions?: string[]
}

type SessionResponse = {
  user?: AccountUser | null
  error?: string
}

async function fetchSession(token: string) {
  try {
    const response = await fetch(`${ACCOUNT_API_BASE}/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    const data = (await response.json().catch(() => ({}))) as SessionResponse
    return { response, data }
  } catch (error) {
    console.error('Session lookup proxy failed', error)
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
    clearSessionCookie(res)
    return res
  }

  const rawUser = data.user as AccountUser
  const identifier =
    typeof rawUser.uuid === 'string' && rawUser.uuid.trim().length > 0
      ? rawUser.uuid.trim()
      : typeof rawUser.id === 'string'
        ? rawUser.id.trim()
        : undefined

  const rawMfa = rawUser.mfa ?? {}
  const derivedMfaEnabled = Boolean(rawUser.mfaEnabled ?? rawMfa.totpEnabled)
  const derivedMfaPendingSource =
    typeof rawUser.mfaPending === 'boolean'
      ? rawUser.mfaPending
      : typeof rawMfa.totpPending === 'boolean'
        ? rawMfa.totpPending
        : false
  const derivedMfaPending = derivedMfaPendingSource && !derivedMfaEnabled

  const normalizedRole =
    typeof rawUser.role === 'string' && rawUser.role.trim().length > 0
      ? rawUser.role.trim().toLowerCase()
      : 'user'
  const normalizedGroups = Array.isArray(rawUser.groups)
    ? rawUser.groups
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim())
    : []
  const normalizedPermissions = Array.isArray(rawUser.permissions)
    ? rawUser.permissions
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim())
    : []

  const normalizedMfa = Object.keys(rawMfa).length
    ? {
        ...rawMfa,
        totpEnabled: Boolean(rawMfa.totpEnabled ?? derivedMfaEnabled),
        totpPending: Boolean(rawMfa.totpPending ?? derivedMfaPending),
      }
    : {
        totpEnabled: derivedMfaEnabled,
        totpPending: derivedMfaPending,
      }

  const normalizedUser = identifier ? { ...rawUser, id: identifier, uuid: identifier } : rawUser

  return NextResponse.json({
    user: {
      ...normalizedUser,
      mfaEnabled: derivedMfaEnabled,
      mfaPending: derivedMfaPending,
      mfa: normalizedMfa,
      role: normalizedRole,
      groups: normalizedGroups,
      permissions: normalizedPermissions,
    },
  })
}

export async function DELETE(request: NextRequest) {
  void request
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    await fetch(`${ACCOUNT_API_BASE}/session`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }).catch(() => null)
  }

  const response = NextResponse.json({ success: true })
  clearSessionCookie(response)
  return response
}
