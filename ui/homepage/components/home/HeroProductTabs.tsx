'use client'

import Link from 'next/link'
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'

import type { HeroSolution } from '@lib/homepageContent'

const ROTATION_INTERVAL_MS = 8000

type HeroProductTabsProps = {
  items: HeroSolution[]
}

export default function HeroProductTabs({ items }: HeroProductTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const tablistId = useId()

  useEffect(() => {
    if (items.length <= 1) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        const nextIndex = current + 1
        return nextIndex >= items.length ? 0 : nextIndex
      })
    }, ROTATION_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [activeIndex, items.length])

  const activeItem = items[activeIndex] ?? items[0]

  const panelId = useMemo(() => {
    if (!activeItem) {
      return undefined
    }
    return `${tablistId}-panel-${activeItem.slug}`
  }, [activeItem, tablistId])

  if (!items.length || !activeItem) {
    return null
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (items.length <= 1) {
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(index === items.length - 1 ? 0 : index + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index === 0 ? items.length - 1 : index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(items.length - 1)
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur-lg sm:p-8">
      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300/90">产品矩阵</span>
      <div
        id={tablistId}
        role="tablist"
        aria-label="XControl 产品套件"
        className="mt-4 flex flex-wrap gap-2"
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex
          const tabId = `${tablistId}-tab-${item.slug}`
          const targetPanelId = `${tablistId}-panel-${item.slug}`
          return (
            <button
              key={item.slug}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={targetPanelId}
              className={`group flex min-w-[9rem] flex-col rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200/80 ${
                isActive
                  ? 'border-sky-300/80 bg-sky-300/90 text-slate-900 shadow-lg shadow-sky-500/30'
                  : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10'
              }`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="text-base font-semibold leading-tight">{item.title}</span>
              {item.tagline ? (
                <span
                  className={`mt-1 text-xs font-medium transition ${
                    isActive ? 'text-slate-800/80' : 'text-slate-200/70 group-hover:text-slate-100'
                  }`}
                >
                  {item.tagline}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${tablistId}-tab-${activeItem.slug}`}
        className="mt-6 flex flex-1 flex-col rounded-2xl border border-white/10 bg-slate-950/30 p-6 shadow-inner shadow-slate-950/40 sm:p-7"
      >
        <div className="flex flex-col gap-2">
          {activeItem.tagline ? (
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-200/80">
              {activeItem.tagline}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold sm:text-3xl">{activeItem.title}</h2>
          {activeItem.description ? (
            <p className="text-sm text-slate-200/90 sm:text-base">{activeItem.description}</p>
          ) : null}
        </div>
        {activeItem.features.length ? (
          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2 sm:text-base">
            {activeItem.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100"
              >
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-sky-400" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {activeItem.bodyHtml ? (
          <div
            className="prose prose-invert mt-5 max-w-none text-sm text-slate-200/90 [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: activeItem.bodyHtml }}
          />
        ) : null}
        {(activeItem.primaryCtaLabel && activeItem.primaryCtaHref) ||
        (activeItem.secondaryCtaLabel && activeItem.secondaryCtaHref) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {activeItem.primaryCtaLabel && activeItem.primaryCtaHref ? (
              <Link
                prefetch={false}
                href={activeItem.primaryCtaHref}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-sky-300"
              >
                {activeItem.primaryCtaLabel}
              </Link>
            ) : null}
            {activeItem.secondaryCtaLabel && activeItem.secondaryCtaHref ? (
              <Link
                prefetch={false}
                href={activeItem.secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white"
              >
                {activeItem.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 via-slate-950/0" aria-hidden />
    </div>
  )
}
