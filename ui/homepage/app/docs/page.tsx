import fs from 'fs'
import path from 'path'
import Link from 'next/link'

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

export default function DocsHome() {
  const docs = getDocs()
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Docs</h1>
      <ul className="list-disc pl-4">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/docs/${doc.slug}`} className="text-purple-600 hover:underline">
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
