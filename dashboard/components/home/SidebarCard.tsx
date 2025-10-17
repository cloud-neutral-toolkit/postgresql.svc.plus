import Link from 'next/link'

import type { SidebarSection } from '@cms/content'

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
    <section className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-md shadow-sky-900/10">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
        {isValidCta(section) ? (
          <Link
            href={section.ctaHref}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
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
          className="prose prose-sm max-w-none text-slate-600 [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline"
          dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
        />
      )}
    </section>
  )
}
