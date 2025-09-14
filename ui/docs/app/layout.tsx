import '../styles/globals.css'
import { Sidebar } from '../components/Sidebar'
import { TopScroller } from '../components/TopScroller'
import { Footer } from '../components/Footer'

export const metadata = {
  title: 'SVC Docs',
  description: 'svc.plus documents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <TopScroller />
          <main className="flex-1 w-full px-4 py-6 prose mx-auto">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
