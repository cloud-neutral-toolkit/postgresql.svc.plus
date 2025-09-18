'use client'

import { Menu } from 'lucide-react'

interface HeaderProps {
  onMenu: () => void
}

export default function Header({ onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur md:px-8">
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
          <span className="font-semibold text-gray-900">XControl Control Center</span>
          <span>Unified governance for admins and end users</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">Admin</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-semibold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
