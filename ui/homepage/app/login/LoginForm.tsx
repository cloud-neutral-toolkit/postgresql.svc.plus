'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { useUser } from '@lib/userStore'

export function LoginForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const copy = translations[language].login
  const authCopy = translations[language].auth.login
  const { user, login, logout } = useUser()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim()) {
      setError(copy.missingUsername)
      return
    }
    if (!password) {
      setError(copy.missingPassword)
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        const messageKey = payload.error ?? 'generic_error'
        switch (messageKey) {
          case 'missing_credentials':
            setError(authCopy.alerts.missingCredentials)
            break
          case 'invalid_credentials':
            setError(copy.invalidCredentials)
            break
          case 'user_not_found':
            setError(copy.userNotFound)
            break
          default:
            setError(copy.genericError)
            break
        }
        return
      }

      setSuccess(copy.success.replace('{username}', username.trim()))
      await login(username.trim())
      redirectTimer.current = setTimeout(() => {
        router.push('/')
      }, 800)
    } catch (submitError) {
      console.warn('Login failed', submitError)
      setError(copy.genericError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 px-6 py-16 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">{copy.title}</h1>
          <p className="mt-4 text-lg text-gray-600 md:text-xl">{copy.description}</p>
          {user ? (
            <div className="mt-6 space-y-4 rounded-2xl border border-purple-200 bg-white/70 p-6 shadow-sm backdrop-blur">
              <p className="text-lg font-semibold text-purple-700">
                {copy.success.replace('{username}', user.username)}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                >
                  {copy.goHome}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 transition hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2"
                >
                  {translations[language].nav.account.logout}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="md:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-lg backdrop-blur"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  {copy.usernameLabel}
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="cloudnative"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {copy.passwordLabel}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {isSubmitting ? `${copy.submit}…` : copy.submit}
            </button>

            <p className="mt-4 text-xs text-gray-500">* {copy.disclaimer}</p>
          </form>
          {success ? <p className="mt-4 text-sm text-emerald-600">{success}</p> : null}
        </div>
      </div>
    </div>
  )
}
