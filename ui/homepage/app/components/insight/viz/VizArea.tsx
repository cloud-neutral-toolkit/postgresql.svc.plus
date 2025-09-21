'use client'

import { ReactNode } from 'react'
import { buildCorrelatedQuery } from '../../insight/services/correlator'
import { DataSource, InsightState } from '../../insight/store/urlState'
import { MetricsChart } from './MetricsChart'
import { LogsViewer } from './LogsViewer'
import { TracesWaterfall } from './TracesWaterfall'

interface VizAreaProps {
  state: InsightState
  data: any
  onUpdate: (partial: Partial<InsightState>) => void
}

export function VizArea({ state, data, onUpdate }: VizAreaProps) {
  const mode = state.dataSource

  function correlate(target: DataSource) {
    const query = buildCorrelatedQuery(target, {
      service: state.service || 'checkout',
      namespace: state.namespace,
      timeRange: state.timeRange
    })
    onUpdate({
      dataSource: target,
      queryLanguage: target === 'metrics' ? 'promql' : target === 'logs' ? 'logql' : 'traceql',
      query
    })
  }

  function renderContent(): ReactNode {
    switch (mode) {
      case 'metrics':
        return <MetricsChart series={Array.isArray(data) ? data : []} />
      case 'logs':
        return <LogsViewer logs={Array.isArray(data) ? data : []} />
      case 'traces':
        return <TracesWaterfall spans={Array.isArray(data) ? data : []} />
      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-200">{modeLabel[mode]}</h3>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-300">
          <button onClick={() => correlate('metrics')} className="rounded-xl border border-slate-800 px-3 py-1 hover:bg-slate-800">
            Link to Metrics
          </button>
          <button onClick={() => correlate('logs')} className="rounded-xl border border-slate-800 px-3 py-1 hover:bg-slate-800">
            Link to Logs
          </button>
          <button onClick={() => correlate('traces')} className="rounded-xl border border-slate-800 px-3 py-1 hover:bg-slate-800">
            Link to Traces
          </button>
          <button className="rounded-xl bg-slate-200/10 px-3 py-1 text-slate-200">Save to dashboard</button>
        </div>
      </div>
      <div className="mt-4 min-h-[240px] rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner">
        {renderContent()}
      </div>
    </div>
  )
}

const modeLabel: Record<DataSource, string> = {
  metrics: 'Metrics visualizations',
  logs: 'Log stream',
  traces: 'Trace waterfall'
}
