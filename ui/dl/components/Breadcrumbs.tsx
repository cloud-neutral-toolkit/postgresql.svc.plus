import Link from 'next/link'

export default function Breadcrumbs({ segments }: { segments: string[] }) {
  const paths = segments.map((_, i) => '/' + segments.slice(0, i + 1).join('/') + '/')
  return (
    <nav className="text-sm mb-4">
      <ol className="flex flex-wrap gap-1 items-center">
        <li><Link href="/" className="text-blue-600">dl.svc.plus</Link></li>
        {segments.map((seg, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <span>/</span>
            <Link href={paths[idx]} className="text-blue-600">{seg}</Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
