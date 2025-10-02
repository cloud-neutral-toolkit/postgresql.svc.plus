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
  uri?: string
  issuer?: string
  account?: string
  qr?: string
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
  const [error, setError] = useState<string | null>(null)

  const hasPendingMfa = Boolean(status?.totpPending && !status?.totpEnabled)
  const setupRequested = searchParams.get('setupMfa') === '1'
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
      const nextUri = data?.uri ?? ''
      setUri(nextUri)
      const nextQr = data?.qr ?? (nextUri ? generateQrImage(nextUri) : '')
      setQrImage(nextQr)
      setStatus(data?.user?.mfa ?? status)
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

  const showProvisionButton = !status?.totpEnabled
  const provisionLabel = secret ? copy.regenerate : copy.generate

  const displayStatus = useMemo(() => status ?? user?.mfa ?? null, [status, user?.mfa])

  useEffect(() => {
    if (setupRequested && showProvisionButton && !secret && !hasPendingMfa) {
      void handleProvision()
    }
  }, [handleProvision, hasPendingMfa, secret, setupRequested, showProvisionButton])

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

  if (!user) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-gray-900">{copy.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{copy.pendingHint}</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{copy.title}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {displayStatus?.totpEnabled ? copy.enabledHint : copy.subtitle}
          </p>
        </div>

        {requiresSetup ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <p className="font-semibold">{copy.pendingHint}</p>
            <p className="mt-1">{copy.steps.intro}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>{copy.steps.provision}</li>
              <li>{copy.steps.verify}</li>
            </ol>
          </div>
        ) : null}

        {displayStatus?.totpEnabled ? (
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
        ) : (
          <div className="space-y-4">
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {hasPendingMfa ? copy.pendingHint : copy.subtitle}
            </p>
            {showProvisionButton ? (
              <button
                type="button"
                onClick={handleProvision}
                disabled={isProvisioning}
                className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProvisioning ? `${provisionLabel}…` : provisionLabel}
              </button>
            ) : null}

            {secret ? (
              <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                {qrImage ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{copy.qrLabel}</p>
                    <div className="mt-2 flex justify-center">
                      <img
                        src={qrImage}
                        alt="Authenticator QR code"
                        className="h-40 w-40 rounded-lg border border-purple-100 bg-white p-2 shadow-sm"
                      />
                    </div>
                  </div>
                ) : null}
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
              </div>
            ) : null}

            {secret ? (
              <form onSubmit={handleVerify} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700" htmlFor="mfa-code">
                  {copy.codeLabel}
                </label>
                <input
                  id="mfa-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={copy.codePlaceholder}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isVerifying ? copy.verifying : copy.verify}
                </button>
              </form>
            ) : null}
          </div>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
    </Card>
  )
}
