import type { CatalogItem, IaCTool, ProviderKey } from './types'

export type ActionResult = {
  success: boolean
  message: string
  timestamp: string
}

export type BaseActionParams = {
  provider: ProviderKey
  category: CatalogItem
  parameters?: Record<string, any>
}

export type TerraformActionParams = BaseActionParams & {
  module: string
}

export type PulumiActionParams = BaseActionParams & {
  component: string
}

export type GithubWorkflowParams = BaseActionParams & {
  workflow: string
}

const SIMULATED_LATENCY = 600

async function simulateNetworkDelay() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY))
}

function buildMessage(tool: IaCTool, provider: ProviderKey, identifier: string) {
  const upperProvider = provider.toUpperCase()
  switch (tool) {
    case 'terraform':
      return `Terraform 模块 ${identifier} 已提交至 ${upperProvider} 的管道。`
    case 'pulumi':
      return `Pulumi 组件 ${identifier} 已为 ${upperProvider} 生成执行任务。`
    case 'githubWorkflow':
      return `GitHub Workflow ${identifier} 已触发 ${upperProvider} 的自动化流程。`
    default:
      return `${identifier} execution started for ${upperProvider}.`
  }
}

function buildResult(tool: IaCTool, provider: ProviderKey, identifier: string): ActionResult {
  return {
    success: true,
    message: buildMessage(tool, provider, identifier),
    timestamp: new Date().toISOString(),
  }
}

export async function runTerraformModule({ provider, category, module, parameters }: TerraformActionParams): Promise<ActionResult> {
  await simulateNetworkDelay()
  return buildResult('terraform', provider, `${module} (${category.key})`)
}

export async function runPulumiProgram({ provider, category, component, parameters }: PulumiActionParams): Promise<ActionResult> {
  await simulateNetworkDelay()
  return buildResult('pulumi', provider, `${component} (${category.key})`)
}

export async function triggerGithubWorkflow({ provider, category, workflow, parameters }: GithubWorkflowParams): Promise<ActionResult> {
  await simulateNetworkDelay()
  return buildResult('githubWorkflow', provider, `${workflow} (${category.key})`)
}
