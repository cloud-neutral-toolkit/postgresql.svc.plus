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
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 max-w-xs"
        />
        <select
          className="border rounded p-2"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="lastModified">Sort by Updated</option>
          <option value="title">Sort by Name</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((section) => (
          <Link key={section.key} href={section.href} className="block border rounded p-4 hover:shadow">
            <h3 className="font-semibold mb-2">{section.title}</h3>
            <div className="text-sm text-gray-600">
              {section.lastModified && <p>Updated: {formatDate(section.lastModified)}</p>}
              {section.count !== undefined && <p>Items: {section.count}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
