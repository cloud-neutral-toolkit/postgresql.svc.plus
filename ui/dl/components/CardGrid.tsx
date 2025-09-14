'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { copyText } from '../utils/copy'
import { formatDate } from '../utils/format'

interface Root {
  name: string
  href: string
  updated_at: string
  item_count: number
  summary?: string
}

export default function CardGrid({ roots }: { roots: Root[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'updated_at' | 'name'>('updated_at')

  const filtered = useMemo(() => {
    return roots
      .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.summary ?? '').toLowerCase().includes(search.toLowerCase()))
      .sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [roots, search, sort])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <Input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs" />
        <select className="border rounded p-2" value={sort} onChange={e=>setSort(e.target.value as any)}>
          <option value="updated_at">Sort by Updated</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(root => (
          <Link key={root.name} href={root.href} className="block">
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">{root.name[0].toUpperCase()}</span>
                  {root.name}
                </CardTitle>
                {root.summary && <CardDescription>{root.summary}</CardDescription>}
              </CardHeader>
              <CardContent className="pt-0 text-sm text-gray-600">
                <p>Updated: {formatDate(root.updated_at)}</p>
                <p>Items: {root.item_count}</p>
              </CardContent>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={e=>e.preventDefault()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={e=>{e.preventDefault();copyText(`https://dl.svc.plus${root.href}`)}}>Copy Link</DropdownMenuItem>
                    <DropdownMenuItem onClick={e=>{e.preventDefault();copyText(`wget -r --no-parent https://dl.svc.plus${root.href}`)}}>Copy wget -r</DropdownMenuItem>
                    <DropdownMenuItem onClick={e=>e.preventDefault()}>
                      <a href={`https://docs.svc.plus${root.href}`} target="_blank" rel="noopener noreferrer" className="ml-2">Docs</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
