import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import SendClientSideEvent from '~/utils/SendClientSideEvent'
import type {LinearScopingSearchFilterMenuQuery} from '../__generated__/LinearScopingSearchFilterMenuQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useLinearProjectsAndTeams from '../hooks/useLinearProjectsAndTeams'
import useSetScopingSearchState from '../hooks/useSetScopingSearchState'
import {
  searchFiltersByKey,
  toggleSearchFilter
} from '../integrations/platform/IntegrationSearchFilter'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import LinearSelectorMenu from './LinearSelectorMenu'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<LinearScopingSearchFilterMenuQuery>
}

const LinearScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<LinearScopingSearchFilterMenuQuery>(
    graphql`
      query LinearScopingSearchFilterMenuQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            ...useLinearProjectsAndTeams_teamMember
          }
        }
      }
    `,
    queryRef
  )
  const teamMember = data.viewer.teamMember ?? null
  const atmosphere = useAtmosphere()
  const setSearchState = useSetScopingSearchState(meetingId, 'linear')
  const {searchQuery, setSearchQuery, filteredProjectsAndTeams} =
    useLinearProjectsAndTeams(teamMember)
  if (!teamMember) return null

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
      onSelectItem={(item) => {
        const key = item.__typename === '_xLinearProject' ? 'project' : 'team'
        setSearchState({filters: toggleSearchFilter(filters, key, item.id)})
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

export default LinearScopingSearchFilterMenu
