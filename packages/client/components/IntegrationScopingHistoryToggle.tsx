import useScopingSearchState from '../hooks/useScopingSearchState'
import type {
  ScopingCapability,
  ScopingSavedQuery
} from '../integrations/platform/ClientIntegrationDefinition'
import type {RegisteredClientIntegration} from '../integrations/platform/registry'
import useRemoveIntegrationSearchQueryMutation from '../mutations/useRemoveIntegrationSearchQueryMutation'
import type {IntegrationSearchFilter} from '../shared/integrations/IntegrationSearchFilter'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

const describeFilters = (
  filters: readonly IntegrationSearchFilter[],
  filterChipLabel: ScopingCapability['filterChipLabel']
) => {
  if (filters.length === 0) return undefined
  return `in ${filters.map((filter) => filterChipLabel?.(filter) ?? filter.value).join(', ')}`
}

interface Props {
  scoping: ScopingCapability
  service: RegisteredClientIntegration
  meetingId: string
  teamId: string
  savedQueries: readonly ScopingSavedQuery[]
}

const IntegrationScopingHistoryToggle = (props: Props) => {
  const {scoping, service, meetingId, teamId, savedQueries} = props
  const setSearchState = useScopingSearchState(meetingId, service)
  const [removeIntegrationSearchQuery, submitting] = useRemoveIntegrationSearchQueryMutation()
  const searchQueries = savedQueries.map(({id, queryString, isAdvancedQuery, filters}) => ({
    id,
    labelFirstLine: isAdvancedQuery ? queryString : `“${queryString}”`,
    labelSecondLine: describeFilters(filters, scoping.filterChipLabel),
    onClick: () => setSearchState({queryString, isAdvancedQuery, filters}),
    onDelete: () => {
      if (submitting) return
      removeIntegrationSearchQuery({variables: {id, teamId}})
    }
  }))
  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default IntegrationScopingHistoryToggle
