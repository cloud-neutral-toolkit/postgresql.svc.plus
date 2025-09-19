import { createFeatureFlag } from '@lib/featureFlags'

const feature = createFeatureFlag({
  id: 'docs',
  title: 'Documentation Library',
  description: 'Knowledge base resources sourced from dl.svc.plus',
  envVar: 'NEXT_PUBLIC_FEATURE_DOCS',
  defaultEnabled: true,
})

export default feature
