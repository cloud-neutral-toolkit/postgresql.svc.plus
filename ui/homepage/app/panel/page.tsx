import Card from './components/Card'

export const dynamic = 'force-static'

export default function PanelHome() {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the XControl control center. Switch between administrator modules and self-service experiences to manage
          your platform with confidence.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900">Administrator modules</h2>
          <p className="mt-2 text-sm text-gray-600">
            Toggle core services, observe infrastructure health, and govern network gateways. Each module mirrors the original
            admin panel layout so existing workflows continue to work.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-900">Self-service experiences</h2>
          <p className="mt-2 text-sm text-gray-600">
            Empower end users with password resets, MFA configuration, and delegated group management without leaving the
            homepage theme.
          </p>
        </Card>
      </div>
    </>
  )
}
