import Link from 'next/link'
import { allDocs } from 'contentlayer/generated'

export default function Home() {
  const docs = allDocs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return (
    <div>
      <h1>SVC Docs</h1>
      <ul>
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link href={doc.url}>{doc.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
