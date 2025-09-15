'use client'

import { useState, useMemo } from 'react'
import CopyButton from './CopyButton'
import Breadcrumbs, { Crumb } from './Breadcrumbs'
import { formatBytes, formatDate } from '../../lib/format'
import type { DirListing } from '../../types/download'

export default function FileTable({ listing, breadcrumb }: { listing: DirListing; breadcrumb: Crumb[] }) {
  const [sort, setSort] = useState<'name' | 'lastModified' | 'size'>('name')
  const [ext, setExt] = useState('')

  const filtered = useMemo(() => {
    return listing.entries
      .filter((i) => !ext || i.name.endsWith(ext))
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
      <Breadcrumbs items={breadcrumb} />
      <div className="flex gap-2 mb-2">
        <select className="border rounded p-2" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="name">Name</option>
          <option value="lastModified">Updated</option>
          <option value="size">Size</option>
        </select>
        <input
          className="border rounded p-2"
          placeholder="Filter ext (.tar.gz)"
          value={ext}
          onChange={(e) => setExt(e.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Name</th>
            <th className="text-left py-2 w-24">Size</th>
            <th className="text-left py-2 w-48">Updated</th>
            <th className="text-left py-2 w-32">Actions</th>
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
              <td className="py-1">{formatDate(item.lastModified || '')}</td>
              <td className="py-1 flex gap-2">
                <CopyButton text={`https://dl.svc.plus${item.href}`} />
                <CopyButton text={`wget -c https://dl.svc.plus${item.href}`} />
                {item.sha256 && (
                  <CopyButton text={`wget -O - https://dl.svc.plus${item.sha256} | grep ${item.name} | sha256sum -c -`} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
