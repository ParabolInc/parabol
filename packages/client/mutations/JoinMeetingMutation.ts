import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {JoinMeetingMutation as TJoinMeetingMutation} from '../__generated__/JoinMeetingMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment JoinMeetingMutation_meeting on JoinMeetingSuccess {
    meeting {
      # probably a gross overfetch, but we can fix that later
      ...MeetingSelector_meeting
      ...MeetingCard_meeting
    }
  }
`

const mutation = graphql`
  mutation JoinMeetingMutation($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...JoinMeetingMutation_meeting @relay(mask: false)
    }
  }
`

const JoinMeetingMutation: StandardMutation<TJoinMeetingMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TJoinMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default JoinMeetingMutation
