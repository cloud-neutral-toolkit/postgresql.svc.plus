import DownloadListingContent from '../../../components/download/DownloadListingContent'
import DownloadNotFound from '../../../components/download/DownloadNotFound'
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
      <main className="px-4 py-10 md:px-8">
        <DownloadNotFound />
      </main>
    )
  }

  const listing = findListing(allListings, segments)

  if (!listing) {
    return (
      <main className="px-4 py-10 md:px-8">
        <DownloadNotFound />
      </main>
    )
  }

  const subdirectorySections = buildSectionsForListing(listing, allListings, segments)
  const fileEntries = listing.entries.filter((entry) => entry.type === 'file')
  const fileListing: DirListing = { path: listing.path, entries: fileEntries }

  const totalFiles = countFiles(listing, allListings)
  const latestModified = getLatestModified(listing)
  const displayTitle = formatSegmentLabel(segments[segments.length - 1] ?? '')
  const relativePath = segments.join('/')
  const remotePath = `https://dl.svc.plus/${listing.path}`

  return (
    <main className="px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <DownloadListingContent
          segments={segments}
          title={displayTitle}
          subdirectorySections={subdirectorySections}
          fileListing={fileListing}
          totalFiles={totalFiles}
          latestModified={latestModified}
          relativePath={relativePath}
          remotePath={remotePath}
        />
      </div>
    </main>
  )
}
