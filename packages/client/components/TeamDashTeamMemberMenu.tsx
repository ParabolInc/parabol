import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import filterTeamMember from '../utils/relay/filterTeamMember'
import {TeamDashTeamMemberMenu_viewer} from '../__generated__/TeamDashTeamMemberMenu_viewer.graphql'

interface Props {
  menuProps: MenuProps
  viewer: TeamDashTeamMemberMenu_viewer
}

const TeamDashTeamMemberMenu = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {menuProps, viewer} = props
  const {teamMemberFilter, teamFilter} = viewer || {}
  const {teamMembers} = viewer
  const teamFilterId = teamFilter && teamFilter.id
  const teamMemberFilterId = teamMemberFilter && teamMemberFilter.id
  const filteredTeamMembers = teamFilterId ? teamMembers.filter((teamMember) => teamMember.tms.includes(teamFilterId)) : teamMembers
  const defaultActiveIdx =
    filteredTeamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2
  return (
    <Menu
      ariaLabel={'Select the team member to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team member:'}</DropdownMenuLabel>
      <MenuItem
        key={'teamMemberFilterNULL'}
        label={'All team members'}
        onClick={() => filterTeamMember(atmosphere, null)}
      />
      {filteredTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => filterTeamMember(atmosphere, teamMember.id)}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(TeamDashTeamMemberMenu, {
  viewer: graphql`
    fragment TeamDashTeamMemberMenu_viewer on User {
      teamFilter {
        id
      }
      teamMemberFilter {
        id
      }
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
        tms
      }
    }
  `
})
