import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CloudIacCatalog from '@components/iac/CloudIacCatalog'
import { CATALOG, PROVIDERS } from '@lib/iac/catalog'

import feature from './feature.config'

export const metadata: Metadata = {
  title: 'Cloud IaC Catalog',
  description:
    '跨云厂商的计算、存储、网络等核心服务一站式对照表，快速触发 Terraform、Pulumi 与 GitHub CI 自动化流程。',
}

export default function CloudIacPage() {
  if (!feature.enabled) {
    notFound()
  }

  return (
    <main className="px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">Cloud Automation</p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Cloud IaC Catalog</h1>
          <p className="max-w-3xl text-sm text-gray-600 md:text-base">
            跨云厂商（AWS / GCP / Azure / 阿里云）的 IaaS、PaaS 与数据智能核心服务统一收录，支持一键调起 Terraform、Pulumi 与 GitHub CI
            工作流，助力企业搭建标准化的多云基础设施编排中心。
          </p>
        </header>

        <CloudIacCatalog catalog={CATALOG} providers={PROVIDERS} />
      </div>
    </main>
  )
}
