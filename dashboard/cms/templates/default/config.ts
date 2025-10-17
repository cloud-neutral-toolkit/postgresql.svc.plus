import type { CommonHomeLayoutConfig } from '@templates/layouts/commonHome'

export const defaultHomeLayoutConfig: CommonHomeLayoutConfig = {
  rootClassName: 'bg-slate-950',
  hero: {
    sectionClassName: 'relative isolate overflow-hidden pb-24 pt-24 text-slate-100',
    overlays: [
      'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]',
      'absolute inset-0 bg-[linear-gradient(130deg,_rgba(12,18,32,0.92),_rgba(8,47,73,0.45))]',
    ],
    containerClassName: 'relative px-4',
    contentClassName: 'mx-auto max-w-6xl',
    slot: {
      key: 'ProductMatrix',
    },
  },
  content: {
    sectionClassName: 'relative bg-slate-50 pb-16 pt-20',
    overlays: ['absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950 via-slate-900/0'],
    containerClassName: 'relative px-4',
    contentClassName: 'mx-auto max-w-6xl',
    gridClassName: 'grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] lg:items-start',
    slots: [
      { key: 'ArticleFeed' },
      { key: 'Sidebar' },
    ],
  },
}
