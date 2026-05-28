import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UpdateMeetingSeriesMutation as TUpdateMeetingSeriesMutation} from '../__generated__/UpdateMeetingSeriesMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateMeetingSeriesMutation_series on UpdateMeetingSeriesSuccess {
    meetingSeries {
      id
      title
      recurrenceRule
      cancelledAt
      nextMeetingDate
    }
  }
`

const mutation = graphql`
  mutation UpdateMeetingSeriesMutation(
    $meetingSeriesId: ID!
    $name: String
    $rrule: RRule
  ) {
    updateMeetingSeries(meetingSeriesId: $meetingSeriesId, name: $name, rrule: $rrule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateMeetingSeriesMutation_series @relay(mask: false)
    }
  }
`

const UpdateMeetingSeriesMutation: StandardMutation<TUpdateMeetingSeriesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateMeetingSeriesMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateMeetingSeriesMutation
