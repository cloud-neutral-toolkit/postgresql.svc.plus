export type TopologyMode = 'application' | 'network' | 'resource'
export type DataSource = 'metrics' | 'logs' | 'traces'
export type BuilderMode = 'visual' | 'code'
export type QueryLanguage = 'promql' | 'logql' | 'traceql'

export interface InsightState {
  org: string
  project: string
  env: string
  region: string
  topologyMode: TopologyMode
  namespace: string
  service: string
  dataSource: DataSource
  queryLanguage: QueryLanguage
  query: string
  builderMode: BuilderMode
  timeRange: string
}

export const DEFAULT_INSIGHT_STATE: InsightState = {
  org: 'global-org',
  project: 'observability',
  env: 'production',
  region: 'us-west-2',
  topologyMode: 'application',
  namespace: 'default',
  service: '',
  dataSource: 'metrics',
  queryLanguage: 'promql',
  query: 'sum(rate(http_requests_total{job="api"}[5m]))',
  builderMode: 'visual',
  timeRange: '1h'
}

const STATE_KEY_MAP: Record<keyof InsightState, string> = {
  org: 'org',
  project: 'proj',
  env: 'env',
  region: 'reg',
  topologyMode: 'mode',
  namespace: 'ns',
  service: 'svc',
  dataSource: 'ds',
  queryLanguage: 'ql',
  query: 'q',
  builderMode: 'bm',
  timeRange: 'tr'
}

const REVERSE_STATE_KEY_MAP = Object.fromEntries(
  Object.entries(STATE_KEY_MAP).map(([key, value]) => [value, key])
) as Record<string, keyof InsightState>

export function serializeInsightState(state: InsightState): string {
  const params = new URLSearchParams()
  ;(Object.keys(STATE_KEY_MAP) as (keyof InsightState)[]).forEach(key => {
    const value = state[key]
    if (value) params.set(STATE_KEY_MAP[key], value)
  })
  return params.toString()
}

export function deserializeInsightState(hash: string): InsightState {
  if (!hash) return DEFAULT_INSIGHT_STATE
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(cleanHash)
  const next: InsightState = { ...DEFAULT_INSIGHT_STATE }

  params.forEach((value, key) => {
    const stateKey = REVERSE_STATE_KEY_MAP[key]
    if (!stateKey) return

    switch (stateKey) {
      case 'topologyMode':
        next.topologyMode = value as TopologyMode
        break
      case 'dataSource':
        next.dataSource = value as DataSource
        break
      case 'queryLanguage':
        next.queryLanguage = value as QueryLanguage
        break
      case 'builderMode':
        next.builderMode = value as BuilderMode
        break
      case 'org':
        next.org = value
        break
      case 'project':
        next.project = value
        break
      case 'env':
        next.env = value
        break
      case 'region':
        next.region = value
        break
      case 'namespace':
        next.namespace = value
        break
      case 'service':
        next.service = value
        break
      case 'query':
        next.query = value
        break
      case 'timeRange':
        next.timeRange = value
        break
      default:
        break
    }
  })

  if (!['application', 'network', 'resource'].includes(next.topologyMode)) {
    next.topologyMode = DEFAULT_INSIGHT_STATE.topologyMode
  }
  if (!['metrics', 'logs', 'traces'].includes(next.dataSource)) {
    next.dataSource = DEFAULT_INSIGHT_STATE.dataSource
  }
  if (!['promql', 'logql', 'traceql'].includes(next.queryLanguage)) {
    next.queryLanguage = DEFAULT_INSIGHT_STATE.queryLanguage
  }
  if (!['visual', 'code'].includes(next.builderMode)) {
    next.builderMode = DEFAULT_INSIGHT_STATE.builderMode
  }

  return next
}
