import { createFeatureFlag } from '@lib/featureFlags'

const feature = createFeatureFlag({
  id: 'cloud-iac',
  title: 'Cloud IaC Catalog',
  description: 'Cross-cloud infrastructure templates and automation entry points.',
  envVar: 'NEXT_PUBLIC_FEATURE_CLOUD_IAC',
  defaultEnabled: true,
})

export default feature
