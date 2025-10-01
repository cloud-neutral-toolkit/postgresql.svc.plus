'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import useSWR from 'swr'
import { create } from 'zustand'

type User = {
  id: string
  email: string
  name?: string
  username: string
}

type UserContextValue = {
  user: User | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

type UserStore = {
  user: User | null
  setUser: (user: User | null) => void
}

const sessionStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

const UserContext = createContext<UserContextValue | undefined>(undefined)

const SESSION_CACHE_KEY = 'account_session'

async function fetchSessionUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as {
      user?: { id: string; email: string; name?: string; username?: string } | null
    }

    const sessionUser = payload?.user
    if (!sessionUser) {
      return null
    }

    const { id, email, name, username } = sessionUser
    const normalizedName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined
    const normalizedUsername =
      typeof username === 'string' && username.trim().length > 0 ? username.trim() : normalizedName

    return {
      id,
      email,
      name: normalizedName,
      username: normalizedUsername ?? email,
    }
  } catch (error) {
    console.warn('Failed to resolve user session', error)
    return null
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const user = sessionStore((state) => state.user)
  const setUser = sessionStore((state) => state.setUser)

  const {
    data,
    isLoading,
    mutate,
  } = useSWR<User | null>(SESSION_CACHE_KEY, fetchSessionUser, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
    shouldRetryOnError: true,
  })

  useEffect(() => {
    if (data === undefined) {
      return
    }
    setUser(data)
  }, [data, setUser])

  const refresh = useCallback(async () => {
    const nextUser = await mutate()
    setUser(nextUser ?? null)
  }, [mutate, setUser])

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
      isLoading,
      login,
      logout,
      refresh,
    }),
    [user, isLoading, login, logout, refresh],
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
