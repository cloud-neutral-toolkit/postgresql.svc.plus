'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Navbar from '@components/Navbar'
import Footer from '@components/Footer'
import { AskAIButton } from '@components/AskAIButton'
import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { getAccountServiceBaseUrl } from '@lib/serviceConfig'

import { WeChatIcon } from '../components/icons/WeChatIcon'

type AlertState = { type: 'error' | 'success'; message: string }

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '').toLowerCase()
}

function ensureHttpsForSameHost(url: string): string {
  if (typeof window === 'undefined') {
    return url
  }

  try {
    const currentOrigin = window.location.origin
    const parsed = new URL(url, currentOrigin)

    if (
      window.location.protocol === 'https:' &&
      parsed.protocol === 'http:' &&
      parsed.hostname === window.location.hostname
    ) {
      parsed.protocol = 'https:'
      return parsed.toString()
    }

    return parsed.toString()
  } catch (error) {
    console.warn('Failed to normalize register URL, falling back to provided value', error)
    return url
  }
}

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

function preferSameOrigin(url: string): string {
  if (typeof window === 'undefined') {
    return url
  }

  try {
    const currentOrigin = window.location.origin
    const parsed = new URL(url, currentOrigin)

    const parsedHostname = parsed.hostname.toLowerCase()
    const browserHostname = window.location.hostname.toLowerCase()

    const parsedIsLocal = LOCAL_HOSTNAMES.has(parsedHostname)
    const browserIsLocal = LOCAL_HOSTNAMES.has(browserHostname)

    if (!browserIsLocal && parsedIsLocal) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/api/auth/register'
    }

    if (parsed.origin === currentOrigin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/api/auth/register'
    }

    return parsed.toString()
  } catch (error) {
    console.warn('Failed to prefer same-origin register URL, falling back to provided value', error)
    return url
  }
}

function coerceRegisterUrlOverride(rawValue: string | undefined | null, accountServiceBaseUrl: string): string {
  const fallbackUrl = `${accountServiceBaseUrl}/api/auth/register`
  if (!rawValue) {
    return preferSameOrigin(ensureHttpsForSameHost(fallbackUrl))
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return preferSameOrigin(ensureHttpsForSameHost(fallbackUrl))
  }

  const rewritePathname = (pathname: string) => {
    const normalized = normalizePathname(pathname)
    if (normalized === '/register' || normalized === 'register') {
      return '/api/auth/register'
    }
    return undefined
  }

  try {
    const parsed = new URL(trimmed)
    const rewritten = rewritePathname(parsed.pathname)
    if (rewritten) {
      parsed.pathname = rewritten
      return preferSameOrigin(ensureHttpsForSameHost(parsed.toString()))
    }
    return preferSameOrigin(ensureHttpsForSameHost(parsed.toString()))
  } catch (error) {
    try {
      const parsed = new URL(trimmed, 'http://localhost')
      const rewritten = rewritePathname(parsed.pathname)
      if (rewritten) {
        return preferSameOrigin(ensureHttpsForSameHost(`${rewritten}${parsed.search}${parsed.hash}`))
      }
    } catch (relativeError) {
      console.warn('Failed to parse register URL override', relativeError)
    }
    return preferSameOrigin(ensureHttpsForSameHost(trimmed))
  }
}

export default function RegisterContent() {
  const { language } = useLanguage()
  const t = translations[language].auth.register
  const alerts = t.alerts
  const searchParams = useSearchParams()
  const router = useRouter()

  const accountServiceBaseUrl = getAccountServiceBaseUrl()
  const githubAuthUrl = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL || '/api/auth/github'
  const wechatAuthUrl = process.env.NEXT_PUBLIC_WECHAT_AUTH_URL || '/api/auth/wechat'
  const registerUrl = coerceRegisterUrlOverride(process.env.NEXT_PUBLIC_REGISTER_URL, accountServiceBaseUrl)
  const isSocialAuthVisible = false

  const registerUrlRef = useRef(registerUrl)

  useEffect(() => {
    registerUrlRef.current = registerUrl
  }, [registerUrl])

  useEffect(() => {
    const sensitiveKeys = ['username', 'password', 'confirmPassword', 'email']
    const hasSensitiveParams = sensitiveKeys.some((key) => searchParams.has(key))

    if (!hasSensitiveParams) {
      return
    }

    const sanitized = new URLSearchParams(searchParams.toString())
    sensitiveKeys.forEach((key) => sanitized.delete(key))

    const queryString = sanitized.toString()
    router.replace(queryString ? `/register?${queryString}` : '/register', { scroll: false })
  }, [router, searchParams])

  const normalize = useCallback(
    (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
    [],
  )

  const initialAlert = useMemo<AlertState | null>(() => {
    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')

    if (successParam === '1') {
      return { type: 'success', message: alerts.success }
    }

    if (!errorParam) {
      return null
    }

    const normalizedError = normalize(errorParam)
    const errorMap: Record<string, string> = {
      missing_fields: alerts.missingFields,
      email_and_password_are_required: alerts.missingFields,
      password_mismatch: alerts.passwordMismatch,
      user_already_exists: alerts.userExists,
      email_must_be_a_valid_address: alerts.invalidEmail,
      password_must_be_at_least_8_characters: alerts.weakPassword,
      email_already_exists: alerts.userExists,
      name_already_exists: alerts.usernameExists ?? alerts.userExists,
      invalid_email: alerts.invalidEmail,
      password_too_short: alerts.weakPassword,
      invalid_name: alerts.invalidName ?? alerts.genericError,
      name_required: alerts.invalidName ?? alerts.genericError,
      credentials_in_query: alerts.genericError,
    }
    const message = errorMap[normalizedError] ?? alerts.genericError
    return { type: 'error', message }
  }, [alerts, normalize, searchParams])

  const [alert, setAlert] = useState<AlertState | null>(initialAlert)
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
      const name = String(formData.get('name') ?? '').trim()
      const email = String(formData.get('email') ?? '').trim()
      const password = String(formData.get('password') ?? '')
      const confirmPassword = String(formData.get('confirmPassword') ?? '')
      const agreementAccepted = formData.get('agreement') === 'on'

      if (!name || !email || !password || !confirmPassword) {
        setAlert({ type: 'error', message: alerts.missingFields })
        return
      }

      if (!agreementAccepted) {
        setAlert({ type: 'error', message: alerts.agreementRequired ?? alerts.missingFields })
        return
      }

      if (password !== confirmPassword) {
        setAlert({ type: 'error', message: alerts.passwordMismatch })
        return
      }

      if (password.length < 8) {
        setAlert({ type: 'error', message: alerts.weakPassword })
        return
      }

      setIsSubmitting(true)
      setAlert(null)

      try {
        const requestPayload = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        } as const

        let response: Response
        let usedUrl = registerUrlRef.current

        try {
          response = await fetch(usedUrl, requestPayload)
        } catch (primaryError) {
          const httpsPattern = /^https:/i
          if (httpsPattern.test(usedUrl)) {
            const insecureUrl = usedUrl.replace(httpsPattern, 'http:')

            try {
              response = await fetch(insecureUrl, requestPayload)
              registerUrlRef.current = insecureUrl
              usedUrl = insecureUrl
            } catch (fallbackError) {
              console.error('Primary register request failed, insecure fallback also failed', fallbackError)
              throw fallbackError
            }
          } else {
            throw primaryError
          }
        }

        if (!response.ok) {
          let errorCode = 'generic_error'
          try {
            const data = await response.json()
            if (typeof data?.error === 'string') {
              errorCode = data.error
            }
          } catch (error) {
            console.error('Failed to parse register response', error)
          }

          const errorMap: Record<string, string> = {
            invalid_request: alerts.genericError,
            missing_credentials: alerts.missingFields,
            invalid_email: alerts.invalidEmail,
            password_too_short: alerts.weakPassword,
            email_already_exists: alerts.userExists,
            name_already_exists: alerts.usernameExists ?? alerts.userExists,
            invalid_name: alerts.invalidName ?? alerts.genericError,
            name_required: alerts.invalidName ?? alerts.genericError,
            hash_failure: alerts.genericError,
            user_creation_failed: alerts.genericError,
            credentials_in_query: alerts.genericError,
          }

          setAlert({ type: 'error', message: errorMap[normalize(errorCode)] ?? alerts.genericError })
          setIsSubmitting(false)
          return
        }

        setAlert({ type: 'success', message: alerts.success })
        setIsSubmitting(false)
        router.push('/login?registered=1&setupMfa=1')
      } catch (error) {
        console.error('Failed to register user', error)
        setAlert({ type: 'error', message: alerts.genericError })
        setIsSubmitting(false)
      }
    },
    [alerts, isSubmitting, normalize, router],
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="grid gap-0 md:grid-cols-2">
            <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 p-10 text-white md:flex">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium uppercase tracking-wide">
                  {t.badge}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{t.title}</h1>
                  <p className="mt-3 text-lg text-white/80">{t.subtitle}</p>
                </div>
                {Array.isArray(t.highlights) && t.highlights.length > 0 ? (
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
                ) : null}
              </div>
              <div className="rounded-2xl bg-black/20 p-6">
                <p className="text-sm text-white/80">{t.bottomNote}</p>
              </div>
            </aside>
            <section className="flex flex-col justify-center gap-10 p-8 sm:p-10">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{t.form.title}</h2>
                <p className="text-sm text-gray-600">{t.form.subtitle}</p>
              </div>
              {t.uuidNote ? (
                <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/80 p-4 text-sm text-purple-700">
                  {t.uuidNote}
                </div>
              ) : null}
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
              <form className="space-y-6" method="post" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-sm font-medium text-gray-700">
                    {t.form.fullName}
                  </label>
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={t.form.fullNamePlaceholder}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t.form.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t.form.emailPlaceholder}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      {t.form.password}
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder={t.form.passwordPlaceholder}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                      {t.form.confirmPassword}
                    </label>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder={t.form.confirmPasswordPlaceholder}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                </div>
                <label className="flex items-start gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="agreement"
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>
                    {t.form.agreement}{' '}
                    <Link href="/docs" className="font-semibold text-purple-600 hover:text-purple-500">
                      {t.form.terms}
                    </Link>
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? t.form.submitting ?? t.form.submit : t.form.submit}
                </button>
              </form>
              <div className="space-y-4">
                {isSocialAuthVisible && (
                  <>
                    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-gray-400">
                      <span className="h-px flex-1 bg-gray-200" aria-hidden />
                      {t.social.title}
                      <span className="h-px flex-1 bg-gray-200" aria-hidden />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <a
                        href={githubAuthUrl}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <Github className="h-5 w-5" aria-hidden />
                        {t.social.github}
                      </a>
                      <a
                        href={wechatAuthUrl}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        <WeChatIcon className="h-5 w-5" aria-hidden />
                        {t.social.wechat}
                      </a>
                    </div>
                  </>
                )}
                <p className="text-sm text-gray-600">
                  {t.loginPrompt.text}{' '}
                  <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
                    {t.loginPrompt.link}
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <AskAIButton />
    </div>
  )
}
