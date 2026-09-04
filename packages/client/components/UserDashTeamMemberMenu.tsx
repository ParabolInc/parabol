import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import useSearchFilter from '~/hooks/useSearchFilter'
import {FilterLabels} from '~/types/constEnums'
import constructFilterQueryParamURL from '~/utils/constructFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import type {
  UserDashTeamMemberMenu_viewer$data,
  UserDashTeamMemberMenu_viewer$key
} from '../__generated__/UserDashTeamMemberMenu_viewer.graphql'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'

interface Props {
  viewer: UserDashTeamMemberMenu_viewer$key | null | undefined
}

const UserDashTeamMemberMenu = (props: Props) => {
  const navigate = useNavigate()
  const {viewer: viewerRef} = props

  const viewer = useFragment(
    graphql`
      fragment UserDashTeamMemberMenu_viewer on User {
        id
        teams {
          id
          name
          teamMembers(sortBy: "preferredName") {
            user {
              userId: id
              preferredName
            }
          }
        }
      }
    `,
    viewerRef
  )

  const atmosphere = useAtmosphere()
  const {userIds, teamIds, showArchived} = useQueryParameterParser(atmosphere.viewerId)

  const oldTeamsRef = useRef<UserDashTeamMemberMenu_viewer$data['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current

  const showAllTeamMembers = !!teamIds
  const filteredTeamMembers = useMemo(() => {
    const filteredTeams = teamIds ? teams.filter(({id: teamId}) => teamIds.includes(teamId)) : teams
    const keySet = new Set()
    const filteredTeamMembers = [] as {
      userId: string
      preferredName: string
    }[]
    const teamMembers = filteredTeams.flatMap(({teamMembers}) => teamMembers.flat())
    teamMembers.forEach(({user}) => {
      const userKey = user.userId
      if (!keySet.has(userKey)) {
        keySet.add(userKey)
        filteredTeamMembers.push(user)
      }
    })
    filteredTeamMembers.sort((a, b) => (a.preferredName > b.preferredName ? 1 : -1))
    return filteredTeamMembers
  }, [teamIds, userIds])

  const {
    query,
    filteredItems: matchedFilteredTeamMembers,
    onQueryChange
  } = useSearchFilter(filteredTeamMembers, (item) => item.preferredName)

  return (
    <MenuContent align='start'>
      <DropdownMenuLabel>{'Filter by team member:'}</DropdownMenuLabel>
      {filteredTeamMembers.length > 5 && (
        <MenuSearch placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedFilteredTeamMembers.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No team members found!
        </EmptyDropdownMenuItemLabel>
      )}
      {query === '' && showAllTeamMembers && (
        <MenuItem
          onClick={() => navigate(constructFilterQueryParamURL(teamIds, null, showArchived))}
        >
          {FilterLabels.ALL_TEAM_MEMBERS}
        </MenuItem>
      )}
      {matchedFilteredTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.userId}`}
          data-cy={`team-member-filter-${teamMember.userId}`}
          onClick={() =>
            navigate(constructFilterQueryParamURL(teamIds, [teamMember.userId], showArchived))
          }
        >
          {teamMember.preferredName}
        </MenuItem>
      ))}
    </MenuContent>
  )
}

export default UserDashTeamMemberMenu
