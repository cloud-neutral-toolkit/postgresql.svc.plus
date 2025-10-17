import { ComponentType, createElement, type ReactNode } from 'react'

import { cmsConfig, type ExtensionName, type TemplateName, type ThemeName } from './config'
import type { CmsExtension, CmsTemplate, CmsTheme } from './types'
import { appShellExtension } from './extensions/appShell'
import { markdownSyncExtension } from './extensions/markdownSync'
import defaultTemplate from './templates/default'
import defaultTheme from './themes/default'

const templateRegistry: Record<TemplateName, CmsTemplate> = {
  default: defaultTemplate,
}

const themeRegistry: Record<ThemeName, CmsTheme> = {
  default: defaultTheme,
}

const extensionRegistry: Record<ExtensionName, CmsExtension> = {
  'app-shell': appShellExtension,
  'markdown-sync': markdownSyncExtension,
}

export function getActiveTemplate(): CmsTemplate {
  return templateRegistry[cmsConfig.template]
}

export function getActiveTheme(): CmsTheme {
  return themeRegistry[cmsConfig.theme]
}

export function getActiveExtensions(): CmsExtension[] {
  return cmsConfig.extensions
    .map((extensionName) => extensionRegistry[extensionName])
    .filter(Boolean)
}

export function listContentSourcesMetadata() {
  return Object.entries(cmsConfig.content.sources).map(([namespace, source]) => ({
    namespace,
    type: source.type,
    repository: source.repository,
    ref: source.ref,
  }))
}

export function collectExtensionProviders(): ComponentType<{ children: ReactNode }>[] {
  return getActiveExtensions()
    .flatMap((extension) => extension.providers ?? [])
}

export function applyExtensionLayouts(children: ReactNode): ReactNode {
  return getActiveExtensions().reduceRight((acc, extension) => {
    if (!extension.Layout) {
      return acc
    }
    const LayoutComponent = extension.Layout
    return createElement(LayoutComponent, null, acc)
  }, children)
}
