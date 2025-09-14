'use client'

import { useState, useMemo } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import CopyButton from './CopyButton'
import { formatBytes, formatDate } from '../utils/format'

interface Item {
  name: string
  size: number
  updated_at: string
  href: string
  sha256?: string
}

export default function FileTable({ basePath, items }: { basePath: string, items: Item[] }) {
  const [sort, setSort] = useState<'name' | 'updated_at' | 'size'>('name')
  const [ext, setExt] = useState('')

  const filtered = useMemo(() => {
    return items
      .filter(i => !ext || i.name.endsWith(ext))
      .sort((a,b) => {
        switch(sort) {
          case 'updated_at':
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          case 'size':
            return b.size - a.size
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [items, sort, ext])

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <select className="border rounded p-2" value={sort} onChange={e=>setSort(e.target.value as any)}>
          <option value="name">Name</option>
          <option value="updated_at">Updated</option>
          <option value="size">Size</option>
        </select>
        <input className="border rounded p-2" placeholder="Filter ext (.tar.gz)" value={ext} onChange={e=>setExt(e.target.value)} />
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
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-blue-600">{item.name}</a>
              </TableCell>
              <TableCell>{formatBytes(item.size)}</TableCell>
              <TableCell>{formatDate(item.updated_at)}</TableCell>
              <TableCell className="flex gap-2">
                <CopyButton text={`https://dl.svc.plus${item.href}`} />
                <CopyButton text={`wget -c https://dl.svc.plus${item.href}`} />
                {item.sha256 && (
                  <CopyButton text={`wget -O - https://dl.svc.plus${item.sha256} | grep ${item.name} | sha256sum -c -`} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
