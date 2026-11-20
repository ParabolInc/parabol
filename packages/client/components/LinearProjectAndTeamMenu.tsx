import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {LinearProjectAndTeamMenuQuery} from '../__generated__/LinearProjectAndTeamMenuQuery.graphql'
import useLinearProjectsAndTeams, {
  type LinearProjectOrTeam
} from '../hooks/useLinearProjectsAndTeams'
import LinearSelectorMenu from './LinearSelectorMenu'

interface Props {
  queryRef: PreloadedQuery<LinearProjectAndTeamMenuQuery>
  selectedItemIds: ReadonlyArray<string>
  onSelectItem: (item: LinearProjectOrTeam, isSelected: boolean) => void
  getItemId?: (item: LinearProjectOrTeam) => string
}

const LinearProjectAndTeamMenu = (props: Props) => {
  const {queryRef, selectedItemIds, onSelectItem, getItemId} = props
  const data = usePreloadedQuery<LinearProjectAndTeamMenuQuery>(
    graphql`
      query LinearProjectAndTeamMenuQuery($teamId: ID!) {
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
  const {searchQuery, setSearchQuery, filteredProjectsAndTeams} =
    useLinearProjectsAndTeams(teamMember)
  if (!teamMember) return null

  return (
    <LinearSelectorMenu
      items={filteredProjectsAndTeams}
      selectedItemIds={selectedItemIds}
      getItemId={getItemId}
      onSelectItem={onSelectItem}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      placeholder='Search Linear projects or teams'
      emptyStateMessage='No projects or teams found!'
    />
  )
}

export default LinearProjectAndTeamMenu
