
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { resolveAccess, type AccessRule } from '@lib/accessControl'
import { useUser } from '@lib/userStore'

type RouteGuard = {
  test: (pathname: string) => boolean
  redirect: {
    unauthenticated: string
    forbidden?: string
  }
  rule: AccessRule
}

const routeGuards: RouteGuard[] = [
  {
    test: (pathname) => pathname.startsWith('/panel/management'),
    redirect: {
      unauthenticated: '/login',
      forbidden: '/panel',
    },
    rule: { requireLogin: true, roles: ['admin', 'operator'] },
  },
  {
    test: (pathname) => pathname.startsWith('/panel'),
    redirect: {
      unauthenticated: '/login',
    },
    rule: { requireLogin: true },
  },
]

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const copy = translations[language].userCenter.mfa
  const { user, isLoading, logout } = useUser()
  const requiresSetup = Boolean(user && (!user.mfaEnabled || user.mfaPending))
  
  useEffect(() => {
    if (isLoading) {
      return
    }

    const guard = routeGuards.find((entry) => entry.test(pathname))
    if (!guard) {
      return
    }

    const decision = resolveAccess(user, guard.rule)
    if (!decision.allowed) {
      const destination =
        decision.reason === 'unauthenticated'
          ? guard.redirect.unauthenticated
          : guard.redirect.forbidden ?? guard.redirect.unauthenticated
      if (destination && destination !== pathname) {
        router.replace(destination)
      }
    }
  }, [isLoading, pathname, router, user])

  useEffect(() => {
    if (!requiresSetup || pathname.startsWith('/panel/account')) {
      return
    }
    router.replace('/panel/account?setupMfa=1')
  }, [pathname, requiresSetup, router])

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-[var(--gradient-app-from)] via-[var(--gradient-app-via)] to-[var(--gradient-app-to)] text-[var(--color-text)]">
      <Sidebar
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        onNavigate={() => setOpen(false)}
      />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-[var(--color-overlay)] backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onMenu={() => setOpen((prev) => !prev)} />
        <main className="flex flex-1 flex-col space-y-6 bg-[var(--color-surface-translucent)] px-3 py-5 text-[var(--color-text)] transition-colors sm:px-4 md:px-6 lg:px-8">
          {requiresSetup ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-warning-muted)] bg-[var(--color-warning-muted)] p-4 text-sm text-[var(--color-warning-foreground)] transition-colors">
              <p className="font-semibold">{copy.pendingHint}</p>
              <p className="mt-1 text-sm">{copy.lockedMessage}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => router.replace('/panel/account?setupMfa=1')}
                  className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-hover)]"
                >
                  {copy.actions.setup}
                </button>
                <a
                  href={copy.actions.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-[color:var(--color-primary-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[color:var(--color-primary)] hover:bg-[var(--color-primary-muted)]"
                >
                  {copy.actions.docs}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-[var(--color-warning-foreground)] transition-colors hover:bg-[var(--color-warning-muted)]"
                >
                  {copy.actions.logout}
                </button>
                {isLoading ? (
                  <span className="inline-flex items-center rounded-md border border-[color:var(--color-warning-muted)] bg-[var(--color-warning-muted)] px-3 py-1.5 text-xs text-[var(--color-warning-foreground)]">
                    …
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="flex w-full flex-1 flex-col gap-5 text-[var(--color-text)] transition-colors md:gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
