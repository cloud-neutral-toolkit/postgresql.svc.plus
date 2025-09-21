export interface ClientOptions {
  baseUrl?: string
  token?: string
}

export function createOpenObserveClient(options: ClientOptions = {}) {
  const { baseUrl = '/api', token } = options

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return res.json() as Promise<T>
  }

  return { request }
}
