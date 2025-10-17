import ContactPanel from './ContactPanel'
import ProductMatrixClient from './ProductMatrixClient'

import { getHeroSolutions } from '@lib/homepageContent'

export default async function ProductMatrix() {
  const solutions = await getHeroSolutions()

  if (!solutions.length) {
    return null
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] lg:items-start">
      <ProductMatrixClient solutions={solutions} />
      <ContactPanel className="lg:sticky lg:top-6" />
    </div>
  )
}
