import { getServerServiceBaseUrl } from '@lib/serviceConfig'

export async function POST(req: Request) {
  const { question, history } = await req.json()
  const apiBase = getServerServiceBaseUrl()
  const res = await fetch(`${apiBase}/api/askai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history })
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

