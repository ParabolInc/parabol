import React from 'react'
import Menu from './Menu'
import MenuItem from './MenuItem'
import DropdownMenuLabel from './DropdownMenuLabel'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import {MenuProps} from '../hooks/useMenu'
import {ITeam} from '../types/graphql'

interface Props {
  menuProps: MenuProps
  teamHandleClick: (teamId: string) => () => void
  teams: readonly Pick<ITeam, 'id' | 'name'>[]
}

const SelectTeamDropdown = (props: Props) => {
  const {teams, menuProps, teamHandleClick} = props
  return (
    <Menu ariaLabel={'Select the team associated with the new task'} {...menuProps}>
      <DropdownMenuLabel>Select Team:</DropdownMenuLabel>
      {teams.map((team) => {
        return (
          <MenuItem
            key={team.id}
            label={<DropdownMenuItemLabel>{team.name}</DropdownMenuItemLabel>}
            onClick={teamHandleClick(team.id)}
          />
        )
      })}
    </Menu>
  )
}

export default SelectTeamDropdown
