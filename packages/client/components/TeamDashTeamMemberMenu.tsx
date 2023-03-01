import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import filterTeamMember from '../utils/relay/filterTeamMember'
import {TeamDashTeamMemberMenu_team$key} from '../__generated__/TeamDashTeamMemberMenu_team.graphql'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  menuProps: MenuProps
  team: TeamDashTeamMemberMenu_team$key
}

const TeamDashTeamMemberMenu = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {menuProps, team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment TeamDashTeamMemberMenu_team on Team {
        id
        teamMemberFilter {
          id
        }
        teamMembers(sortBy: "preferredName") {
          id
          preferredName
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, teamMemberFilter} = team
  const teamMemberFilterId = teamMemberFilter && teamMemberFilter.id
  const defaultActiveIdx =
    teamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2

  const {
    query,
    filteredItems: matchedTeamMembers,
    onQueryChange
  } = useSearchFilter(teamMembers, (teamMember) => teamMember.preferredName)

  return (
    <Menu
      keepParentFocus
      ariaLabel={'Select the team member to filter by'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{'Filter by team member:'}</DropdownMenuLabel>
      {teamMembers.length > 5 && (
        <SearchMenuItem placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedTeamMembers.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No team members found!
        </EmptyDropdownMenuItemLabel>
      )}
      {query === '' && (
        <MenuItem
          key={'teamMemberFilterNULL'}
          label={'All team members'}
          onClick={() => filterTeamMember(atmosphere, teamId, null)}
        />
      )}
      {matchedTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => filterTeamMember(atmosphere, teamId, teamMember.id)}
        />
      ))}
    </Menu>
  )
}

export default TeamDashTeamMemberMenu
