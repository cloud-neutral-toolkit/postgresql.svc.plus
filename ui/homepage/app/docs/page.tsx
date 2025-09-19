export const dynamic = 'error'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'

import { getDocResources } from './resources'
import feature from './feature.config'
import ClientTime from '../components/ClientTime'

function formatMeta({
  category,
  version,
  variant,
}: {
  category?: string
  version?: string
  variant?: string
}) {
  const parts = [] as string[]
  if (category) parts.push(category)
  if (version) parts.push(version)
  else if (variant) parts.push(variant)
  return parts.join(' • ')
}

export default async function DocsHome() {
  if (!feature.enabled) {
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
                return (
                  <Link
                    key={resource.slug}
                    href={`/docs/${resource.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-100">
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div>
                          {meta && (
                            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm">
                              {meta}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-purple-500">
                          {resource.updatedAt && (
                            <span suppressHydrationWarning>
                              Updated <ClientTime isoString={resource.updatedAt} />
                            </span>
                          )}
                          {resource.estimatedMinutes && <span>{resource.estimatedMinutes} min read</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-gray-900 transition group-hover:text-purple-700">
                          {resource.title}
                        </h2>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between text-sm font-medium text-purple-600">
                        <span>Open reader</span>
                        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
