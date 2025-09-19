export const dynamic = 'error'

import { notFound } from 'next/navigation'

import feature from './feature.config'
import DemoContent from './DemoContent'

export default function DemoPage() {
  if (!feature.enabled) {
    notFound()
  }

  return <DemoContent />
}
