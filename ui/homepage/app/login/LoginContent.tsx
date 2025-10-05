'use client'

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Github } from 'lucide-react'

import Navbar from '@components/Navbar'
import Footer from '@components/Footer'
import { AskAIButton } from '@components/AskAIButton'
import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

import { WeChatIcon } from '../components/icons/WeChatIcon'

type LoginContentProps = {
  children?: ReactNode
}

export default function LoginContent({ children }: LoginContentProps) {
  const { language } = useLanguage()
  const t = translations[language].auth.login
  const alerts = t.alerts
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sensitiveKeys = ['username', 'password', 'email']
    const hasSensitiveParams = sensitiveKeys.some((key) => searchParams.has(key))

    if (!hasSensitiveParams) {
      return
    }

    const sanitized = new URLSearchParams(searchParams.toString())
    sensitiveKeys.forEach((key) => sanitized.delete(key))

    const queryString = sanitized.toString()
    router.replace(queryString ? `/login?${queryString}` : '/login', { scroll: false })
  }, [router, searchParams])

  const errorParam = searchParams.get('error')
  const registeredParam = searchParams.get('registered')
  const setupMfaParam = searchParams.get('setupMfa')

  const normalize = useCallback(
    (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
    [],
  )

  const accountServiceBaseUrl = getAccountServiceBaseUrl()
  const githubAuthUrl = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL || '/api/auth/github'
  const wechatAuthUrl = process.env.NEXT_PUBLIC_WECHAT_AUTH_URL || '/api/auth/wechat'
  const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || `${accountServiceBaseUrl}/api/auth/login`

  const loginUrlRef = useRef(loginUrl)

  useEffect(() => {
    loginUrlRef.current = loginUrl
  }, [loginUrl])

  const socialButtonsDisabled = true

  const initialAlert = useMemo(() => {
    const successMessages: string[] = []
    if (registeredParam === '1') {
      successMessages.push(alerts.registered)
    }
    if (setupMfaParam === '1') {
      const setupRequiredMessage = alerts.mfa?.setupRequired ?? alerts.genericError
      if (setupRequiredMessage) {
        successMessages.push(setupRequiredMessage)
      }
    }

    if (successMessages.length > 0) {
      return { type: 'success', message: successMessages.join(' ') } as const
    }

    if (!errorParam) {
      return null
    }

    const normalizedError = normalize(errorParam)
    const errorMap: Record<string, string> = {
      missing_credentials: alerts.missingCredentials,
      email_and_password_are_required: alerts.missingCredentials,
      invalid_credentials: alerts.invalidCredentials,
      user_not_found: alerts.userNotFound ?? alerts.genericError,
      credentials_in_query: alerts.genericError,
      invalid_request: alerts.genericError,

    }
    const message = errorMap[normalizedError] ?? alerts.genericError
    return { type: 'error', message } as const
  }, [alerts, errorParam, normalize, registeredParam, setupMfaParam])

  const [alert, setAlert] = useState(initialAlert)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setAlert(initialAlert)
  }, [initialAlert])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) {
        return
      }

      const formData = new FormData(event.currentTarget)
      const username = String(formData.get('username') ?? '').trim()
      const password = String(formData.get('password') ?? '')
      const remember = formData.get('remember') === 'on'

      if (!username || !password) {
        setAlert({ type: 'error', message: alerts.missingCredentials })
        return
      }

      setIsSubmitting(true)
      setAlert(null)

      try {
        const requestPayload = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            remember,
          }),
        } as const

        let response: Response
        let usedUrl = loginUrlRef.current

        try {
          response = await fetch(usedUrl, requestPayload)
        } catch (primaryError) {
          const httpsPattern = /^https:/i
          if (httpsPattern.test(usedUrl)) {
            const insecureUrl = usedUrl.replace(httpsPattern, 'http:')

            try {
              response = await fetch(insecureUrl, requestPayload)
              loginUrlRef.current = insecureUrl
              usedUrl = insecureUrl
            } catch (fallbackError) {
              console.error('Primary login request failed, insecure fallback also failed', fallbackError)
              throw fallbackError
            }
          } else {
            throw primaryError
          }
        }

        if (!response.ok) {
          let errorCode = 'invalid_credentials'
          try {
            const data = await response.json()
            if (typeof data?.error === 'string') {
              errorCode = data.error
            }
          } catch (error) {
            console.error('Failed to parse login response', error)
          }

          const errorMap: Record<string, string> = {
            invalid_credentials: alerts.invalidCredentials,
            missing_credentials: alerts.missingCredentials,
            user_not_found: alerts.userNotFound ?? alerts.genericError,
            invalid_request: alerts.genericError,
            credentials_in_query: alerts.genericError,
          }

          setAlert({ type: 'error', message: errorMap[normalize(errorCode)] ?? alerts.genericError })
          return
        }

        const data: { redirectTo?: string } = await response
          .json()
          .catch(() => ({}))
        router.push(data?.redirectTo || '/')
        router.refresh()
      } catch (error) {
        console.error('Failed to submit login request', error)
        setAlert({ type: 'error', message: alerts.genericError })
      } finally {
        setIsSubmitting(false)
      }
    },
    [alerts, isSubmitting, normalize, router],
  )

  const socialButtonClass = `flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 ${
    socialButtonsDisabled
      ? 'cursor-not-allowed opacity-50'
      : 'transition hover:border-gray-300 hover:bg-gray-50'
  }`

  const formContent = useMemo(() => {
    if (children) {
      return children
    }

    return (
      <form className="space-y-6" method="post" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="login-username" className="text-sm font-medium text-gray-700">
            {t.form.email}
          </label>
          <input
            id="login-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder={t.form.emailPlaceholder}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="login-password" className="font-medium text-gray-700">
              {t.form.password}
            </label>
            <Link href="#" className="font-medium text-purple-600 hover:text-purple-500">
              {t.forgotPassword}
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t.form.passwordPlaceholder}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            required
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          {t.form.remember}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.form.submitting ?? t.form.submit : t.form.submit}
        </button>
      </form>
    )
  }, [children, handleSubmit, isSubmitting, t])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
            <section className="flex flex-col justify-center gap-8 p-8 sm:p-10">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">{t.form.title}</h1>
                <p className="text-sm text-gray-600">{t.form.subtitle}</p>
              </div>
              {alert ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    alert.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {alert.message}
                </div>
              ) : null}
              {formContent}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-gray-400">
                  <span className="h-px flex-1 bg-gray-200" aria-hidden />
                  {t.social.title}
                  <span className="h-px flex-1 bg-gray-200" aria-hidden />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href={githubAuthUrl}
                    className={socialButtonClass}
                    aria-disabled={socialButtonsDisabled}
                    tabIndex={socialButtonsDisabled ? -1 : undefined}
                    onClick={
                      socialButtonsDisabled
                        ? (event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }
                        : undefined
                    }
                  >
                    <Github className="h-5 w-5" aria-hidden />
                    {t.social.github}
                  </a>
                  <a
                    href={wechatAuthUrl}
                    className={socialButtonClass}
                    aria-disabled={socialButtonsDisabled}
                    tabIndex={socialButtonsDisabled ? -1 : undefined}
                    onClick={
                      socialButtonsDisabled
                        ? (event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }
                        : undefined
                    }
                  >
                    <WeChatIcon className="h-5 w-5" aria-hidden />
                    {t.social.wechat}
                  </a>
                </div>
                <p className="text-sm text-gray-600">
                  {t.registerPrompt.text}{' '}
                  <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-500">
                    {t.registerPrompt.link}
                  </Link>
                </p>
              </div>
            </section>
            <aside className="hidden flex-col justify-between bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 p-10 text-white md:flex">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium uppercase tracking-wide">
                  {t.badge}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{t.title}</h2>
                  <p className="mt-3 text-lg text-white/80">{t.subtitle}</p>
                </div>
                <ul className="space-y-4">
                  {t.highlights.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-lime-300" aria-hidden />
                      <div>
                        <p className="text-base font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-white/75">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-black/20 p-6">
                <p className="text-sm text-white/80">{t.bottomNote}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <AskAIButton />
    </div>
  )
}
