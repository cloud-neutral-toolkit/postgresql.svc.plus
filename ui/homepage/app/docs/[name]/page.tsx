import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ExternalLink, FileText, Monitor, type LucideIcon } from 'lucide-react'

import Breadcrumbs, { Crumb } from '../../../components/download/Breadcrumbs'
import { formatDate } from '../../../lib/format'
import { docResources, getDocResource } from '../resources'

type ViewMode = 'pdf' | 'html'

interface ViewOption {
  id: ViewMode
  label: string
  description: string
  url: string
  icon: LucideIcon
}

function normalizeViewParam(viewParam: string | string[] | undefined): ViewMode | undefined {
  if (!viewParam) return undefined
  const value = Array.isArray(viewParam) ? viewParam[0] : viewParam
  if (value === 'pdf' || value === 'html') return value
  return undefined
}

function buildBreadcrumbs(slug: string, docTitle: string): Crumb[] {
  return [
    { label: 'Docs', href: '/docs' },
    { label: docTitle, href: `/docs/${slug}` },
  ]
}

export function generateStaticParams() {
  return docResources.map((doc) => ({ name: doc.slug }))
}

export function generateMetadata({ params }: { params: { name: string } }): Metadata {
  const doc = getDocResource(params.name)
  if (!doc) {
    return { title: 'Documentation' }
  }
  return {
    title: `${doc.title} | Documentation`,
    description: doc.description,
  }
}

export default function DocPage({
  params,
  searchParams,
}: {
  params: { name: string }
  searchParams?: { view?: string | string[] }
}) {
  const doc = getDocResource(params.name)
  if (!doc) {
    notFound()
  }

  const viewOptions: ViewOption[] = []
  if (doc.pdfUrl) {
    viewOptions.push({
      id: 'pdf',
      label: 'PDF',
      description: 'Best for printing and full fidelity diagrams.',
      url: doc.pdfUrl,
      icon: FileText,
    })
  }
  if (doc.htmlUrl) {
    viewOptions.push({
      id: 'html',
      label: 'HTML',
      description: 'Responsive reader mode optimised for browsers.',
      url: doc.htmlUrl,
      icon: Monitor,
    })
  }

  const normalizedView = normalizeViewParam(searchParams?.view)
  const activeView = viewOptions.find((view) => view.id === normalizedView) ?? viewOptions[0]

  const breadcrumbs = buildBreadcrumbs(doc.slug, doc.title)
  const ActiveIcon = activeView?.icon

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Breadcrumbs items={breadcrumbs} />

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                {doc.category || 'Documentation'} {doc.version ? `• ${doc.version}` : ''}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{doc.title}</h1>
              <p className="max-w-3xl text-sm text-gray-600 md:text-base">{doc.description}</p>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 text-sm text-gray-500 md:items-end">
              {doc.updatedAt && <span>Updated {formatDate(doc.updatedAt)}</span>}
              {doc.estimatedMinutes && <span>Approx. {doc.estimatedMinutes} minute read</span>}
            </div>
          </div>

          {viewOptions.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {viewOptions.map((view) => {
                const isActive = activeView?.id === view.id
                const Icon = view.icon
                return (
                  <Link
                    key={view.id}
                    href={`/docs/${doc.slug}?view=${view.id}`}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition hover:border-purple-400 hover:shadow ${
                      isActive ? 'border-purple-500 bg-purple-50/60 shadow' : 'border-gray-200'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isActive ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        {view.label}
                        {isActive && <span className="text-xs font-medium text-purple-600">Selected</span>}
                      </div>
                      <p className="text-xs text-gray-600">{view.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {activeView && (
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              {ActiveIcon && (
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-medium text-purple-700">
                  <ActiveIcon className="h-4 w-4 text-purple-600" />
                  {activeView.label} view selected
                </span>
              )}
              <a
                href={activeView.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600"
              >
                <ExternalLink className="h-4 w-4" /> Open in new tab
              </a>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {activeView ? (
            <iframe
              key={activeView.id}
              src={activeView.url}
              className="h-[80vh] w-full"
              title={`${doc.title} (${activeView.label})`}
            />
          ) : (
            <div className="p-10 text-center text-gray-500">
              This resource does not provide an embeddable format yet. Use the download buttons above instead.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
