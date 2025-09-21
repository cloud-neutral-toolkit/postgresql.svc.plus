'use client'

import { InsightState } from '../../insight/store/urlState'
import { BreadcrumbBar } from './BreadcrumbBar'

interface WorkspaceHeaderProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
  shareableLink: string
  onSaveLayout: () => void
  onResetLayout: () => void
  layoutDirty: boolean
  statusMessage?: string | null
}

export function WorkspaceHeader({
  state,
  updateState,
  shareableLink,
  onSaveLayout,
  onResetLayout,
  layoutDirty,
  statusMessage
}: WorkspaceHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 shadow-lg shadow-slate-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <BreadcrumbBar state={state} updateState={updateState} shareableLink={shareableLink} />
          <p className="text-xs text-slate-400">
            Drag any panel handle to reorganize the workspace. Saved layouts stay local to your browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSaveLayout}
            disabled={!layoutDirty}
            className={`rounded-xl px-3 py-2 font-medium transition ${
              layoutDirty
                ? 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/80'
                : 'border border-slate-800 bg-slate-900/70 text-slate-500'
            }`}
          >
            Save layout
          </button>
          <button
            type="button"
            onClick={onResetLayout}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 font-medium text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
          >
            Reset to default
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          Shareable link:{' '}
          <span className="text-slate-200">{shareableLink || 'State syncs in the URL hash for collaboration.'}</span>
        </span>
        {statusMessage ? (
          <span className="text-emerald-300">{statusMessage}</span>
        ) : (
          <span>Changes you save apply only to this device.</span>
        )}
      </div>
    </header>
  )
}
