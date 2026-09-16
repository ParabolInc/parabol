import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useFragment} from 'react-relay'
import type {SelectTeamDropdown_teams$key} from '~/__generated__/SelectTeamDropdown_teams.graphql'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import DropdownMenuLabel from './DropdownMenuLabel'

interface Props {
  teamHandleClick: (teamId: string, e: React.MouseEvent) => void
  teams: SelectTeamDropdown_teams$key
}

const SelectTeamDropdown = (props: Props) => {
  const {teams: teamsRef, teamHandleClick} = props
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
    <MenuContent align='start' className='max-w-none'>
      <DropdownMenuLabel>Select Team:</DropdownMenuLabel>
      {teams.map((team) => {
        return (
          <MenuItem key={team.id} onClick={(e) => teamHandleClick(team.id, e)}>
            {team.name}
          </MenuItem>
        )
      })}
    </MenuContent>
  )
}

export default SelectTeamDropdown
