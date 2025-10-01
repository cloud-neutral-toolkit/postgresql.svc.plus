export const dynamic = 'error'

import './globals.css'
import { AppProviders } from './AppProviders'

export const metadata = {
  title: 'CloudNative Suite',
  description: 'Unified tools for your cloud native stack',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
