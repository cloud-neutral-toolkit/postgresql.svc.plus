'use client'

import { useState } from 'react'

import { InsightState } from '../../insight/store/urlState'

interface TopologyStripProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
}

export function TopologyStrip({ state, updateState }: TopologyStripProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-lg shadow-slate-950/20">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">{modeLabels[state.topologyMode]}</h2>
          <p className="text-xs text-slate-400">
            {state.env} · {state.region} · {state.org}/{state.project}
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          Focused on {modeHighlights[state.topologyMode]}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(prev => !prev)}
          className="rounded-xl border border-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
        >
          {collapsed ? 'Expand filters' : 'Collapse filters'}
        </button>
      </div>
      {!collapsed && (
        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
          <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Namespace</span>
            <input
              type="text"
              value={state.namespace}
              onChange={event => updateState({ namespace: event.target.value })}
              placeholder="default"
              className="bg-transparent focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Service</span>
            <input
              type="text"
              value={state.service}
              onChange={event => updateState({ service: event.target.value })}
              placeholder="all services"
              className="bg-transparent focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Time range</span>
            <input
              type="text"
              value={state.timeRange}
              onChange={event => updateState({ timeRange: event.target.value })}
              placeholder="1h"
              className="bg-transparent focus:outline-none"
            />
          </label>
        </div>
      )}
    </div>
  )
}

const modeLabels: Record<InsightState['topologyMode'], string> = {
  application: 'Application topology',
  network: 'Network topology',
  resource: 'Resource topology'
}

const modeHighlights: Record<InsightState['topologyMode'], string> = {
  application: 'services & dependencies',
  network: 'edges & gateways',
  resource: 'clusters & workloads'
}
