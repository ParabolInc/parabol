import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {ActionMeetingUpdates_meeting$key} from '../__generated__/ActionMeetingUpdates_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import isTaskPrivate from '../utils/isTaskPrivate'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import type {ActionMeetingPhaseProps} from './ActionMeeting'
import ActionMeetingUpdatesPrompt from './ActionMeetingUpdatesPrompt'
import MeetingUpdatesContent from './MeetingUpdatesContent'

interface Props extends ActionMeetingPhaseProps {
  meeting: ActionMeetingUpdates_meeting$key
}

const ActionMeetingUpdates = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ActionMeetingUpdates_meeting on ActionMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        ...ActionMeetingUpdatesPrompt_meeting
        id
        endedAt
        showSidebar
        localStage {
          ...ActionMeetingUpdatesStage @relay(mask: false)
        }
        phases {
          stages {
            ...ActionMeetingUpdatesStage @relay(mask: false)
          }
        }
        team {
          id
          tasks(first: 1000) @connection(key: "TeamColumnsContainer_tasks") {
            edges {
              node {
                ...TaskColumns_tasks @arguments(meetingId: $meetingId)
                # grab these so we can sort correctly
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
  const {teamMember} = localStage!
  const {userId} = teamMember!
  const teamMemberTasks = useMemo(() => {
    return tasks.edges
      .map(({node}) => node)
      .filter((task) => task.userId === userId && !isTaskPrivate(task.tags))
  }, [tasks, userId])

  return (
    <MeetingUpdatesContent
      avatarGroup={avatarGroup}
      endedAt={endedAt}
      headerPrompt={<ActionMeetingUpdatesPrompt meeting={meeting} />}
      isViewerStageOwner={userId === viewerId}
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
  fragment ActionMeetingUpdatesStage on UpdatesStage {
    teamMember {
      userId
    }
  }
`

export default ActionMeetingUpdates
