import type {AzureDevOpsSearchQueryJson} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, parseMetaList, rejectUnknownKeys} from '../platform/searchMeta'

const buildAzureDevOpsSearchQuery = (
  queryString: string,
  meta: JsonObject
): AzureDevOpsSearchQueryJson | Error => {
  const {isWIQL, projectNames, ...rest} = meta
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(rest)
  if (invalid) return invalid
  if (typeof isWIQL !== 'boolean') return new Error('meta.isWIQL must be a boolean')
  const sortedProjectNames = parseMetaList('projectNames', projectNames)
  if (sortedProjectNames instanceof Error) return sortedProjectNames
  return {queryString: queryString.trim(), isWIQL, projectNames: sortedProjectNames}
}

export default buildAzureDevOpsSearchQuery
