'use client'

import { useCallback, useMemo, useState } from 'react'
import { Sidebar } from '../components/insight/layout/Sidebar'
import { TopBar } from '../components/insight/layout/TopBar'
import { BreadcrumbBar } from '../components/insight/layout/BreadcrumbBar'
import { TimeRangePicker } from '../components/insight/layout/TimeRangePicker'
import { TopologyStrip } from '../components/insight/topology/TopologyStrip'
import { TopologyCanvas } from '../components/insight/topology/TopologyCanvas'
import { ExploreBuilder } from '../components/insight/explore/ExploreBuilder'
import { VizArea } from '../components/insight/viz/VizArea'
import { SLOPanel } from '../components/insight/slo/SLOPanel'
import { SnippetLibrary } from '../components/insight/snippets/SnippetLibrary'
import { AIAssistant } from '../components/insight/ai/Assistant'
import { useInsightState } from '../components/insight/store/useInsightState'
import { DataSource } from '../components/insight/store/urlState'

export default function InsightWorkbench() {
  const { state, updateState, shareableLink } = useInsightState()
  const [activeSection, setActiveSection] = useState('topology')
  const [history, setHistory] = useState<string[]>([])
  const [resultData, setResultData] = useState<any>([])

  const handleSelectSection = useCallback((section: string) => {
    setActiveSection(section)
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const snippetInsert = useCallback(
    (query: string, domain: DataSource) => {
      updateState({
        query,
        dataSource: domain,
        queryLanguage: domain === 'metrics' ? 'promql' : domain === 'logs' ? 'logql' : 'traceql'
      })
    },
    [updateState]
  )

  const mainActions = useMemo(
    () => <TimeRangePicker state={state} updateState={updateState} />,
    [state, updateState]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <Sidebar
          topologyMode={state.topologyMode}
          dataSource={state.dataSource}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
        />
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <TopBar
                breadcrumb={<BreadcrumbBar state={state} updateState={updateState} shareableLink={shareableLink} />}
                actions={mainActions}
              />
              <section id="topology" className="space-y-4">
                <TopologyStrip state={state} updateState={updateState} />
                <TopologyCanvas state={state} updateState={updateState} />
              </section>
              <section id="explore">
                <ExploreBuilder
                  state={state}
                  updateState={updateState}
                  history={history}
                  setHistory={setHistory}
                  onResults={setResultData}
                />
              </section>
              <section id="visualize">
                <VizArea state={state} data={resultData} onUpdate={updateState} />
              </section>
            </div>
            <aside className="space-y-6">
              <section id="slo">
                <SLOPanel state={state} />
              </section>
              <section>
                <SnippetLibrary state={state} onInsert={snippetInsert} />
              </section>
              <section id="ai">
                <AIAssistant state={state} />
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
