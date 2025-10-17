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
      <section className="pb-24 pt-24">
        <div className="px-4">
          <div className="mx-auto max-w-6xl">
            <ProductMatrixComponent />
          </div>
        </div>
      </section>
      <section className="bg-slate-50 pb-16 pt-20">
        <div className="px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
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
