import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuLabel from './DropdownMenuLabel'
import {TeamDashTeamMemberMenu_team} from '../__generated__/TeamDashTeamMemberMenu_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import filterTeamMember from '../utils/relay/filterTeamMember'

interface Props {
  menuProps: MenuProps
  team: TeamDashTeamMemberMenu_team
}

const TeamDashTeamMemberMenu = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {menuProps, team} = props
  const {id: teamId, teamMembers, teamMemberFilter} = team
  const teamMemberFilterId = teamMemberFilter && teamMemberFilter.id
  const defaultActiveIdx =
    teamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2
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
        onClick={() => filterTeamMember(atmosphere, teamId, null)}
      />
      {teamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => filterTeamMember(atmosphere, teamId, teamMember.id)}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(TeamDashTeamMemberMenu, {
  team: graphql`
    fragment TeamDashTeamMemberMenu_team on Team {
      id
      teamMemberFilter {
        id
      }
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
})
