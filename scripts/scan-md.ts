import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const DASHBOARD_ROOT = path.join(PROJECT_ROOT, 'ui', 'dashboard')

const CONTENT_DIR = path.join(DASHBOARD_ROOT, 'cms', 'content')
const OUTPUT_PATH = path.join(DASHBOARD_ROOT, 'public', '_build', 'docs_index.json')

type DocEntry = {
  slug: string
  title: string
  description: string
  updatedAt: string
  pathSegments: string[]
}

function extractTitle(lines: string[], fallback: string): string {
  const heading = lines.find((line) => /^#\s+/.test(line))
  if (!heading) return fallback
  return heading.replace(/^#\s+/, '').trim() || fallback
}

function extractDescription(lines: string[], title: string): string {
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || /^#\s+/.test(trimmed)) {
      continue
    }
    return trimmed
  }
  return `${title}.`
}

async function readMarkdownFile(file: string): Promise<DocEntry | null> {
  if (!file.endsWith('.md')) return null
  const slug = file.replace(/\.md$/, '')
  const filePath = path.join(CONTENT_DIR, file)

  const [source, stats] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)])
  const lines = source.split(/\r?\n/)
  const title = extractTitle(lines, slug)
  const description = extractDescription(lines, title)

  return {
    slug,
    title,
    description,
    updatedAt: stats.mtime.toISOString(),
    pathSegments: slug.split('/').filter(Boolean),
  }
}

async function collectDocs(): Promise<DocEntry[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const entries: DocEntry[] = []
    for (const file of files) {
      const entry = await readMarkdownFile(file)
      if (entry) {
        entries.push(entry)
      }
    }
    return entries.sort((a, b) => a.slug.localeCompare(b.slug))
  } catch (error) {
    console.warn('[scan-md] Unable to scan markdown directory:', error)
    return []
  }
}

async function main() {
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  const docs = await collectDocs()
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(docs, null, 2), 'utf8')
}

main().catch((error) => {
  console.error('[scan-md] failed:', error)
  process.exit(1)
})
