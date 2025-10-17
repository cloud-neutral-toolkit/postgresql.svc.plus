export const dynamic = 'error'

import { getActiveTemplate } from '@cms'

const template = getActiveTemplate()
const HomePageTemplate = template.pages.home

export default function HomePage() {
  return <HomePageTemplate />
}
