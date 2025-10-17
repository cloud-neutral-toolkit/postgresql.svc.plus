import type { CommonHomeLayoutConfig } from '@templates/layouts/commonHome'

export const defaultHomeLayoutConfig: CommonHomeLayoutConfig = {
  rootClassName:
    'relative min-h-screen bg-gradient-to-b from-[#EAF3FF] to-[#CFE4FF] text-slate-900 antialiased',
  hero: {
    sectionClassName: 'relative isolate overflow-hidden py-24',
    overlays: [
      'absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-transparent',
      'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_65%)]',
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
      'absolute inset-x-0 top-0 h-px bg-blue-100/70',
      'absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_70%)]',
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
