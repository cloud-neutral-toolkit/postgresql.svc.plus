import { allDocs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useReadingProgress } from '../../components/Progress'

export function generateStaticParams() {
  return allDocs.map((doc) => ({ slug: doc.slug.split('/') }))
}

export default function DocPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/')
  const doc = allDocs.find((d) => d.slug === slug)
  useReadingProgress(slug)
  if (!doc) return notFound()
  const docs = allDocs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const index = docs.findIndex((d) => d.slug === slug)
  const prev = docs[index - 1]
  const next = docs[index + 1]
  const pdfUrl = `/pdf/${slug}.pdf`
  return (
    <article>
      <h1>{doc.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: doc.body.html }} />
      <div className="mt-8 flex justify-between">
        {prev ? <Link href={prev.url}>← {prev.title}</Link> : <span />}
        {next ? <Link href={next.url}>{next.title} →</Link> : <span />}
      </div>
      <div className="mt-4">
        <a href={pdfUrl} target="_blank" rel="noopener">Download PDF</a>
      </div>
    </article>
  )
}
