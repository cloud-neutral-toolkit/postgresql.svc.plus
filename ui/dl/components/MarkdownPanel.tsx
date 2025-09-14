import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export default async function MarkdownPanel({ url, title }: { url: string, title: string }) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const text = await res.text()
    return (
      <div className="rounded-2xl shadow p-4">
        <h2 className="font-semibold mb-2">{title}</h2>
        <ReactMarkdown remarkPlugins={[remarkGfm as any]} rehypePlugins={[rehypeRaw as any]}>{text}</ReactMarkdown>
      </div>
    )
  } catch {
    return null
  }
}
