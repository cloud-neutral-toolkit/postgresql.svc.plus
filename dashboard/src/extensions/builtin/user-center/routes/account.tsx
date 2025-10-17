import MfaSetupPanel from '../account/MfaSetupPanel'
import ThemePreferenceCard from '../account/ThemePreferenceCard'
import UserOverview from '../components/UserOverview'

export default function UserCenterAccountRoute() {
  return (
    <div className="space-y-6">
      <UserOverview />
      <ThemePreferenceCard />
      <MfaSetupPanel />
    </div>
  )
}
