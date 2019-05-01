import React from 'react'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'
import {MenuProps} from 'universal/hooks/useMenu'
import {ITeam} from 'universal/types/graphql'

interface Props {
  menuProps: MenuProps
  teamHandleClick: (teamId: string) => () => void
  teams: ReadonlyArray<Pick<ITeam, 'id' | 'name'>>
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
