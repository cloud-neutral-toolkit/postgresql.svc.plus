export const dynamic = 'error'

import Footer from '@components/Footer'
import Navbar from '@components/Navbar'
import { AskAIButton } from '@components/AskAIButton'

import ArticleFeed from '@components/home/ArticleFeed'
import ContactPanel from '@components/home/ContactPanel'
import HeroBanner from '@components/home/HeroBanner'
import ProductMatrix from '@components/home/ProductMatrix'
import Sidebar from '@components/home/Sidebar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pb-16 pt-24">
        <HeroBanner />
        <section className="relative z-10 -mt-12 px-4 sm:-mt-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-8">
                <ProductMatrix />
                <ArticleFeed />
              </div>
              <div className="space-y-6">
                <ContactPanel />
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
