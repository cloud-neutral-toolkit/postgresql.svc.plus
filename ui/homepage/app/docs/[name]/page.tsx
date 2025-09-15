import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { marked } from 'marked'

function getDocs() {
  const contentDir = path.join(process.cwd(), 'content')
  if (!fs.existsSync(contentDir)) return [] as { slug: string; title: string }[]
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const content = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const match = content.match(/^#\s+(.*)/)
      const title = match ? match[1] : slug
      return { slug, title }
    })
}

export function generateStaticParams() {
  return getDocs().map((d) => ({ name: d.slug }))
}

export default function DocPage({ params }: { params: { name: string } }) {
  const docs = getDocs()
  const index = docs.findIndex((d) => d.slug === params.name)
  if (index === -1) return <div className="p-8">Not found</div>
  const contentDir = path.join(process.cwd(), 'content')
  const file = path.join(contentDir, `${params.name}.md`)
  const markdown = fs.readFileSync(file, 'utf8')
  const html = marked.parse(markdown)
  const prev = docs[index - 1]
  const next = docs[index + 1]
  return (
    <main className="p-8">
      <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mt-8 flex justify-between">
        {prev ? <Link href={`/docs/${prev.slug}`}>← {prev.title}</Link> : <span />}
        {next ? <Link href={`/docs/${next.slug}`}>{next.title} →</Link> : <span />}
      </div>
    </main>
  )
}
