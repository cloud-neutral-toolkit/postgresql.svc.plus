export const dynamic = 'error'

import Footer from '@components/Footer'
import Navbar from '@components/Navbar'
import { AskAIButton } from '@components/AskAIButton'

import ArticleFeed from '@components/home/ArticleFeed'
import ProductMatrix from '@components/home/ProductMatrix'
import Sidebar from '@components/home/Sidebar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-950">
        <section className="pb-24 pt-24">
          <div className="px-4">
            <div className="mx-auto max-w-6xl">
              <ProductMatrix />
            </div>
          </div>
        </section>
        <section className="bg-slate-50 pb-16 pt-20">
          <div className="px-4">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <ArticleFeed />
                <Sidebar />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AskAIButton />
    </>
  )
}
