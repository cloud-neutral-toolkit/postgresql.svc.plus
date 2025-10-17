export const dynamic = 'error'

import { notFound } from 'next/navigation'

import type { DocCollection } from './types'
import { getDocResources } from './resources.server'
import { isFeatureEnabled } from '@lib/featureToggles'
import DocCollectionCard from './DocCollectionCard'

function formatMeta(resource: DocCollection) {
  const parts: string[] = []
  if (resource.category) {
    parts.push(resource.category)
  }
  if (resource.latestVersionLabel) {
    parts.push(resource.latestVersionLabel)
  } else if (resource.latestVariant) {
    parts.push(resource.latestVariant)
  }
  if (resource.versions.length > 1) {
    parts.push(`${resource.versions.length} versions`)
  }
  return parts.join(' • ')
}

export default async function DocsHome() {
  if (!isFeatureEnabled('appModules', '/docs')) {
    notFound()
  }

  const manifest = await getDocResources()
  const resources = [...manifest].sort((a, b) => {
    const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0
    const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0
    return bTime - aTime
  })

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">Knowledge Base</p>
          <h1 className="text-3xl font-bold md:text-4xl">Documentation Library</h1>
          <p className="max-w-3xl text-sm text-gray-600 md:text-base">
            Browse curated implementation guides, architecture notes, and runbooks from dl.svc.plus. Select a resource to
            open the focused reading workspace.
          </p>
        </header>

        <section>
          {resources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center text-sm text-gray-500">
              Documentation resources are not available at the moment. Please check back later.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => {
                const meta = formatMeta(resource)
                return <DocCollectionCard key={resource.slug} collection={resource} meta={meta} />
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
