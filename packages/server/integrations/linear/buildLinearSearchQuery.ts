import type {LinearSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, parseMetaList, rejectUnknownKeys} from '../platform/searchMeta'

const buildLinearSearchQuery = (
  queryString: string,
  meta: JsonObject
): LinearSearchQueryJson | Error => {
  const {projectIds, teamIds, ...rest} = meta
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(rest)
  if (invalid) return invalid
  const sortedProjectIds = parseMetaList('projectIds', projectIds)
  if (sortedProjectIds instanceof Error) return sortedProjectIds
  const sortedTeamIds = parseMetaList('teamIds', teamIds)
  if (sortedTeamIds instanceof Error) return sortedTeamIds
  return {queryString: queryString.trim(), projectIds: sortedProjectIds, teamIds: sortedTeamIds}
}

export default buildLinearSearchQuery
