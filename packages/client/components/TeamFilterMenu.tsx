import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {
  TeamFilterMenu_viewer$data,
  TeamFilterMenu_viewer$key
} from '~/__generated__/TeamFilterMenu_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useSearchFilter from '~/hooks/useSearchFilter'
import {FilterLabels} from '~/types/constEnums'
import constructFilterQueryParamURL from '~/utils/constructFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'

interface Props {
  viewer: TeamFilterMenu_viewer$key | null | undefined
}

const TeamFilterMenu = (props: Props) => {
  const navigate = useNavigate()
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TeamFilterMenu_viewer on User {
        id
        teams {
          id
          name
          teamMembers(sortBy: "preferredName") {
            userId
          }
        }
      }
    `,
    viewerRef
  )
  const oldTeamsRef = useRef<TeamFilterMenu_viewer$data['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const atmosphere = useAtmosphere()
  const {teamIds, userIds, showArchived, eventTypes} = useQueryParameterParser(atmosphere.viewerId)
  const showAllTeams = !!userIds
  const filteredTeams = useMemo(
    () =>
      userIds
        ? teams.filter(
            ({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId))
          )
        : teams,
    [userIds, teamIds]
  )

  const {
    query,
    filteredItems: matchedFilteredTeams,
    onQueryChange
  } = useSearchFilter(filteredTeams, (team) => team.name)

  return (
    <MenuContent align='start'>
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      {filteredTeams.length > 5 && (
        <MenuSearch placeholder='Search teams' onChange={onQueryChange} value={query} />
      )}
      {query && matchedFilteredTeams.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No teams found!</EmptyDropdownMenuItemLabel>
      )}
      {query === '' && showAllTeams && (
        <MenuItem
          onClick={() =>
            navigate(constructFilterQueryParamURL(null, userIds, showArchived, eventTypes))
          }
        >
          {FilterLabels.ALL_TEAMS}
        </MenuItem>
      )}
      {matchedFilteredTeams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          data-cy={`team-filter-${team.id}`}
          onClick={() =>
            navigate(constructFilterQueryParamURL([team.id], userIds, showArchived, eventTypes))
          }
        >
          {team.name}
        </MenuItem>
      ))}
    </MenuContent>
  )
}

export default TeamFilterMenu
