export const dynamic = 'error'

import { notFound, redirect } from 'next/navigation'

import { isFeatureEnabled } from '@lib/featureToggles'

export default function RegisterPage() {
  if (!isFeatureEnabled('globalNavigation', '/register')) {
    notFound()
  }

  redirect('/panel/ldp/users')
}
