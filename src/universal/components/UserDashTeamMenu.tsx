import React from 'react'
import {connect, DispatchProp} from 'react-redux'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import {filterTeam} from 'universal/modules/userDashboard/ducks/userDashDuck'
import {ITeam} from 'universal/types/graphql'

interface Props extends DispatchProp {
  closePortal: () => void
  teams: Array<Partial<ITeam>>
  teamFilterId: string | null
}

const UserDashTeamMenu = (props: Props) => {
  const {closePortal, dispatch, teams, teamFilterId} = props
  const defaultActiveIdx = teams.findIndex((team) => team.id === teamFilterId) + 2
  return (
    <Menu
      ariaLabel={'Select the team to filter by'}
      closePortal={closePortal}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by:'}</DropdownMenuLabel>
      <MenuItem
        key={'teamFilterNULL'}
        label={'All teams'}
        onClick={() => dispatch(filterTeam(null))}
      />
      {teams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          label={team.name}
          onClick={() => dispatch(filterTeam(team.id, team.name))}
        />
      ))}
    </Menu>
  )
}

export default connect()(UserDashTeamMenu)
