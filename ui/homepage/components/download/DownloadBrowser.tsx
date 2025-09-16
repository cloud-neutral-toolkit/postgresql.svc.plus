"use client"

import { useMemo, useState } from 'react'
import { formatSegmentLabel, type DownloadSection } from '../../lib/download-data'
import CardGrid from './CardGrid'

interface DownloadBrowserProps {
  sectionsMap: Record<string, DownloadSection[]>
}

export default function DownloadBrowser({ sectionsMap }: DownloadBrowserProps) {
  const roots = useMemo(
    () =>
      Object.keys(sectionsMap).sort((a, b) =>
        formatSegmentLabel(a).localeCompare(formatSegmentLabel(b)),
      ),
    [sectionsMap],
  )
  const [current, setCurrent] = useState<string>('all')

  const totalsByRoot = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const root of roots) {
      const entries = sectionsMap[root] ?? []
      const hasChildren = entries.some((section) => section.key !== root)
      totals[root] = hasChildren
        ? entries.filter((section) => section.key !== root).length
        : entries.length
    }
    return totals
  }, [roots, sectionsMap])

  const allSections = useMemo(
    () => roots.flatMap((root) => sectionsMap[root] ?? []),
    [roots, sectionsMap],
  )

  const rawSections = current === 'all' ? allSections : sectionsMap[current] ?? []
  const sections =
    current === 'all'
      ? rawSections
      : rawSections.some((section) => section.key !== current)
        ? rawSections.filter((section) => section.key !== current)
        : rawSections

  const activeLabel = current === 'all' ? 'All downloads' : formatSegmentLabel(current)
  const description =
    current === 'all'
      ? 'Browse the complete catalog of offline packages, releases, and artifacts.'
      : `Showing resources from the ${formatSegmentLabel(current)} collection.`

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-64">
        <div className="sticky top-24 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
          <ul className="mt-4 space-y-1 text-sm">
            <li key="all">
              <button
                type="button"
                onClick={() => setCurrent('all')}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  current === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <span>All resources</span>
                <span className="text-xs text-gray-500">{allSections.length.toLocaleString()}</span>
              </button>
            </li>
            {roots.map((root) => (
              <li key={root}>
                <button
                  type="button"
                  onClick={() => setCurrent(root)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    current === root ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{formatSegmentLabel(root)}</span>
                  <span className="text-xs text-gray-500">{(totalsByRoot[root] ?? 0).toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="flex-1 space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{activeLabel}</h2>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
              {sections.length.toLocaleString()} item{sections.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        {sections.length > 0 ? (
          <CardGrid sections={sections} />
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
            No downloadable resources found for this category yet.
          </div>
        )}
      </section>
    </div>
  )
}
