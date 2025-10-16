import Link from 'next/link'

import type { SidebarSection } from '@lib/homepageContent'

interface SidebarCardProps {
  section: SidebarSection
}

function isValidCta(section: SidebarSection): section is SidebarSection & {
  ctaLabel: string
  ctaHref: string
} {
  return Boolean(section.ctaLabel && section.ctaHref)
}

export default function SidebarCard({ section }: SidebarCardProps) {
  const hasTagsLayout = section.layout === 'tags' && section.tags.length > 0

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
        {isValidCta(section) ? (
          <Link
            href={section.ctaHref}
            className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
          >
            {section.ctaLabel}
          </Link>
        ) : null}
      </header>
      {hasTagsLayout ? (
        <div className="flex flex-wrap gap-2">
          {section.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none text-slate-600 [&_a]:text-sky-600 [&_a]:no-underline hover:[&_a]:underline"
          dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
        />
      )}
    </section>
  )
}
