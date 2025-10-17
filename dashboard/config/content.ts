import path from 'node:path'

const dashboardRoot = process.cwd()
export const REPO_ROOT = path.resolve(dashboardRoot, '..')

const envOverride = process.env.CONTENT_DIR ? path.resolve(REPO_ROOT, process.env.CONTENT_DIR) : null

export const CONTENT_ROOT = envOverride ?? path.join(REPO_ROOT, 'content')

export const DEFAULT_CONTENT_HISTORY_LIMIT = Number.parseInt(
  process.env.CONTENT_HISTORY_LIMIT ?? '10',
  10,
)

export function resolveContentFile(slugSegments: string[]): { absolutePath: string; relativePath: string } {
  const safeSegments = slugSegments
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .map((segment) => segment.replace(/\\/g, '/'))
  const normalized = safeSegments.join('/')
  const relativePath = `${normalized || 'index'}.md`
  const absolutePath = path.join(CONTENT_ROOT, relativePath)
  if (!absolutePath.startsWith(CONTENT_ROOT)) {
    throw new Error('Invalid content path')
  }
  return { absolutePath, relativePath }
}

export function resolveRepoPath(relativeContentPath: string): string {
  const absolute = path.join(CONTENT_ROOT, relativeContentPath)
  return path.relative(REPO_ROOT, absolute)
}

export const CONTENT_GIT_HISTORY_LIMIT = Math.max(DEFAULT_CONTENT_HISTORY_LIMIT, 1)
