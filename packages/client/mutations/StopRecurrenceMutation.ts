import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {StopRecurrenceMutation as TStopRecurrenceMutation} from '../__generated__/StopRecurrenceMutation.graphql'

graphql`
  fragment StopRecurrenceMutation_team on StopRecurrenceSuccess {
    meetingSeries {
      id
      recurrenceRule
      duration
      cancelledAt
      activeMeetings {
        id
        scheduledEndTime
      }
    }
  }
`

const mutation = graphql`
  mutation StopRecurrenceMutation($meetingSeriesId: ID!) {
    stopRecurrence(meetingSeriesId: $meetingSeriesId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StopRecurrenceMutation_team @relay(mask: false)
    }
  }
`

const StopRecurrenceMutation: StandardMutation<TStopRecurrenceMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TStopRecurrenceMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default StopRecurrenceMutation
