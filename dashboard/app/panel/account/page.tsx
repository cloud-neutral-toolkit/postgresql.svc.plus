export const dynamic = 'error'

import UserOverview from '../components/UserOverview'
import MfaSetupPanel from './MfaSetupPanel'
import ThemePreferenceCard from './ThemePreferenceCard'

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <UserOverview />
      <ThemePreferenceCard />
      <MfaSetupPanel />
    </div>
  )
}
