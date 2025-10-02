'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { useUser } from '@lib/userStore'

export function LoginForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const pageCopy = translations[language].login
  const authCopy = translations[language].auth.login
  const navCopy = translations[language].nav.account
  const { user, login } = useUser()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [loginMode, setLoginMode] = useState<'password_totp' | 'email_totp'>('password_totp')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedIdentifier = identifier.trim()
    if (!trimmedIdentifier) {
      setError(pageCopy.missingUsername)
      return
    }
    if (loginMode === 'password_totp' && !password) {
      setError(pageCopy.missingPassword)
      return
    }
    const sanitizedTotp = totpCode.replace(/\D/g, '')

    if (!sanitizedTotp) {
      setError(pageCopy.missingTotp ?? authCopy.alerts.mfa?.missing ?? authCopy.alerts.missingCredentials)
      return
    }

    if (sanitizedTotp.length !== 6) {
      setError(
        authCopy.alerts.mfa?.invalidFormat ??
          authCopy.alerts.mfa?.invalid ??
          pageCopy.missingTotp ??
          authCopy.alerts.missingCredentials,
      )
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: trimmedIdentifier,
          password: loginMode === 'password_totp' ? password : undefined,
          totp: sanitizedTotp,
          remember,
        }),
        credentials: 'include',
      })

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string | null
        needMfa?: boolean
      }

      if (payload.needMfa) {
        router.replace('/panel/account?setupMfa=1')
        router.refresh()
        return
      }

      if (!payload.success || !response.ok) {
        const messageKey = payload.error ?? 'generic_error'
        switch (messageKey) {
          case 'missing_credentials':
            setError(authCopy.alerts.missingCredentials)
            break
          case 'invalid_credentials':
            setError(pageCopy.invalidCredentials)
            break
          case 'user_not_found':
            setError(pageCopy.userNotFound)
            break
          case 'password_required':
            setError(authCopy.alerts.passwordRequired ?? pageCopy.missingPassword)
            break
          case 'mfa_code_required':
            setError(authCopy.alerts.mfa?.missing ?? pageCopy.missingTotp ?? authCopy.alerts.missingCredentials)
            break
          case 'invalid_mfa_code':
            setError(authCopy.alerts.mfa?.invalid ?? pageCopy.genericError)
            break
          case 'mfa_challenge_failed':
            setError(authCopy.alerts.mfa?.challengeFailed ?? pageCopy.genericError)
            break
          case 'account_service_unreachable':
            setError(pageCopy.serviceUnavailable ?? pageCopy.genericError)
            break
          default:
            setError(pageCopy.genericError)
            break
        }
        return
      }

      await login()
      router.replace('/')
      router.refresh()
    } catch (submitError) {
      console.warn('Login failed', submitError)
      setError(pageCopy.genericError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoHome = () => {
    router.replace('/')
    router.refresh()
  }

  const handleLogout = () => {
    router.push('/logout')
  }

  return (
    <>
      {user ? (
        <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/80 p-5 text-sm text-purple-700">
          <p className="text-base font-semibold">
            {pageCopy.success.replace('{username}', user.username)}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGoHome}
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {pageCopy.goHome}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 transition hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2"
            >
              {navCopy.logout}
            </button>
          </div>
        </div>
      ) : null}

      {!user ? (
        <form method="post" onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="login-identifier" className="text-sm font-medium text-gray-700">
              {authCopy.form.email}
            </label>
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={authCopy.form.emailPlaceholder}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">{authCopy.form.mfa.mode}</legend>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="login-mode"
                  value="password_totp"
                  checked={loginMode === 'password_totp'}
                  onChange={() => setLoginMode('password_totp')}
                />
                {authCopy.form.mfa.passwordAndTotp}
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="login-mode"
                  value="email_totp"
                  checked={loginMode === 'email_totp'}
                  onChange={() => setLoginMode('email_totp')}
                />
                {authCopy.form.mfa.emailAndTotp}
              </label>
            </div>
          </fieldset>
          {loginMode === 'password_totp' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="login-password" className="font-medium text-gray-700">
                  {authCopy.form.password}
                </label>
                <Link href="#" className="font-medium text-purple-600 hover:text-purple-500">
                  {authCopy.forgotPassword}
                </Link>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={authCopy.form.passwordPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="login-totp" className="text-sm font-medium text-gray-700">
              {authCopy.form.mfa.codeLabel}
            </label>
            <input
              id="login-totp"
              name="totpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={totpCode}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '').slice(0, 6)
                setTotpCode(digits)
              }}
              placeholder={authCopy.form.mfa.codePlaceholder}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            {authCopy.form.remember}
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? `${authCopy.form.submit}…` : authCopy.form.submit}
          </button>
          <p className="text-xs text-gray-500">* {pageCopy.disclaimer}</p>
        </form>
      ) : null}
    </>
  )
}
