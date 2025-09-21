'use client'

import { useEffect, useState } from 'react'
import { fetchPromQL } from '../../insight/services/adapters/prometheus'
import { fetchLogs } from '../../insight/services/adapters/logs'
import { fetchTraces } from '../../insight/services/adapters/traces'
import { InsightState } from '../../insight/store/urlState'
import { QueryChips } from '@components/common/QueryChips'
import { QueryHistoryPanel } from '@components/common/QueryHistoryPanel'

interface ExploreBuilderProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
  history: string[]
  setHistory: (history: string[]) => void
  onResults: (data: any) => void
}

const dataSources = [
  { id: 'metrics', label: 'Prometheus', language: 'promql' as const },
  { id: 'logs', label: 'Logs', language: 'logql' as const },
  { id: 'traces', label: 'Traces', language: 'traceql' as const }
]

export function ExploreBuilder({ state, updateState, history, setHistory, onResults }: ExploreBuilderProps) {
  const [chips, setChips] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (state.service && !chips.includes(`service="${state.service}"`)) {
      setChips(prev => [...prev, `service="${state.service}"`])
    }
  }, [state.service, chips])

  async function runQuery() {
    setIsRunning(true)
    setMessage('')
    try {
      let result: any
      if (state.dataSource === 'metrics') {
        result = await fetchPromQL(state.query)
      } else if (state.dataSource === 'logs') {
        result = await fetchLogs(state.query)
      } else {
        result = await fetchTraces(state.query)
      }
      onResults(result)
      const nextHistory = [state.query, ...history.filter(item => item !== state.query)].slice(0, 15)
      setHistory(nextHistory)
      setMessage('Query executed successfully')
    } catch (err) {
      console.error(err)
      setMessage('Query failed. Please try again later.')
    } finally {
      setIsRunning(false)
    }
  }

  function removeChip(label: string) {
    setChips(prev => prev.filter(item => item !== label))
  }

  function toggleMode() {
    updateState({ builderMode: state.builderMode === 'visual' ? 'code' : 'visual' })
  }

  function handleInsert(query: string) {
    updateState({ query })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
        <div className="flex flex-wrap items-center gap-2">
          {dataSources.map(source => (
            <button
              key={source.id}
              onClick={() =>
                updateState({
                  dataSource: source.id,
                  queryLanguage: source.language,
                  query: state.query,
                  builderMode: state.builderMode
                })
              }
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                state.dataSource === source.id
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/60'
                  : 'bg-slate-950/50 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {source.label}
            </button>
          ))}
          <span className="ml-auto text-xs uppercase tracking-wide text-slate-500">{state.queryLanguage}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">{state.builderMode === 'visual' ? 'Visual Builder' : 'Code Editor'}</h3>
          <button onClick={toggleMode} className="text-xs text-emerald-300 hover:text-emerald-200">
            Switch to {state.builderMode === 'visual' ? 'code' : 'visual'} mode
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {state.builderMode === 'visual' ? (
            <div className="space-y-3">
              <QueryChips labels={chips} onRemove={removeChip} />
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
                value={state.query}
                onChange={event => updateState({ query: event.target.value })}
                className="h-32 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200 shadow-inner"
              />
            </div>
          ) : (
            <textarea
              value={state.query}
              onChange={event => updateState({ query: event.target.value })}
              className="h-48 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-3 font-mono text-sm text-slate-200 shadow-inner"
            />
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={runQuery}
            disabled={isRunning}
            className="rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg disabled:opacity-50"
          >
            {isRunning ? 'Running…' : 'Run query'}
          </button>
          <button
            onClick={() => setHistory([state.query, ...history])}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            Save as snippet
          </button>
          {message && <span className="text-xs text-slate-400">{message}</span>}
        </div>
      </div>
      <QueryHistoryPanel history={history} onInsert={handleInsert} onClear={() => setHistory([])} />
    </div>
  )
}
