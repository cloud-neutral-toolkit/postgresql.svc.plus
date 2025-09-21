'use client'

import { useState } from 'react'
import { InsightState } from '../../insight/store/urlState'
import { AskAIDialog } from '../../../../components/AskAIDialog'

const quickActions = [
  { id: 'explain', label: 'Explain anomaly', prompt: 'Explain the recent anomaly in my metrics.' },
  { id: 'logs', label: 'Fetch related logs', prompt: 'Show me logs correlated with the current filters.' },
  { id: 'rca', label: 'Root cause analysis', prompt: 'Run an RCA for the checkout service using metrics, logs and traces.' },
  { id: 'alert', label: 'Draft alert', prompt: 'Generate an alert rule for p95 latency over 300ms.' },
  { id: 'report', label: 'Incident report', prompt: 'Create a short incident report for the last hour.' }
]

interface AssistantProps {
  state: InsightState
}

export function AIAssistant({ state }: AssistantProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState('')
  const [history, setHistory] = useState<{ question: string; timestamp: number }[]>([])

  function openWithPrompt(prompt: string) {
    const enriched = `${prompt}\nContext: org=${state.org}, project=${state.project}, env=${state.env}, region=${state.region}, timeRange=${state.timeRange}, service=${state.service || 'all'}`
    setPendingPrompt(enriched)
    setDialogOpen(true)
    setHistory(prev => [{ question: prompt, timestamp: Date.now() }, ...prev].slice(0, 10))
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">AI Assistant</h3>
        <p className="text-xs text-slate-400">Uses AskAI with observability context to accelerate investigations.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => openWithPrompt(action.prompt)}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-emerald-500/60"
          >
            {action.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Current context</p>
        <ul className="mt-2 space-y-1">
          <li>Org · Project: <span className="text-slate-100">{state.org} / {state.project}</span></li>
          <li>Environment: <span className="text-slate-100">{state.env}</span> · Region: <span className="text-slate-100">{state.region}</span></li>
          <li>Topology focus: <span className="text-slate-100">{state.topologyMode}</span> · Service filter: <span className="text-slate-100">{state.service || 'all'}</span></li>
          <li>Data source: <span className="text-slate-100">{state.dataSource}</span> · Time: <span className="text-slate-100">{state.timeRange}</span></li>
        </ul>
      </div>
      <div className="space-y-2 text-xs text-slate-300">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Recent questions</p>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500">Use the quick actions above or ask your own question.</p>
        ) : (
          <ul className="space-y-1">
            {history.map(item => (
              <li key={item.timestamp} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                <span className="text-slate-200">{item.question}</span>
                <span className="text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => openWithPrompt('Help me explore the current observability context.')}
        className="w-full rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-emerald-950"
      >
        Ask AI
      </button>
      <AskAIDialog
        open={dialogOpen}
        apiBase=""
        onMinimize={() => setDialogOpen(false)}
        onEnd={() => setDialogOpen(false)}
        key={pendingPrompt}
      />
      {dialogOpen && pendingPrompt && (
        <input type="hidden" value={pendingPrompt} aria-hidden />
      )}
    </div>
  )
}
