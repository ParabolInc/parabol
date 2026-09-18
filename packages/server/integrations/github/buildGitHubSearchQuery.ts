import type {GitHubSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, rejectUnknownKeys} from '../platform/searchMeta'

const buildGitHubSearchQuery = (
  queryString: string,
  meta: JsonObject
): GitHubSearchQueryJson | Error => {
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(meta)
  if (invalid) return invalid
  return {queryString: queryString.toLowerCase().trim()}
}

export default buildGitHubSearchQuery
