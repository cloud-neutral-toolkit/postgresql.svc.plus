'use client'

import { InsightState, QueryInputMode, QueryLanguage } from '../../insight/store/urlState'
import { BreadcrumbBar } from './BreadcrumbBar'

interface TopBarProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
  shareableLink: string
}

const orgOptions = ['global-org', 'ecommerce', 'payments']
const projectOptions = ['observability', 'checkout', 'growth']
const envOptions = ['production', 'staging', 'dev']
const regionOptions = ['us-west-2', 'eu-central-1', 'ap-southeast-1']
const timeRanges = ['15m', '1h', '6h', '24h', '7d']

export function TopBar({ state, updateState, shareableLink }: TopBarProps) {
  const currentQuery = state.queries[state.queryLanguage] || ''

  function switchMode(mode: QueryInputMode) {
    updateState({ queryMode: mode })
  }

  function updateQuery(value: string) {
    updateState({
      queries: { ...state.queries, [state.queryLanguage]: value },
      queryMode: 'ql'
    })
  }

  function setLanguage(language: QueryLanguage) {
    updateState({
      queryLanguage: language,
      dataSource: language === 'promql' ? 'metrics' : language === 'logql' ? 'logs' : 'traces',
      activeLanguages: Array.from(new Set([...state.activeLanguages, language]))
    })
  }

  return (
    <header className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 shadow-lg shadow-slate-950/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <BreadcrumbBar state={state} updateState={updateState} shareableLink={shareableLink} />
          <p className="text-sm text-slate-400">
            Unified global query controls apply across topology, explorers and SLOs.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>Mode:</span>
          <button
            onClick={() => switchMode('ql')}
            className={`rounded-xl px-3 py-1 ${
              state.queryMode === 'ql' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-900 text-slate-400'
            }`}
          >
            QL input
          </button>
          <button
            onClick={() => switchMode('menu')}
            className={`rounded-xl px-3 py-1 ${
              state.queryMode === 'menu' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Menu select
          </button>
        </div>
      </div>

      {state.queryMode === 'ql' ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Active language</span>
            <div className="flex items-center gap-1">
              {(['promql', 'logql', 'traceql'] as QueryLanguage[]).map(language => (
                <button
                  key={language}
                  onClick={() => setLanguage(language)}
                  className={`rounded-xl px-3 py-1 text-xs font-medium transition ${
                    state.queryLanguage === language
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={currentQuery}
            onChange={event => updateQuery(event.target.value)}
            placeholder="Enter a PromQL, LogQL or TraceQL statement to drive the workspace."
            className="h-24 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 font-mono text-sm text-slate-200 shadow-inner"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-200">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Org
            <select
              value={state.org}
              onChange={event => updateState({ org: event.target.value })}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              {orgOptions.map(option => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Project
            <select
              value={state.project}
              onChange={event => updateState({ project: event.target.value })}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              {projectOptions.map(option => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Environment
            <select
              value={state.env}
              onChange={event => updateState({ env: event.target.value })}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              {envOptions.map(option => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Region
            <select
              value={state.region}
              onChange={event => updateState({ region: event.target.value })}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
            >
              {regionOptions.map(option => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400 sm:col-span-2 lg:col-span-4">
            Time range
            <div className="flex flex-wrap items-center gap-2">
              {timeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => updateState({ timeRange: range })}
                  className={`rounded-xl px-3 py-1 text-xs font-medium transition ${
                    state.timeRange === range
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {range}
                </button>
              ))}
              <input
                value={state.timeRange}
                onChange={event => updateState({ timeRange: event.target.value })}
                className="w-32 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-200"
                placeholder="Custom"
              />
            </div>
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          Shareable link:{' '}
          <span className="text-slate-200">
            {shareableLink || 'State syncs in the URL hash for collaboration.'}
          </span>
        </span>
        <span>All changes auto-apply to the entire workspace.</span>
      </div>
    </header>
  )
}
