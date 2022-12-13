import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {DismissSuggestedActionMutation as TDismissSuggestedActionMutation} from '../__generated__/DismissSuggestedActionMutation.graphql'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

const mutation = graphql`
  mutation DismissSuggestedActionMutation($suggestedActionId: ID!) {
    dismissSuggestedAction(suggestedActionId: $suggestedActionId) {
      error {
        title
      }
    }
  }
`

const DismissSuggestedActionMutation: StandardMutation<TDismissSuggestedActionMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  const {suggestedActionId} = variables
  return commitMutation<TDismissSuggestedActionMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      handleRemoveSuggestedActions(suggestedActionId, store)
    },
    optimisticUpdater: (store) => {
      handleRemoveSuggestedActions(suggestedActionId, store)
    },
    onError,
    onCompleted
  })
}

export default DismissSuggestedActionMutation
