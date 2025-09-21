'use client'

import { ReactNode } from 'react'

interface TopBarProps {
  breadcrumb: ReactNode
  actions?: ReactNode
}

export function TopBar({ breadcrumb, actions }: TopBarProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-slate-900/70 border border-slate-800 px-6 py-4 shadow-lg shadow-slate-950/20">
      <div className="space-y-1">
        {breadcrumb}
        <p className="text-sm text-slate-400">Explore metrics, logs, traces and automate incident response.</p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  )
}
