import FileTable from '../../../../components/download/FileTable'
import type { DirListing } from '../../../../types/download'
import type { Crumb } from '../../../../components/download/Breadcrumbs'
import listings from '../../../../public/dl-index/all.json'

export async function generateStaticParams() {
  return (listings as DirListing[])
    .filter((l) => l.path)
    .map((l) => {
      const segs = l.path.split('/').filter(Boolean)
      return { name: segs[0], path: segs.slice(1) }
    })
}

export const dynamicParams = false
export const dynamic = 'force-static'

export default function DownloadListing({
  params,
}: {
  params: { name: string; path?: string[] }
}) {
  const { name, path = [] } = params
  const segs = [name, ...path]
  const fullPath = segs.join('/') + '/'
  const dir = (listings as DirListing[]).find((l) => l.path === fullPath)
  if (!dir) {
    return (
      <main className="p-4">
        <div className="text-center text-red-500">Directory not found.</div>
      </main>
    )
  }

  const breadcrumb: Crumb[] = segs.map((seg, idx) => ({
    label: seg,
    href: '/download/' + segs.slice(0, idx + 1).join('/'),
  }))

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <FileTable listing={dir} breadcrumb={breadcrumb} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl shadow p-4">
          <h2 className="font-semibold mb-2">Meta</h2>
          <p className="text-sm">Path: {dir.path}</p>
          <p className="text-sm mt-2">from dl.svc.plus</p>
        </div>
      </div>
    </main>
  )
}
