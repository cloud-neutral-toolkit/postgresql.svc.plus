'use client'

import { QueryLanguage, TopologyMode } from '../../insight/store/urlState'

interface SidebarProps {
  topologyMode: TopologyMode
  activeLanguages: QueryLanguage[]
  onSelectSection: (section: string) => void
  onTopologyChange: (mode: TopologyMode) => void
  onToggleLanguage: (language: QueryLanguage) => void
  activeSection: string
}

const sections = [
  { id: 'topology', label: 'Topology' },
  { id: 'explore', label: 'Explore' },
  { id: 'visualize', label: 'Visualize' },
  { id: 'slo', label: 'SLO & Alerts' },
  { id: 'ai', label: 'AI Assistant' }
]

const topologyOptions: { id: TopologyMode; label: string; hint: string }[] = [
  { id: 'application', label: 'Application', hint: 'Services and dependencies' },
  { id: 'network', label: 'Network', hint: 'Gateways, meshes and edges' },
  { id: 'resource', label: 'Resource', hint: 'Clusters, nodes and workloads' }
]

const languageOptions: { id: QueryLanguage; label: string; description: string }[] = [
  { id: 'promql', label: 'PromQL', description: 'Metrics analytics' },
  { id: 'logql', label: 'LogQL', description: 'Log navigation' },
  { id: 'traceql', label: 'TraceQL', description: 'Trace exploration' }
]

export function Sidebar({
  topologyMode,
  activeLanguages,
  activeSection,
  onSelectSection,
  onTopologyChange,
  onToggleLanguage
}: SidebarProps) {
  return (
    <aside className="w-full bg-slate-900/70 backdrop-blur lg:w-72 xl:w-80 border-r border-slate-800 px-4 py-6 space-y-7">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold text-slate-100">Insight Workbench</h1>
        <p className="text-sm text-slate-400">
          Navigate topology, run cross-domain queries and keep SLOs on track.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
          Topology mode
          <div className="relative">
            <select
              value={topologyMode}
              onChange={event => onTopologyChange(event.target.value as TopologyMode)}
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
            >
              {topologyOptions.map(option => (
                <option key={option.id} value={option.id} className="bg-slate-900 text-slate-200">
                  {option.label} · {option.hint}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">⌄</span>
          </div>
        </label>
        <p className="text-xs text-slate-400">
          Choose the focus for the topology map and SLO templates.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Query domains</p>
        <p className="mt-1 text-xs text-slate-500">Select one or more languages to open stacked explorers.</p>
        <div className="mt-3 space-y-2">
          {languageOptions.map(option => {
            const active = activeLanguages.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => onToggleLanguage(option.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  active
                    ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-slate-400">{option.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      <nav className="space-y-1">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
              activeSection === section.id
                ? 'bg-slate-800 text-slate-100 shadow-inner shadow-slate-800/60'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 p-4 shadow-inner border border-slate-800">
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Active explorers</p>
        <ul className="space-y-1 text-sm text-slate-300">
          {activeLanguages.map(language => (
            <li key={language} className="flex items-center justify-between">
              <span>{languageLabels[language]}</span>
              <span className="text-xs text-slate-500">QL</span>
            </li>
          ))}
          {activeLanguages.length === 0 && <li className="text-xs text-slate-500">No languages selected.</li>}
        </ul>
      </div>
    </aside>
  )
}

const languageLabels: Record<QueryLanguage, string> = {
  promql: 'Prometheus metrics',
  logql: 'Log stream',
  traceql: 'Distributed traces'
}
