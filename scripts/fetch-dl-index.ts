import fs from 'fs/promises'
import path from 'path'
import { DirEntry, DirListing } from '../types/download'

const BASE = (process.env.DL_BASE || 'https://dl.svc.plus/').replace(/\/+$/, '/')

async function crawl(rel: string): Promise<DirListing[]> {
  const url = BASE + rel
  const res = await fetch(url + 'index.json')
  if (!res.ok) throw new Error(`failed to fetch ${url}: ${res.status}`)
  const entries = (await res.json()) as DirEntry[]
  const listing: DirListing = { path: rel, entries }
  const all: DirListing[] = [listing]
  for (const e of entries) {
    if (e.type === 'dir') {
      const childRel = rel + e.name + '/'
      const child = await crawl(childRel)
      all.push(...child)
    }
  }
  return all
}

async function main() {
  const listings = await crawl('')
  const top = listings.find(l => l.path === '')
  const sections = top ? top.entries.filter(e => e.type === 'dir').map(e => ({
    key: e.name,
    title: e.name,
    href: '/' + e.name + '/',
    lastModified: e.lastModified,
    count: undefined
  })) : []

  const outDir = path.join(process.cwd(), 'public', 'dl-index')
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'all.json'), JSON.stringify(listings, null, 2))
  await fs.writeFile(path.join(outDir, 'top.json'), JSON.stringify(sections, null, 2))
}

main().catch(err => {
  console.warn('[fetch-dl-index] skipped due to error:', err)
})
