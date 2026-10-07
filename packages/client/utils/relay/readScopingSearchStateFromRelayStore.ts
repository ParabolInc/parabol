import type {RecordSourceProxy} from 'relay-runtime'
import type {RegisteredClientIntegration} from '~/integrations/platform/registry'
import {
  EMPTY_SCOPING_SEARCH_STATE,
  type ScopingSearchState
} from '~/integrations/platform/ScopingSearchState'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'

interface ScopingSearchQueryRecord {
  queryString: string
  isAdvancedQuery: boolean
  filters: {key: string; value: string}[]
}

const readScopingSearchStateFromRelayStore = (
  store: RecordSourceProxy,
  meetingId: string,
  service: RegisteredClientIntegration
): ScopingSearchState => {
  const query = store.get<ScopingSearchQueryRecord>(SearchQueryId.join(service, meetingId))
  if (!query) return EMPTY_SCOPING_SEARCH_STATE
  return {
    queryString: query.getValue('queryString'),
    isAdvancedQuery: query.getValue('isAdvancedQuery'),
    filters: query.getLinkedRecords('filters').map((filter) => ({
      key: filter.getValue('key'),
      value: filter.getValue('value')
    }))
  }
}

export default readScopingSearchStateFromRelayStore
