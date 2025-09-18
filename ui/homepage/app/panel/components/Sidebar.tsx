'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Server,
  Code,
  CreditCard,
  Search,
  User,
  Shield,
  type LucideIcon,
} from 'lucide-react'

export interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

interface NavItem {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        href: '/panel',
        label: 'Dashboard',
        description: 'Control center snapshot',
        icon: Home,
      },
    ],
  },
  {
    title: 'Admin Toolkit',
    items: [
      {
        href: '/panel/agent',
        label: 'Agents',
        description: 'Manage runtime nodes',
        icon: Server,
      },
      {
        href: '/panel/api',
        label: 'APIs',
        description: 'Observe backend services',
        icon: Code,
      },
      {
        href: '/panel/subscription',
        label: 'Subscription',
        description: 'Billing & plan controls',
        icon: CreditCard,
      },
      {
        href: '/panel/xray',
        label: 'XRay',
        description: 'Inspect network policies',
        icon: Search,
      },
    ],
  },
  {
    title: 'Identity & Access',
    items: [
      {
        href: '/panel/account',
        label: 'Accounts',
        description: 'Directory & MFA settings',
        icon: User,
      },
      {
        href: '/panel/ldp',
        label: 'LDP',
        description: 'Low-latency identity plane',
        icon: Shield,
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

  return (
    <aside className={`flex h-full w-72 flex-col gap-6 border-r border-gray-200 bg-white/90 p-6 shadow-lg backdrop-blur ${className}`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">XControl</p>
        <h2 className="text-lg font-bold text-gray-900">Control Center</h2>
        <p className="text-sm text-gray-500">Switch between admin and self-service spaces.</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</p>
            <div className="space-y-2">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition hover:border-purple-400 hover:text-purple-600 ${
                      active
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow'
                        : 'border-transparent text-gray-600'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-xs text-gray-500 group-hover:text-purple-500">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
