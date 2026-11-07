import type {IntegrationSearchQueryJsonByService} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {checkQueryString, parseMetaList, rejectUnknownKeys} from '../platform/searchMeta'

const buildClickUpSearchQuery = (
  queryString: string,
  meta: JsonObject
): IntegrationSearchQueryJsonByService['clickup'] | Error => {
  const {listIds, ...rest} = meta
  const invalid = checkQueryString(queryString) ?? rejectUnknownKeys(rest)
  if (invalid) return invalid
  const sortedListIds = parseMetaList('listIds', listIds)
  if (sortedListIds instanceof Error) return sortedListIds
  return {queryString: queryString.trim(), listIds: sortedListIds}
}

export default buildClickUpSearchQuery
