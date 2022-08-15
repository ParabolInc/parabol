import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {SelectTeamDropdown_teams} from '~/__generated__/SelectTeamDropdown_teams.graphql'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  teamHandleClick: (teamId: string, e: React.MouseEvent) => void
  teams: SelectTeamDropdown_teams
}

const TeamMenu = styled(Menu)({
  maxWidth: 'none'
})

const SelectTeamDropdown = (props: Props) => {
  const {teams, menuProps, teamHandleClick} = props
  return (
    <TeamMenu ariaLabel={'Select the team associated with the new task'} {...menuProps}>
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
    </TeamMenu>
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
