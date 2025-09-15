import Link from 'next/link'
import Breadcrumbs, { Crumb } from '../../../components/download/Breadcrumbs'
import MarkdownPanel from '../../../components/download/MarkdownPanel'
import { formatDate } from '../../../lib/format'
import listings from '../../../public/dl-index/all.json'
import type { DirListing } from '../../../types/download'

interface DocFile {
  path: string
  href: string
  title: string
  segments: string[]
  lastModified?: string
}

function formatSectionTitle(name: string): string {
  return name
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function collectDocFiles(listing: DirListing, all: DirListing[], base = ''): DocFile[] {
  const files: DocFile[] = []
  for (const entry of listing.entries) {
    if (entry.type === 'file') {
      const lower = entry.name.toLowerCase()
      if (lower.endsWith('.md') || lower.endsWith('.mdx')) {
        const relative = base ? `${base}/${entry.name}` : entry.name
        const segments = relative
          .split('/')
          .map((segment) => segment.replace(/\.(md|mdx)$/i, ''))
        files.push({
          path: relative,
          href: entry.href,
          title: formatSectionTitle(segments[segments.length - 1]),
          segments,
          lastModified: entry.lastModified,
        })
      }
    } else if (entry.type === 'dir') {
      const child = all.find((l) => l.path === `${listing.path}${entry.name}/`)
      if (child) {
        const nextBase = base ? `${base}/${entry.name}` : entry.name
        files.push(...collectDocFiles(child, all, nextBase))
      }
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path))
}

function buildCrumbs(section: string, selected?: DocFile): Crumb[] {
  const crumbs: Crumb[] = [
    { label: 'Docs', href: '/docs' },
    { label: formatSectionTitle(section), href: `/docs/${section}` },
  ]

  if (selected) {
    const label = selected.segments.map((segment) => formatSectionTitle(segment)).join(' / ')
    crumbs.push({ label, href: `/docs/${section}?file=${encodeURIComponent(selected.path)}` })
  }

  return crumbs
}

function normalizeFileParam(fileParam: string | string[] | undefined): string | undefined {
  if (!fileParam) return undefined
  if (Array.isArray(fileParam)) {
    return fileParam[0]
  }
  return fileParam
}

export function generateStaticParams() {
  const allListings = listings as DirListing[]
  const docsRoot = allListings.find((l) => l.path === 'docs/')
  if (!docsRoot) return [] as { name: string }[]
  return docsRoot.entries
    .filter((entry) => entry.type === 'dir')
    .map((entry) => ({ name: entry.name }))
}

export const dynamic = 'force-dynamic'

export default function DocPage({
  params,
  searchParams,
}: {
  params: { name: string }
  searchParams?: { file?: string | string[] }
}) {
  const allListings = listings as DirListing[]
  const docListing = allListings.find((l) => l.path === `docs/${params.name}/`)

  if (!docListing) {
    return (
      <main className="px-4 py-8">
        <div className="max-w-3xl mx-auto text-center text-red-500">Documentation section not found.</div>
      </main>
    )
  }

  const docFiles = collectDocFiles(docListing, allListings)
  if (docFiles.length === 0) {
    return (
      <main className="px-4 py-8">
        <div className="max-w-3xl mx-auto text-center text-gray-600">
          This section does not contain any Markdown documents yet.
        </div>
      </main>
    )
  }

  const selectedPath = normalizeFileParam(searchParams?.file)
  const selected = selectedPath ? docFiles.find((file) => file.path === selectedPath) : docFiles[0]
  const active = selected ?? docFiles[0]
  const crumbs = buildCrumbs(params.name, active)

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="lg:w-64">
          <div className="sticky top-24 rounded-2xl border p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Contents</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {docFiles.map((file) => {
                const depth = Math.max(0, file.segments.length - 1)
                const isActive = file.path === active.path
                return (
                  <li key={file.path}>
                    <Link
                      href={`/docs/${params.name}?file=${encodeURIComponent(file.path)}`}
                      className={`block rounded px-2 py-1 transition-colors ${
                        isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                      }`}
                      style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    >
                      <div className="font-medium">{file.title}</div>
                      {file.segments.length > 1 && (
                        <div className="text-xs text-gray-500">
                          {file.segments
                            .slice(0, -1)
                            .map((segment) => formatSectionTitle(segment))
                            .join(' / ')}
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
        <div className="flex-1 space-y-4">
          <Breadcrumbs items={crumbs} />
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl font-bold">
                {active.segments.map((segment) => formatSectionTitle(segment)).join(' / ')}
              </h1>
              {active.lastModified && (
                <span className="text-xs text-gray-500">
                  Updated {formatDate(active.lastModified)}
                </span>
              )}
            </div>
          </div>
          <MarkdownPanel url={`https://dl.svc.plus${active.href}`} title={active.title} />
        </div>
      </div>
    </main>
  )
}
