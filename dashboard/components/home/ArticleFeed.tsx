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
    <section className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">最新动态</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">产品与社区快讯</h2>
        </div>
        <Link
          href="/docs"
          className="text-sm font-semibold text-sky-300 transition hover:text-sky-200"
        >
          浏览全部更新 →
        </Link>
      </header>
      <div className="space-y-8">
        {!posts.length ? (
          <p className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-slate-200/70">
            暂无内容，敬请期待更多来自产品与社区的最新动态。
          </p>
        ) : null}
        {posts.map((post) => {
          const formattedDate = formatDate(post.date)
          return (
            <article
              key={post.slug}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-lg shadow-sky-950/30 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:shadow-sky-900/40 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300/80 sm:text-sm">
                {formattedDate ? <span>{formattedDate}</span> : null}
                {post.author ? (
                  <span className="flex items-center gap-2">
                    <span className="hidden h-1 w-1 rounded-full bg-slate-400/80 sm:inline" aria-hidden />
                    <span>{post.author}</span>
                  </span>
                ) : null}
                {post.readingTime ? (
                  <span className="flex items-center gap-2">
                    <span className="hidden h-1 w-1 rounded-full bg-slate-400/80 sm:inline" aria-hidden />
                    <span>{post.readingTime}</span>
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white transition group-hover:text-sky-200 sm:text-2xl">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="mt-3 text-sm text-slate-200/80 sm:text-base">{post.excerpt}</p>
              ) : null}
              {post.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200"
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
