export type CategoryKey =
  | 'compute'
  | 'network'
  | 'load_balancer'
  | 'object_storage'
  | 'relational_db'
  | 'message_queue'
  | 'kubernetes'
  | 'data_platform'
  | 'iam'

export type ProviderKey = 'aws' | 'gcp' | 'azure' | 'aliyun'

export type ProviderDefinition = {
  key: ProviderKey
  label: string
}

export type IacIntegration = {
  terraform?: string
  pulumi?: string
  githubWorkflow?: string
  githubInputs?: Record<string, any>
}

export type CatalogItem = {
  key: CategoryKey
  title: string
  subtitle: string
  products: Partial<Record<ProviderKey, string>>
  iac?: Partial<Record<ProviderKey, IacIntegration>>
}

export type IaCTool = 'terraform' | 'pulumi' | 'githubWorkflow'
