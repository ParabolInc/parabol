import type {PreloadFetchPolicy} from 'react-relay'

const REFETCH_AFTER_MS = 60_000
const STORE_ONLY = 'store-only' as PreloadFetchPolicy
const lastFetchedAt = new Map<number, number>()

export const getSyncedBlockPlacesFetchPolicy = (
  pageCode: number,
  now: number
): PreloadFetchPolicy => {
  const fetchedAt = lastFetchedAt.get(pageCode)
  if (fetchedAt !== undefined && now - fetchedAt < REFETCH_AFTER_MS) return STORE_ONLY
  lastFetchedAt.set(pageCode, now)
  return 'store-and-network'
}
