'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDate } from '../../lib/format'

interface Section {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
}

export default function CardGrid({ sections }: { sections: Section[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'lastModified' | 'title'>('lastModified')

  const filtered = useMemo(() => {
    return sections
      .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sort === 'title'
          ? a.title.localeCompare(b.title)
          : new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime()
      )
  }, [sections, search, sort])

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white flex items-center mb-4 gap-2 border-b pb-2">
        <select
          className="border rounded p-2"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="lastModified">Sort by Updated</option>
          <option value="title">Sort by Name</option>
        </select>
        <div className="ml-auto">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2"
          />
        </div>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {filtered.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="mb-4 block break-inside-avoid border rounded p-4 hover:shadow"
          >
            <div className="text-4xl font-bold mb-2">
              {section.title.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm font-semibold mb-2">{section.title}</div>
            <div className="text-xs text-gray-600">
              {section.lastModified && <p>Updated: {formatDate(section.lastModified)}</p>}
              {section.count !== undefined && <p>Items: {section.count}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
