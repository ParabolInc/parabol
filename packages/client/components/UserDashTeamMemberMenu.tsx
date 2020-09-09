import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import {UserDashTeamMemberMenu_viewer} from '../__generated__/UserDashTeamMemberMenu_viewer.graphql'
import useUserTaskFilters from '~/utils/useUserTaskFilters'
import useRouter from '~/hooks/useRouter'
import constructUserTaskFilterQueryParamURL from '~/utils/constructUserTaskFilterQueryParamURL'

interface Props {
  menuProps: MenuProps
  viewer: UserDashTeamMemberMenu_viewer
}

const UserDashTeamMemberMenu = (props: Props) => {
  const {history} = useRouter()
  const {menuProps, viewer} = props

  const {userIds, teamIds, showArchived} = useUserTaskFilters(viewer.id)
  const {teams} = viewer
  const filteredTeams = teamIds ? teams.filter(({id: teamId}) => teamIds.includes(teamId)) : teams
  const keySet = new Set()
  const filteredTeamMembers = [] as {
    userId: string
    preferredName: string
  }[]
  const teamMembers = filteredTeams.map(({teamMembers}) => teamMembers.flat()).flat()
  teamMembers.forEach((teamMember) => {
    const userKey = teamMember.userId
    if (!keySet.has(userKey)) {
      keySet.add(userKey)
      filteredTeamMembers.push(teamMember)
    }
  })
  const teamMemberFilterId = userIds ? userIds[0] : undefined
  const showAllTeamMembers = teamIds ? true : false
  const defaultActiveIdx =
    filteredTeamMembers.findIndex((teamMember) => teamMember.userId === teamMemberFilterId) + (showAllTeamMembers ? 2 : 1)

  return (
    <Menu
      ariaLabel={'Select the team member to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team member:'}</DropdownMenuLabel>
      {showAllTeamMembers &&
        <MenuItem
          key={'teamMemberFilterNULL'}
          label={'All team members'}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL(teamIds, undefined, showArchived))}
        />}
      {filteredTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.userId}`}
          dataCy={`team-member-filter-${teamMember.userId}`}
          label={teamMember.preferredName}
          onClick={() => history.push(constructUserTaskFilterQueryParamURL(teamIds, [teamMember.userId], showArchived))}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(UserDashTeamMemberMenu, {
  viewer: graphql`
    fragment UserDashTeamMemberMenu_viewer on User {
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
