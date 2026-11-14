import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {
  TeamFilterMenu_viewer$data,
  TeamFilterMenu_viewer$key
} from '~/__generated__/TeamFilterMenu_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {FilterLabels} from '~/types/constEnums'
import constructFilterQueryParamURL from '~/utils/constructFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import {MenuItem} from '../ui/Menu/MenuItem'
import TeamPickerMenuContent from './TeamPicker/TeamPickerMenuContent'

interface Props {
  viewer: TeamFilterMenu_viewer$key | null | undefined
}

const TeamFilterMenu = (props: Props) => {
  const navigate = useNavigate()
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TeamFilterMenu_viewer on User {
        id
        teams {
          ...TeamPickerMenuContent_teams
          id
          name
          teamMembers(sortBy: "preferredName") {
            userId
          }
        }
      }
    `,
    viewerRef
  )
  const oldTeamsRef = useRef<TeamFilterMenu_viewer$data['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const atmosphere = useAtmosphere()
  const {teamIds, userIds, showArchived, eventTypes} = useQueryParameterParser(atmosphere.viewerId)
  const showAllTeams = !!userIds
  const filteredTeams = useMemo(
    () =>
      userIds
        ? teams.filter(
            ({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId))
          )
        : teams,
    [userIds, teamIds]
  )

  return (
    <TeamPickerMenuContent
      teamsRef={filteredTeams}
      selectedTeamIds={teamIds ?? []}
      onSelectTeam={(teamId) =>
        navigate(constructFilterQueryParamURL([teamId], userIds, showArchived, eventTypes))
      }
    >
      {showAllTeams && (
        <MenuItem
          onClick={() =>
            navigate(constructFilterQueryParamURL(null, userIds, showArchived, eventTypes))
          }
        >
          {FilterLabels.ALL_TEAMS}
        </MenuItem>
      )}
    </TeamPickerMenuContent>
  )
}

export default TeamFilterMenu
