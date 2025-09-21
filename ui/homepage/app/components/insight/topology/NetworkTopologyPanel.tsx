'use client'

import { useMemo, useState } from 'react'

import { InsightState } from '../../insight/store/urlState'
import { TopologyCanvas } from './TopologyCanvas'

interface NetworkTopologyPanelProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
}

const orgOptions = ['global-org', 'ecommerce', 'payments']
const projectOptions = ['observability', 'checkout', 'growth']
const envOptions = ['production', 'staging', 'dev']
const regionOptions = ['us-west-2', 'eu-central-1', 'ap-southeast-1']
const timeRanges = ['15m', '1h', '6h', '24h', '7d']

export function NetworkTopologyPanel({ state, updateState }: NetworkTopologyPanelProps) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)

  const subtitle = useMemo(
    () => `${state.env} · ${state.region} · ${state.org}/${state.project}`,
    [state.env, state.org, state.project, state.region]
  )

  return (
    <section
      id="topology"
      className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20"
    >
      <header className="panel-drag-handle flex flex-wrap items-start gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-200">Network topology</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => setFiltersCollapsed(prev => !prev)}
            className="rounded-xl border border-slate-800 px-3 py-1 transition hover:border-slate-700 hover:text-slate-100"
          >
            {filtersCollapsed ? 'Expand filters' : 'Collapse filters'}
          </button>
          <button
            type="button"
            onClick={() => updateState({ topologyMode: 'network' })}
            className="rounded-xl border border-emerald-600/50 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-200 shadow-inner shadow-emerald-500/20 transition hover:border-emerald-400/70"
          >
            Focus network
          </button>
        </div>
      </header>

      <div className="mt-4 grid gap-3 text-xs text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField label="Org" value={state.org} onChange={value => updateState({ org: value })} options={orgOptions} />
        <SelectField
          label="Project"
          value={state.project}
          onChange={value => updateState({ project: value })}
          options={projectOptions}
        />
        <SelectField label="Environment" value={state.env} onChange={value => updateState({ env: value })} options={envOptions} />
        <SelectField label="Region" value={state.region} onChange={value => updateState({ region: value })} options={regionOptions} />
        <TimeRangeControls value={state.timeRange} onChange={value => updateState({ timeRange: value })} />
      </div>

      {!filtersCollapsed && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
          <TextField
            label="Namespace"
            value={state.namespace}
            placeholder="default"
            onChange={value => updateState({ namespace: value })}
          />
          <TextField
            label="Service"
            value={state.service}
            placeholder="all services"
            onChange={value => updateState({ service: value })}
          />
          <TextField
            label="Time window"
            value={state.timeRange}
            placeholder="1h"
            onChange={value => updateState({ timeRange: value })}
          />
        </div>
      )}

      <div className="mt-5 flex-1 overflow-hidden">
        <TopologyCanvas state={state} updateState={updateState} />
      </div>
    </section>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
      >
        {options.map(option => (
          <option key={option} value={option} className="bg-slate-900 text-slate-200">
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

interface TimeRangeControlsProps {
  value: string
  onChange: (value: string) => void
}

function TimeRangeControls({ value, onChange }: TimeRangeControlsProps) {
  return (
    <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">Time range</span>
      <div className="flex flex-wrap items-center gap-2">
        {timeRanges.map(range => (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            className={`rounded-xl px-3 py-1 text-xs font-medium transition ${
              value === range
                ? 'bg-emerald-500/20 text-emerald-200'
                : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
            }`}
          >
            {range}
          </button>
        ))}
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          className="w-32 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-200"
          placeholder="Custom"
        />
      </div>
    </label>
  )
}

interface TextFieldProps {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm text-slate-200 focus:outline-none"
      />
    </label>
  )
}
