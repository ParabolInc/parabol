import type {RecordSourceProxy} from 'relay-runtime'
import type {RegisteredClientIntegration} from '~/integrations/platform/registry'
import {
  EMPTY_SCOPING_SEARCH_STATE,
  type ScopingSearchState
} from '~/integrations/platform/ScopingSearchState'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import createProxyRecord from './createProxyRecord'

const getOrCreateScopingSearchQuery = (
  store: RecordSourceProxy,
  meetingId: string,
  service: RegisteredClientIntegration
) => {
  const queryId = SearchQueryId.join(service, meetingId)
  const existingQuery = store.get(queryId)
  if (existingQuery) return existingQuery
  const meeting = store.get(meetingId)
  if (!meeting) return null
  const {queryString, isAdvancedQuery} = EMPTY_SCOPING_SEARCH_STATE
  const newQuery = createProxyRecord(store, 'ScopingSearchQuery', {
    id: queryId,
    service,
    queryString,
    isAdvancedQuery
  })
  newQuery.setLinkedRecords([], 'filters')
  const queries = meeting.getLinkedRecords('scopingSearchQueries') ?? []
  meeting.setLinkedRecords([...queries, newQuery], 'scopingSearchQueries')
  return newQuery
}

const setScopingSearchStateInRelayStore = (
  store: RecordSourceProxy,
  meetingId: string,
  service: RegisteredClientIntegration,
  patch: Partial<ScopingSearchState>
) => {
  const query = getOrCreateScopingSearchQuery(store, meetingId, service)
  if (!query) return
  if (patch.queryString !== undefined) {
    query.setValue(patch.queryString, 'queryString')
  }
  if (patch.isAdvancedQuery !== undefined) {
    query.setValue(patch.isAdvancedQuery, 'isAdvancedQuery')
  }
  if (patch.filters !== undefined) {
    const filterRecords = patch.filters.map((filter) =>
      createProxyRecord(store, 'IntegrationSearchFilter', {...filter})
    )
    query.setLinkedRecords(filterRecords, 'filters')
  }
}

export default setScopingSearchStateInRelayStore
