export const dynamic = 'error'

import { notFound } from 'next/navigation'

import { isFeatureEnabled } from '@lib/featureToggles'

import RegisterContent from './RegisterContent'

export default function RegisterPage() {
  if (!isFeatureEnabled('globalNavigation', '/register')) {
    notFound()
  }

  return <RegisterContent />
}
