import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CloudIacCatalog from '@components/iac/CloudIacCatalog'
import { CATALOG, PROVIDERS } from '@lib/iac/catalog'
import type { ProviderKey } from '@lib/iac/types'

import feature from '../feature.config'

type PageParams = {
  provider: string
}

const PROVIDER_MAP = new Map(PROVIDERS.map((provider) => [provider.key, provider.label] as const))

export function generateMetadata({ params }: { params: PageParams }): Metadata {
  const providerKey = params.provider as ProviderKey
  const providerLabel = PROVIDER_MAP.get(providerKey)
  if (!providerLabel) {
    return {
      title: 'Cloud IaC Catalog',
    }
  }

  return {
    title: `${providerLabel} · Cloud IaC Catalog`,
    description: `${providerLabel} 核心云服务的 IaC 编排目录，涵盖计算、网络、存储、数据库等常用能力。`,
  }
}

export default function CloudIacProviderPage({ params }: { params: PageParams }) {
  if (!feature.enabled) {
    notFound()
  }

  const providerKey = params.provider as ProviderKey
  if (!PROVIDER_MAP.has(providerKey)) {
    notFound()
  }

  const providerLabel = PROVIDER_MAP.get(providerKey)!

  return (
    <main className="px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">{providerLabel} Catalog</p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">核心服务目录</h1>
          <p className="max-w-3xl text-sm text-gray-600 md:text-base">
            浏览 {providerLabel} 提供的计算、网络、负载均衡、存储、数据库、缓存、队列、容器服务、数据服务、安全防护以及身份与访问管理能力，点击卡片进入服务详情配置 IaC 与 GitOps。
          </p>
        </header>

        <CloudIacCatalog catalog={CATALOG} providers={PROVIDERS} mode="provider" activeProvider={providerKey} />
      </div>
    </main>
  )
}
