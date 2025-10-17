import { getSidebarSections } from '@cms/content'

import SidebarCard from './SidebarCard'

export default async function Sidebar() {
  const sections = await getSidebarSections()

  return (
    <aside className="space-y-6">
      {sections.map((section) => (
        <SidebarCard key={section.slug} section={section} />
      ))}
    </aside>
  )
}
