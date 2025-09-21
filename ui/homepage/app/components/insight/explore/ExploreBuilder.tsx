'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchPromQL } from '../../insight/services/adapters/prometheus'
import { fetchLogs } from '../../insight/services/adapters/logs'
import { fetchTraces } from '../../insight/services/adapters/traces'
import { DataSource, InsightState, QueryLanguage } from '../../insight/store/urlState'
import { QueryChips } from '@components/common/QueryChips'
import { QueryHistoryPanel } from '@components/common/QueryHistoryPanel'

interface ExploreBuilderProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
  history: Record<QueryLanguage, string[]>
  setHistory: (language: QueryLanguage, next: string[]) => void
  onResults: (language: QueryLanguage, data: any) => void
}

const languageMeta: Record<
  QueryLanguage,
  { label: string; description: string; dataSource: DataSource; placeholder: string }
> = {
  promql: {
    label: 'PromQL Explorer',
    description: 'Build metrics queries for service SLOs and alerts.',
    dataSource: 'metrics',
    placeholder: 'sum(rate(http_requests_total{job="api"}[5m]))'
  },
  logql: {
    label: 'LogQL Explorer',
    description: 'Stream and filter structured application logs.',
    dataSource: 'logs',
    placeholder: '{service="checkout"} |= "error"'
  },
  traceql: {
    label: 'TraceQL Explorer',
    description: 'Slice and dice distributed tracing data.',
    dataSource: 'traces',
    placeholder: 'traces{service="checkout"} | duration > 250ms'
  }
}

const defaultRecord = <T,>(value: T): Record<QueryLanguage, T> => ({
  promql: value,
  logql: value,
  traceql: value
})

export function ExploreBuilder({ state, updateState, history, setHistory, onResults }: ExploreBuilderProps) {
  const [chipsMap, setChipsMap] = useState<Record<QueryLanguage, string[]>>(defaultRecord<string[]>([]))
  const [runningMap, setRunningMap] = useState<Record<QueryLanguage, boolean>>(defaultRecord<boolean>(false))
  const [messageMap, setMessageMap] = useState<Record<QueryLanguage, string>>(defaultRecord<string>(''))
  const [collapsedMap, setCollapsedMap] = useState<Record<QueryLanguage, boolean>>(defaultRecord<boolean>(false))

  useEffect(() => {
    if (!state.service) return
    setChipsMap(prev => {
      const serviceChip = `service="${state.service}"`
      const next: Record<QueryLanguage, string[]> = { ...prev }
      state.activeLanguages.forEach(language => {
        if (!next[language]) {
          next[language] = []
        }
        if (!next[language].includes(serviceChip)) {
          next[language] = [...next[language], serviceChip]
        }
      })
      return next
    })
  }, [state.service, state.activeLanguages])

  const activePanels = useMemo(() => state.activeLanguages, [state.activeLanguages])

  async function runQuery(language: QueryLanguage) {
    const query = state.queries[language] || ''
    if (!query) return
    const meta = languageMeta[language]
    setRunningMap(prev => ({ ...prev, [language]: true }))
    setMessageMap(prev => ({ ...prev, [language]: '' }))
    try {
      let result: any
      if (meta.dataSource === 'metrics') {
        result = await fetchPromQL(query)
      } else if (meta.dataSource === 'logs') {
        result = await fetchLogs(query)
      } else {
        result = await fetchTraces(query)
      }
      onResults(language, result)
      const nextHistory = [query, ...(history[language] || []).filter(item => item !== query)].slice(0, 15)
      setHistory(language, nextHistory)
      setMessageMap(prev => ({ ...prev, [language]: 'Query executed successfully' }))
    } catch (err) {
      console.error(err)
      setMessageMap(prev => ({ ...prev, [language]: 'Query failed. Please try again later.' }))
    } finally {
      setRunningMap(prev => ({ ...prev, [language]: false }))
    }
  }

  function removeChip(language: QueryLanguage, label: string) {
    setChipsMap(prev => ({
      ...prev,
      [language]: (prev[language] || []).filter(item => item !== label)
    }))
  }

  function toggleMode() {
    updateState({ builderMode: state.builderMode === 'visual' ? 'code' : 'visual' })
  }

  function handleQueryChange(language: QueryLanguage, value: string) {
    const dataSource = languageMeta[language].dataSource
    updateState({
      queries: { ...state.queries, [language]: value },
      queryLanguage: language,
      dataSource,
      activeLanguages: Array.from(new Set([...state.activeLanguages, language]))
    })
  }

  function handleHistoryInsert(language: QueryLanguage, query: string) {
    handleQueryChange(language, query)
  }

  function handleCollapse(language: QueryLanguage) {
    setCollapsedMap(prev => ({ ...prev, [language]: !prev[language] }))
  }

  if (activePanels.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
        Select a query language from the navigation to start exploring data.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activePanels.map(language => {
        const meta = languageMeta[language]
        const chips = chipsMap[language] || []
        const historyItems = history[language] || []
        const isCollapsed = collapsedMap[language]

        return (
          <section key={language} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
            <header className="flex flex-wrap items-start gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{meta.label}</h3>
                <p className="text-xs text-slate-400">{meta.description}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                <button onClick={() => handleCollapse(language)} className="rounded-xl border border-slate-700 px-3 py-1 hover:bg-slate-800">
                  {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
                <button onClick={toggleMode} className="rounded-xl border border-slate-700 px-3 py-1 hover:bg-slate-800">
                  {state.builderMode === 'visual' ? 'Switch to code' : 'Switch to visual'}
                </button>
              </div>
            </header>
            {!isCollapsed && (
              <div className="mt-4 space-y-4">
                {state.builderMode === 'visual' ? (
                  <div className="space-y-3">
                    <QueryChips labels={chips} onRemove={label => removeChip(language, label)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs text-slate-400">
                        Aggregation
                        <select className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                          <option>sum</option>
                          <option>avg</option>
                          <option>max</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs text-slate-400">
                        Window
                        <select className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                          <option>5m</option>
                          <option>15m</option>
                          <option>1h</option>
                        </select>
                      </label>
                    </div>
                    <textarea
                      value={state.queries[language] || ''}
                      onChange={event => handleQueryChange(language, event.target.value)}
                      placeholder={meta.placeholder}
                      className="h-32 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200 shadow-inner"
                    />
                  </div>
                ) : (
                  <textarea
                    value={state.queries[language] || ''}
                    onChange={event => handleQueryChange(language, event.target.value)}
                    placeholder={meta.placeholder}
                    className="h-48 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-3 font-mono text-sm text-slate-200 shadow-inner"
                  />
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => runQuery(language)}
                    disabled={runningMap[language]}
                    className="rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg disabled:opacity-50"
                  >
                    {runningMap[language] ? 'Running…' : 'Run query'}
                  </button>
                  <button
                    onClick={() => {
                      const query = state.queries[language] || meta.placeholder
                      const unique = [query, ...historyItems.filter(item => item !== query)].slice(0, 15)
                      setHistory(language, unique)
                    }}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Save to history
                  </button>
                  {messageMap[language] && <span className="text-xs text-slate-400">{messageMap[language]}</span>}
                </div>
                <QueryHistoryPanel
                  history={historyItems}
                  onInsert={query => handleHistoryInsert(language, query)}
                  onClear={() => setHistory(language, [])}
                />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
