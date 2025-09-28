'use client'

import { LanguageProvider } from '@i18n/LanguageProvider'
import { UserProvider } from '@lib/userStore'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <UserProvider>{children}</UserProvider>
    </LanguageProvider>
  )
}
