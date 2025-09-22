export const dynamic = 'error'

import { notFound, redirect } from 'next/navigation'

import { isFeatureEnabled } from '@lib/featureToggles'

export default function LoginPage() {
  if (!isFeatureEnabled('globalNavigation', '/login')) {
    notFound()
  }

  redirect('/panel/ldp')
}
