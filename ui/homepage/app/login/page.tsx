export const dynamic = 'error'

import { notFound } from 'next/navigation'
import { isFeatureEnabled } from '@lib/featureToggles'
import { LoginForm } from './LoginForm'
import LoginContent from './LoginContent'

export default function LoginPage() {
  if (!isFeatureEnabled('globalNavigation', '/login')) {
    notFound()
  }
  // 统一返回：容器包裹表单，兼容两边改动
  return <LoginContent><LoginForm /></LoginContent>
}
