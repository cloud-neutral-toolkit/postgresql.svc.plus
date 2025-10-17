export interface ContentFrontmatter {
  [key: string]: unknown
  title?: string
  summary?: string
  version?: string
  updatedAt?: string
  tags?: string[]
  status?: string
  author?: string
  links?: Array<{ label?: string; href?: string }>
  slug?: string
}

export interface ContentHeading {
  id: string
  text: string
  depth: number
}

export interface ContentCommitInfo {
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
}

export interface ContentVersionInfo {
  version: string | null
  updatedAt: string | null
  latestCommit: ContentCommitInfo | null
  history: ContentCommitInfo[]
}

export interface ContentDocumentResponse {
  slug: string
  html: string
  headings: ContentHeading[]
  frontmatter: ContentFrontmatter
  versionInfo: ContentVersionInfo
}
