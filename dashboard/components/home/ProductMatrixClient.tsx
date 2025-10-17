'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import clsx from 'clsx'

import type { HeroSolution } from '@cms/content'

const OVERVIEW_HIGHLIGHTS = [
  '跨集群与多云环境的一体化策略治理',
  '以策略为核心的安全与合规自动化',
  '将标准化模板加速落地业务流程',
]

type ProductMatrixClientProps = {
  solutions: HeroSolution[]
}

export default function ProductMatrixClient({ solutions }: ProductMatrixClientProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeSolution = useMemo(() => solutions[activeIndex] ?? solutions[0], [solutions, activeIndex])

  if (!solutions.length || !activeSolution) {
    return null
  }

  const ctas = [
    activeSolution.primaryCtaLabel && activeSolution.primaryCtaHref
      ? {
          label: activeSolution.primaryCtaLabel,
          href: activeSolution.primaryCtaHref,
          variant: 'primary' as const,
        }
      : null,
    activeSolution.secondaryCtaLabel && activeSolution.secondaryCtaHref
      ? {
          label: activeSolution.secondaryCtaLabel,
          href: activeSolution.secondaryCtaHref,
          variant: 'secondary' as const,
        }
      : null,
    activeSolution.tertiaryCtaLabel && activeSolution.tertiaryCtaHref
      ? {
          label: activeSolution.tertiaryCtaLabel,
          href: activeSolution.tertiaryCtaHref,
          variant: 'ghost' as const,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string; variant: 'primary' | 'secondary' | 'ghost' }>

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/90 p-8 text-slate-100 shadow-2xl shadow-sky-900/30 lg:p-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_65%)]" aria-hidden />
        <header className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-300/80">云原生运营中心</span>
          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            打造一体化的 XControl 控制平面
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            将资产管理、访问控制、可观测与自动化工作流整合到一个响应迅速的体验里，帮助团队高效落地治理策略。
          </p>
        </header>
        <ul className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
          {OVERVIEW_HIGHLIGHTS.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
            >
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-sky-400" aria-hidden />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap gap-2">
            {solutions.map((solution, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={solution.slug}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    'flex min-w-[9rem] flex-1 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200/80',
                    isActive
                      ? 'border-sky-300/80 bg-sky-300/90 text-slate-900 shadow-lg shadow-sky-500/30'
                      : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10',
                  )}
                >
                  <span className="flex-1">{solution.title}</span>
                  <span
                    className={clsx(
                      'ml-2 text-xs font-medium transition',
                      isActive ? 'text-slate-800/80' : 'text-slate-200/60',
                    )}
                  >
                    {solution.tagline}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {activeSolution.tagline ? (
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/80">
                  {activeSolution.tagline}
                </p>
              ) : null}
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">{activeSolution.title}</h2>
              {activeSolution.description ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/70">产品文案</p>
                  <p className="text-sm text-slate-200/90 sm:text-base">{activeSolution.description}</p>
                </div>
              ) : null}
              {activeSolution.bodyHtml ? (
                <div
                  className="prose prose-invert max-w-none text-sm text-slate-200/90 [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: activeSolution.bodyHtml }}
                />
              ) : null}
            </div>
            <div className="space-y-5">
              {activeSolution.features.length ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/70">能力速览</p>
                  <ul className="space-y-2 text-sm text-slate-100">
                    {activeSolution.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {ctas.length ? (
                <div className="flex flex-wrap gap-3">
                  {ctas.map(({ href, label, variant }) => (
                    <Link
                      key={label}
                      prefetch={false}
                      href={href}
                      className={clsx(
                        'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition',
                        variant === 'primary'
                          ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/40 hover:bg-sky-300'
                          : variant === 'secondary'
                          ? 'border border-white/40 text-white hover:border-white'
                          : 'border border-white/10 text-slate-100 hover:border-white/40',
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {solutions.map((solution, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={solution.slug}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={clsx(
                'relative overflow-hidden rounded-3xl border bg-white/5 p-6 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200/80',
                isActive
                  ? 'border-sky-400/80 bg-sky-400/10 text-white shadow-lg shadow-sky-900/40'
                  : 'border-white/10 text-slate-200 hover:border-white/30 hover:bg-white/10',
              )}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300/80">{solution.tagline}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{solution.title}</h3>
              {solution.description ? (
                <p className="mt-2 text-sm text-slate-200/80">{solution.description}</p>
              ) : null}
              <span
                className={clsx(
                  'mt-4 inline-flex items-center text-sm font-semibold',
                  isActive ? 'text-sky-200' : 'text-sky-300/90',
                )}
              >
                {isActive ? '正在专题展示' : '点击专题展示'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
