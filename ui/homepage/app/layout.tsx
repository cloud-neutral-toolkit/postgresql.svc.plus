import './globals.css'
import { LanguageProvider } from '@i18n/LanguageProvider'

export const metadata = {
  title: 'CloudNative Suite',
  description: 'Unified tools for your cloud native stack',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
