'use client'

import { DataSource, TopologyMode } from '../../insight/store/urlState'

interface SidebarProps {
  topologyMode: TopologyMode
  dataSource: DataSource
  onSelectSection: (section: string) => void
  activeSection: string
}

const sections = [
  { id: 'topology', label: 'Topology' },
  { id: 'explore', label: 'Explore' },
  { id: 'visualize', label: 'Visualize' },
  { id: 'slo', label: 'SLO & Alerts' },
  { id: 'ai', label: 'AI Assistant' }
]

export function Sidebar({ topologyMode, dataSource, activeSection, onSelectSection }: SidebarProps) {
  return (
    <aside className="w-full lg:w-64 xl:w-72 bg-slate-900/60 backdrop-blur border-r border-slate-800 px-4 py-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Insight Workbench</h1>
        <p className="text-sm text-slate-400">Unified observability for metrics, logs and traces.</p>
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
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Current Modes</p>
        <p className="text-sm text-slate-300">
          Topology focus: <span className="font-medium text-slate-100">{topologyLabels[topologyMode]}</span>
        </p>
        <p className="text-sm text-slate-300">
          Data source: <span className="font-medium text-slate-100">{dataSourceLabels[dataSource]}</span>
        </p>
      </div>
    </aside>
  )
}

const topologyLabels: Record<TopologyMode, string> = {
  application: 'Application',
  network: 'Network',
  resource: 'Resource'
}

const dataSourceLabels: Record<DataSource, string> = {
  metrics: 'Metrics',
  logs: 'Logs',
  traces: 'Traces'
}
