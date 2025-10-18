'use client'

import MarkdownSection from '../components/MarkdownSection'
import { useLanguage, type Language } from '../../i18n/LanguageProvider'

const SECTION_PATHS: Record<Language, {
  operations: string
  productSpotlight: string
  news: string
  support: string
  community: string
  resources: string
}> = {
  zh: {
    operations: 'homepage/zh/operations.md',
    productSpotlight: 'homepage/zh/products.md',
    news: 'homepage/zh/news.md',
    support: 'homepage/zh/support.md',
    community: 'homepage/zh/community.md',
    resources: 'homepage/zh/resources.md',
  },
  en: {
    operations: 'homepage/en/operations.md',
    productSpotlight: 'homepage/en/products.md',
    news: 'homepage/en/news.md',
    support: 'homepage/en/support.md',
    community: 'homepage/en/community.md',
    resources: 'homepage/en/resources.md',
  },
}

const DEFAULT_LANGUAGE: Language = 'zh'

export default function MarkdownHomepage() {
  const { language } = useLanguage()
  const sections = SECTION_PATHS[language] ?? SECTION_PATHS[DEFAULT_LANGUAGE]

  return (
    <main className="flex flex-col gap-16 bg-white py-16">
      <header className="bg-slate-950 py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6">
          <MarkdownSection
            src={sections.operations}
            headingLevel="h1"
            className="flex flex-col gap-4"
            headingClassName="text-3xl font-semibold text-white sm:text-4xl"
            contentClassName="prose-invert prose-headings:text-white prose-strong:text-white text-slate-100"
          />
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <MarkdownSection src={sections.productSpotlight} />
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <MarkdownSection src={sections.news} />
          <div className="flex flex-col gap-12">
            <MarkdownSection src={sections.support} />
            <MarkdownSection src={sections.resources} />
          </div>
        </div>
        <MarkdownSection src={sections.community} />
      </section>
    </main>
  )
}
