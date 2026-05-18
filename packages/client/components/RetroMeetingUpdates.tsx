import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {RetroMeetingUpdates_meeting$key} from '../__generated__/RetroMeetingUpdates_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import isTaskPrivate from '../utils/isTaskPrivate'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import MeetingUpdatesContent from './MeetingUpdatesContent'
import type {RetroMeetingPhaseProps} from './RetroMeeting'
import RetroMeetingUpdatesPrompt from './RetroMeetingUpdatesPrompt'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroMeetingUpdates_meeting$key
}

const RetroMeetingUpdates = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroMeetingUpdates_meeting on RetrospectiveMeeting {
        ...StageTimerDisplay_meeting
        ...RetroMeetingUpdatesPrompt_meeting
        id
        endedAt
        showSidebar
        localStage {
          ...RetroMeetingUpdatesStage @relay(mask: false)
        }
        phases {
          stages {
            ...RetroMeetingUpdatesStage @relay(mask: false)
          }
        }
        team {
          id
          tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
            edges {
              node {
                ...TaskColumns_tasks @arguments(meetingId: $meetingId)
                id
                status
                sortOrder
                tags
                userId
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {id: meetingId, endedAt, localStage, showSidebar, team} = meeting
  const {id: teamId, tasks} = team
  const stageOwner = localStage?.teamMember
  const stageOwnerUserId = stageOwner?.userId ?? viewerId
  const teamMemberTasks = useMemo(() => {
    return tasks.edges
      .map(({node}) => node)
      .filter((task) => task.userId === stageOwnerUserId && !isTaskPrivate(task.tags))
  }, [tasks, stageOwnerUserId])

  return (
    <MeetingUpdatesContent
      avatarGroup={avatarGroup}
      endedAt={endedAt}
      headerPrompt={<RetroMeetingUpdatesPrompt meeting={meeting} />}
      isViewerStageOwner={stageOwnerUserId === viewerId}
      meetingId={meetingId}
      meetingRef={meeting}
      myTeamMemberId={toTeamMemberId(teamId, viewerId)}
      showSidebar={showSidebar}
      tasks={teamMemberTasks}
      toggleSidebar={toggleSidebar}
    />
  )
}

graphql`
  fragment RetroMeetingUpdatesStage on UpdatesStage {
    teamMember {
      userId
    }
  }
`

export default RetroMeetingUpdates
