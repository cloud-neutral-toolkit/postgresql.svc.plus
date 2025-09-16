import CardGrid from '../../../components/download/CardGrid'
import Breadcrumbs, { Crumb } from '../../../components/download/Breadcrumbs'
import FileTable from '../../../components/download/FileTable'
import { formatDate } from '../../../lib/format'
import {
  buildSectionsForListing,
  countFiles,
  findListing,
  formatSegmentLabel,
} from '../../../lib/download-data'
import { getDownloadListings } from '../../../lib/download-manifest'
import type { DirListing } from '../../../types/download'

const allListings = getDownloadListings()

export async function generateStaticParams() {
  return allListings
    .filter((listing) => listing.path)
    .map((listing) => ({ segments: listing.path.split('/').filter(Boolean) }))
}

export const dynamicParams = false

function buildBreadcrumb(segments: string[]): Crumb[] {
  const items: Crumb[] = [{ label: 'Download', href: '/download' }]
  segments.forEach((segment, index) => {
    items.push({
      label: formatSegmentLabel(segment),
      href: '/download/' + segments.slice(0, index + 1).join('/'),
    })
  })
  return items
}

function getLatestModified(listing: DirListing): string | undefined {
  let latest: string | undefined
  for (const entry of listing.entries) {
    if (entry.lastModified && (!latest || new Date(entry.lastModified).getTime() > new Date(latest).getTime())) {
      latest = entry.lastModified
    }
  }
  return latest
}

export default function DownloadListing({
  params,
}: {
  params: { segments: string[] }
}) {
  const rawSegments = params.segments ?? []
  const segments = rawSegments
    .map((segment) => segment.trim().replace(/\/+$/g, ''))
    .filter((segment) => segment.length > 0)

  if (segments.length === 0) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed p-10 text-center text-sm text-red-500">
          Directory not found.
        </div>
      </main>
    )
  }

  const listing = findListing(allListings, segments)

  if (!listing) {
    return (
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed p-10 text-center text-sm text-red-500">
          Directory not found.
        </div>
      </main>
    )
  }

  const breadcrumb = buildBreadcrumb(segments)
  const subdirectorySections = buildSectionsForListing(listing, allListings, segments)
  const fileEntries = listing.entries.filter((entry) => entry.type === 'file')
  const fileListing: DirListing = { path: listing.path, entries: fileEntries }

  const totalFiles = countFiles(listing, allListings)
  const latestModified = getLatestModified(listing)
  const displayTitle = formatSegmentLabel(segments[segments.length - 1] ?? '')
  const relativePath = segments.join('/')
  const remotePath = `https://dl.svc.plus/${listing.path}`

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Breadcrumbs items={breadcrumb} />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Explore downloads and artifacts available under the {displayTitle} directory.
              </p>
              <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-gray-500">Subdirectories</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {subdirectorySections.length.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Files</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{totalFiles.toLocaleString()}</dd>
                </div>
                {latestModified && (
                  <div>
                    <dt className="text-gray-500">Last updated</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{formatDate(latestModified)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {subdirectorySections.length > 0 && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
                  <span className="text-xs text-gray-500">
                    {subdirectorySections.length.toLocaleString()} entr{subdirectorySections.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>
                <CardGrid sections={subdirectorySections} />
              </div>
            )}

            {fileListing.entries.length > 0 && (
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <FileTable listing={fileListing} breadcrumb={breadcrumb} showBreadcrumbs={false} />
              </div>
            )}

            {subdirectorySections.length === 0 && fileListing.entries.length === 0 && (
              <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
                This directory does not contain downloadable artifacts yet.
              </div>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700">Directory info</h2>
              <dl className="mt-4 space-y-3 text-xs text-gray-600">
                <div>
                  <dt className="text-gray-500">Path</dt>
                  <dd className="mt-1 font-mono text-sm text-gray-900">/{relativePath}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Source</dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={remotePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      {remotePath}
                    </a>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-gray-500">Data sourced from dl.svc.plus.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
