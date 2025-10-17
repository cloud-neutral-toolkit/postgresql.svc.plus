import Link from 'next/link'

import { getHomepagePosts } from '@cms/content'

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default async function ArticleFeed() {
  const posts = await getHomepagePosts()

  return (
    <section className="space-y-8 text-slate-900">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">最新动态</p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">产品与社区快讯</h2>
        </div>
        <Link
          href="/docs"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          浏览全部更新 →
        </Link>
      </header>
      <div className="space-y-8">
        {!posts.length ? (
          <p className="rounded-3xl border border-dashed border-blue-200/70 bg-white/80 p-8 text-center text-sm text-slate-700">
            暂无内容，敬请期待更多来自产品与社区的最新动态。
          </p>
        ) : null}
        {posts.map((post) => {
          const formattedDate = formatDate(post.date)
          return (
            <article
              key={post.slug}
              className="group rounded-3xl border border-blue-100 bg-white p-6 text-slate-800 shadow-lg shadow-blue-100/60 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-blue-200 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
                {formattedDate ? <span>{formattedDate}</span> : null}
                {post.author ? (
                  <span className="flex items-center gap-2">
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                    <span>{post.author}</span>
                  </span>
                ) : null}
                {post.readingTime ? (
                  <span className="flex items-center gap-2">
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                    <span>{post.readingTime}</span>
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 transition group-hover:text-blue-700 sm:text-2xl">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="mt-3 text-sm text-slate-700 sm:text-base">{post.excerpt}</p>
              ) : null}
              {post.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
