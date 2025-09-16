import type { DirListing } from '../types/download'

export interface DownloadSection {
  key: string
  title: string
  href: string
  lastModified?: string
  count?: number
  root: string
}

export function formatSegmentLabel(segment: string): string {
  return segment
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => (part.match(/^[a-z]+$/) ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ') || segment
}

export function findListing(allListings: DirListing[], segments: string[]): DirListing | undefined {
  const normalized = segments.filter((segment) => segment.length > 0).join('/')
  const key = normalized ? `${normalized}/` : ''
  return allListings.find((listing) => listing.path === key)
}

export function countFiles(listing: DirListing, allListings: DirListing[]): number {
  const baseSegments = listing.path.split('/').filter(Boolean)
  return listing.entries.reduce((total, entry) => {
    if (entry.type === 'file') {
      return total + 1
    }
    if (entry.type === 'dir') {
      const child = findListing(allListings, [...baseSegments, entry.name])
      if (child) {
        return total + countFiles(child, allListings)
      }
    }
    return total
  }, 0)
}

export function buildSectionsForListing(
  listing: DirListing,
  allListings: DirListing[],
  baseSegments: string[],
): DownloadSection[] {
  return listing.entries
    .filter((entry) => entry.type === 'dir')
    .map((entry) => {
      const segments = [...baseSegments, entry.name]
      const childListing = findListing(allListings, segments)
      return {
        key: segments.join('/'),
        title: formatSegmentLabel(entry.name),
        href: `/download/${segments.join('/')}`,
        lastModified: entry.lastModified,
        count: childListing ? countFiles(childListing, allListings) : undefined,
        root: baseSegments[0] ?? entry.name,
      }
    })
}

export function buildDownloadSections(allListings: DirListing[]): Record<string, DownloadSection[]> {
  const rootListing = findListing(allListings, [])
  if (!rootListing) {
    return {}
  }

  const sectionsMap: Record<string, DownloadSection[]> = {}

  for (const entry of rootListing.entries) {
    if (entry.type !== 'dir') continue
    const rootSegments = [entry.name]
    const listing = findListing(allListings, rootSegments)
    if (!listing) {
      sectionsMap[entry.name] = [
        {
          key: rootSegments.join('/'),
          title: formatSegmentLabel(entry.name),
          href: `/download/${rootSegments.join('/')}`,
          lastModified: entry.lastModified,
          root: entry.name,
        },
      ]
      continue
    }

    const childSections = buildSectionsForListing(listing, allListings, rootSegments)
    const hasFiles = listing.entries.some((item) => item.type === 'file')
    if (childSections.length > 0) {
      sectionsMap[entry.name] = hasFiles
        ? [
            {
              key: rootSegments.join('/'),
              title: formatSegmentLabel(entry.name),
              href: `/download/${rootSegments.join('/')}`,
              lastModified: entry.lastModified,
              count: countFiles(listing, allListings),
              root: entry.name,
            },
            ...childSections,
          ]
        : childSections;
    } else {
      sectionsMap[entry.name] = [
        {
          key: rootSegments.join('/'),
          title: formatSegmentLabel(entry.name),
          href: `/download/${rootSegments.join('/')}`,
          lastModified: entry.lastModified,
          count: countFiles(listing, allListings),
          root: entry.name,
        },
      ]
    }
  }

  return sectionsMap
}
