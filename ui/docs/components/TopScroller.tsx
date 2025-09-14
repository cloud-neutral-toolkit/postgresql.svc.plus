'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { allDocs } from 'contentlayer/generated'
import { useRef, useEffect } from 'react'

export function TopScroller() {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const docs = allDocs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  useEffect(() => {
    const active = ref.current?.querySelector('a.active') as HTMLElement
    active?.scrollIntoView({ inline: 'center' })
  }, [pathname])

  return (
    <div ref={ref} className="flex overflow-x-auto space-x-4 p-2 border-b bg-white sticky top-0 z-10">
      {docs.map((doc) => (
        <Link
          key={doc.slug}
          href={doc.url}
          className={`whitespace-nowrap px-2 ${pathname === doc.url ? 'active text-blue-600 font-semibold' : ''}`}
        >
          {doc.title}
        </Link>
      ))}
    </div>
  )
}
