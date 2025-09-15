import FileTable from '../../../../components/download/FileTable'
import MarkdownPanel from '../../../../components/download/MarkdownPanel'
import type { DirListing } from '../../../../types/download'
import { formatDate } from '../../../../lib/format'
import type { Crumb } from '../../../../components/download/Breadcrumbs'

const BASE_URL = process.env.NEXT_PUBLIC_DL_BASE_URL || 'https://dl.svc.plus'

async function getManifest() {
  try {
    const res = await fetch(`${BASE_URL}/manifest.json`, { cache: 'no-store' })
    if (!res.ok) return { roots: [] } as { roots: any[] }
    return res.json()
  } catch {
    return { roots: [] } as { roots: any[] }
  }
}

async function getDir(path: string) {
  const res = await fetch(`${BASE_URL}${path}dir.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error('failed to load dir')
  return res.json()
}

export async function generateStaticParams() {
  const manifest = await getManifest()
  return manifest.roots.map((r: any) => ({ name: r.key, path: [] as string[] }))
}

export const dynamicParams = false
export const dynamic = 'force-static'

export default async function DownloadListing({ params }: { params: { name: string; path?: string[] } }) {
  const { name, path = [] } = params
  const segs = [name, ...path]
  const fullPath = '/' + segs.join('/') + '/'
  try {
    const dir: DirListing & {
      tldr?: string
      readme?: string
      updated_at?: string
      items?: DirListing['entries']
    } = await getDir(fullPath)
    const breadcrumb: Crumb[] = segs.map((seg, idx) => ({
      label: seg,
      href: '/download/' + segs.slice(0, idx + 1).join('/'),
    }))
    return (
      <main className="p-4 max-w-6xl mx-auto">
        <FileTable
          listing={{ path: dir.path, entries: dir.entries ?? dir.items ?? [] }}
          breadcrumb={breadcrumb}
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {dir.tldr && <MarkdownPanel url={dir.tldr} title="TL;DR" />}
          {dir.readme && <MarkdownPanel url={dir.readme} title="Docs" />}
          <div className="rounded-2xl shadow p-4">
            <h2 className="font-semibold mb-2">Meta</h2>
            <p className="text-sm">Path: {dir.path}</p>
            {dir.updated_at && <p className="text-sm">Updated: {formatDate(dir.updated_at)}</p>}
            <p className="text-sm mt-2">from dl.svc.plus</p>
          </div>
        </div>
      </main>
    )
  } catch {
    return (
      <main className="p-4">
        <div className="text-center text-red-500">Failed to load directory.</div>
        <div className="mt-4 text-center">
          <button onClick={() => location.reload()} className="px-4 py-2 bg-gray-200 rounded">
            Retry
          </button>
        </div>
      </main>
    )
  }
}
