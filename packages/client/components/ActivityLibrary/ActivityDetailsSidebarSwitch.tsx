import type {ActivityDetailsSidebar_teams$key} from '~/__generated__/ActivityDetailsSidebar_teams.graphql'
import type {ActivityDetailsSidebar_template$key} from '~/__generated__/ActivityDetailsSidebar_template.graphql'
import type {TeamHealthDetailsSidebar_teams$key} from '~/__generated__/TeamHealthDetailsSidebar_teams.graphql'
import type {MeetingTypeEnum} from '../../__generated__/ActivityDetailsQuery.graphql'
import ActivityDetailsSidebar from './ActivityDetailsSidebar'
import TeamHealthDetailsSidebar from './TeamHealthDetailsSidebar'

interface Props {
  type: MeetingTypeEnum
  templateId: string
  selectedTemplateRef: ActivityDetailsSidebar_template$key
  teamsRef: ActivityDetailsSidebar_teams$key
  teamHealthTeamsRef: TeamHealthDetailsSidebar_teams$key
  preferredTeamId: string | null | undefined
}

const ActivityDetailsSidebarSwitch = (props: Props) => {
  const {type, templateId, selectedTemplateRef, teamsRef, teamHealthTeamsRef, preferredTeamId} =
    props
  return type === 'teamHealth' ? (
    <TeamHealthDetailsSidebar
      templateId={templateId}
      teamsRef={teamHealthTeamsRef}
      preferredTeamId={preferredTeamId}
    />
  ) : (
    <ActivityDetailsSidebar
      selectedTemplateRef={selectedTemplateRef}
      teamsRef={teamsRef}
      type={type}
      preferredTeamId={preferredTeamId}
    />
  )
}

export default ActivityDetailsSidebarSwitch
