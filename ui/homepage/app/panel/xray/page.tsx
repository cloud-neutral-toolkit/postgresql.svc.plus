import Card from '../components/Card'

export const dynamic = 'force-static'

export default function XRayPage() {
  return (
    <Card>
      <h1 className="text-2xl font-semibold text-gray-900">XRay</h1>
      <p className="mt-2 text-sm text-gray-600">Control XRay configuration and rollout zero-trust policies.</p>
    </Card>
  )
}
