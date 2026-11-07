import type {IssueSearchCapability} from '../platform/ServerIntegrationDefinition'
import {checkQueryString, rejectUnknownKeys} from '../platform/searchMeta'

const buildClickUpSearchQuery: IssueSearchCapability<{queryString: string}>['buildQuery'] = (
  queryString,
  meta
) => {
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(meta)
  if (invalid) return invalid
  return {queryString: queryString.trim()}
}

export default buildClickUpSearchQuery
