export const dynamic = 'error'

import Card from '../components/Card'

export default function AccountPage() {
  return (
    <Card>
      <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
      <p className="mt-2 text-sm text-gray-600">
        Account management placeholder. Provision users, assign groups, and configure MFA policies.
      </p>
    </Card>
  )
}
