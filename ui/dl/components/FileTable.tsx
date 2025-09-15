'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from './ui/table'
import CopyButton from './CopyButton'
import { formatBytes, formatDate } from '../utils/format'
import { DirListing } from '../../../types/download'
import Breadcrumbs, { Crumb } from './Breadcrumbs'

export default function FileTable({
  listing,
  breadcrumb
}: {
  listing: DirListing
  breadcrumb: Crumb[]
}) {
  const [sort, setSort] = useState<'name' | 'lastModified' | 'size'>('name')
  const [ext, setExt] = useState('')

  const filtered = useMemo(() => {
    return listing.entries
      .filter(i => !ext || i.name.endsWith(ext))
      .sort((a, b) => {
        switch (sort) {
          case 'lastModified':
            return (
              new Date(b.lastModified || 0).getTime() -
              new Date(a.lastModified || 0).getTime()
            )
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
        <select
          className="border rounded p-2"
          value={sort}
          onChange={e => setSort(e.target.value as any)}
        >
          <option value="name">Name</option>
          <option value="lastModified">Updated</option>
          <option value="size">Size</option>
        </select>
        <input
          className="border rounded p-2"
          placeholder="Filter ext (.tar.gz)"
          value={ext}
          onChange={e => setExt(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Size</TableHead>
            <TableHead className="w-48">Updated</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(item => (
            <TableRow key={item.name}>
              <TableCell>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  {item.name}
                </a>
              </TableCell>
              <TableCell>{formatBytes(item.size || 0)}</TableCell>
              <TableCell>{formatDate(item.lastModified || '')}</TableCell>
              <TableCell className="flex gap-2">
                <CopyButton text={`https://dl.svc.plus${item.href}`} />
                <CopyButton text={`wget -c https://dl.svc.plus${item.href}`} />
                {item.sha256 && (
                  <CopyButton
                    text={`wget -O - https://dl.svc.plus${item.sha256} | grep ${item.name} | sha256sum -c -`}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
