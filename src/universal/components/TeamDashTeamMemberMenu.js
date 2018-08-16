import React from 'react'
import {createFragmentContainer} from 'react-relay'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck'
import type {TeamDashTeamMemberMenu_team as Team} from './__generated__/TeamDashTeamMemberMenu_team.graphql'

import type {Dispatch} from 'react-redux'
import {connect} from 'react-redux'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'

type Props = {
  closePortal: () => void,
  dispatch: Dispatch<*>,
  team: Team,
  teamMemberFilterId: ?string
}

const TeamDashTeamMemberMenu = (props: Props) => {
  const {closePortal, dispatch, team, teamMemberFilterId} = props
  const {teamMembers} = team
  const defaultActiveIdx =
    teamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the team member to filter by'}
      closePortal={closePortal}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by:'}</DropdownMenuLabel>
      <MenuItemWithShortcuts
        key={'teamMemberFilterNULL'}
        label={'All members'}
        onClick={() => dispatch(filterTeamMember(null))}
      />
      {teamMembers.map((teamMember) => (
        <MenuItemWithShortcuts
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => dispatch(filterTeamMember(teamMember.id, teamMember.preferredName))}
        />
      ))}
    </MenuWithShortcuts>
  )
}

export default createFragmentContainer(
  connect()(TeamDashTeamMemberMenu),
  graphql`
    fragment TeamDashTeamMemberMenu_team on Team {
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
)
