import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import {MenuProps} from 'universal/hooks/useMenu'
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck'
import {connect, DispatchProp} from 'react-redux'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import {TeamDashTeamMemberMenu_team} from '__generated__/TeamDashTeamMemberMenu_team.graphql'

interface Props extends DispatchProp {
  menuProps: MenuProps
  team: TeamDashTeamMemberMenu_team
  teamMemberFilterId: string | null
}

const TeamDashTeamMemberMenu = (props: Props) => {
  const {menuProps, dispatch, team, teamMemberFilterId} = props
  const {teamMembers} = team
  const defaultActiveIdx =
    teamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2
  return (
    <Menu
      ariaLabel={'Select the team member to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by:'}</DropdownMenuLabel>
      <MenuItem
        key={'teamMemberFilterNULL'}
        label={'All members'}
        onClick={() => dispatch(filterTeamMember(null))}
      />
      {teamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => dispatch(filterTeamMember(teamMember.id, teamMember.preferredName))}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(connect()(TeamDashTeamMemberMenu), {
  team: graphql`
    fragment TeamDashTeamMemberMenu_team on Team {
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
})
