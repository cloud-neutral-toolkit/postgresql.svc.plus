import DownloadBrowser from '../../components/download/DownloadBrowser'
import { buildDownloadSections, countFiles, findListing } from '../../lib/download-data'
import listings from '../../public/dl-index/all.json'
import type { DirListing } from '../../types/download'

export default function DownloadHome() {
  const allListings = listings as DirListing[]
  const sectionsMap = buildDownloadSections(allListings)
  const rootListing = findListing(allListings, [])
  const topLevelDirectories = rootListing?.entries.filter((entry) => entry.type === 'dir') ?? []

  const totalCollections = Object.values(sectionsMap).reduce((total, sections) => total + sections.length, 0)
  const totalFiles = topLevelDirectories.reduce((total, entry) => {
    const listing = findListing(allListings, [entry.name])
    return total + (listing ? countFiles(listing, allListings) : 0)
  }, 0)

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold">Download Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse offline packages, releases, and other curated resources hosted on dl.svc.plus.
          </p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-500">Top-level categories</dt>
              <dd className="mt-1 text-xl font-semibold">{topLevelDirectories.length.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Resource collections</dt>
              <dd className="mt-1 text-xl font-semibold">{totalCollections.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Files tracked</dt>
              <dd className="mt-1 text-xl font-semibold">{totalFiles.toLocaleString()}</dd>
            </div>
          </dl>
        </section>
        <DownloadBrowser sectionsMap={sectionsMap} />
      </div>
    </main>
  )
}
