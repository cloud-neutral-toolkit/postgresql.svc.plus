import manifestData from '../public/dl-index/artifacts-manifest.json'
import fallbackData from '../public/dl-index/all.json'
import type { DirListing } from '../types/download'

const manifestListings = Array.isArray(manifestData) ? (manifestData as DirListing[]) : []
const fallbackListings = Array.isArray(fallbackData) ? (fallbackData as DirListing[]) : []

export const DOWNLOAD_LISTINGS: DirListing[] =
  manifestListings.length > 0 ? manifestListings : fallbackListings

export function getDownloadListings(): DirListing[] {
  return DOWNLOAD_LISTINGS
}
