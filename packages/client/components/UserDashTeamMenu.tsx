import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {UserDashTeamMenu_viewer} from '~/__generated__/UserDashTeamMenu_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import filterTeam from '../utils/relay/filterTeam'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  viewer: UserDashTeamMenu_viewer
}

const UserDashTeamMenu = (props: Props) => {
  const {menuProps, viewer} = props
  const {teams, teamFilter} = viewer
  const teamFilterId = (teamFilter && teamFilter.id) || null
  const defaultActiveIdx = teams.findIndex((team) => team.id === teamFilterId) + 2
  const atmosphere = useAtmosphere()
  return (
    <Menu
      ariaLabel={'Select the team to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team:'}</DropdownMenuLabel>
      <MenuItem
        key={'teamFilterNULL'}
        label={'All teams'}
        onClick={() => filterTeam(atmosphere, null)}
      />
      {teams.map((team) => (
        <MenuItem
          key={`teamFilter${team.id}`}
          label={team.name}
          onClick={() => filterTeam(atmosphere, team.id)}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(UserDashTeamMenu, {
  viewer: graphql`
    fragment UserDashTeamMenu_viewer on User {
      teamFilter {
        id
      }
      teams {
        id
        name
      }
    }
  `
})
