'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Server, Code, CreditCard, User, Shield, type LucideIcon } from 'lucide-react'

import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'
import { useUser } from '@lib/userStore'

export interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

interface NavItem {
  href: string
  label: string
  description: string
  icon: LucideIcon
  disabled?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: '用户中心',
    items: [
      {
        href: '/panel',
        label: 'Dashboard',
        description: '专属于你的信息总览',
        icon: Home,
      },
    ],
  },
  {
    title: '功能特性',
    items: [
      {
        href: '/panel/agent',
        label: 'Agents',
        description: '管理运行时节点',
        icon: Server,
        disabled: true,
      },
      {
        href: '/panel/api',
        label: 'APIs',
        description: '洞察后端服务',
        icon: Code,
        disabled: true,
      },
      {
        href: '/panel/subscription',
        label: 'Subscription',
        description: '订阅方案与计费规则',
        icon: CreditCard,
        disabled: true,
      },
    ],
  },
  {
    title: '权限设置',
    items: [
      {
        href: '/panel/account',
        label: 'Accounts',
        description: '目录与多因素设置',
        icon: User,
        disabled: true,
      },
      {
        href: '/panel/ldp',
        label: 'LDP',
        description: '低时延身份平面',
        icon: Shield,
        disabled: true,
      },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === '/panel') {
    return pathname === '/panel'
  }
  return pathname.startsWith(href)
}

export default function Sidebar({ className = '', onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { language } = useLanguage()
  const copy = translations[language].userCenter.mfa
  const { user } = useUser()
  const requiresSetup = Boolean(user && (!user.mfaEnabled || user.mfaPending))

  return (
    <aside
      className={`flex h-full w-64 flex-col gap-6 border-r border-gray-200 bg-white/90 p-6 shadow-lg backdrop-blur ${className}`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">XControl</p>
        <h2 className="text-lg font-bold text-gray-900">User Center</h2>
        <p className="text-sm text-gray-500">在同一处掌控权限与功能特性。</p>
      </div>

      {requiresSetup ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-semibold">{copy.pendingHint}</p>
          <p className="mt-1">{copy.lockedMessage}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/panel/account?setupMfa=1"
              onClick={onNavigate}
              className="inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow transition hover:bg-purple-500"
            >
              {copy.actions.setup}
            </Link>
            <a
              href={copy.actions.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-600 transition hover:border-purple-300 hover:bg-purple-50"
            >
              {copy.actions.docs}
            </a>
          </div>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {navSections.map((section) => {
          const sectionDisabled = section.items.every(
            (item) => item.disabled || (requiresSetup && item.href !== '/panel/account'),
          )

          return (
            <div key={section.title} className="space-y-3">
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  sectionDisabled ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {section.title}
              </p>
              <div className={`space-y-2 ${sectionDisabled ? 'opacity-60' : ''}`}>
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  const disabled = item.disabled || (requiresSetup && item.href !== '/panel/account')

                  const content = (
                    <div
                      className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                        disabled
                          ? 'cursor-not-allowed border-dashed border-gray-200 text-gray-400'
                          : 'hover:border-purple-400 hover:text-purple-600'
                      } ${
                        active
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow'
                          : !disabled
                            ? 'border-transparent text-gray-600'
                            : 'border-transparent'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          active
                            ? 'bg-purple-600 text-white'
                            : disabled
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="font-semibold">{item.label}</span>
                        <span
                          className={`text-xs ${
                            disabled ? 'text-gray-400' : 'text-gray-500 group-hover:text-purple-500'
                          }`}
                        >
                          {item.description}
                        </span>
                      </span>
                    </div>
                  )

                  if (disabled) {
                    return (
                      <div key={item.href} aria-disabled={true} className="select-none">
                        {content}
                      </div>
                    )
                  }

                  return (
                    <Link key={item.href} href={item.href} onClick={onNavigate}>
                      {content}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
