
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { useUser } from '@lib/userStore'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const copy = translations[language].userCenter.mfa
  const { user, isLoading, logout } = useUser()

  const requiresSetup = Boolean(user && (!user.mfaEnabled || user.mfaPending))
  const isManagementRoute = pathname.startsWith('/panel/xray')

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user) {
      router.replace('/login')
      return
    }

    if (isManagementRoute && !(user.isAdmin || user.isOperator)) {
      router.replace('/panel')
    }
  }, [isLoading, isManagementRoute, router, user])

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
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-blue-50 text-gray-900">
      <Sidebar
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        onNavigate={() => setOpen(false)}
      />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onMenu={() => setOpen((prev) => !prev)} />
        <main className="flex flex-1 flex-col space-y-6 bg-white/60 px-3 py-5 sm:px-4 md:px-6 lg:px-8">
          {requiresSetup ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">{copy.pendingHint}</p>
              <p className="mt-1 text-sm">{copy.lockedMessage}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => router.replace('/panel/account?setupMfa=1')}
                  className="inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow transition hover:bg-purple-500"
                >
                  {copy.actions.setup}
                </button>
                <a
                  href={copy.actions.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-purple-200 px-3 py-1.5 text-sm font-medium text-purple-600 transition hover:border-purple-300 hover:bg-purple-50"
                >
                  {copy.actions.docs}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                >
                  {copy.actions.logout}
                </button>
                {isLoading ? (
                  <span className="inline-flex items-center rounded-md border border-amber-100 bg-amber-100 px-3 py-1.5 text-xs text-amber-700">
                    …
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="flex w-full flex-1 flex-col gap-5 md:gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
