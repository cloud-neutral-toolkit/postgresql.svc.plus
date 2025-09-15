import DownloadBrowser from '../../components/download/DownloadBrowser'

const BASE_URL = process.env.NEXT_PUBLIC_DL_BASE_URL || 'https://dl.svc.plus'

interface ManifestRoot {
  name: string
  href: string
  updated_at?: string
  item_count?: number
  summary?: string
}

async function getManifest() {
  const res = await fetch(`${BASE_URL}/manifest.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error('failed to load manifest')
  return res.json() as Promise<{ roots: ManifestRoot[] }>
}

export default async function DownloadHome() {
  const manifest = await getManifest().catch(() => ({ roots: [] }))
  return <DownloadBrowser roots={manifest.roots} />
}
