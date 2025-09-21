'use client'

import { useCallback, useState } from 'react'
import { Sidebar } from '../components/insight/layout/Sidebar'
import { TopBar } from '../components/insight/layout/TopBar'
import { TopologyStrip } from '../components/insight/topology/TopologyStrip'
import { TopologyCanvas } from '../components/insight/topology/TopologyCanvas'
import { ExploreBuilder } from '../components/insight/explore/ExploreBuilder'
import { VizArea } from '../components/insight/viz/VizArea'
import { SLOPanel } from '../components/insight/slo/SLOPanel'
import { SnippetLibrary } from '../components/insight/snippets/SnippetLibrary'
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

  const handleSelectSection = useCallback((section: string) => {
    setActiveSection(section)
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const snippetInsert = useCallback(
    (query: string, domain: DataSource) => {
      const language: QueryLanguage = domain === 'metrics' ? 'promql' : domain === 'logs' ? 'logql' : 'traceql'
      const nextActive = Array.from(new Set([...state.activeLanguages, language]))
      updateState({
        queries: { ...state.queries, [language]: query },
        dataSource: domain,
        queryLanguage: language,
        activeLanguages: nextActive
      })
    },
    [state.activeLanguages, state.queries, updateState]
  )

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <Sidebar
          topologyMode={state.topologyMode}
          activeLanguages={state.activeLanguages}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onTopologyChange={mode => updateState({ topologyMode: mode })}
          onToggleLanguage={toggleLanguage}
        />
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
