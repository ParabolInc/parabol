import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SetPhaseFocusMutation as TSetPhaseFocusMutation} from '../__generated__/SetPhaseFocusMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment SetPhaseFocusMutation_meeting on SetPhaseFocusPayload {
    reflectPhase {
      focusedPromptId
    }
  }
`

const mutation = graphql`
  mutation SetPhaseFocusMutation($meetingId: ID!, $focusedPromptId: ID) {
    setPhaseFocus(meetingId: $meetingId, focusedPromptId: $focusedPromptId) {
      ...SetPhaseFocusMutation_meeting @relay(mask: false)
    }
  }
`
interface LocalHandlers {
  phaseId: string
}

const SetPhaseFocusMutation: StandardMutation<TSetPhaseFocusMutation, LocalHandlers> = (
  atmosphere,
  variables,
  {phaseId}
) => {
  return commitMutation<TSetPhaseFocusMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {focusedPromptId} = variables
      const phase = store.get(phaseId)
      if (!phase) return
      phase.setValue(focusedPromptId, 'focusedPromptId')
    }
  })
}

export default SetPhaseFocusMutation
