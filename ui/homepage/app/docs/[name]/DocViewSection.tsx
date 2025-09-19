'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, FileText, Monitor } from 'lucide-react'

export type ViewMode = 'pdf' | 'html'

export interface DocViewOption {
  id: ViewMode
  label: string
  description: string
  url: string
  icon: ViewMode
}

const ICON_MAP: Record<ViewMode, typeof FileText> = {
  pdf: FileText,
  html: Monitor,
}

interface DocViewSectionProps {
  docTitle: string
  options: DocViewOption[]
}

export default function DocViewSection({ docTitle, options }: DocViewSectionProps) {
  const [activeId, setActiveId] = useState<ViewMode | undefined>(options[0]?.id)

  const activeView = useMemo(() => {
    if (!options.length) return undefined
    return options.find((option) => option.id === activeId) ?? options[0]
  }, [options, activeId])

  const ActiveIcon = activeView ? ICON_MAP[activeView.icon] : undefined

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        {options.length > 0 && (
          <div className="mt-0 grid gap-3 sm:grid-cols-2">
            {options.map((view) => {
              const isActive = activeView?.id === view.id
              const Icon = ICON_MAP[view.icon]
              const optionClassName = [
                'flex items-start gap-3 rounded-2xl border p-4 text-left transition hover:border-purple-400 hover:shadow',
                isActive ? 'border-purple-500 bg-purple-50/60 shadow' : 'border-gray-200',
              ].join(' ')
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveId(view.id)}
                  className={optionClassName}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="space-y-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      {view.label}
                      {isActive && <span className="text-xs font-medium text-purple-600">Selected</span>}
                    </span>
                    <span className="text-xs text-gray-600">{view.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {activeView && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-medium text-purple-700">
              {ActiveIcon && <ActiveIcon className="h-4 w-4 text-purple-600" />}
              <span className="text-purple-700">{activeView.label} view selected</span>
            </span>
            <a
              href={activeView.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600"
            >
              <ExternalLink className="h-4 w-4" /> Open in new tab
            </a>
          </div>
        )}
      </div>

      {activeView ? (
        <iframe
          key={activeView.id}
          src={activeView.url}
          className="h-[80vh] w-full"
          title={`${docTitle} (${activeView.label})`}
        />
      ) : (
        <div className="p-10 text-center text-gray-500">
          This resource does not provide an embeddable format yet. Use the download buttons above instead.
        </div>
      )}
    </section>
  )
}
