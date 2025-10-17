import ArticleFeed from '@components/home/ArticleFeed'
import ProductMatrix from '@components/home/ProductMatrix'
import Sidebar from '@components/home/Sidebar'
import KnowledgeBaseSpotlight from '@components/content/KnowledgeBaseSpotlight'

import type { HomePageTemplateProps, TemplateDefinition } from '../types'

function DefaultHomePageTemplate({ slots }: HomePageTemplateProps) {
  const ProductMatrixComponent = slots.ProductMatrix ?? ProductMatrix
  const ArticleFeedComponent = slots.ArticleFeed ?? ArticleFeed
  const SidebarComponent = slots.Sidebar ?? Sidebar
  const KnowledgeBaseComponent = slots.KnowledgeBase ?? KnowledgeBaseSpotlight

  return (
    <main className="bg-slate-950">
      {KnowledgeBaseComponent ? (
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pb-16 pt-16 text-white">
          <div className="px-4">
            <div className="mx-auto max-w-5xl">
              <KnowledgeBaseComponent />
            </div>
          </div>
        </section>
      ) : null}
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
