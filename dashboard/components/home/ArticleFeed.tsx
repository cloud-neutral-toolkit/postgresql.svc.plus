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
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">最新动态</p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">产品与社区快讯</h2>
        </div>
        <Link href="/docs" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          浏览全部更新 →
        </Link>
      </header>
      <div className="space-y-6">
        {!posts.length ? (
          <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            暂无内容，敬请期待更多来自产品与社区的最新动态。
          </p>
        ) : null}
        {posts.map((post) => {
          const formattedDate = formatDate(post.date)
          return (
            <article
              key={post.slug}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
                {formattedDate ? <span>{formattedDate}</span> : null}
                {post.author ? (
                  <span className="flex items-center gap-2">
                    <span className="hidden h-1 w-1 rounded-full bg-slate-400 sm:inline" aria-hidden />
                    <span>{post.author}</span>
                  </span>
                ) : null}
                {post.readingTime ? (
                  <span className="flex items-center gap-2">
                    <span className="hidden h-1 w-1 rounded-full bg-slate-400 sm:inline" aria-hidden />
                    <span>{post.readingTime}</span>
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 transition group-hover:text-sky-600 sm:text-2xl">
                {post.title}
              </h3>
              {post.excerpt ? <p className="mt-3 text-sm text-slate-600 sm:text-base">{post.excerpt}</p> : null}
              {post.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
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
