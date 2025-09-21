'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_INSIGHT_STATE,
  InsightState,
  serializeInsightState,
  deserializeInsightState
} from './urlState'

function getSegments(pathname: string): string[] {
  return pathname
    .split('/')
    .map(segment => segment.trim())
    .filter(Boolean)
}

function getBasePath(pathname: string): string {
  const segments = getSegments(pathname)
  const insightIndex = segments.indexOf('insight')
  if (insightIndex === -1) {
    return pathname || '/insight'
  }
  const relevant = segments.slice(0, insightIndex + 1)
  return `/${relevant.join('/')}`
}

function getShareIdFromPath(pathname: string): string {
  const segments = getSegments(pathname)
  const insightIndex = segments.indexOf('insight')
  if (insightIndex === -1) return ''
  return segments[insightIndex + 1] || ''
}

function encodeStateId(value: string): string {
  if (!value) return ''
  const base64 =
    typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(value)
      : Buffer.from(value, 'utf-8').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeStateId(value: string): string | null {
  if (!value) return null
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    const padLength = (4 - (padded.length % 4)) % 4
    const base64 = padded + '='.repeat(padLength)
    return typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob(base64)
      : Buffer.from(base64, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Failed to decode insight share identifier', error)
    return null
  }
}

function resolveBaseUrl() {
  if (typeof window !== 'undefined') {
    const { origin, pathname } = window.location
    const basePath = getBasePath(pathname)
    return `${origin}${basePath}`
  }
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    const normalized = configured.endsWith('/') ? configured.slice(0, -1) : configured
    return normalized.endsWith('/insight') ? normalized : `${normalized}/insight`
  }
  return ''
}

export function useInsightState() {
  const [state, setState] = useState<InsightState>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_INSIGHT_STATE
    }
    const shareId = getShareIdFromPath(window.location.pathname)
    if (shareId) {
      const decoded = decodeStateId(shareId)
      if (decoded) {
        return deserializeInsightState(decoded)
      }
    }
    return deserializeInsightState(window.location.hash)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncFromLocation = () => {
      const shareId = getShareIdFromPath(window.location.pathname)
      if (shareId) {
        const decoded = decodeStateId(shareId)
        if (decoded) {
          setState(deserializeInsightState(decoded))
          return
        }
      }
      setState(deserializeInsightState(window.location.hash))
    }

    syncFromLocation()
    window.addEventListener('popstate', syncFromLocation)
    window.addEventListener('hashchange', syncFromLocation)
    return () => {
      window.removeEventListener('popstate', syncFromLocation)
      window.removeEventListener('hashchange', syncFromLocation)
    }
  }, [])

  const serializedState = useMemo(() => serializeInsightState(state), [state])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const encoded = encodeStateId(serializedState)
    const basePath = getBasePath(window.location.pathname)
    const nextPath = encoded ? `${basePath}/${encoded}` : basePath
    const currentPath = window.location.pathname
    if (currentPath !== nextPath || window.location.hash) {
      window.history.replaceState({}, '', nextPath)
    }
  }, [serializedState])

  const updateState = useCallback((partial: Partial<InsightState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const shareableLink = useMemo(() => {
    const encoded = encodeStateId(serializedState)
    const baseUrl = resolveBaseUrl()
    if (!baseUrl) {
      return encoded || ''
    }
    return encoded ? `${baseUrl}/${encoded}` : baseUrl
  }, [serializedState])

  return { state, updateState, shareableLink }
}
