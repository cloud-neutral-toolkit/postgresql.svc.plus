import type { ReactNode } from 'react'

export interface CmsTemplate {
  name: string
  pages: {
    home: React.ComponentType
    [key: string]: React.ComponentType | undefined
  }
}

export interface CmsTheme {
  name: string
  htmlAttributes?: Record<string, string>
  bodyClassName?: string
  Provider?: React.ComponentType<{ children: ReactNode }>
}

export interface CmsExtension {
  name: string
  providers?: React.ComponentType<{ children: ReactNode }>[]
  Layout?: React.ComponentType<{ children: ReactNode }>
}
