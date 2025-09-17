'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import RunModal, { type RunModalTarget } from './RunModal'
import {
  triggerGithubWorkflow,
  runPulumiProgram,
  runTerraformModule,
  type ActionResult,
} from '@lib/iac/actions'
import type { CatalogItem, IaCTool, ProviderDefinition, ProviderKey } from '@lib/iac/types'

const ACTION_CONFIG: { key: IaCTool; label: string; field: 'terraform' | 'pulumi' | 'githubWorkflow' }[] = [
  { key: 'terraform', label: 'Terraform', field: 'terraform' },
  { key: 'pulumi', label: 'Pulumi', field: 'pulumi' },
  { key: 'githubWorkflow', label: 'GitHub CI', field: 'githubWorkflow' },
]

type ProviderFilterKey = ProviderKey | 'all'

interface CloudIacCatalogProps {
  catalog: CatalogItem[]
  providers: readonly ProviderDefinition[]
}

export default function CloudIacCatalog({ catalog, providers }: CloudIacCatalogProps) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderFilterKey>('aws')
  const [searchTerm, setSearchTerm] = useState('')
  const [modalTarget, setModalTarget] = useState<RunModalTarget | null>(null)

  const providerMap = useMemo(() => {
    const entries = providers.map((provider) => [provider.key, provider.label] as const)
    return new Map(entries)
  }, [providers])

  const filteredCatalog = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return catalog.filter((item) => {
      if (selectedProvider !== 'all' && !item.products[selectedProvider]) {
        return false
      }

      if (!query) {
        return true
      }

      const candidates: string[] = [item.title, item.subtitle]

      providers.forEach((provider) => {
        const product = item.products[provider.key]
        if (product) candidates.push(product)
        const integration = item.iac?.[provider.key]
        if (integration?.terraform) candidates.push(integration.terraform)
        if (integration?.pulumi) candidates.push(integration.pulumi)
        if (integration?.githubWorkflow) candidates.push(integration.githubWorkflow)
      })

      return candidates.some((candidate) => candidate?.toLowerCase().includes(query))
    })
  }, [catalog, providers, searchTerm, selectedProvider])

  const providersToDisplay = useMemo(() => {
    if (selectedProvider === 'all') {
      return providers
    }
    return providers.filter((provider) => provider.key === selectedProvider)
  }, [providers, selectedProvider])

  function openRunModal(category: CatalogItem, providerKey: ProviderKey, action: IaCTool) {
    const providerLabel = providerMap.get(providerKey)
    if (!providerLabel) return

    const integration = category.iac?.[providerKey]
    if (!integration) return

    if (action === 'terraform' && !integration.terraform) return
    if (action === 'pulumi' && !integration.pulumi) return
    if (action === 'githubWorkflow' && !integration.githubWorkflow) return

    setModalTarget({
      provider: providerKey,
      providerLabel,
      category,
      action,
      integration,
    })
  }

  async function handleConfirm(parameters: Record<string, any>): Promise<ActionResult> {
    if (!modalTarget) {
      throw new Error('No target selected')
    }

    const { provider, category, integration, action } = modalTarget
    switch (action) {
      case 'terraform':
        return runTerraformModule({ provider, category, module: integration.terraform!, parameters })
      case 'pulumi':
        return runPulumiProgram({ provider, category, component: integration.pulumi!, parameters })
      case 'githubWorkflow':
        return triggerGithubWorkflow({ provider, category, workflow: integration.githubWorkflow!, parameters })
      default:
        throw new Error('Unsupported action')
    }
  }

  const totalCategories = catalog.length
  const matchedCategories = filteredCatalog.length
  const selectedProviderLabel =
    selectedProvider === 'all' ? '全部云厂商' : providerMap.get(selectedProvider) ?? '未知云厂商'

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">云厂商筛选</h2>
          <p className="mt-1 text-sm text-gray-500">聚焦单个云厂商或切换为全局对照视图。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedProvider('all')}
              aria-pressed={selectedProvider === 'all'}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                selectedProvider === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部云厂商
            </button>
            {providers.map((provider) => (
              <button
                key={provider.key}
                type="button"
                onClick={() => setSelectedProvider(provider.key)}
                aria-pressed={selectedProvider === provider.key}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  selectedProvider === provider.key
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {provider.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">搜索服务</h2>
          <p className="mt-1 text-sm text-gray-500">支持按产品名称、Terraform 模块或 Workflow 关键字匹配。</p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="搜索产品或模块"
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </section>
      </aside>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">核心服务类别</h2>
            <p className="text-sm text-gray-500">
              已匹配 {matchedCategories} / {totalCategories} 类服务 · 当前视图：{selectedProviderLabel}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
            Terraform · Pulumi · GitHub CI
          </span>
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white/60 p-12 text-center text-sm text-gray-500">
            未找到匹配的服务，请调整搜索关键词或切换云厂商。
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCatalog.map((item) => (
              <article
                key={item.key}
                className="flex h-full flex-col gap-4 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <header>
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{item.subtitle}</p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-900">{item.title}</h3>
                </header>

                <div className="space-y-4">
                  {providersToDisplay.map((provider) => {
                    const integration = item.iac?.[provider.key]
                    const hasIntegration = Boolean(
                      integration?.terraform || integration?.pulumi || integration?.githubWorkflow
                    )
                    const productLabel = item.products[provider.key] ?? '暂无对应产品'

                    return (
                      <div key={provider.key} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{provider.label}</p>
                            <p className="text-xs text-gray-500">{productLabel}</p>
                          </div>
                          {selectedProvider === 'all' && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
                              对照视图
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {ACTION_CONFIG.map((action) => {
                            const available = Boolean(integration && integration[action.field])
                            return (
                              <button
                                key={action.key}
                                type="button"
                                disabled={!available}
                                onClick={() => available && openRunModal(item, provider.key, action.key)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                                  available
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-offset-white'
                                    : 'cursor-not-allowed bg-gray-200 text-gray-400'
                                }`}
                              >
                                {action.label}
                              </button>
                            )
                          })}
                        </div>

                        {hasIntegration ? (
                          <dl className="mt-4 space-y-2 text-xs text-gray-600">
                            {integration?.terraform && (
                              <div className="flex flex-wrap items-center gap-2">
                                <dt className="font-medium text-gray-500">Terraform</dt>
                                <dd>
                                  <code className="rounded bg-white px-2 py-1 text-gray-700 shadow-sm">{integration.terraform}</code>
                                </dd>
                              </div>
                            )}
                            {integration?.pulumi && (
                              <div className="flex flex-wrap items-center gap-2">
                                <dt className="font-medium text-gray-500">Pulumi</dt>
                                <dd>
                                  <code className="rounded bg-white px-2 py-1 text-gray-700 shadow-sm">{integration.pulumi}</code>
                                </dd>
                              </div>
                            )}
                            {integration?.githubWorkflow && (
                              <div className="flex flex-wrap items-center gap-2">
                                <dt className="font-medium text-gray-500">GitHub CI</dt>
                                <dd>
                                  <code className="rounded bg-white px-2 py-1 text-gray-700 shadow-sm">{integration.githubWorkflow}</code>
                                </dd>
                              </div>
                            )}
                          </dl>
                        ) : (
                          <p className="mt-4 text-xs text-gray-500">该云厂商暂未配置 IAC 模块，欢迎补充。</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <RunModal
        open={Boolean(modalTarget)}
        target={modalTarget}
        onClose={() => setModalTarget(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
