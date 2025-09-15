import CardGrid from '../../components/download/CardGrid'
import listings from '../../public/dl-index/all.json'
import type { DirListing } from '../../types/download'

interface Section {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
}

function formatSectionTitle(name: string): string {
  return name
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function countMarkdownFiles(listing: DirListing | undefined, all: DirListing[]): number | undefined {
  if (!listing) return undefined
  let count = 0
  for (const entry of listing.entries) {
    if (entry.type === 'file') {
      const lower = entry.name.toLowerCase()
      if (lower.endsWith('.md') || lower.endsWith('.mdx')) {
        count += 1
      }
    }
    if (entry.type === 'dir') {
      const child = all.find((l) => l.path === `${listing.path}${entry.name}/`)
      if (child) {
        count += countMarkdownFiles(child, all) || 0
      }
    }
  }
  return count
}

export default function DocsHome() {
  const allListings = listings as DirListing[]
  const docsRoot = allListings.find((l) => l.path === 'docs/')

  const sections: Section[] = docsRoot
    ? docsRoot.entries
        .filter((entry) => entry.type === 'dir')
        .map((entry) => {
          const child = allListings.find((l) => l.path === `docs/${entry.name}/`)
          return {
            key: entry.name,
            title: formatSectionTitle(entry.name),
            href: `/docs/${entry.name}`,
            lastModified: entry.lastModified,
            count: countMarkdownFiles(child, allListings),
          }
        })
    : []

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold">Documentation Library</h1>
          <p className="text-sm text-gray-600">
            Browse curated knowledge bases from dl.svc.plus. Select a topic to explore detailed guides and
            references.
          </p>
        </div>
        <CardGrid sections={sections} />
      </div>
    </main>
  )
}
