import runtimeServiceConfigSource from '../config/runtime-service-config.yaml'

type ServiceRuntimeConfig = {
  baseUrl?: string
}

type EnvironmentRuntimeConfig = {
  accountService?: ServiceRuntimeConfig
  serverService?: ServiceRuntimeConfig
}

type RuntimeServiceConfig = {
  defaultEnvironment?: string
  defaults?: EnvironmentRuntimeConfig
  environments?: Record<string, EnvironmentRuntimeConfig>
}

type StackEntry = {
  indent: number
  value: Record<string, unknown>
}

function parseSimpleYaml(source: string): RuntimeServiceConfig {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, ''))
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line.trim().length > 0)

  const root: Record<string, unknown> = {}
  const stack: StackEntry[] = [{ indent: -1, value: root }]

  for (const line of lines) {
    const indent = line.match(/^\s*/)![0].length
    const trimmed = line.trim()

    const separatorIndex = trimmed.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const parent = stack[stack.length - 1].value

    if (rawValue.length === 0) {
      const child: Record<string, unknown> = {}
      parent[key] = child
      stack.push({ indent, value: child })
    } else {
      parent[key] = rawValue
    }
  }

  return root as RuntimeServiceConfig
}

const runtimeServiceConfig = parseSimpleYaml(runtimeServiceConfigSource)

const runtimeEnvironments: Record<string, EnvironmentRuntimeConfig> =
  runtimeServiceConfig.environments ?? {}

type ServiceKey = keyof EnvironmentRuntimeConfig

const FALLBACK_ACCOUNT_SERVICE_URL = 'http://localhost:8080'
const FALLBACK_SERVER_SERVICE_URL = 'http://localhost:8090'

function getRuntimeServiceBaseUrl(serviceKey: ServiceKey): string | undefined {
  const environmentName = resolveRuntimeEnvironment()
  const runtimeDefaults = runtimeServiceConfig.defaults?.[serviceKey]?.baseUrl
  const environmentValue = environmentName
    ? runtimeEnvironments[environmentName]?.[serviceKey]?.baseUrl
    : undefined

  return environmentValue ?? runtimeDefaults
}

const DEFAULT_ACCOUNT_SERVICE_URL =
  getRuntimeServiceBaseUrl('accountService') ?? FALLBACK_ACCOUNT_SERVICE_URL
const DEFAULT_SERVER_SERVICE_URL =
  getRuntimeServiceBaseUrl('serverService') ?? FALLBACK_SERVER_SERVICE_URL

type RuntimeEnvironmentName = keyof typeof runtimeEnvironments

function normalizeEnvKey(value?: string | null): string | undefined {
  if (!value) return undefined
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function resolveRuntimeEnvironment(): RuntimeEnvironmentName | undefined {
  const envCandidates = [
    process.env.NEXT_PUBLIC_RUNTIME_ENV,
    process.env.NEXT_RUNTIME_ENV,
    process.env.RUNTIME_ENV,
    process.env.APP_ENV,
    process.env.NODE_ENV,
    runtimeServiceConfig.defaultEnvironment,
  ]

  for (const candidate of envCandidates) {
    const normalizedCandidate = normalizeEnvKey(candidate)
    if (!normalizedCandidate) continue

    const matchedEntry = Object.keys(runtimeEnvironments).find(
      (key) => normalizeEnvKey(key) === normalizedCandidate,
    ) as RuntimeEnvironmentName | undefined

    if (matchedEntry) {
      return matchedEntry
    }
  }

  return undefined
}

function readEnvValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const raw = process.env[key]
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  return undefined
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export function getAccountServiceBaseUrl(): string {
  const configured = readEnvValue('ACCOUNT_SERVICE_URL', 'NEXT_PUBLIC_ACCOUNT_SERVICE_URL')
  return normalizeBaseUrl(configured ?? DEFAULT_ACCOUNT_SERVICE_URL)
}

export function getServerServiceBaseUrl(): string {
  const configured = readEnvValue(
    'SERVER_SERVICE_URL',
    'NEXT_PUBLIC_SERVER_SERVICE_URL',
    'NEXT_PUBLIC_API_BASE_URL',
  )
  return normalizeBaseUrl(configured ?? DEFAULT_SERVER_SERVICE_URL)
}

export const serviceConfig = {
  account: {
    baseUrl: getAccountServiceBaseUrl(),
  },
  server: {
    baseUrl: getServerServiceBaseUrl(),
  },
} as const
