import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { CATALOG, PROVIDERS } from '../dashboard/lib/iac/catalog'
import type { ProviderKey } from '../dashboard/lib/iac/types'
import type { DirListing } from '../dashboard/types/download'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const DASHBOARD_ROOT = path.join(PROJECT_ROOT, 'dashboard')
const OUTPUT_DIR = path.join(DASHBOARD_ROOT, 'public', '_build')

function unique<T>(items: Iterable<T>): T[] {
  return Array.from(new Set(items))
}

function buildCloudIacIndex() {
  const providers = PROVIDERS.map((provider) => ({ key: provider.key, label: provider.label }))

  const services: { provider: ProviderKey; service: string; category: string }[] = []
  for (const category of CATALOG) {
    if (!category.iac) continue
    for (const [provider, integration] of Object.entries(category.iac)) {
      if (!integration || typeof integration.detailSlug !== 'string') continue
      services.push({
        provider: provider as ProviderKey,
        service: integration.detailSlug,
        category: category.key,
      })
    }
  }

  services.sort((a, b) => {
    if (a.provider === b.provider) return a.service.localeCompare(b.service)
    return a.provider.localeCompare(b.provider)
  })

  return { providers, services }
}

async function loadDownloadManifest(): Promise<DirListing[]> {
  const manifestPath = path.join(DASHBOARD_ROOT, 'public', 'dl-index', 'all.json')
  try {
    const raw = await fs.readFile(manifestPath, 'utf8')
    const parsed = JSON.parse(raw) as DirListing[]
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch (error) {
    console.warn('[export-slugs] Unable to read download manifest:', error)
    return []
  }
}

function extractDownloadPaths(listings: DirListing[]): string[] {
  const paths: string[] = []
  for (const listing of listings) {
    if (!listing || typeof listing.path !== 'string') continue
    const trimmed = listing.path.replace(/\/+$/g, '')
    if (trimmed.length > 0) {
      paths.push(trimmed)
    }
  }
  return unique(paths).sort()
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const cloudIacIndex = buildCloudIacIndex()
  const downloadListings = await loadDownloadManifest()
  const downloadPaths = extractDownloadPaths(downloadListings)

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'cloud_iac_index.json'),
    JSON.stringify(cloudIacIndex, null, 2),
    'utf8',
  )

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'docs_paths.json'),
    JSON.stringify(downloadPaths, null, 2),
    'utf8',
  )
}

main().catch((error) => {
  console.error('[export-slugs] failed:', error)
  process.exit(1)
})
