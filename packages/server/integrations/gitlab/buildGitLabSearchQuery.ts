import type {GitLabSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, parseMetaList, rejectUnknownKeys} from '../platform/searchMeta'

const buildGitLabSearchQuery = (
  queryString: string,
  meta: JsonObject
): GitLabSearchQueryJson | Error => {
  const {projectIds, ...rest} = meta
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(rest)
  if (invalid) return invalid
  const sortedProjectIds = parseMetaList('projectIds', projectIds)
  if (sortedProjectIds instanceof Error) return sortedProjectIds
  return {queryString: queryString.trim(), projectIds: sortedProjectIds}
}

export default buildGitLabSearchQuery
