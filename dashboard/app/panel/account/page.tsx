export const dynamic = 'error'

import UserOverview from '../components/UserOverview'
import MfaSetupPanel from './MfaSetupPanel'

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <UserOverview />
      <MfaSetupPanel />
    </div>
  )
}
