import type {JiraSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, parseMetaList, rejectUnknownKeys} from '../platform/searchMeta'

const buildJiraSearchQuery = (
  queryString: string,
  meta: JsonObject
): JiraSearchQueryJson | Error => {
  const {isJQL, projectKeyFilters, ...rest} = meta
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(rest)
  if (invalid) return invalid
  if (typeof isJQL !== 'boolean') return new Error('meta.isJQL must be a boolean')
  const sortedProjectKeys = parseMetaList('projectKeyFilters', projectKeyFilters)
  if (sortedProjectKeys instanceof Error) return sortedProjectKeys
  return {queryString: queryString.trim(), isJQL, projectKeyFilters: sortedProjectKeys}
}

export default buildJiraSearchQuery
