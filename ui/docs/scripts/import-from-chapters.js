import { execSync } from 'child_process'
import { mkdtempSync, readdirSync, copyFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const repo = 'https://github.com/svc-design/documents'
const include = process.env.INCLUDE ? process.env.INCLUDE.split(',') : []
const exclude = process.env.EXCLUDE ? process.env.EXCLUDE.split(',') : []

const tmp = mkdtempSync(join(tmpdir(), 'documents-'))
execSync(`git clone --depth 1 ${repo} ${tmp}`, { stdio: 'inherit' })

const targets = readdirSync(tmp)
for (const dir of targets) {
  if (include.length && !include.includes(dir)) continue
  if (exclude.includes(dir)) continue
  const chapters = join(tmp, dir, 'CN', 'chapters')
  if (!existsSync(chapters)) continue
  const files = readdirSync(chapters).filter((f) => f.endsWith('.md'))
  for (const file of files) {
    const src = join(chapters, file)
    const dest = join('content', dir, file)
    execSync(`mkdir -p ${join('content', dir)}`)
    copyFileSync(src, dest)
  }
}
rmSync(tmp, { recursive: true, force: true })
