import type {
  ScopingCapability,
  ScopingSavedQuery
} from '../integrations/platform/ClientIntegrationDefinition'
import {
  type IntegrationSearchFilter,
  normalizeSearchFilters
} from '../integrations/platform/IntegrationSearchFilter'
import type {
  ScopingSearchContext,
  ScopingSearchState
} from '../integrations/platform/ScopingSearchState'
import usePersistIntegrationSearchQueryMutation from '../mutations/usePersistIntegrationSearchQueryMutation'

const canonicalize = (
  queryString: string,
  isAdvancedQuery: boolean,
  filters: readonly IntegrationSearchFilter[]
) => JSON.stringify({queryString, isAdvancedQuery, filters: normalizeSearchFilters(filters)})

const usePersistScopingQuery = (
  scoping: ScopingCapability,
  state: ScopingSearchState,
  savedQueries: readonly ScopingSavedQuery[],
  context: ScopingSearchContext
) => {
  const [persistIntegrationSearchQuery] = usePersistIntegrationSearchQueryMutation()
  return () => {
    const trimmedQueryString = state.queryString.trim()
    if (!trimmedQueryString) return
    if (scoping.isDefaultQuery?.(state)) return
    const queryString = scoping.normalizeQueryString?.(trimmedQueryString) ?? trimmedQueryString
    const filters = normalizeSearchFilters(state.filters)
    const lookupKey = canonicalize(queryString, state.isAdvancedQuery, filters)
    const isQueryNew = !savedQueries.some(
      (saved) => canonicalize(saved.queryString, saved.isAdvancedQuery, saved.filters) === lookupKey
    )
    if (!isQueryNew) return
    const {teamId, providerId} = context
    persistIntegrationSearchQuery({
      variables: {
        teamId,
        providerId,
        queryString,
        meta: scoping.serializeMeta({...state, filters})
      }
    })
  }
}

export default usePersistScopingQuery
