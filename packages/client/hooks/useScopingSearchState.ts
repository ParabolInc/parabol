import {useCallback} from 'react'
import {commitLocalUpdate} from 'react-relay'
import type {IEnvironment, RecordSourceProxy} from 'relay-runtime'
import type {ScopingSearchState} from '~/integrations/platform/ScopingSearchState'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import type {TaskServiceEnum} from '~/shared/types/TaskIntegration'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import useAtmosphere from './useAtmosphere'

export const EMPTY_SCOPING_SEARCH_STATE: ScopingSearchState = {
  queryString: '',
  isAdvancedQuery: false,
  filters: []
}

const getOrCreateScopingSearchQuery = (
  store: RecordSourceProxy,
  meetingId: string,
  service: TaskServiceEnum
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

export const setScopingSearchStateInRelayStore = (
  store: RecordSourceProxy,
  meetingId: string,
  service: TaskServiceEnum,
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

const readScopingSearchStateFromRelayStore = (
  store: RecordSourceProxy,
  meetingId: string,
  service: TaskServiceEnum
): ScopingSearchState | null => {
  const query = store.get(SearchQueryId.join(service, meetingId))
  if (!query) return null
  const filterRecords = query.getLinkedRecords('filters') ?? []
  return {
    queryString: String(query.getValue('queryString') ?? ''),
    isAdvancedQuery: query.getValue('isAdvancedQuery') === true,
    filters: filterRecords.map((filter) => ({
      key: String(filter.getValue('key')),
      value: String(filter.getValue('value'))
    }))
  }
}

export const readScopingSearchState = (
  environment: IEnvironment,
  meetingId: string,
  service: TaskServiceEnum
) => {
  const result: {state: ScopingSearchState | null} = {state: null}
  commitLocalUpdate(environment, (store) => {
    result.state = readScopingSearchStateFromRelayStore(store, meetingId, service)
  })
  return result.state
}

const useScopingSearchState = (meetingId: string, service: TaskServiceEnum) => {
  const atmosphere = useAtmosphere()
  return useCallback(
    (patch: Partial<ScopingSearchState>) => {
      commitLocalUpdate(atmosphere, (store) => {
        setScopingSearchStateInRelayStore(store, meetingId, service, patch)
      })
    },
    [atmosphere, meetingId, service]
  )
}

export default useScopingSearchState
