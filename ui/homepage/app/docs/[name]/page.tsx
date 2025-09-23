export const dynamic = 'error'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import Breadcrumbs, { Crumb } from '../../../components/download/Breadcrumbs'
import { DOC_COLLECTIONS, getDocResource } from '../resources'
import { isFeatureEnabled } from '@lib/featureToggles'
import DocCollectionView from './DocCollectionView'

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

  return DOC_COLLECTIONS.map((doc) => ({ name: doc.slug }))
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

  const breadcrumbs = buildBreadcrumbs(doc.slug, doc.title)

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Breadcrumbs items={breadcrumbs} />
        <DocCollectionView collection={doc} />
      </div>
    </main>
  )
}
