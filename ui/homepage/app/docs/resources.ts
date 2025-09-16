export interface DocResource {
  slug: string
  title: string
  description: string
  category?: string
  version?: string
  updatedAt?: string
  pdfUrl?: string
  htmlUrl?: string
  tags?: string[]
  estimatedMinutes?: number
  coverImage?: string
}

export const docResources: DocResource[] = [
  {
    slug: 'observability-design-and-implementation',
    title: 'Observability Design and Implementation',
    description:
      'Comprehensive design whitepaper that explains the end-to-end observability stack, including collection, storage, query federation and dashboarding best practices.',
    category: 'Observability',
    version: 'CN v28',
    updatedAt: '2024-08-01',
    pdfUrl:
      'https://dl.svc.plus/docs/Observability/CN-v28-17749789283/Observability-Design-and-Implementation.pdf',
    htmlUrl:
      'https://dl.svc.plus/docs/Observability/CN-v28-17749789283/Observability-Design-and-Implementation.html',
    tags: ['Architecture', 'DeepFlow', 'Operations'],
    estimatedMinutes: 45,
  },
]

export function getDocResource(slug: string): DocResource | undefined {
  return docResources.find((doc) => doc.slug === slug)
}
