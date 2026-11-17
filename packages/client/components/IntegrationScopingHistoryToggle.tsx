import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import type {
  ScopingCapability,
  ScopingSavedQuery
} from '../integrations/platform/ClientIntegrationDefinition'
import type {IntegrationSearchFilter} from '../integrations/platform/IntegrationSearchFilter'
import type {TaskClientIntegration} from '../integrations/platform/registry'
import useRemoveIntegrationSearchQueryMutation from '../mutations/useRemoveIntegrationSearchQueryMutation'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

const describeFilters = (
  filters: readonly IntegrationSearchFilter[],
  {filterChipLabel, savedFiltersLabel}: ScopingCapability
) => {
  if (filters.length === 0) return undefined
  const label =
    savedFiltersLabel?.(filters) ??
    filters.map((filter) => filterChipLabel?.(filter) ?? filter.value).join(', ')
  return `in ${label}`
}

interface Props {
  scoping: ScopingCapability
  service: TaskClientIntegration
  meetingId: string
  teamId: string
  savedQueries: readonly ScopingSavedQuery[]
}

const IntegrationScopingHistoryToggle = (props: Props) => {
  const {scoping, service, meetingId, teamId, savedQueries} = props
  const setSearchState = useSetScopingSearchState(meetingId, service)
  const [removeIntegrationSearchQuery, submitting] = useRemoveIntegrationSearchQueryMutation()
  const searchQueries = savedQueries.map((savedQuery) => {
    const {id, queryString, isAdvancedQuery, filters} = savedQuery
    const defaultLabel = isAdvancedQuery ? queryString : `“${queryString}”`
    return {
      id,
      labelFirstLine: scoping.savedQueryLabel?.(savedQuery) ?? defaultLabel,
      labelSecondLine: describeFilters(filters, scoping),
      onClick: () => setSearchState({queryString, isAdvancedQuery, filters}),
      onDelete: () => {
        if (submitting) return
        removeIntegrationSearchQuery({variables: {id, teamId}})
      }
    }
  })
  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default IntegrationScopingHistoryToggle
