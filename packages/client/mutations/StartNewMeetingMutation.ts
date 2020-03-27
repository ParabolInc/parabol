import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
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
