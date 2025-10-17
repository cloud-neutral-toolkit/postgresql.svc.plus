import type { CommonHomeLayoutConfig } from '@templates/layouts/commonHome'

export const defaultHomeLayoutConfig: CommonHomeLayoutConfig = {
  rootClassName:
    'relative min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0C1A2E] to-[#0F172A] text-slate-100',
  hero: {
    sectionClassName: 'relative isolate overflow-hidden py-24',
    overlays: [
      'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]',
      'absolute inset-0 bg-[linear-gradient(130deg,_rgba(12,18,32,0.92),_rgba(8,47,73,0.45))]',
    ],
    containerClassName: 'relative px-6 sm:px-8',
    contentClassName: 'mx-auto max-w-7xl',
    slot: {
      key: 'ProductMatrix',
    },
  },
  content: {
    sectionClassName: 'relative isolate py-20',
    overlays: [
      'absolute inset-x-0 top-0 h-px bg-white/10',
      'absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.08),_transparent_65%)]',
    ],
    containerClassName: 'relative px-6 sm:px-8',
    contentClassName: 'mx-auto max-w-7xl',
    gridClassName:
      'grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12',
    slots: [
      { key: 'ArticleFeed' },
      { key: 'Sidebar' },
    ],
  },
}
