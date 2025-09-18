import { createFeatureFlag } from '@lib/featureFlags'

const feature = createFeatureFlag({
  id: 'login',
  title: 'Account Login Redirect',
  description: 'Routes visitors to the Light IDP control panel',
  envVar: 'NEXT_PUBLIC_FEATURE_LOGIN',
  defaultEnabled: true,
})

export default feature
