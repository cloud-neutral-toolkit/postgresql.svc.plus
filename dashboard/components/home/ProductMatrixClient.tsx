'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import clsx from 'clsx'

import type { HeroSolution } from '@cms/content'
import { useLanguage } from '@i18n/LanguageProvider'
import { translations } from '@i18n/translations'

const heroBackgroundOverlay =
  'absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_70%)]'

type ProductMatrixClientProps = {
  solutions: HeroSolution[]
}

export default function ProductMatrixClient({ solutions }: ProductMatrixClientProps) {
  const { language } = useLanguage()
  const marketing = translations[language].marketing.home
  const [activeIndex, setActiveIndex] = useState(0)

  const localizedSolutions = useMemo(() => {
    const overrides = marketing.solutionOverrides ?? {}
    return solutions.map((solution) => {
      const override = overrides[solution.slug]
      if (!override) {
        return solution
      }
      return {
        ...solution,
        title: override.title ?? solution.title,
        tagline: override.tagline ?? solution.tagline,
        description: override.description ?? solution.description,
        features:
          override.features && override.features.length ? override.features : solution.features,
        bodyHtml: override.bodyHtml ?? solution.bodyHtml,
        primaryCtaLabel: override.primaryCtaLabel ?? solution.primaryCtaLabel,
        secondaryCtaLabel: override.secondaryCtaLabel ?? solution.secondaryCtaLabel,
        tertiaryCtaLabel: override.tertiaryCtaLabel ?? solution.tertiaryCtaLabel,
      }
    })
  }, [marketing.solutionOverrides, solutions])

  const activeSolution = useMemo(
    () => localizedSolutions[activeIndex] ?? localizedSolutions[0],
    [localizedSolutions, activeIndex],
  )

  if (!localizedSolutions.length || !activeSolution) {
    return null
  }

  const { productMatrix } = marketing
  const overviewHighlights = productMatrix.highlights

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
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white p-8 text-slate-900 shadow-2xl shadow-blue-200/60 lg:p-12">
        <div className={heroBackgroundOverlay} aria-hidden />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,_rgba(234,243,255,0.95),_rgba(207,228,255,0.65))]" aria-hidden />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <header className="space-y-3">
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-blue-700">
                {productMatrix.badge}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {productMatrix.title}
              </h1>
              <p className="text-sm text-slate-700 sm:text-base lg:text-lg">
                {productMatrix.description}
              </p>
            </header>
            <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
              {overviewHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-3"
                >
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" aria-hidden />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-3 sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                {productMatrix.topicsLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {localizedSolutions.map((solution, index) => {
                  const isActive = index === activeIndex
                  return (
                    <button
                      key={solution.slug}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={clsx(
                        'flex min-w-[9rem] flex-1 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300',
                        isActive
                          ? 'border-blue-400 bg-blue-100 text-slate-900 shadow-lg shadow-blue-300/40'
                          : 'border-blue-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50',
                      )}
                    >
                      <span className="flex-1">{solution.title}</span>
                      <span
                        className={clsx(
                          'ml-2 text-xs font-medium transition',
                          isActive ? 'text-slate-800/80' : 'text-slate-500',
                        )}
                      >
                        {solution.tagline}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-inner shadow-blue-100/80 backdrop-blur-sm lg:p-8">
            <div className="space-y-4">
              {activeSolution.tagline ? (
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">
                  {activeSolution.tagline}
                </p>
              ) : null}
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{activeSolution.title}</h2>
              {activeSolution.description ? (
                <p className="text-sm text-slate-700 sm:text-base">{activeSolution.description}</p>
              ) : null}
              {activeSolution.bodyHtml ? (
                <div
                  className="prose max-w-none text-sm text-slate-800 [&_strong]:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: activeSolution.bodyHtml }}
                />
              ) : null}
            </div>
            {activeSolution.features.length ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">
                  {productMatrix.capabilitiesLabel}
                </p>
                <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  {activeSolution.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {ctas.length ? (
              <div className="flex flex-wrap gap-3 pt-2">
                {ctas.map(({ href, label, variant }) => (
                  <Link
                    key={label}
                    prefetch={false}
                    href={href}
                    className={clsx(
                      'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition',
                      variant === 'primary'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/50 hover:bg-blue-700'
                        : variant === 'secondary'
                        ? 'border border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50'
                        : 'border border-blue-100 text-slate-700 hover:border-blue-200 hover:bg-blue-50/80',
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
    </section>
  )
}
