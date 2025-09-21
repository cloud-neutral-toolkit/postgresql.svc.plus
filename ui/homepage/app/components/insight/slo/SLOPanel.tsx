'use client'

import { useState } from 'react'
import { InsightState } from '../../insight/store/urlState'
import { AlertWizard } from './AlertWizard'

const templates = [
  {
    name: 'web-availability',
    title: 'Web availability ≥ 99.9%',
    description: 'Ensure HTTP success rate stays above 99.9% over 30 days.',
    condition: 'avg_over_time(up{job="web"}[30d]) < 0.999'
  },
  {
    name: 'latency-p95',
    title: 'P95 latency < 300ms',
    description: 'Track 95th percentile latency for checkout endpoint.',
    condition: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m]))) > 0.3'
  },
  {
    name: 'error-rate',
    title: 'Error rate < 1%',
    description: 'Alert when error ratio crosses 1% for critical services.',
    condition: 'sum(rate(http_requests_total{code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01'
  }
]

interface SLOPanelProps {
  state: InsightState
}

export function SLOPanel({ state }: SLOPanelProps) {
  const [selected, setSelected] = useState<typeof templates[number] | null>(null)

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">SLO templates</h3>
        <p className="text-xs text-slate-400">Align observability with product expectations. ({state.env} / {state.region})</p>
      </div>
      <div className="space-y-3">
        {templates.map(template => (
          <button
            key={template.name}
            onClick={() => setSelected(template)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-left transition hover:border-emerald-500/60"
          >
            <p className="text-sm font-medium text-slate-200">{template.title}</p>
            <p className="text-xs text-slate-400">{template.description}</p>
          </button>
        ))}
      </div>
      {selected && <AlertWizard template={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
