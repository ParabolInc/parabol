import React from 'react'
import {connect, DispatchProp} from 'react-redux'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuProps} from '../hooks/useMenu'
import {filterTeam} from '../modules/userDashboard/ducks/userDashDuck'
import {ITeam} from '../types/graphql'

interface Props extends DispatchProp {
  menuProps: MenuProps
  teams: Partial<ITeam>[]
  teamFilterId: string | null
}

const UserDashTeamMenu = (props: Props) => {
  const {menuProps, dispatch, teams, teamFilterId} = props
  const defaultActiveIdx = teams.findIndex((team) => team.id === teamFilterId) + 2
  return (
    <Menu
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
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
