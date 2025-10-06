'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Card from '../components/Card'
import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { useUser } from '@lib/userStore'

type TotpStatus = {
  totpEnabled?: boolean
  totpPending?: boolean
  totpSecretIssuedAt?: string
  totpConfirmedAt?: string
}

type ProvisionResponse = {
  secret?: string
  otpauth_url?: string
  issuer?: string
  account?: string
  qr?: string
  mfa?: TotpStatus
  user?: { mfa?: TotpStatus }
}

function formatTimestamp(value?: string) {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

export default function MfaSetupPanel() {
  const { language } = useLanguage()
  const copy = translations[language].userCenter.mfa
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refresh, logout } = useUser()

  const [status, setStatus] = useState<TotpStatus | null>(null)
  const [secret, setSecret] = useState('')
  const [uri, setUri] = useState('')
  const [qrImage, setQrImage] = useState('')
  const [code, setCode] = useState('')
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupRequested = searchParams.get('setupMfa') === '1'
  const hasPendingMfa = Boolean(status?.totpPending && !status?.totpEnabled)
  const requiresSetup = Boolean(user && (!user.mfaEnabled || user.mfaPending))

  const generateQrImage = useCallback((value: string) => {
    if (!value) {
      return ''
    }

    try {
      const encoded = encodeURIComponent(value)
      return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}`
    } catch (err) {
      console.warn('Failed to build MFA QR code URL', err)
      return ''
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/mfa/status', { cache: 'no-store', credentials: 'include' })
      const payload = (await response.json().catch(() => ({}))) as {
        mfa?: TotpStatus
        user?: { mfa?: TotpStatus }
      }
      if (response.ok) {
        setStatus(payload?.mfa ?? payload?.user?.mfa ?? null)
      } else if (response.status === 401) {
        setStatus(payload?.mfa ?? null)
      }
    } catch (err) {
      console.warn('Failed to fetch MFA status', err)
    }
  }, [])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (setupRequested) {
      setIsDialogOpen(true)
    }
  }, [setupRequested])

  const handleProvision = useCallback(async () => {
    setIsProvisioning(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string | null
        data?: ProvisionResponse
      }
      if (!payload?.success || !payload?.data) {
        setError(payload?.error ?? copy.error)
        return
      }
      const data = payload.data
      setSecret(data?.secret ?? '')
      const nextUri = data?.otpauth_url ?? ''
      setUri(nextUri)
      const nextQr = data?.qr ?? (nextUri ? generateQrImage(nextUri) : '')
      setQrImage(nextQr)
      setStatus(data?.mfa ?? data?.user?.mfa ?? status)
    } catch (err) {
      console.warn('Provision TOTP failed', err)
      setError(copy.error)
    } finally {
      setIsProvisioning(false)
    }
  }, [copy.error, generateQrImage, status])

  const handleVerify = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!code.trim()) {
        setError(copy.codePlaceholder)
        return
      }
      setIsVerifying(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/mfa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code: code.trim() }),
        })
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          error?: string | null
          needMfa?: boolean
        }
        if (!payload?.success || !response.ok) {
          setError(payload?.error ?? copy.error)
          return
        }
        setStatus({ totpEnabled: true })
        setSecret('')
        setUri('')
        setQrImage('')
        setCode('')
        await refresh()
        setIsDialogOpen(false)
        router.replace('/panel/account')
        router.refresh()
      } catch (err) {
        console.warn('Verify TOTP failed', err)
        setError(copy.error)
      } finally {
        setIsVerifying(false)
      }
    },
    [code, copy.codePlaceholder, copy.error, refresh, router],
  )

  const displayStatus = useMemo(() => status ?? user?.mfa ?? null, [status, user?.mfa])

  useEffect(() => {
    if (
      (setupRequested || isDialogOpen) &&
      !displayStatus?.totpEnabled &&
      !secret &&
      !hasPendingMfa &&
      !isProvisioning
    ) {
      void handleProvision()
    }
  }, [
    displayStatus?.totpEnabled,
    handleProvision,
    hasPendingMfa,
    isDialogOpen,
    isProvisioning,
    secret,
    setupRequested,
  ])

  useEffect(() => {
    if (!secret && user?.mfa?.totpEnabled) {
      setQrImage('')
    }
  }, [secret, user?.mfa?.totpEnabled])

  const handleLogoutClick = useCallback(async () => {
    await logout()
    router.replace('/login')
    router.refresh()
  }, [logout, router])

  const handleDisable = useCallback(async () => {
    setIsDisabling(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        credentials: 'include',
      })
      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string | null
        data?: { user?: { mfa?: TotpStatus } }
      }
      if (!response.ok || !payload?.success) {
        setError(payload?.error ?? copy.error)
        return
      }
      const nextStatus = payload?.data?.user?.mfa ?? null
      setStatus(nextStatus ?? { totpEnabled: false, totpPending: false })
      setSecret('')
      setUri('')
      setQrImage('')
      setCode('')
      await refresh()
      router.refresh()
    } catch (err) {
      console.warn('Disable TOTP failed', err)
      setError(copy.error)
    } finally {
      setIsDisabling(false)
    }
  }, [copy.error, refresh, router])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setError(null)
    if (setupRequested) {
      router.replace('/panel/account')
    }
  }, [router, setupRequested])

  const openDialog = useCallback(() => {
    setError(null)
    setIsDialogOpen(true)
  }, [])

  if (!user) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-gray-900">{copy.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{copy.pendingHint}</p>
      </Card>
    )
  }

  const statusLabel = displayStatus?.totpEnabled
    ? copy.state.enabled
    : displayStatus?.totpPending || hasPendingMfa
      ? copy.state.pending
      : copy.state.disabled

  return (
    <>
      <Card>
        <div className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{copy.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{copy.summary.description}</p>
              <dl className="mt-4 grid gap-4 text-xs text-gray-600 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-purple-600">{copy.summary.statusLabel}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{statusLabel}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-purple-600">{copy.status.issuedAt}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(displayStatus?.totpSecretIssuedAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-purple-600">{copy.status.confirmedAt}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(displayStatus?.totpConfirmedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <button
                type="button"
                onClick={openDialog}
                className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-500"
              >
                {displayStatus?.totpEnabled ? copy.summary.manage : copy.summary.bind}
              </button>
              {requiresSetup ? (
                <p className="text-xs text-amber-600">{copy.pendingHint}</p>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4 py-10"
          onClick={closeDialog}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDialog}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
            >
              <span className="sr-only">{copy.modal.close}</span>
              ×
            </button>
            <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-gray-900">{copy.modal.title}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {displayStatus?.totpEnabled ? copy.enabledHint : copy.subtitle}
              </p>

              <div className="mt-6 space-y-6">
                {displayStatus?.totpEnabled ? (
                  <div className="space-y-5">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                      <p className="font-medium">{copy.successTitle}</p>
                      <p className="mt-1">{copy.successBody}</p>
                      <dl className="mt-3 grid gap-2 text-xs text-green-700 sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold uppercase tracking-wide">{copy.status.issuedAt}</dt>
                          <dd>{formatTimestamp(displayStatus?.totpSecretIssuedAt)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-wide">{copy.status.confirmedAt}</dt>
                          <dd>{formatTimestamp(displayStatus?.totpConfirmedAt)}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <div>
                        <p className="font-semibold text-red-800">{copy.disable.title}</p>
                        <p className="mt-1 text-red-700">{copy.disable.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDisable}
                        disabled={isDisabling}
                        className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDisabling ? copy.disable.confirming : copy.disable.action}
                      </button>
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      {hasPendingMfa ? copy.pendingHint : copy.subtitle}
                    </p>

                    <ol className="space-y-4">
                      <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900">{copy.guide.step1Title}</h4>
                        <p className="mt-2 text-sm text-gray-600">{copy.guide.step1Description}</p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                          <li>{copy.guide.step1Ios}</li>
                          <li>{copy.guide.step1Android}</li>
                        </ul>
                      </li>

                      <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900">{copy.guide.step2Title}</h4>
                        <p className="mt-2 text-sm text-gray-600">{copy.guide.step2Description}</p>
                        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
                          {qrImage ? (
                            <div className="flex justify-center lg:w-60 lg:justify-start">
                              <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                                <img
                                  src={qrImage}
                                  alt="Authenticator QR code"
                                  className="h-44 w-44 rounded-lg border border-purple-200 bg-white p-2 shadow-sm"
                                />
                              </div>
                            </div>
                          ) : null}
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{copy.secretLabel}</p>
                              <code className="mt-1 block break-all rounded bg-purple-50 px-3 py-2 text-sm text-purple-700">{secret}</code>
                            </div>
                            {uri ? (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{copy.uriLabel}</p>
                                <a
                                  href={uri}
                                  className="mt-1 block break-all text-sm text-purple-600 underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {uri}
                                </a>
                              </div>
                            ) : null}
                            <p className="text-xs text-gray-500">{copy.manualHint}</p>
                            <button
                              type="button"
                              onClick={handleProvision}
                              disabled={isProvisioning}
                              className="inline-flex items-center justify-center rounded-md border border-purple-200 px-3 py-2 text-xs font-medium text-purple-600 transition hover:border-purple-300 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isProvisioning ? `${copy.regenerate}…` : copy.regenerate}
                            </button>
                          </div>
                        </div>
                      </li>

                      <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900">{copy.guide.step3Title}</h4>
                        <p className="mt-2 text-sm text-gray-600">{copy.guide.step3Description}</p>
                        <form
                          onSubmit={handleVerify}
                          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
                        >
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="mfa-code">
                              {copy.codeLabel}
                            </label>
                            <input
                              id="mfa-code"
                              name="code"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              autoComplete="one-time-code"
                              value={code}
                              onChange={(event) => setCode(event.target.value)}
                              placeholder={copy.codePlaceholder}
                              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-mono tracking-[0.6em] text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isVerifying}
                            className="inline-flex items-center justify-center rounded-md bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isVerifying ? copy.verifying : copy.verify}
                          </button>
                        </form>
                      </li>
                    </ol>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                  </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                  <p className="font-semibold text-gray-700">{copy.actions.help}</p>
                  <p className="mt-1 text-gray-600">{copy.actions.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="inline-flex items-center justify-center rounded-md border border-purple-200 px-3 py-2 text-xs font-medium text-purple-600 transition hover:border-purple-300 hover:bg-purple-50"
                    >
                      {copy.actions.logout}
                    </button>
                    <a
                      href={copy.actions.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-500"
                    >
                      {copy.actions.docs}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
