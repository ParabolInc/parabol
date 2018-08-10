// @flow
import React from 'react'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'

type Props = {
  closePortal: () => void,
  teamHandleClick: (teamId: string) => void,
  teams: Array<any>
}

const SelectTeamDropdown = (props: Props) => {
  const {teams, closePortal, teamHandleClick} = props
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the team associated with the new task'}
      closePortal={closePortal}
    >
      <DropdownMenuLabel>Select Team:</DropdownMenuLabel>
      {teams.map((team) => {
        return (
          <MenuItemWithShortcuts
            key={team.id}
            label={<DropdownMenuItemLabel>{team.name}</DropdownMenuItemLabel>}
            onClick={teamHandleClick(team.id)}
          />
        )
      })}
    </MenuWithShortcuts>
  )
}

export default SelectTeamDropdown
