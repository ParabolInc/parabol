import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {TeamDashTeamMemberMenu_team$key} from '../__generated__/TeamDashTeamMemberMenu_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import filterTeamMember from '../utils/relay/filterTeamMember'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'

interface Props {
  team: TeamDashTeamMemberMenu_team$key
}

const TeamDashTeamMemberMenu = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment TeamDashTeamMemberMenu_team on Team {
        id
        teamMemberFilter {
          id
        }
        teamMembers(sortBy: "preferredName") {
          id
          user {
            preferredName
          }
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers} = team

  const {
    query,
    filteredItems: matchedTeamMembers,
    onQueryChange
  } = useSearchFilter(teamMembers, ({user}) => user.preferredName)

  return (
    <MenuContent align='start'>
      <DropdownMenuLabel>{'Filter by team member:'}</DropdownMenuLabel>
      {teamMembers.length > 5 && (
        <MenuSearch placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedTeamMembers.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No team members found!
        </EmptyDropdownMenuItemLabel>
      )}
      {query === '' && (
        <MenuItem onClick={() => filterTeamMember(atmosphere, teamId, null)}>
          {'All team members'}
        </MenuItem>
      )}
      {matchedTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.id}`}
          onClick={() => filterTeamMember(atmosphere, teamId, teamMember.id)}
        >
          {teamMember.user.preferredName}
        </MenuItem>
      ))}
    </MenuContent>
  )
}

export default TeamDashTeamMemberMenu
