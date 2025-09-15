import CardGrid from '../../components/download/CardGrid'

const BASE_URL = process.env.NEXT_PUBLIC_DL_BASE_URL || 'https://dl.svc.plus'

interface ManifestRoot {
  key: string
  title: string
  href: string
  last_modified?: string
  count?: number
}

async function getManifest() {
  const res = await fetch(`${BASE_URL}/manifest.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error('failed to load manifest')
  return res.json() as Promise<{ roots: ManifestRoot[] }>
}

export default async function DownloadHome() {
  const manifest = await getManifest().catch(() => ({ roots: [] }))
  const sections = manifest.roots.map((r) => ({
    key: r.key,
    title: r.title,
    href: `/download/${r.key}`,
    lastModified: r.last_modified,
    count: r.count,
  }))
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Downloads</h1>
      <CardGrid sections={sections} />
    </main>
  )
}
