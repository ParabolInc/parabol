import {commitMutation} from 'react-relay'

graphql`
  fragment SetPhaseFocusMutation_team on SetPhaseFocusPayload {
    reflectPhase {
      focusedPhaseItemId
    }
  }
`

const mutation = graphql`
  mutation SetPhaseFocusMutation($meetingId: ID!, $focusedPhaseItemId: ID) {
    setPhaseFocus(meetingId: $meetingId, focusedPhaseItemId: $focusedPhaseItemId) {
      ...SetPhaseFocusMutation_team @relay(mask: false)
    }
  }
`

const SetPhaseFocusMutation = (atmosphere, variables, context, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {focusedPhaseItemId} = variables
      const {phaseId} = context
      const phase = store.get(phaseId)
      phase.setValue(focusedPhaseItemId, 'focusedPhaseItemId')
    }
  })
}

export default SetPhaseFocusMutation
