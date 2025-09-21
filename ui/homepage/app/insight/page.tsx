'use client'

import { useCallback, useState } from 'react'
import { PanelLeftOpen } from 'lucide-react'
import { Sidebar } from '../components/insight/layout/Sidebar'
import { TopBar } from '../components/insight/layout/TopBar'
import { TopologyStrip } from '../components/insight/topology/TopologyStrip'
import { TopologyCanvas } from '../components/insight/topology/TopologyCanvas'
import { ExploreBuilder } from '../components/insight/explore/ExploreBuilder'
import { VizArea } from '../components/insight/viz/VizArea'
import { SLOPanel } from '../components/insight/slo/SLOPanel'
import { AIAssistant } from '../components/insight/ai/Assistant'
import { useInsightState } from '../components/insight/store/useInsightState'
import { DataSource, QueryLanguage } from '../components/insight/store/urlState'

export default function InsightWorkbench() {
  const { state, updateState, shareableLink } = useInsightState()
  const [activeSection, setActiveSection] = useState('topology')
  const [history, setHistory] = useState<Record<QueryLanguage, string[]>>({
    promql: [],
    logql: [],
    traceql: []
  })
  const [resultData, setResultData] = useState<Record<QueryLanguage, any>>({
    promql: [],
    logql: [],
    traceql: []
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(false)

  const handleSelectSection = useCallback((section: string) => {
    setActiveSection(section)
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const updateHistory = useCallback(
    (language: QueryLanguage, items: string[]) => {
      setHistory(prev => ({ ...prev, [language]: items }))
    },
    []
  )

  const updateResults = useCallback((language: QueryLanguage, data: any) => {
    setResultData(prev => ({ ...prev, [language]: data }))
  }, [])

  const toggleLanguage = useCallback(
    (language: QueryLanguage) => {
      const exists = state.activeLanguages.includes(language)
      let nextActive = exists
        ? state.activeLanguages.filter(item => item !== language)
        : [...state.activeLanguages, language]
      if (nextActive.length === 0) {
        nextActive = [language]
      }
      const primary = nextActive[0]
      const nextSource: DataSource = primary === 'promql' ? 'metrics' : primary === 'logql' ? 'logs' : 'traces'
      updateState({
        activeLanguages: nextActive,
        queryLanguage: primary,
        dataSource: nextSource
      })
    },
    [state.activeLanguages, updateState]
  )

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {sidebarHidden && (
        <button
          type="button"
          onClick={() => setSidebarHidden(false)}
          className="fixed left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 shadow-lg backdrop-blur transition hover:border-slate-700 hover:text-slate-100"
        >
          <PanelLeftOpen className="h-4 w-4" />
          Show menu
        </button>
      )}
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        {!sidebarHidden && (
          <Sidebar
            topologyMode={state.topologyMode}
            activeLanguages={state.activeLanguages}
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onTopologyChange={mode => updateState({ topologyMode: mode })}
            onToggleLanguage={toggleLanguage}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            onHide={() => setSidebarHidden(true)}
            collapsed={sidebarCollapsed}
          />
        )}
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <TopBar state={state} updateState={updateState} shareableLink={shareableLink} />
              <section id="topology" className="space-y-4">
                <TopologyStrip state={state} updateState={updateState} />
                <TopologyCanvas state={state} updateState={updateState} />
              </section>
              <section id="explore">
                <ExploreBuilder
                  state={state}
                  updateState={updateState}
                  history={history}
                  setHistory={updateHistory}
                  onResults={updateResults}
                />
              </section>
              <section id="visualize">
                <VizArea state={state} data={resultData[state.queryLanguage]} onUpdate={updateState} />
              </section>
            </div>
            <aside className="space-y-6">
              <section id="slo">
                <SLOPanel state={state} />
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
