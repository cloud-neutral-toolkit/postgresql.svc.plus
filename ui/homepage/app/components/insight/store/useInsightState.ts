'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_INSIGHT_STATE,
  InsightState,
  serializeInsightState,
  deserializeInsightState
} from './urlState'

export function useInsightState() {
  const [state, setState] = useState<InsightState>(DEFAULT_INSIGHT_STATE)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const initial = deserializeInsightState(window.location.hash)
    setState(initial)

    const handleHashChange = () => {
      setState(deserializeInsightState(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = serializeInsightState(state)
    const currentHash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    if (hash === currentHash) return
    const url = `${window.location.pathname}${hash ? `#${hash}` : ''}`
    window.history.replaceState({}, '', url)
  }, [state])

  const updateState = useCallback((partial: Partial<InsightState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const shareableLink = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const hash = serializeInsightState(state)
    return `${window.location.origin}${window.location.pathname}${hash ? `#${hash}` : ''}`
  }, [state])

  return { state, updateState, shareableLink }
}
