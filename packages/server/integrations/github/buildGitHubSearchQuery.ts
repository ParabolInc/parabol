import type {GitHubSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, parseMetaList, rejectUnknownKeys} from '../platform/searchMeta'

const buildGitHubSearchQuery = (
  queryString: string,
  meta: JsonObject
): GitHubSearchQueryJson | Error => {
  const {repos, ...rest} = meta
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(rest)
  if (invalid) return invalid
  const sortedRepos = repos === undefined ? [] : parseMetaList('repos', repos)
  if (sortedRepos instanceof Error) return sortedRepos
  const normalizedQueryString = queryString.toLowerCase().trim()
  return sortedRepos.length > 0
    ? {queryString: normalizedQueryString, repos: sortedRepos}
    : {queryString: normalizedQueryString}
}

export default buildGitHubSearchQuery
