import fs from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import slug from 'remark-slug'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import type { Root } from 'mdast'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  CONTENT_GIT_HISTORY_LIMIT,
  REPO_ROOT,
  resolveContentFile,
  resolveRepoPath,
} from '../../../../config/content'

import type {
  ContentDocumentResponse,
  ContentFrontmatter,
  ContentHeading,
} from '../../../../types/content'

export const runtime = 'nodejs'

const execFileAsync = promisify(execFile)

interface GitCommitRow {
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
}

function isValidSlug(slugParam: unknown): slugParam is string[] {
  return Array.isArray(slugParam) && slugParam.every((segment) => typeof segment === 'string')
}

function createHeadingCollector(headings: ContentHeading[]) {
  return () => (tree: Root) => {
    visit(tree, 'heading', (node) => {
      const text = toString(node)
      const depth = node.depth ?? 0
      const id = (node.data as any)?.id ?? (node as any).data?.hProperties?.id
      headings.push({
        id: typeof id === 'string' && id ? id : text.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, ''),
        text,
        depth,
      })
    })
  }
}

async function renderMarkdown(source: string): Promise<{ html: string; headings: ContentHeading[] }> {
  const headings: ContentHeading[] = []
  const processor = remark().use(gfm).use(slug).use(createHeadingCollector(headings)).use(html, {
    sanitize: false,
  })
  const result = await processor.process(source)
  return { html: String(result), headings }
}

async function readGitHistory(relativePath: string): Promise<GitCommitRow[]> {
  const args = [
    'log',
    `-n`,
    String(CONTENT_GIT_HISTORY_LIMIT),
    '--date=iso-strict',
    "--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s",
    '--',
    relativePath,
  ]

  try {
    const { stdout } = await execFileAsync('git', args, { cwd: REPO_ROOT })
    if (!stdout.trim()) {
      return []
    }

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [hash, shortHash, author, date, message] = line.split('\u001f')
        return { hash, shortHash, author, date, message }
      })
      .filter((commit): commit is GitCommitRow =>
        Boolean(commit.hash && commit.shortHash && commit.author && commit.date && commit.message),
      )
  } catch (error) {
    console.warn('[content] failed to read git history', error)
    return []
  }
}

function mergeFrontmatter(
  slug: string,
  frontmatter: Record<string, unknown>,
  gitHistory: GitCommitRow[],
): ContentDocumentResponse {
  const normalizedFrontmatter: ContentFrontmatter = { ...frontmatter }
  const latest = gitHistory[0]

  const updatedAt =
    typeof normalizedFrontmatter.updatedAt === 'string' && normalizedFrontmatter.updatedAt
      ? normalizedFrontmatter.updatedAt
      : latest?.date ?? null

  const version = typeof normalizedFrontmatter.version === 'string' ? normalizedFrontmatter.version : null

  const slugOverride =
    typeof normalizedFrontmatter.slug === 'string' && normalizedFrontmatter.slug.trim()
      ? normalizedFrontmatter.slug.trim()
      : null

  return {
    slug: slugOverride ?? slug,
    html: '',
    headings: [],
    frontmatter: normalizedFrontmatter,
    versionInfo: {
      updatedAt,
      version,
      latestCommit: latest
        ? {
            hash: latest.hash,
            shortHash: latest.shortHash,
            author: latest.author,
            date: latest.date,
            message: latest.message,
          }
        : null,
      history: gitHistory.map((commit) => ({
        hash: commit.hash,
        shortHash: commit.shortHash,
        author: commit.author,
        date: commit.date,
        message: commit.message,
      })),
    },
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: { slug?: string[] } },
): Promise<NextResponse<ContentDocumentResponse | { error: string }>> {
  const { slug } = context.params
  if (!isValidSlug(slug) || slug.length === 0) {
    return NextResponse.json({ error: 'Missing content slug' }, { status: 400 })
  }

  let contentFile
  try {
    contentFile = resolveContentFile(slug)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid content slug' }, { status: 400 })
  }

  const { absolutePath, relativePath } = contentFile

  try {
    const file = await fs.readFile(absolutePath, 'utf8')
    const parsed = matter(file)
    const slugName = slug.join('/')
    const gitHistory = await readGitHistory(resolveRepoPath(relativePath))
    const baseResponse = mergeFrontmatter(slugName, parsed.data ?? {}, gitHistory)
    const rendered = await renderMarkdown(parsed.content)

    const response: ContentDocumentResponse = {
      ...baseResponse,
      html: rendered.html,
      headings: rendered.headings,
    }

    if (typeof baseResponse.frontmatter.title !== 'string' || !baseResponse.frontmatter.title) {
      response.frontmatter.title = slug[slug.length - 1] ?? 'Untitled'
    }

    return NextResponse.json(response)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }
    console.error('[content] failed to load content', error)
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 })
  }
}
