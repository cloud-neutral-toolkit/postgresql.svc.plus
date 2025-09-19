export const dynamic = 'error'

import { notFound, redirect } from 'next/navigation'

import feature from './feature.config'

export default function RegisterPage() {
  if (!feature.enabled) {
    notFound()
  }

  redirect('/panel/ldp/users')
}
