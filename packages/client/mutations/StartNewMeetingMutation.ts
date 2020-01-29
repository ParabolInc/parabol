import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StartNewMeetingMutation_team} from '__generated__/StartNewMeetingMutation_team.graphql'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  StandardMutation
} from '../types/relayMutations'
import {StartNewMeetingMutation as TStartNewMeetingMutation} from '../__generated__/StartNewMeetingMutation.graphql'

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    meeting {
      id
      defaultFacilitatorUserId
      name
      meetingMembers {
        user {
          id
          preferredName
        }
      }
    }
    team {
      ...TopBarMeetingsActiveMeetings @relay(mask: false)
      lastMeetingType
    }
    # TODO Fetch the RetroRoot Query so we don't need to fetch again
  }
`

const mutation = graphql`
  mutation StartNewMeetingMutation($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    startNewMeeting(teamId: $teamId, meetingType: $meetingType) {
      error {
        message
      }
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
  const {id: meetingId, defaultFacilitatorUserId, meetingMembers, name: meetingName} = meeting
  const viewerMeetingMember = meetingMembers.find((member) => member.user.id === viewerId)
  const facilitatorMeetingMember = meetingMembers.find(
    (member) => member.user.id === defaultFacilitatorUserId
  )
  if (!facilitatorMeetingMember || !viewerMeetingMember) return
  const {user: facilitator} = facilitatorMeetingMember
  const {preferredName} = facilitator
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `newMeeting:${meetingId}`,
    message: `${preferredName} just started ${meetingName}`,
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
      onCompleted(res, errors)
      const {startNewMeeting} = res
      const {meeting} = startNewMeeting
      if (!meeting) return
      const {id: meetingId} = meeting
      history.push(`/meet/${meetingId}`)
    }
  })
}

export default StartNewMeetingMutation
