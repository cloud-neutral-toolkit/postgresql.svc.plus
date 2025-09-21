'use client'

import { InsightState } from '../../insight/store/urlState'
import { formatDuration } from '@lib/format'

interface TimeRangePickerProps {
  state: InsightState
  updateState: (partial: Partial<InsightState>) => void
}

const ranges = ['15m', '1h', '6h', '24h', '7d']

export function TimeRangePicker({ state, updateState }: TimeRangePickerProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 shadow-inner">
      <span className="text-xs uppercase tracking-wide text-slate-500">Time Range</span>
      <select
        value={state.timeRange}
        onChange={event => updateState({ timeRange: event.target.value })}
        className="bg-transparent focus:outline-none text-sm font-medium"
      >
        {ranges.map(range => (
          <option key={range} value={range} className="bg-slate-900">
            {formatDuration(range)}
          </option>
        ))}
        <option value="custom" className="bg-slate-900">
          Custom window
        </option>
      </select>
    </div>
  )
}
