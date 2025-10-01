'use client'

import { useCallback, useMemo, useState } from 'react'
import { Copy } from 'lucide-react'

import Card from './Card'
import { useUser } from '@lib/userStore'

function resolveDisplayName(
  user: {
    name?: string
    username: string
    email: string
  } | null,
) {
  if (!user) {
    return '访客'
  }

  if (user.name && user.name.trim().length > 0) {
    return user.name.trim()
  }

  if (user.username && user.username.trim().length > 0) {
    return user.username.trim()
  }

  return user.email
}

export default function UserOverview() {
  const { user, isLoading } = useUser()
  const [copied, setCopied] = useState(false)

  const displayName = useMemo(() => resolveDisplayName(user), [user])
  const uuid = user?.id ?? '—'
  const username = user?.username ?? '—'
  const email = user?.email ?? '—'

  const handleCopy = useCallback(async () => {
    if (!user?.id) {
      return
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && 'writeText' in navigator.clipboard) {
        await navigator.clipboard.writeText(user.id)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = user.id
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.warn('Failed to copy UUID', error)
    }
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">用户中心</h1>
        <p className="mt-2 text-sm text-gray-600">
          {isLoading ? '正在加载你的专属空间…' : user ? `欢迎回来，${displayName}。` : '请登录后解锁属于你的用户中心。'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          UUID 是你在 XControl 中的唯一身份凭证，后续的所有服务都与它神秘地关联在一起。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">UUID</p>
              <p className="mt-1 break-all text-base font-medium text-gray-900">{uuid}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!user?.id}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
              aria-label="复制 UUID"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            这是一串只属于你的身份指纹，让平台中的每项服务都能准确识别你。
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">UserName</p>
          <p className="mt-1 text-base font-medium text-gray-900">{username}</p>
          <p className="mt-3 text-xs text-gray-500">面向系统的登录凭据，展示给自动化流程与团队成员。</p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">UserEmail</p>
          <p className="mt-1 break-all text-base font-medium text-gray-900">{email}</p>
          <p className="mt-3 text-xs text-gray-500">用来接收通知、验证操作，并保持与你的 UUID 一致的信任链路。</p>
        </Card>
      </div>
    </div>
  )
}
