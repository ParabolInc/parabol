import {StartNewMeetingMutation as TStartNewMeetingMutation} from '../__generated__/StartNewMeetingMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  StandardMutation
} from '../types/relayMutations'
import {StartNewMeetingMutation_team} from '__generated__/StartNewMeetingMutation_team.graphql'
import {meetingTypeToLabel} from '../utils/meetings/lookups'

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    meeting {
      id
      defaultFacilitatorUserId
      meetingType
      meetingMembers {
        user {
          id
          preferredName
        }
      }
    }
    team {
      ...DashTopBarActiveMeetings @relay(mask: false)
    }
    # TODO Fetch the RetroRoot Query so we don't need to fetch again
  }
`

const mutation = graphql`
  mutation StartNewMeetingMutation($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    startNewMeeting(teamId: $teamId, meetingType: $meetingType) {
      ...StartNewMeetingMutation_team @relay(mask: false)
    }
  }
`

export const startNewMeetingTeamOnNext: OnNextHandler<
  StartNewMeetingMutation_team,
  OnNextHistoryContext
> = (payload, context) => {
  const {atmosphere, history} = context
  const {viewerId} = atmosphere
  const {meeting} = payload
  if (!meeting) return
  const {id: meetingId, defaultFacilitatorUserId, meetingMembers, meetingType} = meeting
  const viewerMeetingMember = meetingMembers.find((member) => member.user.id === viewerId)
  const facilitatorMeetingMember = meetingMembers.find(
    (member) => member.user.id === defaultFacilitatorUserId
  )
  if (!facilitatorMeetingMember || !viewerMeetingMember) return
  const {user: facilitator} = facilitatorMeetingMember
  const {preferredName} = facilitator
  const type = meetingTypeToLabel[meetingType]
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `newMeeting:${meetingId}`,
    message: `${preferredName} just started a ${type} meeting.`,
    action: {
      label: 'Join Now',
      callback: () => {
        history.push(`/meet/${meetingId}`)
      }
    }
  })
}

const StartNewMeetingMutation: StandardMutation<TStartNewMeetingMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartNewMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      const {startNewMeeting} = res
      const {meeting} = startNewMeeting
      if (!meeting) return
      const {id: meetingId} = meeting
      history.push(`/meet/${meetingId}`)
      onCompleted(res, errors)
    }
  })
}

export default StartNewMeetingMutation
