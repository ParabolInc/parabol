import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {UserDashTeamMenu_viewer} from '~/__generated__/UserDashTeamMenu_viewer.graphql'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import constructUserTaskFilterQueryParamURL from '~/utils/constructUserTaskFilterQueryParamURL'
import useRouter from '~/hooks/useRouter'
import useAtmosphere from '~/hooks/useAtmosphere'
import {UserTaskViewFilterLabels} from '~/types/constEnums'
import useSearchFilter from '~/hooks/useSearchFilter'
import {SearchMenuItem} from './SearchMenuItem'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'

interface Props {
  menuProps: MenuProps
  viewer: UserDashTeamMenu_viewer | null
}

const UserDashTeamMenu = (props: Props) => {
  const {history} = useRouter()
  const {menuProps, viewer} = props
  const oldTeamsRef = useRef<UserDashTeamMenu_viewer['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const atmosphere = useAtmosphere()
  const {teamIds, userIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)
  const showAllTeams = !!userIds
  const {filteredTeams, defaultActiveIdx} = useMemo(() => {
    const filteredTeams = userIds
      ? teams.filter(({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId)))
      : teams
    return {
      filteredTeams,
      defaultActiveIdx:
        filteredTeams.findIndex((team) => teamIds?.includes(team.id)) + (showAllTeams ? 2 : 1)
    }
  }, [userIds, teamIds])

  const {
    query,
    filteredItems: matchedFilteredTeams,
    onQueryChange
  } = useSearchFilter(filteredTeams, (team) => team.name)

  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      {filteredTeams.length > 5 && (
        <SearchMenuItem placeholder='Search teams' onChange={onQueryChange} value={query} />
      )}
      {query && matchedFilteredTeams.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No teams found!</EmptyDropdownMenuItemLabel>
      )}
      {query === '' && showAllTeams && (
        <MenuItem
          key={'teamFilterNULL'}
          label={UserTaskViewFilterLabels.ALL_TEAMS}
          onClick={() =>
            history.push(constructUserTaskFilterQueryParamURL(null, userIds, showArchived))
          }
        />
      )}
      {matchedFilteredTeams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          dataCy={`team-filter-${team.id}`}
          label={team.name}
          onClick={() =>
            history.push(constructUserTaskFilterQueryParamURL([team.id], userIds, showArchived))
          }
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(UserDashTeamMenu, {
  viewer: graphql`
    fragment UserDashTeamMenu_viewer on User {
      id
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
      }
    }
  `
})
