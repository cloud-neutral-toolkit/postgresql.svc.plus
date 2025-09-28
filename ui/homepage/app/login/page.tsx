export const dynamic = 'error'

import { notFound } from 'next/navigation'

import { isFeatureEnabled } from '@lib/featureToggles'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  if (!isFeatureEnabled('globalNavigation', '/login')) {
    notFound()
  }

  return <LoginForm />
}
