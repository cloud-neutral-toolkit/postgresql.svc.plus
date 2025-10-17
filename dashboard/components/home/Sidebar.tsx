import { getSidebarSections } from '@cms/content'

import SidebarCard from './SidebarCard'

export default async function Sidebar() {
  const sections = await getSidebarSections()

  if (!sections.length) {
    return null
  }

  return (
    <aside className="w-full space-y-6 rounded-3xl border border-blue-100 bg-white/95 p-6 text-slate-900 shadow-xl shadow-blue-200/60 backdrop-blur lg:sticky lg:top-16 lg:h-fit lg:w-[360px]">
      {sections.map((section) => (
        <SidebarCard key={section.slug} section={section} />
      ))}
    </aside>
  )
}
