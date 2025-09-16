'use client'

import { useMemo, useState } from 'react'
import Breadcrumbs, { Crumb } from './Breadcrumbs'
import CopyButton from './CopyButton'
import { formatBytes, formatDate } from '../../lib/format'
import type { DirListing } from '../../types/download'

interface FileTableProps {
  listing: DirListing
  breadcrumb: Crumb[]
  showBreadcrumbs?: boolean
}

export default function FileTable({ listing, breadcrumb, showBreadcrumbs = true }: FileTableProps) {
  const [sort, setSort] = useState<'name' | 'lastModified' | 'size'>('name')
  const [ext, setExt] = useState('')

  const filtered = useMemo(() => {
    return listing.entries
      .filter((item) => !ext || item.name.toLowerCase().endsWith(ext.toLowerCase()))
      .sort((a, b) => {
        switch (sort) {
          case 'lastModified':
            return new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime()
          case 'size':
            return (b.size || 0) - (a.size || 0)
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [listing.entries, sort, ext])

  return (
    <div>
      {showBreadcrumbs && <Breadcrumbs items={breadcrumb} />}
      <div className="mb-2 flex flex-wrap gap-2">
        <select className="rounded border p-2" value={sort} onChange={(event) => setSort(event.target.value as any)}>
          <option value="name">Name</option>
          <option value="lastModified">Updated</option>
          <option value="size">Size</option>
        </select>
        <input
          className="rounded border p-2"
          placeholder="Filter ext (.tar.gz)"
          value={ext}
          onChange={(event) => setExt(event.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Name</th>
            <th className="w-24 py-2 text-left">Size</th>
            <th className="w-48 py-2 text-left">Updated</th>
            <th className="w-40 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.name} className="border-b last:border-0">
              <td className="py-1">
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {item.name}
                </a>
              </td>
              <td className="py-1">{formatBytes(item.size || 0)}</td>
              <td className="py-1">{item.lastModified ? formatDate(item.lastModified) : '--'}</td>
              <td className="py-1">
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={`https://dl.svc.plus${item.href}`} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
