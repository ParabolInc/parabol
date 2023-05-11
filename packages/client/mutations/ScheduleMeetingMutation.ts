import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {ScheduleMeetingMutation as TScheduleMeetingMutation} from '../__generated__/ScheduleMeetingMutation.graphql'

graphql`
  fragment ScheduleMeetingMutation_meeting on ScheduleMeetingSuccess {
    meeting {
      id
    }
  }
`

const mutation = graphql`
  mutation ScheduleMeetingMutation(
    $meetingId: ID!
    $title: String!
    $description: String!
    $startTimestamp: String!
    $endTimestamp: String!
    $inviteTeam: Boolean!
  ) {
    scheduleMeeting(
      meetingId: $meetingId
      title: $title
      description: $description
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
      inviteTeam: $inviteTeam
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ScheduleMeetingMutation_meeting @relay(mask: false)
    }
  }
`

const ScheduleMeetingMutation: StandardMutation<TScheduleMeetingMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TScheduleMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ScheduleMeetingMutation
