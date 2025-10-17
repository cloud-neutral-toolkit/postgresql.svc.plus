import ArticleFeed from '@components/home/ArticleFeed'
import ProductMatrix from '@components/home/ProductMatrix'
import Sidebar from '@components/home/Sidebar'

import type { HomePageTemplateProps, TemplateDefinition } from '../types'

function DefaultHomePageTemplate({ slots }: HomePageTemplateProps) {
  const ProductMatrixComponent = slots.ProductMatrix ?? ProductMatrix
  const ArticleFeedComponent = slots.ArticleFeed ?? ArticleFeed
  const SidebarComponent = slots.Sidebar ?? Sidebar

  return (
    <main className="bg-slate-950">
      <section className="relative isolate overflow-hidden pb-24 pt-24 text-slate-100">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(130deg,_rgba(12,18,32,0.92),_rgba(8,47,73,0.45))]"
          aria-hidden
        />
        <div className="relative px-4">
          <div className="mx-auto max-w-6xl">
            <ProductMatrixComponent />
          </div>
        </div>
      </section>
      <section className="relative bg-slate-50 pb-16 pt-20">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950 via-slate-900/0" aria-hidden />
        <div className="relative px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] lg:items-start">
              <ArticleFeedComponent />
              <SidebarComponent />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const defaultTemplate: TemplateDefinition = {
  name: 'default',
  pages: {
    home: DefaultHomePageTemplate,
  },
}

export default defaultTemplate
