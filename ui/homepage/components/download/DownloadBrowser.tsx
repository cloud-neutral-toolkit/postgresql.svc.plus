"use client"

import { useState, useMemo } from 'react'
import CardGrid from './CardGrid'

interface Section {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
  root: string
}

export default function DownloadBrowser({
  sectionsMap,
}: {
  sectionsMap: Record<string, Section[]>
}) {
  const [current, setCurrent] = useState<string>('all')

  const roots = Object.keys(sectionsMap)
  const allSections = useMemo(() => Object.values(sectionsMap).flat(), [sectionsMap])
  const sections = current === 'all' ? allSections : sectionsMap[current] || []

  return (
    <main className="flex">
      <aside className="w-48 border-r p-4">
        <ul className="space-y-2">
          <li key="all">
            <button
              className={`text-left w-full ${current === 'all' ? 'font-semibold' : ''}`}
              onClick={() => setCurrent('all')}
            >
              All
            </button>
          </li>
          {roots.map((r) => (
            <li key={r}>
              <button
                className={`text-left w-full ${current === r ? 'font-semibold' : ''}`}
                onClick={() => setCurrent(r)}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 p-4">
        <CardGrid sections={sections} />
      </div>
    </main>
  )
}
