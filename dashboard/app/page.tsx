export const dynamic = 'error'

import ArticleFeed from '@components/home/ArticleFeed'
import ProductMatrix from '@components/home/ProductMatrix'
import Sidebar from '@components/home/Sidebar'

import { getActiveTemplate } from '../src/templateRegistry'

const template = getActiveTemplate()
const HomePageTemplate = template.pages.home

export default function HomePage() {
  return (
    <HomePageTemplate
      slots={{
        ProductMatrix,
        ArticleFeed,
        Sidebar,
      }}
    />
  )
}
