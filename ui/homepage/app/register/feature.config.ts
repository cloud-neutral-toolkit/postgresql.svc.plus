import { createFeatureFlag } from '@lib/featureFlags'

const feature = createFeatureFlag({
  id: 'register',
  title: 'Account Registration Redirect',
  description: 'Routes visitors to the Light IDP user management surface',
  envVar: 'NEXT_PUBLIC_FEATURE_REGISTER',
  defaultEnabled: false,
})

export default feature
