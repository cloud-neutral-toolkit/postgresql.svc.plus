'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { ArrowUpRight } from 'lucide-react'

import ClientTime from '../components/ClientTime'
import type { DocCollection, DocVersionOption } from './resources'

interface DocCollectionCardProps {
  collection: DocCollection
  meta?: string
}

function resolveVersionLabel(version?: DocVersionOption | null) {
  return version?.label ?? 'Latest'
}

export default function DocCollectionCard({ collection, meta }: DocCollectionCardProps) {
  const { versions } = collection
  const defaultVersionId = collection.defaultVersionId ?? versions[0]?.id ?? ''
  const [selectedVersionId, setSelectedVersionId] = useState(defaultVersionId)

  useEffect(() => {
    if (!defaultVersionId) {
      return
    }
    setSelectedVersionId(defaultVersionId)
  }, [defaultVersionId, collection.slug])

  useEffect(() => {
    if (!versions.length) {
      return
    }
    if (!versions.some((version) => version.id === selectedVersionId)) {
      const fallback = versions.find((version) => version.id === defaultVersionId) ?? versions[0]
      if (fallback) {
        setSelectedVersionId(fallback.id)
      }
    }
  }, [versions, selectedVersionId, defaultVersionId])

  const activeVersion = useMemo(() => {
    if (!versions.length) return undefined
    return versions.find((version) => version.id === selectedVersionId) ?? versions[0]
  }, [versions, selectedVersionId])

  const activeResource = activeVersion?.resource
  const description = activeResource?.description ?? collection.description
  const href = activeVersion ? `/docs/${collection.slug}/${activeVersion.slug}` : `/docs/${collection.slug}`
  const updatedAt = activeResource?.updatedAt ?? collection.updatedAt
  const estimatedMinutes = activeResource?.estimatedMinutes ?? collection.estimatedMinutes
  const tags = activeResource?.tags?.length ? activeResource.tags : collection.tags

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
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
            {updatedAt && (
              <span suppressHydrationWarning>
                Updated <ClientTime isoString={updatedAt} />
              </span>
            )}
            {estimatedMinutes && <span>{estimatedMinutes} min read</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 transition group-hover:text-purple-700">{collection.title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {versions.length > 0 && (
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Version</span>
            <select
              value={selectedVersionId}
              onChange={(event) => setSelectedVersionId(event.target.value)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-sm font-medium text-purple-600">
          <div className="flex flex-col">
            <span>Open reader</span>
            {activeVersion && (
              <span className="text-xs text-gray-500">{resolveVersionLabel(activeVersion)}</span>
            )}
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-transparent bg-purple-50 px-3 py-1 text-purple-700 transition hover:border-purple-200 hover:bg-white"
          >
            <span>Open</span>
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
