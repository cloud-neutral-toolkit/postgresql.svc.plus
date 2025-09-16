'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { formatDate } from '../../lib/format'
import { formatSegmentLabel } from '../../lib/download-data'

interface Section {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
  root?: string
}

export default function CardGrid({ sections }: { sections: Section[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'lastModified' | 'title'>('lastModified')

  const filtered = useMemo(() => {
    return sections
      .filter((section) => section.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sort === 'title'
          ? a.title.localeCompare(b.title)
          : new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime(),
      )
  }, [sections, search, sort])

  return (
    <div>
      <div className="sticky top-20 z-10 mb-4 flex items-center gap-2 border-b bg-white pb-2">
        <select className="rounded border p-2" value={sort} onChange={(event) => setSort(event.target.value as any)}>
          <option value="lastModified">Sort by Updated</option>
          <option value="title">Sort by Name</option>
        </select>
        <div className="ml-auto">
          <input
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded border p-2"
          />
        </div>
      </div>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="mb-4 block break-inside-avoid rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col gap-3">
              {section.root && (
                <span className="inline-flex w-fit items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
                  {formatSegmentLabel(section.root)}
                </span>
              )}
              <div className="text-4xl font-bold text-gray-900">{section.title.charAt(0).toUpperCase()}</div>
              <div className="text-base font-semibold text-gray-900">{section.title}</div>
              <div className="space-y-1 text-xs text-gray-600">
                {section.lastModified && <p>Updated: {formatDate(section.lastModified)}</p>}
                {section.count !== undefined && <p>Items: {section.count.toLocaleString()}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
