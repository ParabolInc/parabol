import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {UserDashTeamMenu_viewer} from '~/__generated__/UserDashTeamMenu_viewer.graphql'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import parseUserTaskFilters from '~/utils/parseUserTaskFilters'
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
  const {teamIds, userIds, showArchived} = parseUserTaskFilters(viewer.id)
  const teamFilter = teamIds ? {id: teamIds[0]} : undefined
  const teamFilterId = (teamFilter && teamFilter.id) || undefined
  const filteredTeams = userIds ? teams.filter(({teamMembers}) =>
    teamMembers.find(({userId}) => userIds.includes(userId)) != undefined
  ) : teams
  const defaultActiveIdx = filteredTeams.findIndex((team) => team.id === teamFilterId) + 2
  return (
    <Menu
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      {userIds &&
        <MenuItem
          key={'teamFilterNULL'}
          label={'All teams'}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL(undefined, userIds, showArchived))}
        />}
      {filteredTeams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          dataCy={`team_filter_${team.id}`}
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
