"use client"

import { useState, useEffect } from 'react'
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
}

export default function DownloadBrowser({ roots }: { roots: ManifestRoot[] }) {
  const [current, setCurrent] = useState<ManifestRoot | undefined>(roots[0])
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    if (!current) return
    fetch(`${BASE_URL}${current.href}dir.json`)
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => {
        const entries = (data.entries || data.items || []).filter((e: any) => e.type === 'dir')
        setSections(
          entries.map((e: any) => ({
            key: e.name,
            title: e.name,
            href: `/download/${current.name}/${e.name}`,
            lastModified: e.updated_at || e.last_modified,
            count: e.item_count,
          }))
        )
      })
      .catch(() => setSections([]))
  }, [current])

  return (
    <main className="flex">
      <aside className="w-48 border-r p-4">
        <ul className="space-y-2">
          {roots.map((r) => (
            <li key={r.name}>
              <button
                className={`text-left w-full ${current?.name === r.name ? 'font-semibold' : ''}`}
                onClick={() => setCurrent(r)}
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
