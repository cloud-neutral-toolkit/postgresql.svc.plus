import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ServiceDetailView from '@components/iac/ServiceDetailView'
import { CATALOG, PROVIDERS } from '@lib/iac/catalog'
import type { CatalogItem, ProviderKey } from '@lib/iac/types'

import feature from '../../feature.config'

type PageParams = {
  provider: string
  service: string
}

const PROVIDER_MAP = new Map(PROVIDERS.map((provider) => [provider.key, provider.label] as const))

function findCategoryBySlug(provider: ProviderKey, slug: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.iac?.[provider]?.detailSlug === slug)
}

export function generateMetadata({ params }: { params: PageParams }): Metadata {
  const providerKey = params.provider as ProviderKey
  const providerLabel = PROVIDER_MAP.get(providerKey)
  const category = providerLabel ? findCategoryBySlug(providerKey, params.service) : undefined
  if (!providerLabel || !category) {
    return {
      title: 'Cloud IaC Catalog',
    }
  }

  const productName = category.products[providerKey] ?? category.title
  return {
    title: `${providerLabel} · ${productName} · Cloud IaC`,
    description: `${providerLabel} 的 ${productName} IaC 详情页，提供 GitOps 配置、资源预览与成本估算。`,
  }
}

export default function CloudIacServicePage({ params }: { params: PageParams }) {
  if (!feature.enabled) {
    notFound()
  }

  const providerKey = params.provider as ProviderKey
  const providerLabel = PROVIDER_MAP.get(providerKey)
  if (!providerLabel) {
    notFound()
  }

  const category = findCategoryBySlug(providerKey, params.service)
  if (!category) {
    notFound()
  }

  const integration = category.iac?.[providerKey]
  const productName = category.products[providerKey] ?? category.title

  return (
    <main className="px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <ServiceDetailView
          providerKey={providerKey}
          providerLabel={providerLabel}
          category={category}
          productName={productName}
          integration={integration}
        />
      </div>
    </main>
  )
}
