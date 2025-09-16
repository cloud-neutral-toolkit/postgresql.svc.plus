import manifestData from '../public/dl-index/manifest.json'
import fallbackData from '../public/dl-index/all.json'
import type { DirListing } from '../types/download'

const manifestListings = (manifestData as DirListing[]) ?? []
const fallbackListings = (fallbackData as DirListing[]) ?? []

const listings = manifestListings.length > 0 ? manifestListings : fallbackListings

export function getDownloadListings(): DirListing[] {
  return listings
}
