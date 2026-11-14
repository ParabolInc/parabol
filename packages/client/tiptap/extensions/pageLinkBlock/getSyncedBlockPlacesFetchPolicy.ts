import type {PreloadFetchPolicy} from 'react-relay'

const REFETCH_AFTER_MS = 60_000
const lastFetchedAt = new Map<number, number>()

export const getSyncedBlockPlacesFetchPolicy = (
  pageCode: number,
  now: number
): PreloadFetchPolicy => {
  const fetchedAt = lastFetchedAt.get(pageCode)
  if (fetchedAt !== undefined && now - fetchedAt < REFETCH_AFTER_MS) return 'store-or-network'
  lastFetchedAt.set(pageCode, now)
  return 'store-and-network'
}
