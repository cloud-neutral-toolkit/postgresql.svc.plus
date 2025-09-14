'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { allDocs } from 'contentlayer/generated'

export function Sidebar() {
  const pathname = usePathname()
  const docs = allDocs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return (
    <aside className="w-60 border-r hidden md:block overflow-y-auto h-screen sticky top-0 p-4">
      <nav>
        <ul className="space-y-2">
          {docs.map((doc) => {
            const active = pathname === doc.url
            return (
              <li key={doc.slug}>
                <Link
                  href={doc.url}
                  className={active ? 'text-blue-600 font-bold' : 'text-gray-700'}
                >
                  {doc.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
