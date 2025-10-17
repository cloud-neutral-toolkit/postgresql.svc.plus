import type { CmsTheme } from '../../types'

function PassthroughThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const defaultTheme: CmsTheme = {
  name: 'default',
  htmlAttributes: {
    lang: 'en',
  },
  bodyClassName: 'bg-gray-50 text-gray-900',
  Provider: PassthroughThemeProvider,
}

export default defaultTheme
