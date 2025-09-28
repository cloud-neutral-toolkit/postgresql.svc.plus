'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type User = {
  username: string
}

type UserContextValue = {
  user: User | null
  login: (username: string) => void
  logout: () => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((username: string) => {
    setUser({ username })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

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
