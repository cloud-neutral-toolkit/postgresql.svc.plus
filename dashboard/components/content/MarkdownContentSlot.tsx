'use client'

import { useMemo } from 'react'

import DOMPurify from 'dompurify'
import clsx from 'clsx'
import useSWR from 'swr'

import type { ContentDocumentResponse, ContentCommitInfo } from '@types/content'

interface MarkdownContentSlotProps {
  slug: string
  className?: string
  historyLimit?: number
}

interface VersionRowProps {
  commit: ContentCommitInfo
}

const fetcher = async (url: string): Promise<ContentDocumentResponse> => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to load content: ${response.status}`)
  }
  return response.json()
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function VersionRow({ commit }: VersionRowProps) {
  const date = formatDate(commit.date)
  return (
    <li className="space-y-1 rounded-lg border border-slate-200 bg-white/70 p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-slate-500">{commit.shortHash}</span>
        {date ? <span className="text-xs text-slate-500">{date}</span> : null}
      </div>
      <p className="font-medium text-slate-900">{commit.message}</p>
      <p className="text-xs text-slate-500">{commit.author}</p>
    </li>
  )
}

export default function MarkdownContentSlot({ slug, className, historyLimit = 5 }: MarkdownContentSlotProps) {
  const { data, error, isLoading } = useSWR<ContentDocumentResponse>(`/api/content/${slug}`, fetcher, {
    revalidateOnFocus: false,
  })

  const sanitizedHtml = useMemo(() => {
    if (!data?.html) {
      return ''
    }
    return DOMPurify.sanitize(data.html)
  }, [data?.html])

  if (isLoading) {
    return <div className={clsx('rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500', className)}>正在加载内容…</div>
  }

  if (error || !data) {
    return (
      <div className={clsx('rounded-xl border border-red-200 bg-red-50/60 p-6 text-sm text-red-600', className)}>
        无法加载内容，请稍后重试。
      </div>
    )
  }

  const updatedAt = formatDate(data.versionInfo.updatedAt)
  const limitedHistory = data.versionInfo.history.slice(0, historyLimit)
  const tags = Array.isArray(data.frontmatter.tags)
    ? data.frontmatter.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : []
  const links = Array.isArray(data.frontmatter.links)
    ? data.frontmatter.links.filter((link): link is { label?: string; href?: string } =>
        Boolean(link && typeof link === 'object'),
      )
    : []

  return (
    <article className={clsx('space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm', className)}>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">动态内容</p>
        <h2 className="text-2xl font-bold text-slate-900">{data.frontmatter.title}</h2>
        {data.frontmatter.summary ? (
          <p className="text-sm text-slate-600">{data.frontmatter.summary}</p>
        ) : null}
        <dl className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-wide">版本</dt>
            <dd>{data.versionInfo.version ?? '未标记'}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide">最近更新</dt>
            <dd>{updatedAt ?? '未知'}</dd>
          </div>
          {data.frontmatter.author ? (
            <div>
              <dt className="font-semibold uppercase tracking-wide">作者</dt>
              <dd>{String(data.frontmatter.author)}</dd>
            </div>
          ) : null}
          {data.frontmatter.status ? (
            <div>
              <dt className="font-semibold uppercase tracking-wide">状态</dt>
              <dd>{String(data.frontmatter.status)}</dd>
            </div>
          ) : null}
        </dl>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

      {links.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">相关链接</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {links.map((link, index) => (
              <li key={`${link?.href ?? index}`}>
                {link?.href ? (
                  <a className="text-purple-600 underline decoration-purple-400 underline-offset-2" href={link.href} target="_blank" rel="noreferrer">
                    {link?.label ?? link.href}
                  </a>
                ) : (
                  <span>{link?.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {limitedHistory.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">版本历史</h3>
            <p className="text-xs text-slate-500">最近 {limitedHistory.length} 次提交</p>
          </div>
          <ul className="space-y-2">
            {limitedHistory.map((commit) => (
              <VersionRow key={commit.hash} commit={commit} />
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-xs text-slate-500">暂无提交历史。</p>
      )}
    </article>
  )
}
