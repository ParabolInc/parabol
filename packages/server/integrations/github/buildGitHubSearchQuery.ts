import type {GitHubSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'

const MAX_QUERY_STRING_LENGTH = 2000

const buildGitHubSearchQuery = (
  queryString: string,
  meta: JsonObject
): GitHubSearchQueryJson | Error => {
  if (queryString.length > MAX_QUERY_STRING_LENGTH) {
    return new Error(`queryString must be at most ${MAX_QUERY_STRING_LENGTH} characters`)
  }
  const unknownKeys = Object.keys(meta)
  if (unknownKeys.length > 0) return new Error(`Unknown meta keys: ${unknownKeys.join(', ')}`)
  return {queryString: queryString.toLowerCase().trim()}
}

export default buildGitHubSearchQuery
