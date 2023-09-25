import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {SelectTeamDropdown_teams$key} from '~/__generated__/SelectTeamDropdown_teams.graphql'
import {MenuProps} from '../hooks/useMenu'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  teamHandleClick: (teamId: string, e: React.MouseEvent) => void
  teams: SelectTeamDropdown_teams$key
  onAddTeamClick?: () => void
}

const TeamMenu = styled(Menu)({
  maxWidth: 'none'
})

const SelectTeamDropdown = (props: Props) => {
  const {teams: teamsRef, menuProps, teamHandleClick, onAddTeamClick} = props
  const teams = useFragment(
    graphql`
      fragment SelectTeamDropdown_teams on Team @relay(plural: true) {
        id
        name
      }
    `,
    teamsRef
  )
  return (
    <TeamMenu ariaLabel={'Select the team associated with the new task'} {...menuProps}>
      {onAddTeamClick ? (
        <MenuItem
          label={
            <div
              className='text-md flex w-full items-center px-2 font-semibold leading-8 text-sky-500'
              onClick={onAddTeamClick}
            >
              <Add className='mr-1' />
              Add Team
            </div>
          }
        />
      ) : (
        <DropdownMenuLabel>Select Team:</DropdownMenuLabel>
      )}
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

export default SelectTeamDropdown
