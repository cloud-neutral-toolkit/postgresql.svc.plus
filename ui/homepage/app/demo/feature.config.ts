import { createFeatureFlag } from '@lib/featureFlags'

const feature = createFeatureFlag({
  id: 'demo',
  title: 'Interactive Demo',
  description: 'Preview experience for account capabilities',
  envVar: 'NEXT_PUBLIC_FEATURE_DEMO',
  defaultEnabled: false,
})

export default feature
