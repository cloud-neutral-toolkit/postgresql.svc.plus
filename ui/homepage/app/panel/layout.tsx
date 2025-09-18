'use client'

import { useState } from 'react'

import Header from './components/Header'
import Sidebar from './components/Sidebar'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-blue-50 text-gray-900">
      <Sidebar
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        onNavigate={() => setOpen(false)}
      />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col md:pl-72">
        <Header onMenu={() => setOpen((prev) => !prev)} />
        <main className="flex-1 space-y-6 bg-transparent px-4 py-6 md:px-10">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
