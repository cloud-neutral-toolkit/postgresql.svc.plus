import { NextRequest, NextResponse } from 'next/server'

import { buildAbsoluteDocUrl, DOCS_BASE_URL } from '../../../docs/resources'

const FORWARDED_HEADERS = [
  'range',
  'if-modified-since',
  'if-none-match',
  'accept',
  'accept-encoding',
  'accept-language',
]

const PASSTHROUGH_HEADERS = [
  'content-type',
  'content-length',
  'content-disposition',
  'accept-ranges',
  'content-range',
  'last-modified',
  'etag',
  'cache-control',
  'content-encoding',
]

const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:'])

const resolveBaseForRelative = (): URL | null => {
  if (DOCS_BASE_URL) {
    try {
      return new URL(DOCS_BASE_URL.endsWith('/') ? DOCS_BASE_URL : `${DOCS_BASE_URL}/`)
    } catch {
      return null
    }
  }
  return null
}

const buildTargetUrl = (rawUrl: string, request: NextRequest): URL | null => {
  const normalized = buildAbsoluteDocUrl(rawUrl) ?? rawUrl
  if (!normalized) {
    return null
  }
  if (normalized.startsWith('/api/docs/proxy')) {
    return null
  }
  try {
    return new URL(normalized)
  } catch {
    if (normalized.startsWith('/')) {
      try {
        return new URL(normalized, request.nextUrl.origin)
      } catch {
        return null
      }
    }
    const base = resolveBaseForRelative()
    if (base) {
      try {
        return new URL(normalized, base)
      } catch {
        return null
      }
    }
    return null
  }
}

const allowedOrigin = (() => {
  if (!DOCS_BASE_URL) {
    return null
  }
  try {
    return new URL(DOCS_BASE_URL)
  } catch {
    return null
  }
})()

const createUpstreamHeaders = (request: NextRequest) => {
  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value) {
      headers.set(name, value)
    }
  }
  const userAgent = request.headers.get('user-agent')
  if (userAgent) {
    headers.set('user-agent', userAgent)
  }
  return headers
}

const createResponseHeaders = (upstream: Response) => {
  const headers = new Headers()
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) {
      headers.set(name, value)
    }
  }
  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'no-store')
  }
  return headers
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url')
  if (!urlParam) {
    return NextResponse.json({ error: 'Missing url parameter.' }, { status: 400 })
  }

  const target = buildTargetUrl(urlParam, request)
  if (!target || !SUPPORTED_PROTOCOLS.has(target.protocol)) {
    return NextResponse.json({ error: 'Invalid or unsupported document URL.' }, { status: 400 })
  }

  if (allowedOrigin && target.origin !== allowedOrigin.origin) {
    return NextResponse.json({ error: 'Requested document host is not permitted.' }, { status: 403 })
  }

  const headers = createUpstreamHeaders(request)

  try {
    const upstream = await fetch(target, {
      headers,
      redirect: 'follow',
    })

    const responseHeaders = createResponseHeaders(upstream)
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve document content.' }, { status: 502 })
  }
}

