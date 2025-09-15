"use client"

import { useState, useEffect, useMemo } from 'react'
import CardGrid from './CardGrid'

const BASE_URL = process.env.NEXT_PUBLIC_DL_BASE_URL || 'https://dl.svc.plus'

interface ManifestRoot {
  name: string
  href: string
  updated_at?: string
  item_count?: number
  summary?: string
}

interface Section {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
  root: string
}

export default function DownloadBrowser({ roots }: { roots: ManifestRoot[] }) {
  const [current, setCurrent] = useState<string>('all')
  const [sectionsMap, setSectionsMap] = useState<Record<string, Section[]>>({})

  useEffect(() => {
    roots.forEach((r) => {
      fetch(`${BASE_URL}${r.href}dir.json`)
        .then((res) => (res.ok ? res.json() : { entries: [] }))
        .then((data) => {
          const entries = (data.entries || data.items || []).filter((e: any) => e.type === 'dir')
          const secs: Section[] = entries.map((e: any) => ({
            key: `${r.name}/${e.name}`,
            title: e.name,
            href: `/download/${r.name}/${e.name}`,
            lastModified: e.updated_at || e.last_modified,
            count: e.item_count,
            root: r.name,
          }))
          setSectionsMap((prev) => ({ ...prev, [r.name]: secs }))
        })
        .catch(() => setSectionsMap((prev) => ({ ...prev, [r.name]: [] })))
    })
  }, [roots])

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
            <li key={r.name}>
              <button
                className={`text-left w-full ${current === r.name ? 'font-semibold' : ''}`}
                onClick={() => setCurrent(r.name)}
              >
                {r.name}
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
