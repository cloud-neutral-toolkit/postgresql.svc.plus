import Card from '../components/Card'

export const dynamic = 'force-static'

export default function APIPage() {
  return (
    <Card>
      <h1 className="text-2xl font-semibold text-gray-900">API Status</h1>
      <p className="mt-2 text-sm text-gray-600">View backend API health and toggle feature matrices.</p>
    </Card>
  )
}
