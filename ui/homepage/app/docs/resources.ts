import 'server-only'

import feature from './feature.config'
import docsIndex from '../../public/_build/docs_index.json'

export interface DocResource {
  slug: string
  title: string
  description: string
  category?: string
  version?: string
  updatedAt?: string
  pdfUrl?: string
  htmlUrl?: string
  tags?: string[]
  estimatedMinutes?: number
  coverImage?: string
  language?: string
  variant?: string
  pathSegments?: string[]
}

interface RawDocResource {
  slug?: unknown
  title?: unknown
  description?: unknown
  category?: unknown
  version?: unknown
  updatedAt?: unknown
  pdfUrl?: unknown
  htmlUrl?: unknown
  tags?: unknown
  estimatedMinutes?: unknown
  coverImage?: unknown
  language?: unknown
  variant?: unknown
  pathSegments?: unknown
}

const RAW_DOCS = Array.isArray(docsIndex) ? (docsIndex as RawDocResource[]) : []

const DOCS_DATASET = RAW_DOCS.map((item) => normalizeResource(item as RawDocResource)).filter(
  (item): item is DocResource => item !== null,
)

function normalizeResource(item: RawDocResource): DocResource | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  const slug = typeof item.slug === 'string' ? item.slug : undefined
  const title = typeof item.title === 'string' ? item.title : undefined
  if (!slug || !title) {
    return null
  }

  const resource: DocResource = {
    slug,
    title,
    description: typeof item.description === 'string' ? item.description : '',
  }

  if (typeof item.category === 'string' && item.category.trim()) {
    resource.category = item.category
  }
  if (typeof item.version === 'string' && item.version.trim()) {
    resource.version = item.version
  }
  if (typeof item.updatedAt === 'string' && item.updatedAt.trim()) {
    resource.updatedAt = item.updatedAt
  }
  if (typeof item.pdfUrl === 'string' && item.pdfUrl.trim()) {
    resource.pdfUrl = item.pdfUrl
  }
  if (typeof item.htmlUrl === 'string' && item.htmlUrl.trim()) {
    resource.htmlUrl = item.htmlUrl
  }
  if (typeof item.language === 'string' && item.language.trim()) {
    resource.language = item.language
  }
  if (typeof item.variant === 'string' && item.variant.trim()) {
    resource.variant = item.variant
  }
  if (typeof item.estimatedMinutes === 'number' && !Number.isNaN(item.estimatedMinutes)) {
    resource.estimatedMinutes = item.estimatedMinutes
  }
  if (typeof item.coverImage === 'string' && item.coverImage.trim()) {
    resource.coverImage = item.coverImage
  }
  if (Array.isArray(item.tags)) {
    const tags = item.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    if (tags.length > 0) {
      resource.tags = [...new Set(tags)]
    }
  }
  if (Array.isArray(item.pathSegments)) {
    const segments = item.pathSegments.filter((segment): segment is string => typeof segment === 'string' && segment.trim().length > 0)
    if (segments.length > 0) {
      resource.pathSegments = segments
    }
  }

  if (!resource.description.trim()) {
    const context: string[] = []
    if (resource.category) {
      context.push(resource.category)
    }
    if (resource.version) {
      context.push(`edition ${resource.version}`)
    } else if (resource.variant) {
      context.push(`release ${resource.variant}`)
    }
    const formats: string[] = []
    if (resource.pdfUrl) formats.push('PDF')
    if (resource.htmlUrl) formats.push('HTML')
    if (formats.length > 0) {
      context.push(`available as ${formats.join(' and ')}`)
    }
    const suffix = context.length > 0 ? ` (${context.join(', ')})` : ''
    resource.description = `${resource.title}${suffix}.`
  }

  return resource
}

export async function getDocResources(): Promise<DocResource[]> {
  if (!feature.enabled) {
    return []
  }

  return DOCS_DATASET
}

export async function getDocResource(slug: string): Promise<DocResource | undefined> {
  if (!feature.enabled) {
    return undefined
  }

  return DOCS_DATASET.find((doc) => doc.slug === slug)
}
