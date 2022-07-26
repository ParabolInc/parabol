import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {StartRecurrenceMutation as TStartRecurrenceMutation} from '../__generated__/StartRecurrenceMutation.graphql'

graphql`
  fragment StartRecurrenceMutation_team on StartRecurrenceSuccess {
    meeting {
      id
    }
  }
`

const mutation = graphql`
  mutation StartRecurrenceMutation($meetingId: ID!) {
    startRecurrence(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartRecurrenceMutation_team @relay(mask: false)
    }
  }
`

const StartRecurrenceMutation: StandardMutation<TStartRecurrenceMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TStartRecurrenceMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default StartRecurrenceMutation
