'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

import { useUser } from '@lib/userStore'
import type { UserRole } from '@lib/userStore'

const ROLE_BADGES: Record<UserRole, { label: string; className: string }> = {
  guest: { label: 'Guest', className: 'bg-gray-200 text-gray-600' },
  user: { label: 'User', className: 'bg-blue-100 text-blue-700' },
  operator: { label: 'Operator', className: 'bg-emerald-100 text-emerald-700' },
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
}

interface HeaderProps {
  onMenu: () => void
}

function resolveAccountInitial(input?: string | null) {
  if (!input) {
    return '?'
  }

  const normalized = input.trim()
  if (!normalized) {
    return '?'
  }

  return normalized.charAt(0).toUpperCase()
}

export default function Header({ onMenu }: HeaderProps) {
  const { user, isLoading } = useUser()
  const role: UserRole = user?.role ?? 'guest'
  const badge = ROLE_BADGES[role]
  const accountLabel = user?.name ?? user?.username ?? user?.email ?? 'Guest user'
  const accountInitial = resolveAccountInitial(accountLabel)
  const statusBadge = isLoading ? 'Syncing' : badge.label
  const badgeClasses = isLoading ? 'bg-gray-200 text-gray-600' : badge.className

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur md:px-6">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-purple-400 hover:text-purple-600 md:hidden"
        onClick={onMenu}
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      <div className="flex flex-1 items-center justify-end gap-4 md:justify-between">
        <div className="hidden flex-col text-sm text-gray-500 md:flex">
          <span className="font-semibold text-gray-900">XControl User Center</span>
          <span>Personalized access across every service touchpoint</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-purple-400 hover:text-purple-600"
          >
            返回主页
          </Link>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}>{statusBadge}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-semibold text-white">
            {isLoading ? <span className="animate-pulse">…</span> : accountInitial}
          </div>
          <div className="hidden flex-col text-right text-xs text-gray-500 sm:flex">
            <span className="text-sm font-semibold text-gray-900">{accountLabel}</span>
            <span>{user?.email ?? (isLoading ? 'Checking session…' : 'Not signed in')}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
