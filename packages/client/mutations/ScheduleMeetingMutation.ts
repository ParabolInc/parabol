import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {ScheduleMeetingMutation as TScheduleMeetingMutation} from '../__generated__/ScheduleMeetingMutation.graphql'

graphql`
  fragment ScheduleMeetingMutation_part on ScheduleMeetingSuccess {
    successField
  }
`

const mutation = graphql`
  mutation ScheduleMeetingMutation($arg1: ID!) {
    scheduleMeeting(arg1: $arg1) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ScheduleMeetingMutation_part @relay(mask: false)
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
    optimisticUpdater: (store) => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default ScheduleMeetingMutation
