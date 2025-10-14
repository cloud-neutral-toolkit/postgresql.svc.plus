import { getInternalServerServiceBaseUrl } from '@lib/serviceConfig'

export async function POST(req: Request) {
  try {
    const { question, history } = await req.json()
    const apiBase = getInternalServerServiceBaseUrl()
    const response = await fetch(`${apiBase}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history })
    })

    const data = await response.json().catch(() => null)
    return Response.json(data ?? { error: 'Invalid response from server' }, {
      status: response.status
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
