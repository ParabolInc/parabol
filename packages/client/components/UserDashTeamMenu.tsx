import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {UserDashTeamMenu_viewer} from '~/__generated__/UserDashTeamMenu_viewer.graphql'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import useUserTaskFilters from '~/utils/useUserTaskFilters'
import constructUserTaskFilterQueryParamURL from '~/utils/constructUserTaskFilterQueryParamURL'
import useRouter from '~/hooks/useRouter'

interface Props {
  menuProps: MenuProps
  viewer: UserDashTeamMenu_viewer
}

const UserDashTeamMenu = (props: Props) => {
  const {history} = useRouter()
  const {menuProps, viewer} = props
  const {teams} = viewer
  const {teamIds, userIds, showArchived} = useUserTaskFilters(viewer.id)
  const showAllTeams = !!userIds
  const {filteredTeams, defaultActiveIdx} = useMemo(() => {
    const filteredTeams = userIds ? teams.filter(({teamMembers}) =>
      teamMembers.find(({userId}) => userIds.includes(userId)) != undefined
    ) : teams
    return {
      filteredTeams,
      defaultActiveIdx: filteredTeams.findIndex((team) => teamIds?.includes(team.id)) + (showAllTeams ? 2 : 1)
    }
  }, [userIds, teamIds])
  return (
    <Menu
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      {showAllTeams &&
        <MenuItem
          key={'teamFilterNULL'}
          label={'All teams'}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL(undefined, userIds, showArchived))}
        />}
      {filteredTeams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          dataCy={`team-filter-${team.id}`}
          label={team.name}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL([team.id], userIds, showArchived))}
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
