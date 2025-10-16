import Link from 'next/link'

import { getHomepageHero, getHeroSolutions } from '@lib/homepageContent'
import HeroProductTabs from './HeroProductTabs'

const gradientOverlay =
  'absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-sky-900/70'

export default async function HeroBanner() {
  const [hero, solutions] = await Promise.all([getHomepageHero(), getHeroSolutions()])

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      </div>
      <div className={gradientOverlay} aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 text-white sm:py-20 lg:flex-row lg:items-center lg:py-24">
        <div className="flex-1 space-y-6">
          {hero.eyebrow ? (
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium tracking-wide">
              {hero.eyebrow}
            </span>
          ) : null}
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {hero.title}
            </h1>
            {hero.subtitle ? (
              <p className="text-base text-slate-200 sm:text-lg lg:text-xl">{hero.subtitle}</p>
            ) : null}
          </div>
          {hero.highlights.length ? (
            <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 sm:text-base">
              {hero.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-sky-400" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {hero.bodyHtml ? (
            <div
              className="prose prose-invert max-w-none text-sm text-slate-200 sm:text-base"
              dangerouslySetInnerHTML={{ __html: hero.bodyHtml }}
            />
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {hero.primaryCtaLabel && hero.primaryCtaHref ? (
              <Link
                href={hero.primaryCtaHref}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-sky-300"
              >
                {hero.primaryCtaLabel}
              </Link>
            ) : null}
            {hero.secondaryCtaLabel && hero.secondaryCtaHref ? (
              <Link
                href={hero.secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white"
              >
                {hero.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex-1">
          {solutions.length ? (
            <HeroProductTabs items={solutions} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg sm:p-8 lg:p-10">
              <h2 className="text-lg font-semibold text-white sm:text-xl">平台概览</h2>
              <p className="mt-3 text-sm text-slate-200 sm:text-base">
                通过统一的控制平面与开放接口，XControl 将治理、观测、安全与工作流整合为一体，让团队可以自信地扩展云原生业务。
              </p>
              {hero.highlights.length ? (
                <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                  {hero.highlights.slice(0, 4).map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
                      {item}
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
