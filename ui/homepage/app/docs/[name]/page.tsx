export const dynamic = 'error'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import Breadcrumbs, { Crumb } from '../../../components/download/Breadcrumbs'
import { DOCS_DATASET, getDocResource } from '../resources'
import { isFeatureEnabled } from '@lib/featureToggles'
import ClientTime from '../../components/ClientTime'
import DocViewSection, { type DocViewOption } from './DocViewSection'

function buildBreadcrumbs(slug: string, docTitle: string): Crumb[] {
  return [
    { label: 'Docs', href: '/docs' },
    { label: docTitle, href: `/docs/${slug}` },
  ]
}

export const generateStaticParams = () => {
  if (!isFeatureEnabled('appModules', '/docs')) {
    return []
  }

  return DOCS_DATASET.map((doc) => ({ name: doc.slug }))
}

export const dynamicParams = false

export const metadata: Metadata = {
  title: 'Documentation',
}

export default async function DocPage({
  params,
}: {
  params: { name: string }
}) {
  if (!isFeatureEnabled('appModules', '/docs')) {
    notFound()
  }

  const doc = await getDocResource(params.name)
  if (!doc) {
    notFound()
  }

  const viewOptions: DocViewOption[] = []
  if (doc.pdfUrl) {
    viewOptions.push({
      id: 'pdf',
      label: 'PDF',
      description: 'Best for printing and full fidelity diagrams.',
      url: doc.pdfUrl,
      icon: 'pdf',
    })
  }
  if (doc.htmlUrl) {
    viewOptions.push({
      id: 'html',
      label: 'HTML',
      description: 'Responsive reader mode optimised for browsers.',
      url: doc.htmlUrl,
      icon: 'html',
    })
  }

  const breadcrumbs = buildBreadcrumbs(doc.slug, doc.title)

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Breadcrumbs items={breadcrumbs} />

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                {doc.category || 'Documentation'}
                {doc.version ? ` • ${doc.version}` : doc.variant ? ` • ${doc.variant}` : ''}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{doc.title}</h1>
              <p className="max-w-3xl text-sm text-gray-600 md:text-base">{doc.description}</p>
              {(doc.variant || doc.language) && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {doc.variant && <span className="rounded-full bg-gray-100 px-3 py-1">Release {doc.variant}</span>}
                  {doc.language && <span className="rounded-full bg-gray-100 px-3 py-1">Language {doc.language}</span>}
                </div>
              )}
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
              {doc.updatedAt && (
                <span suppressHydrationWarning>
                  Updated <ClientTime isoString={doc.updatedAt} />
                </span>
              )}
              {doc.estimatedMinutes && <span>Approx. {doc.estimatedMinutes} minute read</span>}
            </div>
          </div>

        </section>

        <DocViewSection docTitle={doc.title} options={viewOptions} />
      </div>
    </main>
  )
}
