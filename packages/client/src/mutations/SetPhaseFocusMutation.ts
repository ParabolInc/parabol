import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {SetPhaseFocusMutation as TSetPhaseFocusMutation} from '../__generated__/SetPhaseFocusMutation.graphql'
import {IReflectPhase} from '../types/graphql'

graphql`
  fragment SetPhaseFocusMutation_meeting on SetPhaseFocusPayload {
    reflectPhase {
      focusedPhaseItemId
    }
  }
`

const mutation = graphql`
  mutation SetPhaseFocusMutation($meetingId: ID!, $focusedPhaseItemId: ID) {
    setPhaseFocus(meetingId: $meetingId, focusedPhaseItemId: $focusedPhaseItemId) {
      ...SetPhaseFocusMutation_meeting @relay(mask: false)
    }
  }
`
interface LocalHanders {
  phaseId: string
}

const SetPhaseFocusMutation: StandardMutation<TSetPhaseFocusMutation, LocalHanders> = (
  atmosphere,
  variables,
  {phaseId}
) => {
  return commitMutation<TSetPhaseFocusMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {focusedPhaseItemId} = variables
      const phase = store.get<IReflectPhase>(phaseId)
      if (!phase) return
      phase.setValue(focusedPhaseItemId, 'focusedPhaseItemId')
    }
  })
}

export default SetPhaseFocusMutation
