import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {RetroMeetingUpdates_meeting$key} from '../__generated__/RetroMeetingUpdates_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import getTeamMemberTasks from '../utils/getTeamMemberTasks'
import getUpdatesEmptyState from '../utils/getUpdatesEmptyState'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import LastRetroEndedAtContext from './LastRetroEndedAtContext'
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
        prevCompletedMeeting {
          endedAt
        }
        localStage {
          ...RetroMeetingUpdatesStage @relay(mask: false) @alias
        }
        phases {
          stages {
            ...RetroMeetingUpdatesStage @relay(mask: false) @alias
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
  const {id: meetingId, endedAt, localStage, showSidebar, team, prevCompletedMeeting} = meeting
  const {id: teamId, tasks} = team
  const stageOwner = localStage?.RetroMeetingUpdatesStage?.teamMember
  const stageOwnerUserId = stageOwner?.userId ?? viewerId
  const isViewerStageOwner = stageOwnerUserId === viewerId
  const teamTasks = useMemo(() => tasks.edges.map(({node}) => node), [tasks])
  const teamMemberTasks = useMemo(
    () => getTeamMemberTasks(teamTasks, stageOwnerUserId),
    [teamTasks, stageOwnerUserId]
  )
  const emptyState = getUpdatesEmptyState(
    teamTasks,
    teamMemberTasks.length,
    stageOwner?.user.preferredName,
    isViewerStageOwner
  )

  return (
    <LastRetroEndedAtContext.Provider value={prevCompletedMeeting?.endedAt ?? null}>
      <MeetingUpdatesContent
        avatarGroup={avatarGroup}
        emptyState={emptyState}
        endedAt={endedAt}
        headerPrompt={<RetroMeetingUpdatesPrompt meeting={meeting} />}
        isViewerStageOwner={isViewerStageOwner}
        meetingId={meetingId}
        meetingRef={meeting}
        myTeamMemberId={toTeamMemberId(teamId, viewerId)}
        showSidebar={showSidebar}
        tasks={teamMemberTasks}
        toggleSidebar={toggleSidebar}
      />
    </LastRetroEndedAtContext.Provider>
  )
}

graphql`
  fragment RetroMeetingUpdatesStage on UpdatesStage {
    teamMember {
      userId
      user {
        preferredName
      }
    }
  }
`

export default RetroMeetingUpdates
