import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import type {LinearScopingSearchFilterMenuRootQuery} from '../__generated__/LinearScopingSearchFilterMenuRootQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useLinearProjectsAndTeams from '../hooks/useLinearProjectsAndTeams'
import useScopingSearchState from '../hooks/useScopingSearchState'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import {searchFiltersByKey} from '../shared/integrations/IntegrationSearchFilter'
import LinearSelectorMenu from './LinearSelectorMenu'
import MockFieldList from './MockFieldList'

const query = graphql`
  query LinearScopingSearchFilterMenuRootQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        ...useLinearProjectsAndTeams_teamMember
      }
    }
  }
`

const LinearScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const data = useLazyLoadQuery<LinearScopingSearchFilterMenuRootQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const teamMember = data.viewer.teamMember ?? null
  const atmosphere = useAtmosphere()
  const setSearchState = useScopingSearchState(meetingId, 'linear')
  const {searchQuery, setSearchQuery, filteredProjectsAndTeams} =
    useLinearProjectsAndTeams(teamMember)
  if (!teamMember) return <MockFieldList />

  const {filters} = state
  const selectedItemIds = [
    ...searchFiltersByKey(filters, 'project'),
    ...searchFiltersByKey(filters, 'team')
  ]

  return (
    <LinearSelectorMenu
      items={filteredProjectsAndTeams}
      selectedItemIds={selectedItemIds}
      getItemId={(item) => item.id}
      onSelectItem={(item, isSelected) => {
        const key = item.__typename === '_xLinearProject' ? 'project' : 'team'
        setSearchState({
          filters: isSelected
            ? filters.filter((filter) => filter.key !== key || filter.value !== item.id)
            : [...filters, {key, value: item.id}]
        })
        SendClientSideEvent(atmosphere, 'Selected Poker Scope Project Filter', {
          meetingId,
          selectionValue: item.id,
          service: 'linear'
        })
      }}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      placeholder='Search Linear projects or teams'
      emptyStateMessage='No projects or teams found!'
    />
  )
}

export default LinearScopingSearchFilterMenuRoot
