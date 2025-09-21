'use client'

import { InsightState, TopologyMode } from '../../insight/store/urlState'

interface TopologyStripProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
}

const modes: { id: TopologyMode; label: string; description: string }[] = [
  { id: 'application', label: 'Application', description: 'Services and dependencies' },
  { id: 'network', label: 'Network', description: 'Gateways, meshes and edges' },
  { id: 'resource', label: 'Resource', description: 'Nodes, pods and workloads' }
]

export function TopologyStrip({ state, updateState }: TopologyStripProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-lg shadow-slate-950/20">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Topology Modes</h2>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">{state.env} · {state.region}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => updateState({ topologyMode: mode.id })}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              state.topologyMode === mode.id
                ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-200 shadow-inner'
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <p className="text-sm font-medium">{mode.label}</p>
            <p className="text-xs text-slate-400">{mode.description}</p>
          </button>
        ))}
      </div>
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
      </div>
    </div>
  )
}
