import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateMaxPhaseIndexMutation as TUpdateMaxPhaseIndexMutation} from '../__generated__/UpdateMaxPhaseIndexMutation.graphql'

graphql`
  fragment UpdateMaxPhaseIndexMutation_meeting on UpdateMaxPhaseIndexSuccess {
    meetingId
    currentPhaseIndex
    maxPhaseIndex
  }
`

const mutation = graphql`
  mutation UpdateMaxPhaseIndexMutation($meetingId: String!, $currentPhaseIndex: Int) {
    updateMaxPhaseIndex(meetingId: $meetingId, currentPhaseIndex: $currentPhaseIndex) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateMaxPhaseIndexMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateMaxPhaseIndexMutation: StandardMutation<TUpdateMaxPhaseIndexMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateMaxPhaseIndexMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, currentPhaseIndex} = variables
      store.get(meetingId)!.setValue(currentPhaseIndex, 'maxPhaseIndex')
    },
    onCompleted,
    onError
  })
}

export default UpdateMaxPhaseIndexMutation
