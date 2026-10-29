import type {PageSearchResults} from './getPagesByKeyword'

export type PageSearchRanking = 'fused' | 'keyword' | 'recent'

const RANKINGS: readonly string[] = ['fused', 'keyword', 'recent']
const MAX_POSITION = 2_147_483_647

export const encodePageSearchCursor = (ranking: PageSearchRanking, position: number) =>
  btoa(JSON.stringify({ranking, position}))

export const decodePageSearchCursor = (cursor: string) => {
  try {
    const {ranking, position} = JSON.parse(atob(cursor))
    if (!RANKINGS.includes(ranking)) return null
    if (!Number.isInteger(position) || position < 0 || position > MAX_POSITION) return null
    return {ranking: ranking as PageSearchRanking, position: position as number}
  } catch {
    return null
  }
}

export const getPageSearchPageInfo = (
  ranking: PageSearchRanking,
  offset: number,
  edgeCount: number,
  hasNextPage: boolean
): PageSearchResults['pageInfo'] => ({
  hasNextPage,
  hasPreviousPage: offset > 0,
  startCursor: edgeCount > 0 ? encodePageSearchCursor(ranking, offset + 1) : null,
  endCursor: edgeCount > 0 ? encodePageSearchCursor(ranking, offset + edgeCount) : null
})
