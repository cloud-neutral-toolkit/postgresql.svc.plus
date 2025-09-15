import DownloadBrowser from '../../components/download/DownloadBrowser'
import listings from '../../public/dl-index/all.json'
import type { DirListing } from '../../types/download'

interface Section {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
  root: string
}

export default function DownloadHome() {
  const sectionsMap: Record<string, Section[]> = {}
  const root = (listings as DirListing[]).find((l) => l.path === '')
  if (root) {
    for (const entry of root.entries.filter((e) => e.type === 'dir')) {
      const child = (listings as DirListing[]).find((l) => l.path === `${entry.name}/`)
      const secs: Section[] = (child?.entries || [])
        .filter((e) => e.type === 'dir')
        .map((e) => ({
          key: `${entry.name}/${e.name}`,
          title: e.name,
          href: `/download/${entry.name}/${e.name}`,
          lastModified: e.lastModified,
          count: (e as any).count,
          root: entry.name,
        }))
      sectionsMap[entry.name] = secs
    }
  }
  return <DownloadBrowser sectionsMap={sectionsMap} />
}
