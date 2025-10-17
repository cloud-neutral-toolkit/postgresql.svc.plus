import MarkdownSection from '../components/MarkdownSection'
import { loadContentMeta, loadMarkdownSection } from '../lib/markdown'

export default async function MarkdownHomepage() {
  const [intro, features, footer, footerMeta] = await Promise.all([
    loadMarkdownSection('homepage/intro.md'),
    loadMarkdownSection('homepage/features.md'),
    loadMarkdownSection('homepage/footer.md'),
    loadContentMeta('homepage/footer.md'),
  ])

  const lastUpdated = footerMeta.updatedAt
    ? new Date(footerMeta.updatedAt).toLocaleDateString()
    : (typeof footer.meta.updated === 'string' ? footer.meta.updated : undefined)

  return (
    <main className="flex flex-col gap-16 bg-white py-16">
      <header className="bg-slate-950 py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6">
          <MarkdownSection src="homepage/intro.md" prefetched={intro} headingLevel="h1" />
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6">
        <MarkdownSection src="homepage/features.md" prefetched={features} />
        <MarkdownSection src="homepage/footer.md" prefetched={footer} headingLevel="h3" />
        {lastUpdated ? (
          <p className="text-sm text-slate-500">
            Last updated: {lastUpdated}
            {footerMeta.author ? ` by ${footerMeta.author}` : ''}
            {footerMeta.message ? ` · “${footerMeta.message}”` : ''}
          </p>
        ) : null}
      </section>
    </main>
  )
}
