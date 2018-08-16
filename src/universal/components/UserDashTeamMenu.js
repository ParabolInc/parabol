import React from 'react'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import type {Team} from 'universal/types/schema.flow'
import type {Dispatch} from 'react-redux'
import {connect} from 'react-redux'
import {filterTeam} from 'universal/modules/userDashboard/ducks/userDashDuck'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'

type Props = {
  closePortal: () => void,
  dispatch: Dispatch<*>,
  teams: Array<Team>,
  teamFilterId: ?string
}

const UserDashTeamMenu = (props: Props) => {
  const {closePortal, dispatch, teams, teamFilterId} = props
  const defaultActiveIdx = teams.findIndex((team) => team.id === teamFilterId) + 2
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the team to filter by'}
      closePortal={closePortal}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by:'}</DropdownMenuLabel>
      <MenuItemWithShortcuts
        key={'teamFilterNULL'}
        label={'All teams'}
        onClick={() => dispatch(filterTeam(null))}
      />
      {teams.map((team) => (
        <MenuItemWithShortcuts
          key={`teamFilter${team.id}`}
          label={team.name}
          onClick={() => dispatch(filterTeam(team.id, team.name))}
        />
      ))}
    </MenuWithShortcuts>
  )
}

export default connect()(UserDashTeamMenu)
