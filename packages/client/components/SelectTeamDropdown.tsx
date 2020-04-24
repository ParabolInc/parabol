import React from 'react'
import Menu from './Menu'
import MenuItem from './MenuItem'
import DropdownMenuLabel from './DropdownMenuLabel'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import {MenuProps} from '../hooks/useMenu'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {SelectTeamDropdown_teams} from '~/__generated__/SelectTeamDropdown_teams.graphql'

interface Props {
  menuProps: MenuProps
  teamHandleClick: (teamId: string, e: React.MouseEvent) => void
  teams: SelectTeamDropdown_teams
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
            onClick={(e) => teamHandleClick(team.id, e)}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(SelectTeamDropdown, {
  teams: graphql`
    fragment SelectTeamDropdown_teams on Team @relay(plural: true) {
      id
      name
    }
  `
})
