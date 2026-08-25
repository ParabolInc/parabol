import type {JiraSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'

const MAX_QUERY_STRING_LENGTH = 2000
const MAX_PROJECT_KEY_FILTERS = 100
const MAX_PROJECT_KEY_LENGTH = 64

const buildJiraSearchQuery = (
  queryString: string,
  meta: JsonObject
): JiraSearchQueryJson | Error => {
  if (queryString.length > MAX_QUERY_STRING_LENGTH) {
    return new Error(`queryString must be at most ${MAX_QUERY_STRING_LENGTH} characters`)
  }
  const {isJQL, projectKeyFilters, ...rest} = meta
  const unknownKeys = Object.keys(rest)
  if (unknownKeys.length > 0) return new Error(`Unknown meta keys: ${unknownKeys.join(', ')}`)
  if (typeof isJQL !== 'boolean') return new Error('meta.isJQL must be a boolean')
  if (!Array.isArray(projectKeyFilters)) return new Error('meta.projectKeyFilters must be an array')
  if (projectKeyFilters.length > MAX_PROJECT_KEY_FILTERS) {
    return new Error(`meta.projectKeyFilters must have at most ${MAX_PROJECT_KEY_FILTERS} keys`)
  }
  const isProjectKey = (key: unknown): key is string =>
    typeof key === 'string' && key.length > 0 && key.length <= MAX_PROJECT_KEY_LENGTH
  if (!projectKeyFilters.every(isProjectKey)) {
    return new Error(
      `meta.projectKeyFilters must be non-empty strings of at most ${MAX_PROJECT_KEY_LENGTH} characters`
    )
  }
  return {queryString: queryString.trim(), isJQL, projectKeyFilters: [...projectKeyFilters].sort()}
}

export default buildJiraSearchQuery
