'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type User = {
  id: string
  email: string
  name?: string
  username: string
}

type UserContextValue = {
  user: User | null
  login: (username?: string) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

async function getSessionUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as { user?: { id: string; email: string; name?: string } | null }
    if (!payload?.user) {
      return null
    }

    const { id, email, name } = payload.user
    const normalizedName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined
    return {
      id,
      email,
      name: normalizedName,
      username: normalizedName ?? email,
    }
  } catch (error) {
    console.warn('Failed to resolve user session', error)
    return null
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const refresh = useCallback(async () => {
    const currentUser = await getSessionUser()
    setUser(currentUser)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async () => {
    await refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('Failed to clear user session', error)
    }
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [login, logout, user],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
