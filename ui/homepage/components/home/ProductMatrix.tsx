import Link from 'next/link'

import { getHeroSolutions } from '@lib/homepageContent'

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength - 1)}…`
}

export default async function ProductMatrix() {
  const solutions = await getHeroSolutions()

  if (!solutions.length) {
    return null
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">产品矩阵</p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">旗舰能力一览</h2>
        </div>
        <Link href="/docs" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          查看全部方案 →
        </Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {solutions.map((solution) => (
          <article
            key={solution.slug}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400 opacity-0 transition group-hover:opacity-100" aria-hidden />
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-sky-600">
                  {solution.title}
                </h3>
                {solution.tagline ? (
                  <p className="mt-1 text-sm text-slate-500">{truncate(solution.tagline, 60)}</p>
                ) : null}
              </div>
              {solution.features.length ? (
                <ul className="space-y-2 text-sm text-slate-600">
                  {solution.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {solution.bodyHtml ? (
                <div
                  className="prose prose-sm max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: solution.bodyHtml }}
                />
              ) : null}
            </div>
            {(solution.primaryCtaLabel && solution.primaryCtaHref) ||
            (solution.secondaryCtaLabel && solution.secondaryCtaHref) ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {solution.primaryCtaLabel && solution.primaryCtaHref ? (
                  <Link
                    href={solution.primaryCtaHref}
                    className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400"
                  >
                    {solution.primaryCtaLabel}
                  </Link>
                ) : null}
                {solution.secondaryCtaLabel && solution.secondaryCtaHref ? (
                  <Link
                    href={solution.secondaryCtaHref}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    {solution.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
