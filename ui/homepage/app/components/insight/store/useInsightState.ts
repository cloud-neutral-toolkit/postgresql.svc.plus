'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_INSIGHT_STATE,
  InsightState,
  serializeInsightState,
  deserializeInsightState
} from './urlState'

function resolveBaseUrl() {
  if (typeof window !== 'undefined') {
    const { origin, pathname } = window.location
    return `${origin}${pathname}`
  }
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    return configured.endsWith('/') ? configured.slice(0, -1) : configured
  }
  return ''
}

export function useInsightState() {
  const [state, setState] = useState<InsightState>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_INSIGHT_STATE
    }
    return deserializeInsightState(window.location.hash)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncFromHash = () => {
      setState(deserializeInsightState(window.location.hash))
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
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
    const hash = serializeInsightState(state)
    const baseUrl = resolveBaseUrl()
    if (!baseUrl) {
      return hash ? `#${hash}` : ''
    }
    return `${baseUrl}${hash ? `#${hash}` : ''}`
  }, [state])

  return { state, updateState, shareableLink }
}
